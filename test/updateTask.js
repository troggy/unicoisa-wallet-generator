'use strict';

let chai = require("chai"),
    chaiAsPromised = require("chai-as-promised"),
    sinon = require('sinon'),
    expect = chai.expect,
    fs = require('fs'),
    path = require('path'),
    rimraf = require('rimraf').sync,
    Promise = require('bluebird'),
    _ = require('underscore'),
    CreateTask = require('../worker/createTask'),
    UpdateTask = require('../worker/updateTask');
 
chai.use(chaiAsPromised);
chai.should();

describe('UpdateTask', function() {
  
  let walletName = "walletName" + Math.random().toString(36).substring(7),
      defaultParams = {
          assetId: "assetId",
          assetName: "assetName",
          walletName: walletName,
          symbol: "dollar",
          pluralSymbol: "dollars",
          mainColor: "#ffab00",
          secondaryColor: "#333",
          coluApiKey: "bla"
      },
      params;
      
  before(() => {
    let task = new CreateTask(defaultParams);
    console.log(`${walletName}`);
    return task._storeWalletConfig().then(task._createConfigFile.bind(task));
  });

  
  beforeEach(() => {
    params = JSON.parse(JSON.stringify(defaultParams));
  });
  
  it('successfull flow', function () {
    params = _.extend(params, {
      assetId: "assetId!",
      assetName: "assetName!",
      symbol: "dollar!",
      pluralSymbol: "dollars!",
      mainColor: "#ffab01",
      secondaryColor: "#334",
      coluApiKey: "bla"
    });
    let task = new UpdateTask(params);
    return task.execute().should.be.fulfilled;
  });
  
  it('should not allow changing api key', function () {
    params = _.extend(params, {
      coluApiKey: 'dfvdfvdf'
    });
    let task = new UpdateTask(params);
    return task.execute().should.be.fulfilled;
    //todo
  });


});