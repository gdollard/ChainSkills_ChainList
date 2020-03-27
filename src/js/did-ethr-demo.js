const HDWalletProvider = require("truffle-hdwallet-provider");
require('dotenv').config(); //need this module to retrieve the infura mnemonic and API key
var Web3 = require('web3');
var HDwalletProvider =  new HDWalletProvider(process.env.MNEMONIC, "https://ropsten.infura.io/v3/" + process.env.INFURA_API_KEY);
var web3 = new Web3(HDwalletProvider);

const Resolver = require('did-resolver').Resolver
const getResolver = require('ethr-did-resolver').getResolver
const EthrDID = require('ethr-did');

//Ethereum DID Registery address 
const ethereumDIDRegistryAddress = '0xdCa7EF03e98e0DC2B855bE647C39ABe984fcF21B'
const ropsten_0_address = '0xEdAA87f3a3096bc7C0CE73971b1c463f20Cf3Af5';
const ropsten_1_address = '0xB72fD1f1cC6ecbE44270a5E235e81d768cf1BF86';

let test = async () => {

    //Generating Eth keyPair {address, private key}
    const keypair = EthrDID.createKeyPair()
    //console.log("Keypair: ", keypair);

    //Generating Ethr DID
    const ethrDid = new EthrDID({
        ...keypair,
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
    didResolver.resolve(didString).then(doc => {console.log("DID Document", doc)
        process.exit()})
}

test()
