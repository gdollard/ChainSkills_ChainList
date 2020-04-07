const HDWalletProvider = require("truffle-hdwallet-provider");
require('dotenv').config(); //need this module to retrieve the infura mnemonic and API key
const Web3 = require('web3');
var HDwalletProvider =  new HDWalletProvider(process.env.MNEMONIC, "https://ropsten.infura.io/v3/" + process.env.INFURA_API_KEY);
const web3 = new Web3(HDwalletProvider);
const DidRegistryContract = require('ethr-did-registry');
const Contract = require("@truffle/contract");
const truffleDIDRegistryContract = Contract(DidRegistryContract);
const trustAnchorArtifact = require('../../build/contracts/TrustAnchor.json');
truffleDIDRegistryContract.setProvider(HDwalletProvider);
const EthrDID = require('ethr-did');
require('ethr-did');
const ETHEREUM_DID_REGISTRY_ADDRESS = "0xdca7ef03e98e0dc2b855be647c39abe984fcf21b";
const Resolver = require('did-resolver').Resolver;
const getResolver = require('ethr-did-resolver').getResolver;
const didJWT = require('did-jwt');
const { SimpleSigner } = require('did-jwt');
const trustAnchorContractAddress = '0xC5baD71aB5443402155daB864C2F3fE4b01700a7';
var truffleContract = require("@truffle/contract");
let trustAnchorContract = truffleContract(trustAnchorArtifact);
trustAnchorContract.setProvider(HDwalletProvider);

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
 * Calling the identityOwner function of the registry smart contract using the Truffle 
 * contract abstraction.
 * 
 */
const requestDataAccessUsingTruffleContract = async (accountAddress) => {
    
    //verify the owner of the identity by calling the Ethereum registry contract using web3
    let contractInstance = await truffleDIDRegistryContract.deployed();
    let idOwner = await contractInstance.identityOwner(accountAddress);
    return idOwner;
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
const requestDataAccessClaim = async (didObject) => {
    const signer = SimpleSigner(keyPair.privateKey);
    let idOwner = await requestDataAccessUsingTruffleContract(didObject.address);

    if(didObject.address.toUpperCase() === idOwner.toUpperCase()) {
        let theToken = await didJWT.createJWT({ aud: didObject.did, exp: 1957463421, claims: { 
            name: 'MTQQ_Read', 
            admin: false, 
            readMQTT: true, somethingElse: true }, 
            name: 'Read MQTT for '+ didObject.did},
             { alg: `ES256K-R`, 
             issuer: thisDid.did, 
              signer }).catch(error => {
                 console.log("Error when creating Token: ", error.message);
                 return null;
             });
        if(theToken == null){
            return theToken;
        }

        // next add the claim
        let theClaimTxnReceipt = await addClaimUsingTruffleContract().catch(error => {
            console.log("Failed to write the claim to the ledger: ", error);
            return null;
        });
        
        if(theClaimTxnReceipt) {
            return theToken;
        }
        else {
            return null;
        }
    }
};

/**
 * This function writes the claim issue details to the ledger.
 * The contract it calls is TrustAnchor.sol
 */
const addClaimUsingTruffleContract = async() => {
    const ropsten_0_address = process.env.ROPSTEN_ACCOUNT_0_ADDRESS;
    let trustAnchorInstance = await trustAnchorContract.deployed();
    let claimResult = trustAnchorInstance.addClaim("MyTestClaim", trustAnchorContractAddress, "test Token", 12345, {from: ropsten_0_address, gas: 5000000}).then
            (result => {
                return result;
        }).catch(function (err) {
        console.log("Promise Rejected", err)});
    return claimResult;
};

const getNumberOfIssuedClaims = async () => {
    let trustAnchorInstance = await trustAnchorContract.deployed();
    let numClaims = trustAnchorInstance.getNumberOfClaimsIssued().then
        (result => {
            return result;
        }).catch(error => {
            console.log("Error occurred retrieving the number of claims: ", error);
            return null;
        });
    return numClaims;    
};

module.exports = {getNumberOfIssuedClaims, addClaimUsingTruffleContract, requestDataAccessClaim, resolveDID, web3, ETHEREUM_DID_REGISTRY_ADDRESS };

