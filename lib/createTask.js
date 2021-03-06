'use strict';

let $ = require('preconditions').singleton(),
    temp = require('temp'),
    fs = require('fs'),
    execute = require('./shell').execute,
    Promise = require('bluebird'),
    Task = require('./task'),
    db = require('../lib/db'),
    checkName = require('../lib/checkName');
    
class CreateTask extends Task {
  
  constructor(params) {
    super(params);
  }
  
  _checkWalletName(params) {
    let error = checkName(params.walletName);
    
    if (error) {
      throw new Error(error);
    }
  };
  
  _checkParams(params) {
    $.shouldBeDefined(params.assetId, "assetId is required");
    $.shouldBeDefined(params.assetName, "assetName is required");
    $.shouldBeDefined(params.walletName, "walletName is required");
    
    this._checkWalletName(params);
    
    if (!params.symbol) {
      params.symbol = 'unit';
      params.pluralSymbol = 'units';
    }
  };
  
  _storeWalletConfig() {
    console.log('Storing config..');
    return db.createWallet(this.params);
  };

  _createCopayCopy() {
    console.log('Creating copay copy..');
    return execute(`mkdir -p ${this.targetWalletDir}`).then(() => {
      return execute(`cp -r ${this.templateCopayDir}/* ${this.targetWalletDir}/`);
    });
  };
  
  _fetchDependencies() {
    return execute(`cd ${this.targetWalletDir} && npm install && bower install`);
  };
  
  _configureNginx() {
    console.log('Creating nginx config..')
    let params = {
        walletName: this.params.walletName,
        targetWalletDir: this.targetWalletDir
    };
    let tempName = temp.path();
    return this._compileHbsFile('templates/nginx.tmpl.hbs', params, tempName)
      .then(() => {
        return execute(`sudo ./scripts/copy_nginx_config.sh ${this.params.walletName} ${tempName} ${CreateTask._nginxConfigDir}`);
      });
  };
  
  _restartNginx() {
    console.log('Restarting nginx..');
    return execute('sudo /usr/bin/service nginx reload');
  };
  
  execute () {
    return this._createCopayCopy()
      .then(this._createConfigFile.bind(this))
      .then(this._storeWalletConfig.bind(this))
      .then(this._copyLogo.bind(this))
      .then(this._configureNginx.bind(this))
      .then(this._restartNginx.bind(this));
  };

}

CreateTask._nginxConfigDir = '/etc/nginx/sites-enabled';

module.exports = CreateTask;