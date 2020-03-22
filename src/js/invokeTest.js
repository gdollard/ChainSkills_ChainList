/**
 * This file interacts with various contracts on the Ganache network using web3js
 */

var Web3 = require('web3');
var ganacheProvider = new Web3.providers.HttpProvider("http://localhost:7545");
var web3 = new Web3(ganacheProvider);
const inboxArtifact = require('../../build/contracts/Inbox.json');
var truffleContract = require("@truffle/contract");
let inboxContract = truffleContract(inboxArtifact);
inboxContract.setProvider(ganacheProvider);

const chainListArtifact = require('../../build/contracts/ChainList.json');
var truffleContract = require("@truffle/contract");
let chainListContract = truffleContract(chainListArtifact);
chainListContract.setProvider(ganacheProvider);


const ganache_account_0 = '0x207526Be94a4F1DB646a8291Fe0A99327B2338a8';
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



console.log("Calling contract functions..");
// callGetGreeting();
//callGetNumberOfArticles();
//callGetArticlesForSale();
callSellArticle();