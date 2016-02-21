'use strict';

let express = require('express'),
    formidable = require('formidable'),
    Promise = require('bluebird'),
    router = express.Router(),
    config = require('../config'),
    fs = require('fs'),
    path = require('path'),
    _ = require('underscore'),
    passport = require('passport'),
    BasicStrategy = require('passport-http').BasicStrategy,
    checkName = require('../lib/checkName'),
    db = require('../lib/db'),
    users = require('../users.json'),
    CreateTask = require('../lib/createTask'),
    UpdateTask = require('../lib/updateTask');
    
passport.use(new BasicStrategy(
  function(username, password, cb) {
    if (!users[username] || users[username] != password) {
        return cb(null, false);
    }
    return cb(null, username);
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
  if (req.accepts('json') && !req.accepts('html')) {
    res.setHeader('Content-Type', 'application/json');
    res.status(status).send(result);
  } else if (template) {
    res.status(status).render(template, result);
  } else {
    res.status(status).send(result);
  }
};

var getParams = function(req) {
  if (req.headers['content-type'].indexOf('multipart/form-data') < 0) {
    //todo: logo?
    return Promise.resolve(req.body);
  } else {
    var form = new formidable.IncomingForm();
    
    return new Promise((resolve, reject) => {
        form.parse(req, (err, fields, files) => {
          if (err) return reject(err);
          fields.logo = files.file.name ? files.file.path : '';
          return resolve(fields);
        })
    });
  }
};

router.post('/wallet', function(req, res, next) {
    getParams(req).then((params) => {
      let walletRequest = whitelistParams(params);
      
      let validationError = validateForCreate(walletRequest);
          
      if (validationError) {
        return respondToFormat(400, { message : validationError }, req, res, 'error');
      }
      
      let walletName = walletRequest.walletName;
      new CreateTask(walletRequest).execute()
        .then(function() {
          let result = { link: `http://${walletRequest.walletName}.coluwalletservice.com` };
          console.log(`Done: ${result.link}`);
          respondToFormat(200, result, req, res, 'created');
        })
        .catch(function(err) {
          console.log(`Failed to process "${walletName}" request: ` + err);
          respondToFormat(500, { message : 'Failed to process request' }, req, res, 'error');
        });
    });
});

router.put('/wallet', 
  passport.authenticate('basic', { session: false }),
  function(req, res, next) {
    db.findWallet(req.body.walletName)
      .then((wallet) => {
        if (!wallet) { 
          return respondToFormat(404, { message : "No such wallet" }, req, res, 'error');
        }
        if (wallet.user != req.user) {
          return respondToFormat(403, { message : "You are not authorized to change this wallet" }, req, res, 'error');
        }
        console.log(wallet);
        next();
      })
      .catch((e) => {
        console.error(e);
        respondToFormat(500, { message : 'Failed to process request' }, req, res, 'error');
      });
  },
  function(req, res, next) {
    let walletRequest = whitelistParams(req.body),
        validationError = validateForUpdate(walletRequest);
    
    if (validationError) {
      return respondToFormat(400, { message : validationError }, req, res, 'error');
    }
    
    new UpdateTask(walletRequest).execute()
      .then(function() {
        let result = { link: `http://${walletRequest.walletName}.coluwalletservice.com` };
        console.log(`Updated: ${result.link}`);
        respondToFormat(200, result, req, res, 'updated');
      })
      .catch(function(err) {
        console.log(`Failed to process update "${walletRequest.walletName}" request: ` + err);
        respondToFormat(500, { message : 'Failed to process request' }, req, res, 'error');
      });
});


module.exports = router;
