var Web3 = require('web3');
require('dotenv').config(); //need this module to retrieve the infura mnemonic and API key
const HDWalletProvider = require("truffle-hdwallet-provider");

// Create the wallet provider which will sign transactions using my mnemonic
var walletProvider =  new HDWalletProvider(process.env.MNEMONIC, "https://ropsten.infura.io/v3/" + process.env.INFURA_API_KEY);
var web3 = new Web3(walletProvider);

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

    const simpleSigner = SimpleSigner('0x92dd08591c87f6b860fd2bb4895d593f9f240a6f289883a7d5d625494eaeda1d')
    
    
    //Registering Ethr Did To Resolver
    const ethrDidResolver = getResolver({
        web3,
        registry: ethereumDIDRegistryAddress,
    })
    
    // create a DID resolver based on the ethr DID resolver
    const didResolver = new Resolver(ethrDidResolver)

    //Generating Ethr DID
    ethrDid = new EthrDID({
        address: keyPair.address,
        privateKey: keyPair.privateKey,
        provider: web3,
        registry: ethereumDIDRegistryAddress
    })
    // the full DID compatible string 
    let didString = ethrDid.did

    // resolve the DID document for the given DID identity
    didResolver.resolve(didString).then(doc => {
        console.log("DID Document", doc)
        const helloJWT = ethrDid.signJWT({hello: 'world'})
        console.log("JWT: ", helloJWT)
        const {payload, issuer} = ethrDid.verifyJWT(helloJWT).then(data => {console.log("GGGG ", data)}).catch(error => {console.log("Error when verifying JWT: ", error)})
        })
}

/**
 * Sign and verify a JWT.
 */
let signJWT = async () => {
    

    

    let verifiedRespone = {};
    // pass the JWT from step 1 & 2
    didJWT.verifyJWT(helloJWT, {resolver: didResolver, audience: 'did:ethr:0xf3beac30c498d9e26865f34fcaa57dbb935b0d74'}).then((response) =>
        { verifiedRespone = response });
    console.log("TTTTTT", verifiedRespone);
    



    //await ethrDid.createSigningDelegate().catch(error => {console.log("Error creating a signing delegate", error.message)})
    //const {payload, issuer} = await verifyJWT(helloJWT).catch(error => {console.log("Error when verifying JWT: ", error)})
    //const {payload, issuer} = await ethrDid.verifyJWT(helloJWT).then(data => {console.log("GGGG ", data)}).catch(error => {console.log("Error when verifying JWT: ", error)})
    // payload contains the JavaScript object that was signed together with a few JWT specific attributes
    //console.log("Verified Payload: ", payload)
    // Issuer contains the DID of the signing identity
    //console.log("iSSUER: ", issuer)

}

let doStuff = async () => {
    await createEthrDID()
    //signJWT()
}

doStuff()

