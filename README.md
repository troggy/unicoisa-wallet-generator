# unicoisa-wallet-generator

Simple Web UI to generate brand new single digital asset wallet (project [Unicoisa](https://github.com/troggy/unicoisa) based on Copay + Colu).

## Installation

### Prerequisites

- MongoDb

### Install app
1. ``git clone https://github.com/troggy/unicoisa-wallet-generator``
2. ``npm install``
3. ``bower install``

### Configure
Edit config.json to match your settings:

````
{
  "targetDir": "<folder where to put generated wallets>",
  "templateCopayDir": "<folder with ColuCopay to make copy of>"
}
````

To prepare ColuCopay (project [Unicoisa](https://github.com/troggy/unicoisa)):
````
 git clone https://github.com/troggy/unicoisa copay && cd copay && npm install && bower install && grunt
````

App copies nginx config to the /etc/nginx/sites-enabled and restarts nginx. It uses ``sudo`` to do this. To make it work you need the following:
- app should be running under user with sudo privileges
- edit ``/etc/sudoers`` (use ``visudo`` for your safety) to allow certain commands to run without password prompt:
````
<USERNAME> ALL=NOPASSWD:<PATH_TO_WALLET_GENERATOR>/scripts/copy_nginx_config.sh
<USERNAME> ALL=NOPASSWD:/usr/bin/service nginx reload
````

### Start app

````
npm start
````

## API

API uses HTTP Basic authentication.

### Create wallet
Endpoint: ``POST /api/wallet``
Payload:
````
{
  walletName: "name of the wallet to change (mandatory)",
  assetId: "assetId (mandatory)",
  assetName: "name of the asset (mandatory)",
  mainColor: "#xxxxxx code of the main wallet color",
  secondaryColor: "#xxxxxx code of the secondary wallet color",
  symbol: "symbol/ticker for the asset currency",
  pluralSymbol: "plural form of the symbol",
  logo: "logo could be uploaded only with multipart/form-data requests",
  logoUrl: "logo URL (e.g. from CDN). If both logoUrl and logo bytes supplied, logoUrl will be used",
  coluApiKey: "api key for Colu SDK"
}
````

### Change wallet
Colu API key, assetId and wallet name cannot be changed.

Endpoint: ``PUT /api/wallet``
Payload:
````
{
  walletName: "name of the wallet to change",
  assetName: "name of the asset",
  mainColor: "#xxxxxx code of the main wallet color",
  secondaryColor: "#xxxxxx code of the secondary wallet color",
  symbol: "symbol/ticker for the asset currency",
  pluralSymbol: "plural form of the symbol",
  logo: "logo could be uploaded only with multipart/form-data requests",
  logoUrl: "logo URL (e.g. from CDN). If both logoUrl and logo bytes supplied, logoUrl will be used"
}
````
