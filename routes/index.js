'use strict';

let express = require('express'),
    formidable = require('formidable'),
    router = express.Router(),
    kue = require('kue'),
    queue = kue.createQueue(),
    config = require('../config'),
    fs = require('fs'),
    path = require('path'),
    _ = require('underscore'),
    checkName = require('../lib/checkName'),
    CreateTask = require('../worker/createTask'),
    UpdateTask = require('../worker/updateTask');

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

router.post('/wallet', function(req, res, next) {

    var form = new formidable.IncomingForm();
 
    form.parse(req, function(err, fields, files) {
      let walletRequest = whitelistParams(fields),
          validationError = validateForCreate(walletRequest);
          
      if (validationError) {
        res.status(400).send(validationError);
        res.end();
        return;
      }
      walletRequest.logo = files.file.name ? files.file.path : '';
      
      walletRequest = {
        wallet: walletRequest,
        job: {
          templateCopayDir: config.templateCopayDir,
          targetDir: config.targetDir
        }
      };
      new CreateTask(walletRequest).execute()
        .then(function() {
          console.log(`Done: http://${walletRequest.wallet.walletName}.coluwalletservice.com`);
          res.render('queued', { link: `http://${walletRequest.wallet.walletName}.coluwalletservice.com` });
        })
        .catch(function(err) {
          console.log(`Failed to process "${walletRequest.wallet.walletName}" request: ` + err);
          res.status(500).send(err);
        });
    });
});

router.put('/wallet', function(req, res, next) {
    let walletRequest = whitelistParams(req.body),
        validationError = validateForUpdate(walletRequest);
    
    if (validationError) {
      res.status(400).send(validationError);
      res.end();
      return;
    }
    
    walletRequest = {
      wallet: walletRequest,
      job: {
        templateCopayDir: config.templateCopayDir,
        targetDir: config.targetDir
      }
    };
    new UpdateTask(walletRequest).execute()
      .then(function() {
        console.log(`Updated: http://${walletRequest.wallet.walletName}.coluwalletservice.com`);
        res.render('queued', { link: `http://${walletRequest.wallet.walletName}.coluwalletservice.com` });
      })
      .catch(function(err) {
        console.log(`Failed to process update "${walletRequest.wallet.walletName}" request: ` + err);
        res.status(500).send(err);
      });
});


module.exports = router;
