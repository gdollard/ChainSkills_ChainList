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

//Ethereum DID Registery address 
const ethereumDIDRegistryAddress = '0xdCa7EF03e98e0DC2B855bE647C39ABe984fcF21B'
let ethrDid

let createEthrDID = async () => {

    const keypairAlt = EthrDID.createKeyPair()
    // get the accounts from the Ropsten network
    const accounts =  await web3.eth.getAccounts()
    // const keyPair = {
    //     address: accounts[0],
    //     privateKey: process.env.ACCOUNT_0_PKEY
    // }

    
    const keyPair_address = 'did:ethr:0xEdAA87f3a3096bc7C0CE73971b1c463f20Cf3Af5'
    const signer = SimpleSigner(keypairAlt.privateKey)
    const ethKey = 'did:ethr:' + keypairAlt.address
    
    //Registering Ethr Did To Resolver
    const ethrDidResolver = getResolver({
        web3,
        registry: ethereumDIDRegistryAddress,
    })
    
    // create a DID resolver based on the ethr DID resolver
    const didResolver = new Resolver(ethrDidResolver)

    //Generating Ethr DID
    ethrDid = new EthrDID({
        ...keypairAlt,
        provider: web3,
        registry: ethereumDIDRegistryAddress
    })

    //const helloJWT = await ethrDid.signJWT({claims: { name: 'Joe Lubin' }})
    //console.log("Data from signJWT: ", helloJWT)
   // console.log("Decoded JWT created from ethrDID:", didJWT.decodeJWT(helloJWT))
    
    
    let jwt = '';
    const theJWT = await didJWT.createJWT({ aud: ethKey, exp: 1957463421, name: 'uPort Developer' },
         { alg: `ES256K-R`, issuer: ethKey, signer }).catch(error => {
             console.log("Error creating/verifying JWT:", error.message)
             process.exit()
         })
    
   
    didJWT.decodeJWT(theJWT)

    didJWT.verifyJWT(theJWT, {resolver: didResolver, audience: ethKey }).then((verifiedResponse) => {
    console.log("Verified response from verifyJWT: ", verifiedResponse)
    }).catch(error => {
        console.log("lslkdjlksjdskljdsjd", error.message)
        process.exit()
    })



    

    
    // await ethrDid.verifyJWT(helloJWT, {resolver: didResolver, audience: keyPair_address }).catch(error => {
    //          console.log("Error from verifyJWT: ", error.message)
    //         process.exit()
    //     })
    // didJWT.createJWT({ aud: keyPair.address, exp: 1957463421, name: 'uPort Developer' },
    //     { alg: `ES256K-R`, issuer: keyPair.address, simpleSigner }).then(jwt => {
    //         console.log("Error at createJWT ", jwt) // this works fine

    //         didJWT.verifyJWT(jwt, {resolver: didResolver, audience: keyPair.address }).then((verifiedRespone) => {
    //             console.log(verifiedRespone)
    //         })
    //     }).catch(error => {
    //         console.log("RRRRRR ", error)
    //         process.exit()
    //     })
    // const {payload, issuer} = await ethrDid.verifyJWT(helloJWT, {resolver: didResolver, audience: keyPair.address }).catch(error => {
    //     console.log("Error from verifyJWT: ", error.message)
    //     process.exit()
    //})

    // resolve the DID document for the given DID identity
    didResolver.resolve(ethrDid.did).then(doc => {
        console.log("DID Document", doc)
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
    const {payload, issuer} = await verifyJWT(helloJWT).catch(error => {console.log("Error when verifying JWT: ", error)})
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

