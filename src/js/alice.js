const EthrDID = require('ethr-did');
const ETHEREUM_DID_REGISTRY_ADDRESS = require('./TrustAnchor').ETHEREUM_DID_REGISTRY_ADDRESS;
const requestDataAccessClaim = require('./TrustAnchor').requestDataAccessClaim;
const createDID = require('./TrustAnchor').createDID;
const web3 = require('./TrustAnchor').web3;
const resolveDID = require('./TrustAnchor').resolveDID;

const ropsten_0_address = '0xEdAA87f3a3096bc7C0CE73971b1c463f20Cf3Af5';

const keyPair = {
    address: process.env.EthrDID_ADDRESS_ALICE,
    privateKey: process.env.PRIVATE_KEY_ALICE
}


 //Instantiate the the Ethr DID for Alice. This will represent an identical DID document
 //every time (when resolved) as long as the same key pair is used.
 const ethrDid = new EthrDID({
    ...keyPair,
    provider: web3,
    registry: ETHEREUM_DID_REGISTRY_ADDRESS
});

let didDocument;

resolveDID(ethrDid).then((result) => {
    didDocument = result;
    console.log("did Doc: ", didDocument);
    process.exit(0);
});


// requestDataAccessClaim(ropsten_0_address).then(result => {
//     console.log("Good to go...");
//     process.exit(0);
// }).catch(error => {
//     console.log("Nope.");
//     process.exit(1);
// });

