'use strict';

let kue = require('kue'),
    queue = kue.createQueue(),
    Task = require('./task'),
    config = require('../config');
    
if (!config.templateCopayDir) {
  console.log('Missing "templateCopayDir" property in config.json');
  process.exit(1);
}

if (!config.targetDir) {
  console.log('Missing "targetDir" property in config.json');
  process.exit(1);
}

queue.process('NewWallet', function(job, done){
  let params = job.data;
  console.log("Got wallet request: " + JSON.stringify(params));
  params = Object.assign(params, {
      templateCopayDir: config.templateCopayDir,
      targetDir: config.targetDir
  });
  new Task(params).execute()
    .then(function() {
      console.log(`Done: http://${params.walletName}.coluwalletservice.com`);
      done();
    })
    .catch(function(err) {
      console.log(`Failed to process ${params.walletName} request: ` + err);
      done(err);
    });
});

console.log('Waiting for new jobs in queue..');

