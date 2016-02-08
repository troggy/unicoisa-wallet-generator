# unicoisa-wallet-generator

Simple Web UI to generate brand new single digital asset wallet (project [Unicoisa](https://github.com/troggy/unicoisa) based on Copay + Colu). Background worker process makes a copy of the wallet template, configures it with the desired asset, creates new nginx config and restarts nginx.

## Installation

### Check prerequisites. You will need:
- Redis server (for Ubuntu: ``sudo apt-get install redis-server``)
- [Foreman](https://www.npmjs.com/package/foreman)

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
 git clone https://github.com/troggy/unicoisa copay && cd copay && npm install && bower install && grunt build
````

### Start app

Worker process needs root privileges to configure and restart nginx, hence everything is being ran with ``sudo`` (yes, not good).

For development: ``sudo nf start``
In production export to Upstart with
````
sudo nf export -a wallet-gen -l `pwd`/logs -o /etc/init/
````
then you can manage it with ``sudo service wallet-gen start/stop/restart``



