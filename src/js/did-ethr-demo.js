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
let ethrDid

let createEthrDID = async () => {

    // get the accounts from the Ropsten network
    const accounts =  await web3.eth.getAccounts()
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

    //Generating Ethr DID
    ethrDid = new EthrDID({
        ...keyPair,
        provider: web3,
        registry: ethereumDIDRegistryAddress
    })
    
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
    
   
    // create the JWT directly using the didJWT library, the issuer = eth did address of a trusted party
    didJWT.createJWT({ aud: ethrDid.did, exp: 1957463421, claims: { name: 'Joe Developer', admin: false, readMQTT: true }, name: 'Developer MTQQ Reader' },
         { alg: `ES256K-R`, issuer: ethrDid.did, signer }).then(theJWT => {
            // decode it just for debug purposes
            console.log("Unverified JWT:", didJWT.decodeJWT(theJWT))
            // when verifying the token I need to pass the audience argument if it was specified as the 'aud' argument in the createJWT call
            didJWT.verifyJWT(theJWT, {resolver: didResolver, audience: ethrDid.did }).then((verifiedResponse) => {
                console.log("Verified response from verifyJWT: ", verifiedResponse)
                end()
                }).catch(error => {
                    console.log("Error trying to verify JWT: ", error.message)
                    process.exitCode = 1
        })
            
         }
         ).catch(error => {
             console.log("Error creating/verifying JWT:", error.message)
             process.exitCode = 1
         })
    
    

    


    // resolve the DID document for the given DID identity
   // didResolver.resolve(ethrDid.did).then(doc => {
      //  console.log("Resolved DID Document", doc)
        
    //    })
}

const end = () => {
    process.exit()
}

let doStuff = async () => {
    createEthrDID()
    //wtf.dump()
}

doStuff()

