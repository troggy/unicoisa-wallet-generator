#!/bin/sh

# $1 - copay template
# $2 - new wallet directory
# $3 - assetId
# $4 - asset name
# $5 - asset symbol
# $6 - asset plural symbol

cp -r $1 $2 

cd $2

grunt --assetId=$3 --assetName=$4 --assetSymbol=$5 --assetPluralSymbol=$6

