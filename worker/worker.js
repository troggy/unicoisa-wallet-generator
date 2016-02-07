'use strict';

let argv = require('yargs').argv,
    kue = require('kue'),
    queue = kue.createQueue(),
    Task = require('./task');
    
    
if (!argv.homeDir || !argv.tmplCopayDir) {
  console.log(" Usage: node worker.js --homeDir=<where to install> --tmplCopayDir=<copay to clone>");
  process.exit(1);
}

queue.process('NewWallet', function(job, done){
  let params = job.data;
  console.log("Got wallet request: " + JSON.stringify(params));
  new Task(params).execute()
    .then(function() {
      done();
    })
    .catch(function(err) {
      console.log(`Failed to process ${params.walletName} request: ` + err);
      done(err);
    });
});

