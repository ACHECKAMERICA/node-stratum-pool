## BitcoinV SOLO mining instructions
## After reading below, open the file index_STRATUM_MINING.js above and read the notes at the bottom.

--------

High performance Stratum poolserver in Node.js.


Requirements
------------
* node v0.10+
```bash
# Using Ubuntu
sudo apt remove nodejs
curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -
sudo apt-get install -y nodejs
```
* BitcoinV coin daemon or QT wallet


Usage
-------------

#### Install

```bash
cd
git clone https://github.com/bitcoinVBR/node-stratum-pool.git node_modules/stratum-pool
cd node_modules/stratum-pool
sudo npm update npm -g
sudo apt install g++ make
npm update
```

