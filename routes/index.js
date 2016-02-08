'use strict';

let express = require('express'),
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

router.post('/wallet', function(req, res, next) {
    let walletRequest = { 
      walletName: req.body.walletName,
      assetId: req.body.assetId,
      assetName: req.body.assetName,
      symbol: req.body.symbol,
      pluralSymbol: req.body.pluralSymbol
    };

    var job = queue.create("NewWallet", walletRequest).save(function(err){
      if( !err ) { 
        console.log("Request for new wallet queued up [" + job.id + "]: " + JSON.stringify(walletRequest));
      } else {
        console.error(err);
      }
    });
    
    res.render('queued', { link: `http://${walletRequest.walletName}.coluwalletservice.com` });
});


module.exports = router;
