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
const Resolver = require('did-resolver').Resolver;
const getResolver = require('ethr-did-resolver').getResolver;


//Registering Ethr Did To Resolver
const ethrDidResolver = getResolver({
    web3,
    registry: ETHEREUM_DID_REGISTRY_ADDRESS,
});
const didResolver = new Resolver(ethrDidResolver);

/**
 * Resolves the given EthrDID object to produce a DID document in JSON. 
 * 
 */
const resolveDID = async(didObject) => {
    const didDocument = await didResolver.resolve(didObject.did);
    return didDocument;
};

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
            // further checks needed
            return;
        }
        idOwner = false;
        return;
    })
    
    return idOwner;
}




/**
 * Calling the identityOwner function of the registry smart contract using the Truffle 
 * contract abstraction.
 * 
 */
const requestDataAccessUsingTruffleContract = async (accountAddress) => {
    
    //verify the owner of the identity by calling the Ethereum registry contract using web3
    let contractInstance = await truffleDIDRegistryContract.deployed();
    let idOwner = await contractInstance.identityOwner(accountAddress);
    console.log("Owner: ", idOwner);
};

const requestDataAccessClaim = (did) => {

}

module.exports = {requestDataAccessClaim, resolveDID, web3, ETHEREUM_DID_REGISTRY_ADDRESS };

