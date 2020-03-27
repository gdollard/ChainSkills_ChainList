/**
 * This file interacts with various contracts on the Ganache network using web3js
 */
require = require("esm")(module/*, options*/)
var Web3 = require('web3');
Web3.providers.HttpProvider.prototype.sendAsync = Web3.providers.HttpProvider.prototype.send
var privateNetworkProvider = new Web3.providers.HttpProvider("http://localhost:8545");
var web3 = new Web3(privateNetworkProvider);
const inboxArtifact = require('../../build/contracts/Inbox.json');
var truffleContract = require("@truffle/contract");
let inboxContract = truffleContract(inboxArtifact);
inboxContract.setProvider(privateNetworkProvider);

const didJWT = require('did-jwt');
const chainListArtifact = require('../../build/contracts/ChainList.json');
var truffleContract = require("@truffle/contract");
let chainListContract = truffleContract(chainListArtifact);
chainListContract.setProvider(privateNetworkProvider);

const ethereumDIDRegistryArtifact = require('../../build/contracts/EthereumDIDRegistry.json');
let ethereumDIDRegistryContract = truffleContract(ethereumDIDRegistryArtifact);
ethereumDIDRegistryContract.setProvider(privateNetworkProvider);
const EthrDID = require('ethr-did');



web3.eth.getAccounts((error, accounts) => console.log("Default Account: ", accounts[0]));
const ganache_account_0 = '0x207526Be94a4F1DB646a8291Fe0A99327B2338a8';
const ganache_account_1 = '0x4DeDB748DA0184bFFb44cA074c116c68C9175D39';
const chainskills_account_0 = '0x9932aee2b8be4bca94664bf576410f1383c37f6a';
const chainskills_account_1 = '0x024e37cdecc2835ce39ddefa8366c2f95c5b1a56';
const chainskills_account_2 = '0x2d419b55bf9cd3ff96cfc2cb5c1d3d631289b49c';

const balance = web3.eth.getBalance(ganache_account_0, (err, wei) => {
    const b = web3.utils.fromWei(wei, "ether")
    console.log("Balance for account is: ", b);
});


const callGetGreeting = async() => {
    await inboxContract.deployed().then(instance => {
        instance.getMessage().then(value => {console.log("Message from smart contract: ", value)});
    }).then((txnID) => {}).catch(function (err) {
        console.log("Promise Rejected", err)});
}

const callGetNumberOfArticles = async() => {
    await chainListContract.deployed().then(instance => {
        instance.getNumberOfArticles().then(value => {console.log("Number of articles: ", value)});
    }).then((txnID) => {}).catch(function (err) {
        console.log("Promise Rejected", err)});
}

const callGetArticlesForSale = async() => {
    await chainListContract.deployed().then(instance => {
        instance.getArticlesForSale().then(value => {console.log("Articles for sale: ", value)});
    }).then((txnID) => {}).catch(function (err) {
        console.log("Promise Rejected", err)});
}

const callSellArticle = async() => {
    await chainListContract.deployed().then(instance => {
        instance.sellArticle("My TV", "This TV is broken!", web3.utils.toWei("1", "ether"), {from: ganache_account_0, gas: 5000000}).then
        (value => {console.log("Article submitted for sale : ", value)});
    }).then((txnID) => {}).catch(function (err) {
        console.log("Promise Rejected", err)});
}

const callGetIdentityOwner = async() => {
    await ethereumDIDRegistryContract.deployed().then(instance => {
        console.log("We have a Registry contract instance..");
        instance.identityOwner(ganache_account_0).then
        (value => {console.log("Identity Owner return value : ", value);});
    }).then((txnID) => {}).catch(function (err) {
        console.log("Promise Rejected", err)});
}

const doEthrDIDStuff = async() => {
    const keypair = EthrDID.createKeyPair();
    // Save keypair somewhere safe
    //const ethrDid = new EthrDID({...keypair, provider});
    
    const signer = didJWT.SimpleSigner(keypair.privateKey);
    const ethrDid = new EthrDID({provider: privateNetworkProvider, address: keypair.address,  signer: signer});

    // await ethrDid.createSigningDelegate().then((txnID) => {}).catch(function (err) {
    //     console.log("ethrDID create signing delegate failed", err)});
    //console.log(">>>>> Key Pair: ", keypair);
    //console.log("ethrDID: " + ethrDid);

    
    const helloJWT = await ethrDid.signJWT({hello: 'world'});
    console.log("The JWT:", helloJWT);

    // now verify the token
    require('ethr-did-resolver')();
    const {payload, issuer} = await ethrDid.verifyJWT(helloJWT);
    console.log(`payload: ${payload}`);
    // Issuer contains the DID of the signing identity
    console.log(issuer);
}

const doJWTStuff = () => {
    const didJWT = require('did-jwt');
    const signer = didJWT.SimpleSigner('278a5de700e29faae8e40e366ec5012b5ec63d36ec77e8a2417154cc1d25383f');

    let jwt = '';
    didJWT.createJWT({aud: 'did:ethr:0xf3beac30c498d9e26865f34fcaa57dbb935b0d74', exp: 1957463421, name: 'uPort Developer'},
                 {alg: 'ES256K-R', issuer: 'did:ethr:0xf3beac30c498d9e26865f34fcaa57dbb935b0d74', signer}).then( response =>
                 { jwt = response;
                    console.log("+++: ", jwt); });

    //console.log(">>: ", jwt);
};

const resolveDIDDocument = () => {

    // this value will change between deployments
    const didRegistryAddress = '0x68342D370d2660625239296fC6C3b7668f85ea85';
    const providerConfig = { rpcUrl: 'http://localhost:7545', registry: didRegistryAddress };
    const Resolver = require('did-resolver');
    const ethrDid =  require('ethr-did-resolver').getResolver(providerConfig);
    let resolver = new Resolver.Resolver(ethrDid);
    console.log(">>> ", resolver);

 
};

const changeOwner = async () => {
    let didReg = await ethereumDIDRegistryContract.deployed();
    let txnReceipt = await didReg.changeOwner(chainskills_account_0, chainskills_account_1, {from: chainskills_account_0, gas: 5000000}).then((err, event) => {
        console.log("NNNNN", event);
    }).catch(error => { console.log('caught', error.message); });
    console.log("VVVVV ", txnReceipt);
};

console.log("Calling contract functions..");
// callGetGreeting();
//callGetNumberOfArticles();
//callGetArticlesForSale();
//callSellArticle();
//callGetIdentityOwner();
//doEthrDIDStuff();
//doJWTStuff();
//resolveDIDDocument();
changeOwner();