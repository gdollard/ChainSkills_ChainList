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
const didJWT = require('did-jwt');
const { SimpleSigner } = require('did-jwt');

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

const keyPair = {
    address: process.env.EthrDID_ADDRESS_ANCHOR,
    privateKey: process.env.PRIVATE_KEY_ANCHOR
};





// instantiate DID for this Anchor (technically could be multiple)
const thisDid = new EthrDID({
    ...keyPair,
    provider: web3,
    registry: ETHEREUM_DID_REGISTRY_ADDRESS
});

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

/**
 * Called by a party who wishes to request a claim from this anchor. They pass their DID formulated ID string
 * and if everything checks out a JWT is returned. Many assumptions are made here on the caller's ID having
 * previously been created upon an inspection and approval process on behalf of this Trust Anchor. This function
 * keeps it all high-level for proof of concept.
 * 
 * did is an EthrDID object.
 * 
 */
const requestDataAccessClaim = (didObject) => {

    // get the DID Registry
    let DidReg = new web3.eth.Contract(DidRegistryContract.abi, ETHEREUM_DID_REGISTRY_ADDRESS);
    
    // create the signer from the private key
    const signer = SimpleSigner(keyPair.privateKey);
    
    
    let theResult = DidReg.methods.identityOwner(didObject.address).call().then(result => {
        let identity = result;
        if(didObject.address.toUpperCase() === identity.toUpperCase()) {
            // the owner of the identity is this address, continue
            let result = didJWT.createJWT({ aud: didObject.did, exp: 1957463421, claims: { 
                name: 'MTQQ_Read', 
                admin: false, 
                readMQTT: true, somethingElse: true }, 
                name: 'Read MQTT for '+ didObject.did},
                 { alg: `ES256K-R`, 
                 issuer: thisDid.did, 
                 signer }).then((result) => {
                     return result;
                }).catch(error => {
                     console.log("Error creating JWT for " + didObject.did + ": ", error.message);
                 });
            // return the Promise from the create JWT call
            return result;
        }
        return null;
    }).catch(registryError => {
        console.log("Error checking the identity owner: ", registryError);
        return null;
    });
    return theResult;

    
};

module.exports = {requestDataAccessClaim, resolveDID, web3, ETHEREUM_DID_REGISTRY_ADDRESS };

