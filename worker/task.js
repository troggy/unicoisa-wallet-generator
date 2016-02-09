'use strict';

let $ = require('preconditions').singleton(),
    path = require('path'),    
    fs = require('fs'),
    Handlebars = require('handlebars'),
    execute = require('./shell').execute,
    checkName = require('../lib/checkName');
    
function Task(_params) {
  
  this._init = function(params) {
    this._checkParams(params);
    this.params = params;
    this.targetWalletDir = path.join(params.targetDir, params.walletName);
  };
  
  this._checkWalletName = function(params) {
    let error = checkName(params.walletName);
    
    if (error) {
      throw new Error(error);
    }
  };
  
  this._checkParams = function(params) {
    $.shouldBeDefined(params.assetId, "assetId is required");
    $.shouldBeDefined(params.assetName, "assetName is required");
    $.shouldBeDefined(params.walletName, "walletName is required");
    $.shouldBeDefined(params.targetDir, "targetDir is required");
    $.shouldBeDefined(params.templateCopayDir, "templateCopayDir is required");
    
    this._checkWalletName(params);
    
    if (!params.symbol) {
      params.symbol = 'unit';
      params.pluralSymbol = 'units';
    }
  };
  
  this._compileHbsFile = function(sourceFile, data, destFile) {
    return new Promise((resolve, reject) => {
        fs.readFile(sourceFile, (err, template) => {
            if (err) { 
              return reject(err);
            }
            let compiledData = Handlebars.compile(template.toString())(data);
            fs.writeFile(destFile, compiledData, (err) => {
              if (err) {
                return reject(err);
              }
              resolve();
            })
        });
    });
  }
  
  this._createCopayCopy = function() {
    return execute(
      `mkdir -p ${this.targetWalletDir} && cp -r ${this.params.templateCopayDir}/* ${this.targetWalletDir}/`
    );
  };
  
  this._fetchDependencies = function() {
    return execute(`cd ${this.targetWalletDir} && npm install && bower install`);
  };
  
  this._createConfigFile = function() {
    return this._compileHbsFile('templates/config.tmpl.hbs', this.params, `${this.targetWalletDir}/public/js/config.js`);
  }
  
  this._configureNginx = function() {
    let params = {
        walletName: this.params.walletName,
        targetWalletDir: this.targetWalletDir
    };
    return this._compileHbsFile('templates/nginx.tmpl.hbs', params, `/etc/nginx/sites-enabled/${this.params.walletName}`);
  };
  
  this._restartNginx = function() {
      return execute('service nginx restart');
  };
  
  this.execute = function() {
    return this._createCopayCopy()
      .then(this._createConfigFile.bind(this))
      .then(this._configureNginx.bind(this))
      .then(this._restartNginx.bind(this));
  };

  this._init(_params);
}

module.exports = Task;