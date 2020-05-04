const wtf = require('wtfnode');
var Web3 = require('web3');
//Web3.providers.HttpProvider.prototype.sendAsync = Web3.providers.HttpProvider.prototype.send
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

//Ethereum DID Registery address (smart contract)
const ethereumDIDRegistryAddress = '0xdCa7EF03e98e0DC2B855bE647C39ABe984fcF21B'


//Registering Ethr Did To Resolver
const ethrDidResolver = getResolver({
    web3,
    registry: ethereumDIDRegistryAddress,
})
    
/**
 * create a DID resolver based on the ethr DID resolver, if using a different DID Method (uPort, nacl, https etc)
 * I would pass that specific resolver to the Resolver object.
 */
const didResolver = new Resolver(ethrDidResolver)
let signerDID


let createEthrDID = async () => {

    // get the accounts from the Ropsten network
    //const accounts =  await web3.eth.getAccounts()
    const keyPair = {
        // the keypair below are ones from a Ropsten account but they seem to fail for JWT creation/verification in this scenario
        // from the ether-did repo: Unfortunately, web3 providers are not directly able to sign data in a way that is compliant with the JWT-ES256K standard.
        //address: accounts[0],
        //privateKey: process.env.ACCOUNT_0_PKEY

        // The keypair below were created by EthrDID.createKeyPair()
        address: process.env.EthrDID_ADDRESS,
        privateKey: process.env.EthrDID_PKEY
    }
    
    // create the signer from the private key
    const signer = SimpleSigner(keyPair.privateKey)

    // add signer as a delegate to bobsDID

    //Generating Ethr DID
    signerDID = new EthrDID({
        ...keyPair,
        provider: web3,
        registry: ethereumDIDRegistryAddress
    })
    
    
    const bobsKeyPair = EthrDID.createKeyPair()
    console.log("Bobs's Keypair: ", bobsKeyPair)
    const bobsDID = new EthrDID({
        ...bobsKeyPair,
        provider: web3,
        registry: ethereumDIDRegistryAddress
    })

    //console.log("Signer DID: ", signerDID);
    //console.log("Bob's DID: ", bobsDID);

    //const didDocument = await didResolver.resolve(ethrDid.did)
    //console.log("Resolved DID: ", didDocument)
    
    //create a DID for Bob issued by the main DID
    didJWT.createJWT({ aud: bobsDID.did, exp: 1957463421, claims: { name: 'MTQQ_Read', admin: false, readMQTT: true, writeMQTT: true }, name: 'IoT Device Claim' },
         { alg: `ES256K-R`, issuer: signerDID.did, signer }).then(theJWT => {
            // decode it just for debug purposes
            console.log("Bob's Unverified JWT:", didJWT.decodeJWT(theJWT))
            // when verifying the token I need to pass the audience argument if it was specified as the 'aud' argument in the createJWT call
            didJWT.verifyJWT(theJWT, {resolver: didResolver, audience: bobsDID.did }).then((verifiedResponse) => {
                console.log("Bob's verified JWT ", verifiedResponse)
                end()
                }).catch(error => {
                    console.log("Sorry Bob, computer says No! ", error.message)
                    end(1)
                })
            }).catch(error => {
             console.log("Error creating/verifying JWT:", error.message)
             end(1)
         })
}



const end = (exitCode=0) => {
    process.exit(exitCode)
}

let doStuff = async () => {
    createEthrDID()
    //wtf.dump()
}



//doStuff()

