// network config
const Web3 = require('web3')
Web3.providers.HttpProvider.prototype.sendAsync = Web3.providers.HttpProvider.prototype.send
let provider = new Web3.providers.HttpProvider('http://localhost:8546')

const EthrDID = require('ethr-did');
const resolve = require('did-resolver').default;
const registerResolver = require('ethr-did-resolver').default;


const didJWT = require('did-jwt');
const { createJWT, verifyJWT, SimpleSigner } = require('did-jwt');

// get accounts
//const accounts = await provider.eth.getAccounts();
const keypair = EthrDID.createKeyPair();
                                
const signer = SimpleSigner(keypair.privateKey);
const didRegistryAddress = '0x68342D370d2660625239296fC6C3b7668f85ea85';
const address = '0x207526Be94a4F1DB646a8291Fe0A99327B2338a8';

//Generating Ethr DID
const ethrDid = new EthrDID({ provider, didRegistryAddress, address });

let test = async () => {
    const delegate = await ethrDid.createSigningDelegate();
    createJWT({ aud: 'did:ethr:0x07b3fae112f54be9c1bd4477565e0366c41fc2f3', exp: 1957463421, name: 'uPort Developer' },
        { alg: 'ES256K-R', issuer: 'did:ethr:0x07b3fae112f54be9c1bd4477565e0366c41fc2f3', signer }).then(jwt => {
            console.log(jwt); // this works fine
            // this does not work
            verifyJWT(jwt, { audience: 'did:ethr:0x07b3fae112f54be9c1bd4477565e0366c41fc2f3' }).then((verifiedRespone) => {
                console.log(verifiedRespone);
            });
        });

}

test()