'use strict';

let express = require('express'),
    formidable = require('formidable'),
    router = express.Router(),
    config = require('../config'),
    fs = require('fs'),
    path = require('path'),
    _ = require('underscore'),
    passport = require('passport'),
    BasicStrategy = require('passport-http').BasicStrategy,
    checkName = require('../lib/checkName'),
    db = require('../lib/db'),
    CreateTask = require('../worker/createTask'),
    UpdateTask = require('../worker/updateTask');
    
passport.use(new BasicStrategy(
  function(username, password, cb) {
    db.findWallet(username)
      .then((wallet) => {
        if (!wallet || wallet.password != password) { 
          return cb(null, false);
        }
        console.log(wallet);
        return cb(null, wallet);
      })
      .catch((e) => {
        console.error(e);
        return cb(e);
      });
  }));

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

router.get('/name', function(req, res, next) {
  res.setHeader('Content-Type', 'application/json');
  res.send(checkName(req.query.walletName));
});

var whitelistParams = function(params) {
  return _.pick(params, ['walletName', 'assetId', 'assetName', 'symbol',
    'pluralSymbol', 'mainColor', 'secondaryColor', 'coluApiKey']);
};

var validateForCreate = function(params) {
    if (!params.walletName) {
      return 'Missing required param: walletName';
    }
    
    let nameError;
    
    if (nameError = checkName(params.walletName)) {
      return nameError;
    }
    
    if (!params.assetId) {
      return 'Missing required param: assetId';
    }

    if (!params.assetName) {
      return 'Missing required param: assetName';
    }
};

var validateForUpdate = function(params) {
  if (!params.walletName) {
    return 'Missing required param: walletName';
  }

  if (!fs.existsSync(path.join(config.targetDir, params.walletName))) {
    return 'No such wallet exists';
  }
};

var respondToFormat = function(status, result, req, res, template) {
  if (req.accepts('json')) {
    res.setHeader('Content-Type', 'application/json');
    res.status(status).send(result);
  } else if (template) {
    res.render(template, result);
  } else {
    res.status(status).send(result);
  }
};

router.post('/wallet', function(req, res, next) {

    var form = new formidable.IncomingForm();
 
    form.parse(req, function(err, fields, files) {
      let walletRequest = whitelistParams(fields),
          validationError = validateForCreate(walletRequest);
          
      if (validationError) {
        return respondToFormat(400, { error : validationError}, req, res);
      }
      walletRequest.logo = files.file.name ? files.file.path : '';
      
      let walletName = walletRequest.walletName;
      new CreateTask(walletRequest).execute()
        .then(function() {
          let result = { link: `http://${walletRequest.walletName}.coluwalletservice.com` };
          console.log(`Done: ${result.link}`);
          respondToFormat(200, result, req, res, 'created');
        })
        .catch(function(err) {
          console.log(`Failed to process "${walletName}" request: ` + err);
          respondToFormat(500, { error : err}, req, res);
        });
    });
});

router.put('/wallet', 
  passport.authenticate('basic', { session: false }),
  function(req, res, next) {
    if (req.user.walletName != req.body.walletName) {
      return respondToFormat(403, { error : "You are not authorized to change this wallet"}, req, res);
    }
    next();
  },
  function(req, res, next) {
    let walletRequest = whitelistParams(req.body),
        validationError = validateForUpdate(walletRequest);
    
    if (validationError) {
      respondToFormat(400, { error : validationError}, req, res);
      return;
    }
    
    new UpdateTask(walletRequest).execute()
      .then(function() {
        let result = { link: `http://${walletRequest.walletName}.coluwalletservice.com` };
        console.log(`Updated: ${result.link}`);
        respondToFormat(200, result, req, res, 'updated');
      })
      .catch(function(err) {
        console.log(`Failed to process update "${walletRequest.walletName}" request: ` + err);
        respondToFormat(500, { error : err}, req, res);
      });
});


module.exports = router;
