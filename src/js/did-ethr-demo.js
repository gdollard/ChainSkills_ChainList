//Use 'ethjs-provider-http' instead of 'web3' due to this issue: https://github.com/uport-project/ethr-did/issues/3#issuecomment-413908925
const HDWalletProvider = require("truffle-hdwallet-provider");
require('dotenv').config(); //need this module to retrieve the infura mnemonic and API key
var Web3 = require('web3');
var HDwalletProvider =  new HDWalletProvider(process.env.MNEMONIC, "https://ropsten.infura.io/v3/" + process.env.INFURA_API_KEY);
var web3 = new Web3(HDwalletProvider);
const HttpProvider = require('ethjs-provider-http')
let provider = new HttpProvider('https://ropsten.infura.io/v3/82fa156d2820477885af5607d839f448')
//Registery address for ethr did
const registryAddress = '0xdCa7EF03e98e0DC2B855bE647C39ABe984fcF21B'
const providerConfig = {rpcUrl: 'https://ropsten.infura.io/v3/82fa156d2820477885af5607d839f448', registry: registryAddress}
const Resolver = require('did-resolver').Resolver
const getResolver = require('ethr-did-resolver').getResolver
const EthrDID = require('ethr-did');

let test = async () => {
    

    //Generating Eth keyPair {address, private key}
    const keypair = EthrDID.createKeyPair()
    //console.log("Keypair: ", keypair);

    //Generating Ethr DID
    const ethrDid = new EthrDID({
        ...keypair,
        HDwalletProvider,
        registry: registryAddress
    })
    

    let did = ethrDid.did

    //Registering Ethr Did To Resolver
    const ethrDidResolver = getResolver({
        web3,
        registry: registryAddress,
    })
    
    // create a DID resolver based on the ethr DID resolver
    const didResolver = new Resolver(ethrDidResolver)
    
    // resolve the DID document for the given DID identity
    didResolver.resolve(did).then(doc => {console.log("XXX", doc)
        process.exit()})
}

test()
