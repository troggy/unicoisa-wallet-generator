'use strict';

let express = require('express'),
    formidable = require('formidable'),
    router = express.Router(),
    kue = require('kue'),
    queue = kue.createQueue(),
    config = require('../config'),
    fs = require('fs'),
    path = require('path'),
    checkName = require('../lib/checkName');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

router.get('/name', function(req, res, next) {
  res.setHeader('Content-Type', 'application/json');
  res.send(checkName(req.query.walletName));
});

var whitelistParams = function(params) {
  return { 
    walletName: params.walletName,
    assetId: params.assetId,
    assetName: params.assetName,
    symbol: params.symbol,
    pluralSymbol: params.pluralSymbol,
    mainColor: params.mainColor,
    secondaryColor: params.secondaryColor,
    coluApiKey: params.coluApiKey
  };
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
      
      let job = queue.create("NewWallet", walletRequest).save(function(err){
        if( !err ) { 
          console.log("Request for new wallet queued up [" + job.id + "]: " + JSON.stringify(walletRequest));
        } else {
          console.error(err);
        }
      });
      res.render('queued', { link: `http://${walletRequest.walletName}.coluwalletservice.com` });
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
    
    let job = queue.create("UpdateWallet", walletRequest).save(function(err){
      if( !err ) { 
        console.log("Request for wallet update queued up [" + job.id + "]: " + JSON.stringify(walletRequest));
      } else {
        console.error(err);
      }
    });
    res.render('queued', { link: `http://${walletRequest.walletName}.coluwalletservice.com` });

});


module.exports = router;
