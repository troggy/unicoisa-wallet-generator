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

let updateWallet = function(walletDoc) {
  return new Promise(function(resolve, reject) {
      MongoClient.connect(config.dbUrl, function(err, db) {
        var collection = db.collection('wallets');
        console.log("vq: " + walletDoc.walletName);
        console.log(walletDoc);
        collection.updateOne({ walletName: walletDoc.walletName }, { $set: walletDoc }, (err, r) => {
            if (err) {
              reject(err);
            } if (r.matchedCount != 1 || r.modifiedCount != 1) {
              console.log(r.matchedCount);
              console.log(r.modifiedCount);
              
              reject("Record was not updated");
            }else {
              resolve();
            }
          });
      });
  });
};

module.exports = {
  findWallet,
  createWallet,
  updateWallet
};
