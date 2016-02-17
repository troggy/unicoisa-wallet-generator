'use strict';

let $ = require('preconditions').singleton(),
    fs = require('fs'),
    execute = require('./shell').execute,
    Promise = require('bluebird'),
    Task = require('./task'),
    checkName = require('../lib/checkName');
    
class CreateTask extends Task {
  
  constructor(params) {
    super(params);
  }
  
  _checkWalletName(params) {
    let error = checkName(params.wallet.walletName);
    
    if (error) {
      throw new Error(error);
    }
  };
  
  _checkParams(params) {
    $.shouldBeDefined(params.wallet.assetId, "assetId is required");
    $.shouldBeDefined(params.wallet.assetName, "assetName is required");
    $.shouldBeDefined(params.wallet.walletName, "walletName is required");
    $.shouldBeDefined(params.job.targetDir, "targetDir is required");
    $.shouldBeDefined(params.job.templateCopayDir, "templateCopayDir is required");
    
    this._checkWalletName(params);
    
    if (!params.wallet.symbol) {
      params.wallet.symbol = 'unit';
      params.wallet.pluralSymbol = 'units';
    }
  };

  
  _createCopayCopy() {
    return execute(`mkdir -p ${this.targetWalletDir}`).then(() => {
      return execute(`cp -r ${this.templateCopayDir}/* ${this.targetWalletDir}/`);
    });
  };
  
  _fetchDependencies() {
    return execute(`cd ${this.targetWalletDir} && npm install && bower install`);
  };
  
  _configureNginx() {
    let params = {
        walletName: this.params.walletName,
        targetWalletDir: this.targetWalletDir
    };
    return this._compileHbsFile('templates/nginx.tmpl.hbs', params, `${CreateTask._nginxConfigDir}/${this.params.walletName}`);
  };
  
  _restartNginx() {
      return execute('service nginx restart');
  };
  
  execute () {
    return this._createCopayCopy()
      .then(this._createConfigFile.bind(this))
      .then(this._copyLogo.bind(this))
      .then(this._configureNginx.bind(this))
      .then(this._restartNginx.bind(this));
  };

}

CreateTask._nginxConfigDir = '/etc/nginx/sites-enabled';

module.exports = CreateTask;