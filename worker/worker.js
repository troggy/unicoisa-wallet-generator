'use strict';

let kue = require('kue'),
    queue = kue.createQueue(),
    CreateTask = require('../lib/createTask'),
    UpdateTask = require('../lib/updateTask'),
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
  new CreateTask(params).execute()
    .then(function() {
      console.log(`Done: http://${params.walletName}.coluwalletservice.com`);
      done();
    })
    .catch(function(err) {
      console.log(`Failed to process "${params.walletName}" request: ` + err);
      done(err);
    });
});

queue.process('UpdateWallet', function(job, done){
  let params = job.data;
  console.log("Got update wallet request: " + JSON.stringify(params));
  new UpdateTask(params).execute()
    .then(function() {
      console.log(`Updated: http://${params.walletName}.coluwalletservice.com`);
      done();
    })
    .catch(function(err) {
      console.log(`Failed to process update "${params.walletName}" request: ` + err);
      done(err);
    });
});

console.log('Waiting for new jobs in queue..');

