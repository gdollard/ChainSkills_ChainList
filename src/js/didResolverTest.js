// Source: https://github.com/cluster-labs/did-ethr-demo
//Use 'ethjs-provider-http' instead of 'web3' due to this issue: https://github.com/uport-project/ethr-did/issues/3#issuecomment-413908925
//const HttpProvider = require('ethjs-provider-http')
//let provider = new HttpProvider('https://rinkeby.infura.io')

const HDWalletProvider = require("truffle-hdwallet-provider");
require('dotenv').config(); //need this module to retrieve the infura mnemonic and API key
var HDwalletProvider =  new HDWalletProvider(process.env.MNEMONIC, "https://ropsten.infura.io/v3/" + process.env.INFURA_API_KEY);

const resolve = require('did-resolver').default;
const registerEthrDidToResolver = require('ethr-did-resolver').default
const EthrDID = require('ethr-did');

let test = async () => {
    //Registery address for ethr did on Ropsten
    let registryAddress = '0xdca7ef03e98e0dc2b855be647c39abe984fcf21b'

    //Generating Eth keyPair
    const keypair = EthrDID.createKeyPair()

    //Generating Ethr DID
    const ethrDid = new EthrDID({
        ...keypair,
        HDwalletProvider,
        registry: registryAddress
    })
    console.log('Ethr DID\n\n', ethrDid)

    let did = ethrDid.did

    //Registering Ethr Did To Resolver
    registerEthrDidToResolver({
        HDwalletProvider,
        registry: registryAddress,
    })

    //Resolving Ethr DID to DID document
    resolve(did)
        .then(didDocument => {
            console.log('\n\nEthr DID Document\n\n')
            console.dir(didDocument)
        })
        .catch(error => {
            console.error(error)
        })
}

test()