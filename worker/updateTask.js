'use strict';

let $ = require('preconditions').singleton(),
    fs = require('fs'),
    execute = require('./shell').execute,
    Promise = require('bluebird'),
    db = require('../lib/db'),
    path = require('path'),
    config = require('../config'),
    _ = require('underscore'),
    Task = require('./task');
    
class UpdateTask extends Task {
  
  constructor(params) {
    super(params);
    if (this.params.coluApiKey) {
      delete this.params.coluApiKey;
    };
    console.log(`Task params to update: ${JSON.stringify(this.params)}`);
  }
  
  _checkWalletName(params) {
    if (!fs.existsSync(path.join(config.targetDir, params.walletName))) {
      throw new Error(`No such wallet exist "${params.walletName}`);
    }
  };
  
  _checkParams(params) {
    this._checkWalletName(params);
  };
  
  _readConfig() {
    console.log('Reading config..');
    return db.findWallet(this.params.walletName)
      .then((wallet) => { 
        this.walletConfig = wallet;
        return wallet;
      });
  };
  
  _storeConfig() {
    console.log('Saving config..');
      return db.updateWallet(this.walletConfig);
  };
  
  _updateConfig() {
    console.log('Updating config..');
    
    let originalSettings = _.clone(this.walletConfig.settings);
    Object.assign(this.walletConfig.settings, this.params);
    let isUpdated = !_.isEqual(originalSettings, this.walletConfig.settings);
    this.params = this.walletConfig.settings;
    return Promise.resolve(isUpdated);
  }
  
  execute() {
    return this._readConfig()
      .then(this._updateConfig.bind(this))
      .then((isUpdated) => {
        if (!isUpdated) return false;
        
        return this._storeConfig()
        .then(this._createConfigFile.bind(this))
        .then(this._copyLogo.bind(this))
        .then(() => { return true; });
      });
  };
}

module.exports = UpdateTask;