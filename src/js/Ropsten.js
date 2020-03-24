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
var Contract = require("@truffle/contract");
let DidReg = Contract(DidRegistryContract);
DidReg.setProvider(HDwalletProvider);
//let InboxContract = Contract(artifacts);
//InboxContract.setProvider(HDwalletProvider);


const ropsten_0_address = '0xEdAA87f3a3096bc7C0CE73971b1c463f20Cf3Af5';

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

const callVerifyOwner = async () => {
    let didReg = await DidReg.deployed();
    let idOwner = await didReg.identityOwner(ropsten_0_address);
    console.log("Owner: ", idOwner);

};

//callGetGreeting();
callVerifyOwner();