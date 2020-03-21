var Web3 = require('web3');
var ganacheProvider = new Web3.providers.HttpProvider("http://localhost:7545");
var web3 = new Web3(ganacheProvider);
// var web3 = new Web3(new Web3.providers.HttpProvider('https://ropsten.infura.io/v3/5db0a2fb8a8948fdbe57bb19eecb5674'));
const fs = require('fs');
const artifacts = require('../../build/contracts/Inbox.json');

var contract = require("@truffle/contract");
let MyContract = contract(artifacts);
MyContract.setProvider(ganacheProvider);


let inboxContract={};

const balance = web3.eth.getBalance('0x207526Be94a4F1DB646a8291Fe0A99327B2338a8', (err, wei) => {
    const b = web3.utils.fromWei(wei, "ether")
    console.log("Balance for account is: ", b);
});



// const getBalance = (address) => {
//     const balancePromise = Web3.eth.getBalance(address);
//     balancePromise.then((value) => {
//         myBalance = web3Connection.utils.fromWei(value, "ether");
//         console.log("MyBalance is ", myBalance);
//         return myBalance;
//     });
// };


// Function that calls getGreeting on the Inbox smart contract
const initialiseInboxContract = () => {
    //const inboxContractJSON = JSON.parse(fs.readFileSync('./build/contracts/Inbox.json', 'utf8'));
    //const contractABI = inboxContractJSON.abi;
    //console.log(JSON.stringify(inboxContractJSON.abi));
    // inboxContract = new web3Connection.eth.Contract(contractABI, {
    //     from: '0x207526Be94a4F1DB646a8291Fe0A99327B2338a8', // default from address
    //     gasPrice: '20000000000' // default gas price in wei, 20 gwei in this case
    // });
    //inboxContract.setProvider(web3Connection.currentProvider);
    //console.log("Default Account: ", inboxContract.defaultAccount);
    // inboxContract.defaultAccount = '0x207526Be94a4F1DB646a8291Fe0A99327B2338a8';
    // console.log("Default Account: ", inboxContract.defaultAccount);
    // inboxContract.deployed().then(instance => {
    //     console.log(">>>>> ", instance.getGreeting());
    // });
    //MyContract.setProvider(web3Connection.currentProvider);

}

const callGetGreeting = async() => {
    MyContract.deployed().then(instance => {
        instance.getMessage().then(value => {console.log("Data from contract call: ", value)});
    }).then((txnID) => {}).catch(function (err) {
        console.log("Promise Rejected", err)});
}

console.log("Init Inbox contract..");
initialiseInboxContract();
callGetGreeting();