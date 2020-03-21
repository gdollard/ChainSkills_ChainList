var Web3 = require('web3');
const fs = require('fs');


let inboxContract={};
var web3Connection = new Web3('http://localhost:7545');

const balance = web3Connection.eth.getBalance('0x207526Be94a4F1DB646a8291Fe0A99327B2338a8', (err, wei) => {
    const b = web3Connection.utils.fromWei(wei, "ether")
    console.log("B: ", b);
});



const getBalance = (address) => {
    const balancePromise = web3Connection.eth.getBalance(address);
    balancePromise.then((value) => {
        myBalance = web3Connection.utils.fromWei(value, "ether");
        console.log("MyBalance is ", myBalance);
        return myBalance;
    });
};


// Function that calls getGreeting on the Inbox smart contract
const initialiseInboxContract = () => {
    const inboxContractJSON = JSON.parse(fs.readFileSync('./build/contracts/Inbox.json', 'utf8'));
    const contractABI = inboxContractJSON.abi;
    console.log(JSON.stringify(inboxContractJSON.abi));
    inboxContract = new web3Connection.eth.Contract(contractABI, {
        from: '0x207526Be94a4F1DB646a8291Fe0A99327B2338a8', // default from address
        gasPrice: '20000000000' // default gas price in wei, 20 gwei in this case
    });
    inboxContract.setProvider(web3Connection.currentProvider);
    console.log("Default Account: ", inboxContract.defaultAccount);
    inboxContract.defaultAccount = '0x207526Be94a4F1DB646a8291Fe0A99327B2338a8';
    console.log("Default Account: ", inboxContract.defaultAccount);
    inboxContract.deployed().then(instance => {
        console.log(">>>>> ", instance.getGreeting());
    });
}

const callGetGreeting = async() => {
    inboxContract.deployed().then(instance => {
        console.log(">>>>> ", instance.getGreeting());
    });
}

console.log("Init Inbox contract..");
initialiseInboxContract();
callGetGreeting();