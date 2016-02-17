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
        wallet: {
          assetId: "assetId",
          assetName: "assetName",
          walletName: walletName,
          symbol: "dollar",
          pluralSymbol: "dollars",
          mainColor: "#ffab00",
          secondaryColor: "#333",
          coluApiKey: "bla"
        },
        job: {
          targetDir: "/tmp",
          templateCopayDir: "/tmp/copay",
        }
      },
      params;
      
  before(() => {
    let task = new CreateTask(defaultParams);
    console.log(`${walletName}`);
    return task._createConfigFile();
  });

  
  beforeEach(() => {
    params = JSON.parse(JSON.stringify(defaultParams));
  });
  
  it('successfull flow', function () {
    params.wallet = _.extend(params.wallet, {
      assetId: "assetId!",
      assetName: "assetName!",
      symbol: "dollar!",
      pluralSymbol: "dollars!",
      mainColor: "#ffab01",
      secondaryColor: "#334",
      coluApiKey: "bla"
    });
    let task = new UpdateTask(params);
    return task._updateConfigFile().then(() => {
        return Promise.promisify(fs.readFile)(task.configFileRaw).then((newConfig) => {
            newConfig = JSON.parse(newConfig.toString());
            _.isEqual(params.wallet, newConfig).should.be.true;
        });
    });
  });
  
  it('should not allow changing api key', function () {
    params.wallet = _.extend(params.wallet, {
      coluApiKey: 'dfvdfvdf'
    });
    let task = new UpdateTask(params);
    return task._updateConfigFile().then(() => {
        return Promise.promisify(fs.readFile)(task.configFileRaw).then((newConfig) => {
            newConfig = JSON.parse(newConfig.toString());
            newConfig.coluApiKey.should.be.equal(defaultParams.wallet.coluApiKey);
        });
    });
  });


});