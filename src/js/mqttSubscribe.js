/**
 * This is a simple JS client to subscribe to my local broker topics. It will then 
 * attempt to broadcast the message to the ledger via smart contract calls using
 * its DID and authorisation tokens.
 * 
 * Using MQTT.js https://github.com/mqttjs/MQTT.js as the client.
 */
var fs = require('fs');
const requestDataPublishClaim = require('./TrustAnchor').requestDataPublishClaim;
const authDataPublish = require('./ServiceProvider').authoriseDataPublishClaim;
var File = require("file-class");
var mqtt = require('mqtt');
const HDWalletProvider = require("truffle-hdwallet-provider");
require('dotenv').config();
const Web3 = require('web3');
var ganacheProvider = new Web3.providers.HttpProvider("http://localhost:7545");
var web3 = new Web3(ganacheProvider);

//const Web3 = require('web3');
//var HDwalletProvider =  new HDWalletProvider(process.env.MNEMONIC, "https://ropsten.infura.io/v3/" + process.env.INFURA_API_KEY);
//const web3 = new Web3(HDwalletProvider);
const EthrDID = require('ethr-did');
const messageBroadcasterArtifact = require('../../build/contracts/BrokerMessageRepo.json');


const BROKER_ID = "MosquittoBroker_CK_IE_0";
let messageCount = 0;
const homedir = require('os').homedir();
const MESSAGE_FILE_NAME = homedir+"/input.txt";

console.log("INPUT NAME:", MESSAGE_FILE_NAME);
const mqtt_options = {
  username: process.env.MOSQUITTO_USERNAME,
  password: process.env.MOSQUITTO_PASSWORD
};

var mqttClient  = mqtt.connect('mqtt://localhost:1883', mqtt_options);

const keyPair = {
    address: process.env.EthrDID_ADDRESS_IOT_PI,
    privateKey: process.env.PRIVATE_KEY_IOT_PI
};


// Instantiate the DID for this device
const myDID = new EthrDID({
    ...keyPair,
    provider: web3,
    registry: process.env.ETHEREUM_DID_REGISTRY_ADDRESS
});


// Once we connect to the broker provide a subscribe function
mqttClient.on('connect', function () {
  mqttClient.subscribe('TestTopic', function (err) {
    if (!err) {
      console.log("Connected to broker...");
    }
  });
});

// Called when our client receives a message from the broker.
mqttClient.on('message', function (topic, message) {
    console.log("Received a message: %s on topic %s, next up write this to the ledger if authorised.", message.toString(), topic);
    appendMessageToFile(message);
    messageCount++
    if(messageCount == process.env.MESSAGE_BUFFER_LIMIT) {
      //publishData();
      publishDataWithExistingClaim(tokenString); //publish with a claim (faster)
    }
    //client.end();
  });



// Keeping getters here for reference
const getAllHashesForBroker = async (broker_id) => {
  const accountNumber = process.env.GANACHE_ADDRESS_ACCOUNT_0;
  let contractInstance = await messageBroadcasterContract.deployed();
  let claimResult = await contractInstance.getHashes(broker_id);
  console.log("Hashes Returned: ", claimResult);
};

// Keeping getters here for reference
const getTotalNumberOfMessagesForBroker = async (broker_id) => {
  const accountNumber = process.env.GANACHE_ADDRESS_ACCOUNT_0;
  let contractInstance = await messageBroadcasterContract.deployed();
  let claimResult = await contractInstance.getTotalNumberOfMessagesForBroker(broker_id);
  console.log("Hashes Returned: ", claimResult.toNumber());
};



/**
 * This function publishes the latest set of messages to the IPFS data store.
 * It will then write the Content Identifier (CID) to our BrokerMsgRepo smart contract.
 */
