const { TONClient } = require('ton-client-node-js');
    // ABI and imageBase64 of a binary Hello contract 
    const HelloContract = require('./giverContract.js');
    
    //address of giver on NodeSE
    const giverAddress = '0:841288ed3b55d9cdafa806807f02a0ae0c169aa5edfe88a789a6482429756a94';
    //giver ABI on NodeSE
    const giverAbi =
        {
            'ABI version': 1,
            'functions': [
                {
                    'name': 'constructor',
                    'inputs': [],
                    'outputs': []
                },
                {
                    'name': 'sendGrams',
                    'inputs': [
                        {'name': 'dest', 'type': 'address'},
                        {'name': 'amount', 'type': 'uint64'}
                    ],
                    'outputs': []
                }
            ],
            'events': [],
            'data': []
        };
    
    //Requesting 1000000000 local test nanograms from Node SE giver
    async function get_grams_from_giver(client, account) {
        //console.log(account);
        const {contracts, queries} = client;
        await contracts.run({
            address: giverAddress,
            functionName: 'sendGrams',
            abi: giverAbi,
            input: {
                dest: account,
                amount: 1000000000
            },
            keyPair: null,
        });
    }
    
    
    async function main(client) {
      
    //Generating public and secret key pairs
    let helloKeys = await client.crypto.ed25519Keypair();
      
    //Receiving future Hello contract address
    const futureAddress = (await client.contracts.createDeployMessage({
        package: HelloContract.package,
        constructorParams: {},
        keyPair: helloKeys,
      })).address;

    console.log(`Future address of the contract will be: ${futureAddress}`);
        
    //Requesting contract deployment funds form a local NodeSE giver
    //not suitable for other test networks (net.ton.dev и testnet.ton.dev)
    await get_grams_from_giver(client, futureAddress);
    console.log(`Grams were transfered from giver to ${futureAddress}`);
    
    // Contract deployment 
     const helloAddress = (await client.contracts.deploy({
        package: HelloContract.package,
        constructorParams: {},
        keyPair: helloKeys,
      })).address;
     console.log(`Hello contract was deployed at address: ${helloAddress}`);
    }
    
    (async () => {
        try {
            const client = new TONClient();
    // Connecting to NodeSE at http://0.0.0.0 or http://127.0.0.1 or http://localhost 
            client.config.setData({
                servers: ['http://0.0.0.0']  
            });
            await client.setup();
            await main(client);
            console.log('Hello TON');
        process.exit(0);
        } catch (error) {
            console.error(error);
        }
    })();