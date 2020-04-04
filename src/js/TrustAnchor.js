const HDWalletProvider = require("truffle-hdwallet-provider");
require('dotenv').config(); //need this module to retrieve the infura mnemonic and API key
const Web3 = require('web3');
var HDwalletProvider =  new HDWalletProvider(process.env.MNEMONIC, "https://ropsten.infura.io/v3/" + process.env.INFURA_API_KEY);
const web3 = new Web3(HDwalletProvider);
const DidRegistryContract = require('ethr-did-registry');
const Contract = require("@truffle/contract");
const truffleDIDRegistryContract = Contract(DidRegistryContract);
truffleDIDRegistryContract.setProvider(HDwalletProvider);
const EthrDID = require('ethr-did');
require('ethr-did');
const ETHEREUM_DID_REGISTRY_ADDRESS = "0xdca7ef03e98e0dc2b855be647c39abe984fcf21b";

/**
 * 
 * 
 */
const requestDataAccess = async (accountAddress) => {

    //verify the owner of the identity by calling the Ethereum registry contract using web3
    let DidReg = new web3.eth.Contract(DidRegistryContract.abi, ETHEREUM_DID_REGISTRY_ADDRESS);
    let idOwner; 
    DidReg.methods.identityOwner(accountAddress).call().then(result => {
        if(result === accountAddress) {
            idOwner = true;
            return;
        }
        idOwner = false;
        return;
    })
    
    return idOwner;
}


/**
 * Create a DID 
 */
const createDID = () => {
    
    const keypair = EthrDID.createKeyPair();

    ethrDid = new EthrDID({
        ...keypair,
        provider: web3,
        registry: ETHEREUM_DID_REGISTRY_ADDRESS
    });
    return ethrDid;
};

/**
 * 
 * 
 */
const requestDataAccessUsingTruffleContract = async (accountAddress) => {
    
    //verify the owner of the identity by calling the Ethereum registry contract using web3
    let contractInstance = await truffleDIDRegistryContract.deployed();
    let idOwner = await contractInstance.identityOwner(accountAddress);
    console.log("Owner: ", idOwner);
};

module.exports = {createDID, requestDataAccess};

