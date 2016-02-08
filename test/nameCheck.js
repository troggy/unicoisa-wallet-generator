'use strict';

let checkName = require('../lib/checkName'),
    assert = require("chai").assert;
    
describe('checkName', function() {

  it('should allow only alphanumeric wallet names with optional dash in the middle', function () {
    let badNames = [ 
      "1231", "-name", "name-", "-", "../", "/tmp"
    ];
    badNames.forEach((name) => {
      assert.isNotNull(checkName(name), `Wallet name "${name}" should not be accepted`);
    });
  });

  it('should not allow already used wallet names', function () {
    let name = "copay";
    assert.isNotNull(checkName(name), `Wallet name "${name}" should not be accepted`);
  });
  
  it('should not allow reserved wallet names', function () {
    let badNames = [ 
      "bws", "copay", "www", "ftp", "mail"
    ];
    badNames.forEach((name) => {
      assert.isNotNull(checkName(name), `Wallet name "${name}" should not be accepted`);
    });
  });  
});

