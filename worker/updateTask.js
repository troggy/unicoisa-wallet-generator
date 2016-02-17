'use strict';

let $ = require('preconditions').singleton(),
    fs = require('fs'),
    execute = require('./shell').execute,
    Promise = require('bluebird'),
    _ = require('underscore'),
    Task = require('./task');
    
class UpdateTask extends Task {
  
  constructor(params) {
    super(params);
  }
  
  _checkWalletName(params) {
    var files = fs.readdirSync(params.job.targetDir)
    if (files.indexOf(params.wallet.walletName) == -1) {
      throw new Error(`No such wallet exist "${params.wallet.walletName}`);
    }
  };
  
  _checkParams(params) {
    $.shouldBeDefined(params.job.targetDir, "targetDir is required");
    
    this._checkWalletName(params);
  };
  
  _readConfigFile() {
    return Promise.promisify(fs.readFile)(`${this.targetWalletDir}/public/js/config.json`)
          .then((configStr) => {
            return JSON.parse(configStr);
          });
  };
  
  _updateConfigFile() {
      return this._readConfigFile().then((config) => {
        this.params = _.extend(config, this.params);
      }).then(this._createConfigFile.bind(this));
  }
  
  execute() {
    return this._updateConfigFile()
      .then(this._copyLogo.bind(this));
  };
}

module.exports = UpdateTask;