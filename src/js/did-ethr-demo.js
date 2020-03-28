const HDWalletProvider = require("truffle-hdwallet-provider");
require('dotenv').config(); //need this module to retrieve the infura mnemonic and API key
var Web3 = require('web3');

// Create the wallet provider which will sign transactions using my mnemonic
var HDwalletProvider =  new HDWalletProvider(process.env.MNEMONIC, "https://ropsten.infura.io/v3/" + process.env.INFURA_API_KEY);
var web3 = new Web3(HDwalletProvider);

const Resolver = require('did-resolver').Resolver
const getResolver = require('ethr-did-resolver').getResolver
const EthrDID = require('ethr-did');

const didJWT = require('did-jwt')
const { SimpleSigner } = require('did-jwt')

//Ethereum DID Registery address 
const ethereumDIDRegistryAddress = '0xdCa7EF03e98e0DC2B855bE647C39ABe984fcF21B'
let ethrDid

let createEthrDID = async () => {

    // get the accounts from the Ropsten network
    const accounts =  await web3.eth.getAccounts()
    const keyPair = {
        address: accounts[0],
        privateKey: process.env.ACCOUNT_0_PKEY
    }

    //Generating Ethr DID
    ethrDid = new EthrDID({
        ...keyPair,
        web3,
        registry: ethereumDIDRegistryAddress
    })
    
    // the full DID compatible string 
    let didString = ethrDid.did

    //Registering Ethr Did To Resolver
    const ethrDidResolver = getResolver({
        web3,
        registry: ethereumDIDRegistryAddress,
    })
    
    // create a DID resolver based on the ethr DID resolver
    const didResolver = new Resolver(ethrDidResolver)
    
    // resolve the DID document for the given DID identity
    didResolver.resolve(didString).then(doc => {
        console.log("DID Document", doc)
        process.exit()})
}

/**
 * Sign and verify a JWT.
 */
let signJWT = async () => {
    const helloJWT = await ethrDid.signJWT({alg : 'ES256K-R', hello: 'world'})
    console.log("JWT: ", helloJWT)

    //await ethrDid.createSigningDelegate().catch(error => {console.log("Error creating a signing delegate", error.message)})

    const {payload, issuer} = await ethrDid.verifyJWT(helloJWT).then(data => {console.log("GGGG ", data)}).catch(error => {console.log("Error when verifying JWT: ", error)})
    // payload contains the JavaScript object that was signed together with a few JWT specific attributes
    //console.log("Verified Payload: ", payload)
    // Issuer contains the DID of the signing identity
    //console.log("iSSUER: ", issuer)

}

let doStuff = async () => {
    await createEthrDID()
    signJWT()
}

doStuff()

