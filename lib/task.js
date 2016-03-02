'use strict';

let path = require('path'),    
    fs = require('fs'),
    Handlebars = require('handlebars'),
    Promise = require('bluebird'),
    execute = require('./shell').execute,
    config = require('../config'),
    checkName = require('../lib/checkName');
    
class Task {
  
  constructor(params) {
    this._checkParams(params);
    this.params = Object.assign({}, params);
    this.targetDir = config.targetDir;
    this.templateCopayDir = config.templateCopayDir;
    this.targetWalletDir = path.join(config.targetDir, this.params.walletName);
    this.configFileJs = `${this.targetWalletDir}/public/js/config.js`;
    
    // prefer logo URL to uploaded bytes
    if (this.params.logoUrl) {
      this.params.logo = this.params.logoUrl;
    } else if (this.params.logo) {
      this.logoPath = this.params.logo;
      this.params.logo = "img/custom-logo" + path.extname(this.params.logo);
    }
  }
  
  _checkParams(params) {
  };
  
  _compileHbsFile(sourceFile, data, destFile) {
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
  };
  
  _copyLogo() {
    if (this.logoPath) {
      console.log('Copying logo..');
      fs.createReadStream(this.logoPath).pipe(fs.createWriteStream(`${this.targetWalletDir}/public/${this.params.logo}`));
      fs.createReadStream(this.logoPath).pipe(fs.createWriteStream(`${this.targetWalletDir}/public/${this.params.logo}`));
    }
    return Promise.resolve();
  };
  
  _createConfigFile() {
    console.log('Creating config file..');
    return execute(`mkdir -p ${this.targetWalletDir}/public/js`).then(() => {
      return this._compileHbsFile('templates/config.tmpl.hbs', this.params, this.configFileJs);
    });
  };
  
  execute () {
    return true;
  };

}

module.exports = Task;