const publishData = async () => {
  console.log("Received request to publish, requesting claim first..");
  requestDataPublishClaim(myDID).then((claim) => {
      console.log(">>>>> mqttSubscriber: Publishing messages to storage <<<<<<");
      authDataPublish(claim, myDID, MESSAGE_FILE_NAME, BROKER_ID).then(auth => {
          console.log("Returned Transaction Receipt:", auth);
          //clear out local messages, no longer needed
          deleteMessageFile(MESSAGE_FILE_NAME);
      });
  }).catch(error => {
    console.log("Failed to publish the messages: \"%s\". Please make sure your claim is valid or"
      + " try requesting a new claim before publishing.", error.message);
  });
};

/**
 * This function will by-pass the request for a claim on the assumption that the provided
 * claim is valid (will be verified by the service provider). The overall processing
 * time should be less because there is no call to the Trust Anchor contract.
 * 
 * @param {string} claim - JWT token
 */
const publishDataWithExistingClaim = async (claim) => {
  console.log("Calling Service Provider to publish Messages..");
  authDataPublish(claim, myDID, MESSAGE_FILE_NAME, BROKER_ID).then((auth) => {
    console.log("Data was successfully published.");
    //clear out local messages, no longer needed
    deleteMessageFile(MESSAGE_FILE_NAME);
  }).catch(error => {
    console.log("Failed to publish the messages: \"%s\". Please make sure your claim is valid or"
      + " try requesting a new claim before publishing.", error.message);
  });
}

/*
* As the broker receives messages it will add them to the file (if file storage is preferred over
* in-memory arrays).
*/
const appendMessageToFile = (message) => {
  fs.appendFile(MESSAGE_FILE_NAME, message + '\n', (err) => {
      if (err) throw err;
  });
};

const deleteMessageFile = (filename) => {
  fs.unlink(filename, function(err) {
      if (err) {
         return console.error(err);
      }
      else {
        console.log("Message file deleted.");
        messageCount=0;
      }
      
   });
};


let startTime, endTime;

function start() {
  startTime = new Date();
};

function end() {
  endTime = new Date();
  var timeDiff = endTime - startTime; //in ms
  // strip the ms
  timeDiff /= 1000;

  // get seconds 
  var seconds = Math.round(timeDiff);
  console.log(seconds + " seconds");
}

//------------------------ Test code ---------------------------------------------
const tokenString = "eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NkstUiJ9.eyJpYXQiOjE1ODg1OTgzMjIsImV4cCI6Mjk1NzQ3MzQyNSwiYXVkIjoiZGlkOmV0aHI6MHgyOTRmZjcxYjI4M2IxNWZjMjE4ZjRkZGFkMTY5MjI2MzczZjgzYzY3IiwiY2xhaW1zIjp7Im5hbWUiOiJNUVRUX1B1Ymxpc2hDbGFpbSIsImFkbWluIjpmYWxzZSwicHVibGlzaE1RVFQiOnRydWV9LCJuYW1lIjoiUHVibGlzaCBNUVRUIGZvciBkaWQ6ZXRocjoweDI5NGZmNzFiMjgzYjE1ZmMyMThmNGRkYWQxNjkyMjYzNzNmODNjNjciLCJpc3MiOiJkaWQ6ZXRocjoweDlkMTk2M2VjZDVhZjY1ZmYxZjA0N2Y5YjE3NzIwN2RhYTBmOTBiYWMifQ.1FfD7jwHf8RkuHCHHR6m12WRl1FKpaEAt-KxvlkOkymlSuMyWZRXXe0IR1AMYjbY13bTPop7VydVJM6k4b6KigA";

const testpublishData = () => {
  //  messages.push("Test data");
  //  messages.push("And this is more data");
  //  messages.push("Broker time: 11:48 Fri May 16");
  appendMessageToFile("Is this the last message??");
  start();
  //publishData(); // request a claim AND publish data 
  publishDataWithExistingClaim(tokenString); //publish data with an existing claim (faster)

  // call to get the JWT only
  // requestDataPublishClaim(myDID).then((result) => {
  //   console.log("claim:", result);
  // });

    // authDataPublish(tokenString, myDID, messages, BROKER_ID).then(auth => {
    //   console.log("Returned Storage Hash:", auth);
    //   messages = [];
    //   end();
    //   //process.exit();
    //});
};

//testpublishData();


