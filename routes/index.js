'use strict';

let express = require('express'),
    formidable = require('formidable'),
    router = express.Router(),
    kue = require('kue'),
    queue = kue.createQueue(),
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

router.post('/wallet', function(req, res, next) {

    var form = new formidable.IncomingForm();
 
    form.parse(req, function(err, fields, files) {
      let walletRequest = whitelistParams(fields);
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
    let walletRequest = whitelistParams(req.body);
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
