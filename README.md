# unicoisa-wallet-generator

Simple Web UI to generate brand new single digital asset wallet (project [Unicoisa](https://github.com/troggy/unicoisa) based on Copay + Colu).

## Installation

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

### Start app

Process needs root privileges to configure and restart nginx, hence everything should be ran with ``sudo`` (yes, not good).



