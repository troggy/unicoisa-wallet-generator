'use strict';

let chai = require("chai"),
    chaiAsPromised = require("chai-as-promised"),
    sinon = require('sinon'),
    expect = chai.expect,
    fs = require('fs'),
    path = require('path'),
    rimraf = require('rimraf').sync,
    Task = require('../worker/task');
 
chai.use(chaiAsPromised);
chai.should();

describe('Task', function() {
  
  let defaultParams = {
    assetId: "assetId",
    assetName: "assetName",
    walletName: "walletName",
    symbol: "dollar",
    pluralSymbol: "dollars",
    mainColor: "#color1",
    secondaryColor: "#color2",
    targetDir: "/tmp",
    templateCopayDir: "/tmp/copay"
  };
  
  fs.mkdir('/tmp/copay'); // copy copay there and make npm i && bower install && grunt build
  
  function cloneWith(arr, args) {
    var clone = JSON.parse(JSON.stringify(arr));
    return Object.assign(clone, args || {});
  };
  
 this.timeout(15000);

 beforeEach(() => {
    rimraf(path.join(defaultParams.targetDir, defaultParams.walletName), fs, () => {
    });
 });
  
 describe('#preconditions', function () {
    it('should require assetId', function () {
      let params = cloneWith(defaultParams, { assetId: undefined });
      expect(() => { new Task(params)}).to.throw(Error);
    });
    
    it('should require assetName', function () {
      let params = cloneWith(defaultParams, { assetName: undefined });
      expect(() => { new Task(params)}).to.throw(Error);
    });

    it('should require walletName', function () {
      let params = cloneWith(defaultParams, { walletName: undefined });
      expect(() => { new Task(params)}).to.throw(Error);
    });

    it('should require templateCopayDir', function () {
      let params = cloneWith(defaultParams, { templateCopayDir: undefined });
      expect(() => { new Task(params)}).to.throw(Error);
    });
    
    it('should require targetDir', function () {
      let params = cloneWith(defaultParams, { targetDir: undefined });
      expect(() => { new Task(params)}).to.throw(Error);
    });

    it('should use default symbol if needed', function () {
      let params = cloneWith(defaultParams, { symbol: undefined }),
          task = new Task(params);
          
      task.params.symbol.should.eq('unit');
      task.params.pluralSymbol.should.eq('units');
    });     
    
  });
  
  describe('#execution', function () {
    this.timeout(20000);
    
    it('successfull flow', function () {
      return new Task(defaultParams).execute().should.be.fulfilled;
    });

    it('should stop if step failed', function () {
      let params = cloneWith(defaultParams, { templateCopayDir: "/tmp/copay2" }),
          task = new Task(params);
      sinon.spy(task, '_createConfigFile');
      
      let promise = task.execute();
      
      task._createConfigFile.callCount.should.eq(0, "_buildAndSetup should not be called");
      return promise.should.be.rejected;
    });
    
    it('should generate nginx config', function() {
      let promise = new Task(defaultParams)._configureNginx();
      return promise.should.be.fulfilled;
    });
  });
});