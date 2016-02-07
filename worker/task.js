'use strict';

let $ = require('preconditions').singleton(),
    path = require('path'),    
    execute = require('./shell').execute,
    fs = require('fs'),
    Handlebars = require('handlebars');

function Task(_params) {
  
  this._init = function(params) {
    this._checkParams(params);
    this.params = params;
    this.targetWalletDir = path.join(params.targetDir, params.walletName);
  };
  
  this._checkWalletName = function(params) {
    let walletName = params.walletName;
    $.checkArgument(walletName.match(/^[a-zA-Z][a-zA-Z0-9\-]*[a-zA-Z0-9]$/), `Incorrect wallet name: ${walletName}`);
    var files = fs.readdirSync(params.targetDir)
    if (files.indexOf(walletName) != -1) {
      throw new Error(`Wallet name "${walletName}" is already used`);
    }
    if (["bws", "copay", "www", "ftp", "mail"].indexOf(walletName) != -1) {
      throw new Error(`Wallet name "${walletName}" is not allowed`);
    }
  };
  
  this._checkParams = function(params) {
    $.shouldBeDefined(params.assetId, "assetId is required");
    $.shouldBeDefined(params.assetName, "assetName is required");
    $.shouldBeDefined(params.walletName, "walletName is required");
    $.shouldBeDefined(params.targetDir, "targetDir is required");
    $.shouldBeDefined(params.tmplCopayDir, "tmplCopayDir is required");
    
    this._checkWalletName(params);
    
    if (!params.symbol) {
      params.symbol = 'unit';
      params.pluralSymbol = 'units';
    }
  };
  
  this._createCopayCopy = function() {
    return execute(
      `mkdir -p ${this.targetWalletDir} && cp -r ${this.params.tmplCopayDir}/* ${this.targetWalletDir}/`
    );
  };
  
  this._fetchDependencies = function() {
    return execute(`cd ${this.targetWalletDir} && npm install && bower install`);
  };
  
  this._buildAndSetup = function() {
    return execute(`cd ${this.targetWalletDir} && grunt configure`, [
      `--assetId="${this.params.assetId}"`,
      `--assetName="${this.params.assetName}"`,
      `--assetSymbol="${this.params.symbol}"`,
      `--assetPluralSymbol="${this.params.pluralSymbol}"`
    ]);
  };
  
  this._configureNginx = function() {
    return new Promise((resolve, reject) => {
        fs.readFile('worker/nginx.tmpl.hbs', (err, template) => {
            if (err) { 
              return reject(err);
            }
            var configStr = Handlebars.compile(template.toString())({
                walletName: this.params.walletName,
                targetWalletDir: this.targetWalletDir
            });
            fs.writeFile(`/etc/nginx/sites-enabled/${this.params.walletName}`, configStr, (err) => {
              if (err) {
                return reject(err);
              }
              resolve();
            })
        });
    });
  };
  
  this._restartNginx = function() {
      return execute('service nginx restart');
  };
  
  this.execute = function() {
    return this._createCopayCopy()
      //.then(this._fetchDependencies.bind(this))
      .then(this._buildAndSetup.bind(this))
      .then(this._configureNginx.bind(this))
      .then(this._restartNginx.bind(this));
  };

  this._init(_params);
}

module.exports.Task = Task;