var Web3 = require('web3');
var ganacheProvider = new Web3.providers.HttpProvider("http://localhost:7545");
var web3 = new Web3(ganacheProvider);
const artifacts = require('../../build/contracts/Inbox.json');
var contract = require("@truffle/contract");
let MyContract = contract(artifacts);
MyContract.setProvider(ganacheProvider);


const ganache_account_0 = '0x207526Be94a4F1DB646a8291Fe0A99327B2338a8';
const balance = web3.eth.getBalance(ganache_account_0, (err, wei) => {
    const b = web3.utils.fromWei(wei, "ether")
    console.log("Balance for account is: ", b);
});


const callGetGreeting = async() => {
    await MyContract.deployed().then(instance => {
        instance.getMessage().then(value => {console.log("Data from the contract call: ", value)});
    }).then((txnID) => {}).catch(function (err) {
        console.log("Promise Rejected", err)});
}

console.log("Init Inbox contract..");
callGetGreeting();