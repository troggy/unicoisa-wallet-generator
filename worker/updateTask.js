'use strict';

let $ = require('preconditions').singleton(),
    fs = require('fs'),
    execute = require('./shell').execute,
    Promise = require('bluebird'),
    db = require('../lib/db'),
    config = require('../config'),
    _ = require('underscore'),
    Task = require('./task');
    
class UpdateTask extends Task {
  
  constructor(params) {
    super(params);
    if (this.params.coluApiKey) {
      delete this.params.coluApiKey;
    };
  }
  
  _checkWalletName(params) {
    var files = fs.readdirSync(config.targetDir)
    if (files.indexOf(params.walletName) == -1) {
      throw new Error(`No such wallet exist "${params.wallet.walletName}`);
    }
  };
  
  _checkParams(params) {
    this._checkWalletName(params);
  };
  
  _readConfig() {
    return db.findWallet(this.params.walletName)
      .then((wallet) => { 
        this.walletConfig = wallet;
        return wallet;
      });
  };
  
  _storeConfig() {
      return db.updateWallet(this.walletConfig);
  };
  
  _updateConfig() {
    console.log(this.params);
      this.walletConfig.settings = Object.assign(this.walletConfig.settings, this.params)
      this.params = this.walletConfig.settings;
  }
  
  execute() {
    return this._readConfig()
      .then(this._updateConfig.bind(this))
      .then(this._storeConfig.bind(this))
      .then(this._createConfigFile.bind(this))
      .then(this._copyLogo.bind(this));
  };
}

module.exports = UpdateTask;