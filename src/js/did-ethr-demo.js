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
let ethrDid

let createEthrDID = async () => {

    // get the accounts from the Ropsten network
    const accounts =  await web3.eth.getAccounts()
    const keyPair = {
        // the keypair below are ones from a Ropsten account but they seem to fail for JWT creation/verification in this scenario
        //address: accounts[0],
        //privateKey: process.env.ACCOUNT_0_PKEY

        // The keypair below were created by EthrDID.createKeyPair()
        address: process.env.EthrDID_ADDRESS,
        privateKey: process.env.EthrDID_PKEY
    }

    // create the signer from the private key
    const signer = SimpleSigner(keyPair.privateKey)

    //Generating Ethr DID
    ethrDid = new EthrDID({
        ...keyPair,
        provider: web3,
        registry: ethereumDIDRegistryAddress
    })

    // this is the complete DID ID (the ethereum address formatted as an ether DID address )
    const didAddress = ethrDid.did
    
    //Registering Ethr Did To Resolver
    const ethrDidResolver = getResolver({
        web3,
        registry: ethereumDIDRegistryAddress,
    })
    
    // create a DID resolver based on the ethr DID resolver
    const didResolver = new Resolver(ethrDidResolver)
    

    //const helloJWT = await ethrDid.signJWT({aud: didAddress, exp: 1957463421, claims: { name: 'Joe Lubin' }, name: 'uPort Developer'})
    //console.log("Data from signJWT: ", helloJWT)
    //console.log("Decoded JWT created from ethrDID:", didJWT.decodeJWT(helloJWT))
    
    // create the JWT directly using the didJWT library
    const theJWT = await didJWT.createJWT({ aud: didAddress, exp: 1957463421, claims: { name: 'Joe Lubin' }, name: 'uPort Developer' },
         { alg: `ES256K-R`, issuer: didAddress, signer }).catch(error => {
             console.log("Error creating/verifying JWT:", error.message)
             process.exit()
         })
    
    // decode it just for debug purposes
    //didJWT.decodeJWT(theJWT)

    // when verifying the token I need to pass the audience argument if it was specified as the 'aud' argument in the createJWT call
    didJWT.verifyJWT(theJWT, {resolver: didResolver, audience: didAddress }).then((verifiedResponse) => {
    console.log("Verified response from verifyJWT: ", verifiedResponse)
    }).catch(error => {
        console.log("Error trying to verify JWT: ", error.message)
        process.exit()
    })

    // verify the token using my EthrDID, this doesn't work, getting error: mnidOrDid.match is not a function
    // ethrDid.verifyJWT(helloJWT, {resolver: didResolver, audience: didAddress }).then((verifiedResponse) => {
    //     console.log("Verified response from ethrDid.verifyJWT: ", verifiedResponse)
    //     }).catch(error => {
    //         console.log("Error trying to verify JWT using ethrDID: ", error.message)
    //         process.exit()
    //     })

    // resolve the DID document for the given DID identity
    didResolver.resolve(ethrDid.did).then(doc => {
        console.log("Resolved DID Document", doc)
        
        })
}


let doStuff = async () => {
    await createEthrDID() 
}

doStuff()

