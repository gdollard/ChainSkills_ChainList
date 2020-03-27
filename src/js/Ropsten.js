/*
* This file will interact with contract functions on the Ropsten test net, make sure you have deployed your contracts
* onto the Ropsten network using the command: truffle migrate --compile-all --reset --network ropsten
* To check the network details see truffle-config.js
*/ 

const HDWalletProvider = require("truffle-hdwallet-provider");
require('dotenv').config(); //need this module to retrieve the infura mnemonic and API key

var Web3 = require('web3');

const DidRegistryContract = require('ethr-did-registry');

var HDwalletProvider =  new HDWalletProvider(process.env.MNEMONIC, "https://ropsten.infura.io/v3/" + process.env.INFURA_API_KEY);
var web3 = new Web3(HDwalletProvider);
const artifacts = require('../../build/contracts/Inbox.json');
const Contract = require("@truffle/contract");
const DidReg = Contract(DidRegistryContract);
DidReg.setProvider(HDwalletProvider);
//let InboxContract = Contract(artifacts);
//InboxContract.setProvider(HDwalletProvider);


const ropsten_0_address = '0xEdAA87f3a3096bc7C0CE73971b1c463f20Cf3Af5';
const ropsten_1_address = '0xB72fD1f1cC6ecbE44270a5E235e81d768cf1BF86';



// Little bit of tester code to verify I'm using web3.eth properly and looking at a valid address on the network
const balance = web3.eth.getBalance(ropsten_0_address, (err, wei) => {
    const b = web3.utils.fromWei(wei, "ether")
    console.log("Balance for account is: ", b);
});


const callGetGreeting = async() => {
    await MyContract.deployed().then(instance => {
        instance.getMessage().then(value => {console.log("Data from the contract call: ", value)});
    }).then((txnID) => {}).catch(function (err) {
        console.log("Promise Rejected", err)});
};

/**
 * Invoke the ether-did-registry using the truffle contract abstraction.
 */
const callVerifyOwner = async () => {
    let didReg = await DidReg.deployed();
    let idOwner = await didReg.identityOwner(ropsten_0_address);
    console.log("Owner: ", idOwner);

};

/**
 * Change ownership from address 0 to address 1
 */
const setupEventListener = async () => {
    let didReg = await DidReg.deployed();
    didReg.getPastEvents('AllEvents',
    {
        fromBlock: 7462390,
        toBlock: "latest"
    },
    (err, events) => {console.log("QQQQ ", events.length);}
    );
    // let didReg = await DidReg.deployed();
    // var event = didReg.DIDOwnerChanged({}, {fromBlock: 7462390, toBlock: "latest"});
    // event.watch(function(error, result) {
    //     if(!error) {
    //         console.log("HHHHHHH");
    //     }
    // });
    //didReg.events.DIDOwnerChanged({fromBlock: "latest"}, (error, event) => {Console.log("We have an event: ", event);}).
    // on('data', (event) => {
    //     console.log("BBBBBB");
    // }).
    // on('connected', (event) => {
    //     console.log("CCCCCC");
    // }).
    // on('error', (event) => {
    //     console.log("DDDDDDD");
    // });
};

const changeOwner = async () => {
    let didReg = await DidReg.deployed();
    let txnReceipt = await didReg.changeOwner(ropsten_0_address, ropsten_1_address, {from: ropsten_0_address, gas: 5000000}).then((err, event) => {
        console.log("NNNNN", event);
    }).catch(error => { console.log('caught', error.message); });
    console.log("VVVVV ", txnReceipt);
};

const listenToRegistryEvents = async () => {
    //get the contract instance first
    let event = DidReg.DIDOwnerChanged();
    event.watch((error, result) => {
        if (!error)
            console.log("Owner has changed..");
    });

    //let didReg = await DidReg.deployed();
    //let changeOwnerEvent = await didReg.DIDOwnerChanged();

    // watch for changes
    // changeOwnerEvent.watch((error, result) => {
    //     if (!error)
    //         console.log("Owner has changed..");
    // });

};

//listenToRegistryEvents();
//callGetGreeting();
callVerifyOwner();
//setupEventListener();
//changeOwner();