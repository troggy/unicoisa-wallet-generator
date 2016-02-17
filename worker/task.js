'use strict';

let path = require('path'),    
    fs = require('fs'),
    Handlebars = require('handlebars'),
    Promise = require('bluebird'),
    execute = require('./shell').execute,
    checkName = require('../lib/checkName');
    
class Task {
  
  constructor(params) {
    this._checkParams(params);
    this.params = params.wallet;
    this.targetDir = params.job.targetDir;
    this.templateCopayDir = params.job.templateCopayDir;
    this.targetWalletDir = path.join(this.targetDir, this.params.walletName);
    this.configFileRaw = `${this.targetWalletDir}/public/js/config.json`;
    this.configFileJs = `${this.targetWalletDir}/public/js/config.js`;
    if (this.params.logo) {
      this.params.logoPath = this.params.logo;
      this.params.logo = "custom-logo" + path.extname(this.params.logo);
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
    if (this.params.logo) {
      fs.createReadStream(this.params.logoPath).pipe(fs.createWriteStream(`${this.targetWalletDir}/public/img/${this.params.logo}`));
      fs.createReadStream(this.params.logoPath).pipe(fs.createWriteStream(`${this.targetWalletDir}/public/img/${this.params.logo}`));
    }
  };
  
  _createConfigFile() {
    return execute(`mkdir -p ${this.targetWalletDir}/public/js`).then(() => {
      return this._compileHbsFile('templates/config.tmpl.hbs', this.params, this.configFileJs);
    }).then(() => {
      return Promise.promisify(fs.writeFile)(
        this.configFileRaw,
        JSON.stringify(this.params, null, 2)
      );
    });
  };
  
  execute () {
    return true;
  };

}

module.exports = Task;