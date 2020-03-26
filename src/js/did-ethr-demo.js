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
const providerConfig = {rpcUrl: 'https://rinkeby.infura.io/ethr-did', registry: registryAddress}
const resolver = require('did-resolver').default;
const getResolver = require('ethr-did-resolver').getResolver
const EthrDID = require('ethr-did');

let test = async () => {
    

    //Generating Eth keyPair
    const keypair = EthrDID.createKeyPair()
    //console.log("Keypair: ", keypair);

    //Generating Ethr DID
    const ethrDid = new EthrDID({
        ...keypair,
        HDwalletProvider,
        registry: registryAddress
    })
   // console.log('Ethr DID\n\n', ethrDid)

    let did = ethrDid.did

    //const ethrDidResolver = getResolver({HDwalletProvider})
    //const didResolver = resolver(ethrDidResolver)
    //didResolver.resolve(did).then(doc => console.log("jskldklj", doc));

    const providerConfig = {
        networks: [
          { name: "0x3", rpcUrl: "https://ropsten.infura.io/v3/82fa156d2820477885af5607d839f448" }
        ]
      }

    //Registering Ethr Did To Resolver
    getResolver({
        web3,
        registry: registryAddress,
    })

    // //Resolving Ethr DID to DID document
    resolver(did)
        .then(didDocument => {
            console.log('\n\nEthr DID Document\n\n')
            console.dir(didDocument)
        })
        .catch(error => {
            console.error(error)
        })
}

test()