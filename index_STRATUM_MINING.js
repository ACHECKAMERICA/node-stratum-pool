var myCoin = {
    "name": "BitcoinV",
    "symbol": "BTCV",
    "algorithm": "sha256",
    "nValue": 1024, //optional - defaults to 1024
    "rValue": 1, //optional - defaults to 1
    "txMessages": false, //optional - defaults to false,


};



var Stratum = require('stratum-pool');

var pool = Stratum.createPool({

    "coin": myCoin,

    "address": "1GPLaBLsczMDDNSueiwbxouGDfLaoxhopq", //Address to where block rewards are given

    /* Block rewards go to the configured pool wallet address to later be paid out to miners,
       except for a percentage that can go to, for examples, pool operator(s) as pool fees or
       or to donations address. Addresses or hashed public keys can be used. Here is an example
       of rewards going to the main pool op, a pool co-owner, and NOMP donation. */
    "rewardRecipients": {

    },

    "blockRefreshInterval": 1000, //How often to poll RPC daemons for new blocks, in milliseconds


    /* Some miner apps will consider the pool dead/offline if it doesn't receive anything new jobs
       for around a minute, so every time we broadcast jobs, set a timeout to rebroadcast
       in this many seconds unless we find a new job. Set to zero or remove to disable this. */
    "jobRebroadcastTimeout": 135,

    //instanceId: 37, //Recommend not using this because a crypto-random one will be generated

    /* Some attackers will create thousands of workers that use up all available socket connections,
       usually the workers are zombies and don't submit shares after connecting. This features
       detects those and disconnects them. */
    "connectionTimeout": 600, //Remove workers that haven't been in contact for this many seconds

    /* Sometimes you want the block hashes even for shares that aren't block candidates. */
    "emitInvalidBlockHashes": false,

    /* Enable for client IP addresses to be detected when using a load balancer with TCP proxy
       protocol enabled, such as HAProxy with 'send-proxy' param:
       http://haproxy.1wt.eu/download/1.5/doc/configuration.txt */
    "tcpProxyProtocol": false,

    /* If a worker is submitting a high threshold of invalid shares we can temporarily ban their IP
       to reduce system/network load. Also useful to fight against flooding attacks. If running
       behind something like HAProxy be sure to enable 'tcpProxyProtocol', otherwise you'll end up
       banning your own IP address (and therefore all workers). */
    "banning": {
        "enabled": false,
        "time": 600, //How many seconds to ban worker for
        "invalidPercent": 50, //What percent of invalid shares triggers ban
        "checkThreshold": 500, //Check invalid percent when this many shares have been submitted
        "purgeInterval": 300 //Every this many seconds clear out the list of old bans
    },

    /* Each pool can have as many ports for your miners to connect to as you wish. Each port can
       be configured to use its own pool difficulty and variable difficulty settings. varDiff is
       optional and will only be used for the ports you configure it for. */
    "ports": {
        "3333": { //A port for your miners to connect to
            "diff": 20000, //the pool difficulty for this port

            /* Variable difficulty is a feature that will automatically adjust difficulty for
               individual miners based on their hashrate in order to lower networking overhead */
            "varDiff": {
                "minDiff": 20000, //Minimum difficulty
                "maxDiff": 225000, //Network difficulty will be used if it is lower than this
                "targetTime": 25, //Try to get 1 share per this many seconds
                "retargetTime": 40, //Check to see if we should retarget every this many seconds
                "variancePercent": 20 //Allow time to very this % from target without retargeting
            }
        },
        //"3333": { //Another port for your miners to connect to, this port does not use varDiff
        //    "diff": 225000 //The pool difficulty
        //}
    },

    /* Recommended to have at least two daemon instances running in case one drops out-of-sync
       or offline. For redundancy, all instances will be polled for block/transaction updates
       and be used for submitting blocks. Creating a backup daemon involves spawning a daemon
       using the "-datadir=/backup" argument which creates a new daemon instance with it's own
       RPC config. For more info on this see:
          - https://en.bitcoin.it/wiki/Data_directory
          - https://en.bitcoin.it/wiki/Running_bitcoind */
    "daemons": [
        {   //Main daemon instance
            "host": "localhost",
            "port": 9332,
            "user": "user",
            "password": "pass"
        }
    ],


    /* This allows the pool to connect to the daemon as a node peer to receive block updates.
       It may be the most efficient way to get block updates (faster than polling, less
       intensive than blocknotify script). It requires the additional field "peerMagic" in
       the coin config. */
    "p2p": {
        "enabled": false,

        /* Host for daemon */
        "host": "127.0.0.1",

        /* Port configured for daemon (this is the actual peer port not RPC port) */
        "port": 19333,

        /* If your coin daemon is new enough (i.e. not a shitcoin) then it will support a p2p
           feature that prevents the daemon from spamming our peer node with unnecessary
           transaction data. Assume its supported but if you have problems try disabling it. */
        "disableTransactions": true

    }

}, function(ip, port , workerName, password, callback){ //stratum authorization function
    console.log("Authorize " + workerName + ":" + password + "@" + ip);
    callback({
        error: null,
        authorized: true,
        disconnect: false
    });
});




pool.on('share', function(isValidShare, isValidBlock, data){

    if (isValidBlock)
        console.log('Block found');
    else if (isValidShare)
        console.log('Valid share submitted');
    else if (data.blockHash)
        console.log('We thought a block was found but it was rejected by the daemon');
    else
        console.log('Invalid share submitted')

    console.log('share data: ' + JSON.stringify(data));
});



/*
'severity': can be 'debug', 'warning', 'error'
'logKey':   can be 'system' or 'client' indicating if the error
            was caused by our system or a stratum client
*/
pool.on('log', function(severity, logKey, logText){
    console.log(severity + ': ' + '[' + logKey + '] ' + logText);
});


pool.start();




/* ===== bitcoin.conf ======  put this file in /home/user/.bitcoin   directory
rpcport=9332
rpcuser=user
rpcpassword=pass
listen=1
server=1
setvbrmultiplier=1
rest=1
*/


/*

Warning, you must have some technical skill to follow these directions. If you are new, just use google to help you.

Copy this file 'index_STRATUM_MINING.js' and copy to:

~/node_modules/stratum-pool

install NODE

Modify the above code to add YOUR BitcoinV address:
"address": "1GPLaBLsczMDDNSueiwbxouGDfLaoxhopq"
change to
"address": "your address here"

****Make sure your address starts with a '1', not a '3' or 'bc'

start SOLO mining with this command:

user@ubuntu-desktop:~/node_modules/stratum-pool$ node index_STRATUM_MINING.js


Point your miner to your BitcoinV wallet.
-open up port 3333 on your home network and point it to the IP address of your computer running the BitcoinV wallet.

You need at least 1 other node connected on the BitcoinV P2P network to mine:

start SOLO mining with this command:

user@ubuntu-desktop:~/node_modules/stratum-pool$ node index_STRATUM_MINING.js

It should succeed and you will start seeing the miner being authorized and valid shares will be submitted.

To update the block reward, modify the bitcoin.conf file line:
setvbrmultiplier=1

change to

setvbrmultiplier=2

Restart the BitcoinV wallet and perform the above steps again.

Block rewards will now be at 2x50 = 100 BTCV.

Get greedy and change to any number between 1 and 1048576, should be a power of 2.

The largest reward possible is 50 x 1048576 = about 50 Million BTCV

Good luck!

*/

