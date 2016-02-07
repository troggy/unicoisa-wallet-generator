'use strict';

let exec = require('child_process').exec;

module.exports.execute = function (cmd, args) {
  args = args || [];
  return new Promise((resolve, reject) => {
    cmd = cmd + " " + args.join(" ");
    console.log(cmd);
    exec(cmd, function (error, stdout, stderr) {
      console.log(stdout);
      console.log(error);
      console.log(error);
      if (stderr || error) {
        reject(stderr || error);
      } else {
        resolve(stdout);
      }
    });
  });
};

