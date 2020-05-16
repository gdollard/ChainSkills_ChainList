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
var mqtt = require('mqtt');
const HDWalletProvider = require("truffle-hdwallet-provider");
var walletProvider =  new HDWalletProvider(process.env.MNEMONIC, "https://ropsten.infura.io/v3/" + process.env.INFURA_API_KEY);
require('dotenv').config();
const Web3 = require('web3');
var web3 = new Web3(walletProvider); 
const EthrDID = require('ethr-did');


const BROKER_ID = "MosquittoBroker_CK_IE_0";
let messageCount = 0;
const MESSAGE_FILE_NAME = "./input.txt";
const MESSAGE_FILE_NAME_SP = "./input_SP.txt";


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
    messageCount++;
    if(messageCount >= process.env.MESSAGE_BUFFER_LIMIT) {
      //publishData();
      publishDataWithExistingClaim(tokenString); //publish with a claim (faster)
      messageCount=0;
    }
  });


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
          clearFile();
          deleteSPMessageFile();
      });
  }).catch(error => {
    console.log("Failed to publish the messages: \"%s\"", error.message);
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

  //copy the file and send it to the SP (to avoid locking issues back here)
  fs.copyFile(MESSAGE_FILE_NAME, MESSAGE_FILE_NAME_SP, (err) => {
    if (err) throw err;
  
    authDataPublish(claim, myDID, MESSAGE_FILE_NAME_SP, BROKER_ID).then((auth) => {
        console.log("Data was successfully published.");
        //clear out local messages, no longer needed
        clearFile();
        deleteSPMessageFile();
      }).catch(error => {
        console.log("Failed to publish the messages: \"%s\"", error);
    });
  });
};


/*
* As the broker receives messages it will add them to the file (if file storage is preferred over
* in-memory arrays).
*/
const appendMessageToFile = (message) => {
  fs.appendFile(MESSAGE_FILE_NAME, message + '\n', (err) => {
      if (err) throw err;
  });  
};

const deleteSPMessageFile = () => {
  //delete the file that was sent to the Service Provider
  fs.unlink(MESSAGE_FILE_NAME_SP, function(err) {
      if (err) {
         return console.error(err);
      }
      else {
        console.log("Message file deleted.");
      }
      
   });
};

//wipe the contents of the message broker input file
const clearFile = () => {
  fs.writeFile(MESSAGE_FILE_NAME, "", (err) => {
    if (err) throw err;
    console.log('File reset.');
  });
}

