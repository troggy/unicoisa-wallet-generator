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

router.post('/wallet', function(req, res, next) {
    
    
    var form = new formidable.IncomingForm();
 
    form.parse(req, function(err, fields, files) {
      let walletRequest = { 
        walletName: fields.walletName,
        assetId: fields.assetId,
        assetName: fields.assetName,
        symbol: fields.symbol,
        pluralSymbol: fields.pluralSymbol,
        mainColor: fields.mainColor,
        secondaryColor: fields.secondaryColor,
        logo: files && files.file ? files.file.path : '',
        coluApiKey: fields.coluApiKey
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
});


module.exports = router;
