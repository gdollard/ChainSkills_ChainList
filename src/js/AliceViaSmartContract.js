// This is a testbed for developing contracts and running on a local Ganache node.

var sleep = require('sleep');
var Web3 = require('web3');
Web3.providers.HttpProvider.prototype.sendAsync = Web3.providers.HttpProvider.prototype.send
var ganacheProvider = new Web3.providers.HttpProvider("http://localhost:7545");
var web3 = new Web3(ganacheProvider);
const DidRegistryContract = require('ethr-did-registry');
const trustAnchorArtifact = require('../../build/contracts/TrustAnchor.json');
var truffleContract = require("@truffle/contract");
let trustAnchorContract = truffleContract(trustAnchorArtifact);
trustAnchorContract.setProvider(ganacheProvider);

// loading a smart contract using eth-js
const Eth = require('ethjs-query');
const EthContract = require('ethjs-contract');
const eth = new Eth(ganacheProvider);
const trustAnchorContractAddress = '0x90A535a0A4Ed1CB7b07aBB5b1EcDaC4BC9704ccC';
const TrustAnchorContract = new EthContract(eth)(trustAnchorArtifact.abi);
const trustAnchorContractInstance = TrustAnchorContract.at(trustAnchorContractAddress);

// local dev account
const ganache_account_0 = '0x207526Be94a4F1DB646a8291Fe0A99327B2338a8';

/**
 * Call the contract using the Truffle Contract abstraction.
 */
const callGetGreetingUsingTruffleContract = () => {
    trustAnchorContract.deployed().then(instance => {
        instance.getMessage().then(value => {console.log("Message from smart contract: ", value)});
    }).then((txnID) => {}).catch(function (err) {
        console.log("Promise Rejected", err)});
}

/**
 * Call the contract using web3 in conjunction with the JSON interface and the contract address.
 */
const callGetGreetingEthJS = () => {
    trustAnchorContractInstance.getMessage().then(result => {
        console.log(">>", result);});
    
}

const addClaimUsingEthJS = () => {
    trustAnchorContractInstance.addClaim("MyTestClaim", trustAnchorContractAddress, "test Token", 12345, {from: ganache_account_0, gas: 5000000})
    .then(result => {
        console.log("addClaimUsingEthJS", result);
    });
    
}

/**
 * And here's another way to skin a cat, this time using web3.eth.Contract
 */
const callGetGreetingsUsingWeb3 = () => {
    var fs = require('fs');
    var jsonFile = "./build/contracts/TrustAnchor.json";
    var parsed= JSON.parse(fs.readFileSync(jsonFile));
    var abi = parsed.abi;

    var trustAnchorContract= new web3.eth.Contract(abi, trustAnchorContractAddress);
    trustAnchorContract.methods.getMessage().call().then(result => {console.log("Result from contract:", result);});
}

/**
 * Doesn't work
 */
const addClaim = () => {
    var fs = require('fs');
    var jsonFile = "./build/contracts/TrustAnchor.json";
    var parsed= JSON.parse(fs.readFileSync(jsonFile));
    var abi = parsed.abi;

    var trustAnchorContract= new web3.eth.Contract(abi, trustAnchorContractAddress);
    trustAnchorContract.methods.addClaim("MyTestClaim", trustAnchorContractAddress, "test Token", 12345).call().
        then(result => {
            console.log("Result addClaim:", result);
        });
};

/**
 * Works!
 */
const getNumberOfIssuedClaims = () => {
    var fs = require('fs');
    var jsonFile = "./build/contracts/TrustAnchor.json";
    var parsed= JSON.parse(fs.readFileSync(jsonFile));
    var abi = parsed.abi;

    var trustAnchorContract= new web3.eth.Contract(abi, trustAnchorContractAddress);
    trustAnchorContract.methods.getNumberOfClaimsIssued().call().
        then(result => {console.log("Number of claims issued:", result);});
};

/**
 * Adding a claim: this function works!
 */
const addClaimUsingTruffleContract = () => {
    trustAnchorContract.deployed().then(instance => {
        instance.addClaim("MyTestClaim", trustAnchorContractAddress, "test Token", 12345, {from: ganache_account_0, gas: 5000000}).then
            (result => {console.log("Add claim result: ", result)});
    }).then((txnID) => {}).catch(function (err) {
        console.log("Promise Rejected", err)});
};

/**
 * Not working
 */
const listenToEventsUsingTruffleContract = () => {
    trustAnchorContract.deployed().then(instance => {
        instance
                .ClaimIssued()
                .on("data", event => {
                    console.log("Caught event: ", event);
                })
                .on("error", error => {
                    console.error("Oops, something went wrong when adding a claim: ", error);
                });
    });  
};

/**
 * Doesn't work!
 */
const listenToAddClaimEventUsingWeb3 = () => {
    var fs = require('fs');
    var jsonFile = "./build/contracts/TrustAnchor.json";
    var parsed= JSON.parse(fs.readFileSync(jsonFile));
    var abi = parsed.abi;

    var trustAnchorContract= new web3.eth.Contract(abi, trustAnchorContractAddress);
    trustAnchorContract.events.ClaimIssued((error, event) => {
        console.log("Event back from claim added: ", event);
    }).on('data', function(event){
        console.log("Event triggered...",event); 
    }).on("connected", function(subscriptionId){
        console.log("Subscribed to addClaim event:", subscriptionId);
    }).on('changed', function(event){
        console.log("Changed...", event);
    });
};

// register listeners
//listenToAddClaimEventUsingWeb3();
listenToEventsUsingTruffleContract();
//sleep.sleep(2);


// functions not working for some reason which I have no time to investigate!
//addClaim();


// ** working functions ***
//addClaimUsingEthJS();
addClaimUsingTruffleContract();

//getNumberOfIssuedClaims();

//callGetGreetingUsingTruffleContract();
//callGetGreetingEthJS();
//callGetGreetingsUsingWeb3();
