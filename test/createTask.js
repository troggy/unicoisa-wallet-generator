'use strict';

let chai = require("chai"),
    chaiAsPromised = require("chai-as-promised"),
    sinon = require('sinon'),
    expect = chai.expect,
    fs = require('fs'),
    path = require('path'),
    rimraf = require('rimraf').sync,
    _ = require('underscore'),
    Promise = require('bluebird'),
    CreateTask = require('../worker/createTask');
 
chai.use(chaiAsPromised);
chai.should();

describe('CreateTask', function() {
  
  let defaultParams = {
    wallet: {
      assetId: "assetId",
      assetName: "assetName",
      walletName: "walletName",
      symbol: "dollar",
      pluralSymbol: "dollars",
      mainColor: "#ffab00",
      secondaryColor: "#333",
      logo: "/tmp/logotipe.jpg"
    },
    job: {
      targetDir: "/tmp",
      templateCopayDir: "/tmp/copay",
    }
  };
  let params;
  
  CreateTask._nginxConfigDir = '/tmp/nginxConfig';
  if (!fs.existsSync(CreateTask._nginxConfigDir)) {
    fs.mkdirSync(CreateTask._nginxConfigDir);
  }
  
  if (!fs.existsSync('/tmp/copay')) {
    fs.mkdirSync('/tmp/copay');
    fs.mkdirSync('/tmp/copay/public');
  }
  
  fs.existsAsync = Promise.promisify
    (function exists2(path, exists2callback) {
        fs.exists(path, function callbackWrapper(exists) { exists2callback(null, exists); });
     });

 this.timeout(15000);

 beforeEach(() => {
   params = JSON.parse(JSON.stringify(defaultParams));
   let walletDir = path.join(defaultParams.job.targetDir, defaultParams.wallet.walletName);
   console.log(walletDir);
  rimraf(walletDir, fs, () => {
    
  });
  console.log(fs.existsSync(walletDir));
    
 });
  
 describe('#preconditions', function () {
    it('should require assetId', function () {
      params.wallet.assetId = undefined;
      expect(() => { new CreateTask(params)}).to.throw(Error);
    });
    
    it('should require assetName', function () {
      params.wallet.assetName = undefined;
      expect(() => { new CreateTask(params)}).to.throw(Error);
    });

    it('should require walletName', function () {
      params.wallet.walletName = undefined;
      expect(() => { new CreateTask(params)}).to.throw(Error);
    });

    it('should require templateCopayDir', function () {
      params.job.templateCopayDir = undefined;
      expect(() => { new CreateTask(params)}).to.throw(Error);
    });
    
    it('should require targetDir', function () {
      params.job.targetDir = undefined;
      expect(() => { new CreateTask(params)}).to.throw(Error);
    });

    it('should use default symbol if needed', function () {
      params.wallet.symbol = undefined;
      let task = new CreateTask(params);
          
      task.params.symbol.should.eq('unit');
      task.params.pluralSymbol.should.eq('units');
    });     
    
  });
  
  describe('#execution', function () {
    this.timeout(20000);
    
    it('successfull flow', function () {
      console.log(params);
      return new CreateTask(params).execute().should.be.fulfilled;
    });

    it('should stop if step failed', function () {
      params.job.templateCopayDir = "/tmp/copay2";
      let task = new CreateTask(params);
      sinon.spy(task, '_createConfigFile');
      
      let promise = task.execute();
      
      task._createConfigFile.callCount.should.eq(0, "_buildAndSetup should not be called");
      return promise.should.be.rejected;
    });
    
    it('should create copay copy', function(done) {
      let task = new CreateTask(params);
      let promise = task._createCopayCopy();
      promise.should.be.fulfilled;
      promise.then(() => {
        fs.existsSync(task.targetWalletDir + "/public").should.be.true;
        done();
      });
    });

    
    it('should create config file', function() {
      let task = new CreateTask(params),
          promise = task._createConfigFile(),
          exists = Promise.promisify(fs.exists);
      promise.should.be.fulfilled;
      return promise.then(() => {
        let configJs = fs.existsAsync(task.targetWalletDir + "/public/js/config.js");
        expect(configJs).to.eventually.equal(true, 'config.js should be generated');
        let configRaw = fs.existsAsync(task.targetWalletDir + "/public/js/config.json");
        expect(configRaw).to.eventually.equal(true, 'config.json should be generated');
      });
    });
    
    it('should generate nginx config', function() {
      let task = new CreateTask(params);
      let promise = task._configureNginx();
      return promise.should.be.fulfilled;
    });
  });
});