'use strict';

let MongoClient = require('mongodb'),
    config = require('../config');

let findWallet = function(walletName) {
    return new Promise(function(resolve, reject) {
        MongoClient.connect(config.dbUrl, function(err, db) {
          var collection = db.collection('wallets');
          collection.find({ walletName: walletName }).next((err, wallet) => {
              if (err) {
                reject(err);
              } else {
                resolve(wallet);
              }
            });
        });
    });
};

let createWallet = function(walletDoc) {
  return new Promise(function(resolve, reject) {
      MongoClient.connect(config.dbUrl, function(err, db) {
        var collection = db.collection('wallets');
        collection.insertOne(walletDoc, (err, r) => {
            if (err) {
              reject(err);
            } if (r.insertedCount == 0) {
              reject("Record was not created");
            }else {
              resolve();
            }
          });
      });
  });
};

module.exports = {
  findWallet,
  createWallet
};
