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
const registryAddress = '0xaA725754A9f228E38F7eF946746662BB321d7FB9';
const TrustAnchorContract = new EthContract(eth)(trustAnchorArtifact.abi);
const trustAnchorContractInstance = TrustAnchorContract.at(registryAddress);

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

/**
 * And here's another way to skin a cat, this time using web3.eth.Contract
 */
const callGetGreetingsUsingWeb3 = () => {
    var fs = require('fs');
    var jsonFile = "./build/contracts/TrustAnchor.json";
    var parsed= JSON.parse(fs.readFileSync(jsonFile));
    var abi = parsed.abi;

    var YourContract= new web3.eth.Contract(abi, registryAddress);
    YourContract.methods.getMessage().call().then(result => {console.log("HHHH", result);});
}

//callGetGreetingUsingTruffleContract();
//callGetGreetingEthJS();
callGetGreetingsUsingWeb3();