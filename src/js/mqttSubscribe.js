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
const resolveDID = require('./TrustAnchor').resolveDID;
var mqtt = require('mqtt');
const HDWalletProvider = require("truffle-hdwallet-provider");
var walletProvider =  new HDWalletProvider(process.env.MNEMONIC, "https://ropsten.infura.io/v3/" + process.env.INFURA_API_KEY);
require('dotenv').config();
const Web3 = require('web3');
var web3 = new Web3(walletProvider); 
const EthrDID = require('ethr-did');
const EXISTING_TOKEN = process.env.MQTT_SUBSCRIBER_JWT;
const BROKER_ID = process.env.MOSQUITTO_BROKER_NAME;
const didJWT = require('did-jwt');
let messages = [];


const mqtt_options = {
  username: process.env.MOSQUITTO_USERNAME,
  password: process.env.MOSQUITTO_PASSWORD
};

var mqttClient;
const connectToBroker = () => {
  mqttClient = mqtt.connect('mqtt://localhost:1883', mqtt_options);
}


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


/**
 * This function will request a claim to publish the latest set of messages to the IPFS data store.
 * If it receives the claim it will then write the Content Identifier (CID) to our 
 * BrokerMsgRepo smart contract.
 * 
 */
const publishData = async () => {
  console.log("Received request to publish, requesting claim first..");
  requestDataPublishClaim(myDID).then((claim) => {
      console.log(">>>>> mqttSubscriber: Claim to publish data granted <<<<<<");
      authDataPublish(claim, myDID, messages, BROKER_ID).then(auth => {
        console.log(">>>>> mqttSubscriber: Data was successfully published <<<<<<");
          messages = [];
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
  authDataPublish(claim, myDID, messages, BROKER_ID).then((auth) => {
    console.log(">>>>> mqttSubscriber: Data was successfully published <<<<<<");
      messages = [];
    }).catch(error => {
      console.log("Failed to publish the messages: \"%s\"", error);
  });

};

const program = require('commander');
program.version('0.0.1');

// commands to show or request a claim
program.command('claim <option>')
.description('[show]')
.action((arg) => {
    if(arg == 'show') {
        console.log("Claim for Message Agent:\n", didJWT.decodeJWT(process.env.MQTT_SUBSCRIBER_JWT));
        process.exit();
    }
    else {
        console.log("Invalid request, run with -h for help");
        process.exit();
    }
});


// command to view the DID for this agent
program.command('did')
.description('View the DID for this Message Agent')
.action(() => {
  resolveDID(myDID).then((result) => {
    console.log("DID for this Message Agent:\n%s", result);
    process.exit();
  }).catch((error) => {
    console.log("An error occurred when resolving DID:%s", error.message);
  });
});

// command to run the agent
program.command('run')
.description('Run the Message Agent')
.action(() => {
    connectToBroker();
    // Once we connect to the broker provide a subscribe function
    mqttClient.on('connect', function () {
      mqttClient.subscribe('TestTopic', function (err) {
        if (!err) {
          console.log("Connected to broker...");
        }
      });
    });
  
    let dotCounter = 0;
    // Called when our client receives a message from the broker.
    mqttClient.on('message', function (topic, message) {
      if(dotCounter == 0) {
        console.log(".");
        dotCounter++;
      } else if(dotCounter == 1) {
        console.log("..");
        dotCounter++;
      } else {
        console.log("...");
        dotCounter = 0;
      }
        //console.log("Received a message: %s on topic %s, next up write this to the ledger if authorised.", message.toString(), topic);
        let messageCount = messages.push(message+ '\n');
        
        if(messageCount == process.env.MESSAGE_BUFFER_LIMIT) {
          //publishData();
          publishDataWithExistingClaim(EXISTING_TOKEN); //publish with a claim (faster)
        }
      });
});




program.parse(process.argv);


