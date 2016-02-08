'use strict';

let fs = require('fs'),
    config = require('../config');

function checkName(name) {
  if (!name.match(/^[a-zA-Z][a-zA-Z0-9\-]*[a-zA-Z0-9]$/))
    return `Incorrect name: ${name}`;
  var files = fs.readdirSync(config.targetDir)
  if (files.indexOf(name) != -1) {
    return `Wallet name "${name}" is already used`;
  }
  if (["bws", "copay", "www", "ftp", "mail"].indexOf(name) != -1) {
    return `Wallet name "${name}" is not allowed`;
  }
  
  return null;
}

module.exports = checkName;