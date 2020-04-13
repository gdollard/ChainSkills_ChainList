/**
 * Simple JS client to publish to my local broker.
 * Using MQTT.js https://github.com/mqttjs/MQTT.js as the client.
 */
var mqtt = require('mqtt');
require('dotenv').config();

const mqtt_options = {
    username: process.env.MOSQUITTO_USERNAME,
    password: process.env.MOSQUITTO_PASSWORD
  };
  
var client  = mqtt.connect('mqtt://localhost:1883', mqtt_options);


const publishMessages = async () => {
  
  console.log("CONNECTED TO BROKER, publishing now...");

    while(true) {
      await sleep(2000)
      console.log("Publish...");
      client.publish('TestTopic', 'Hello there on TestTopic');
    }
};

client.on('connect', function () {
  publishMessages();
});

// sleep time expects milliseconds
const sleep = (time) => {
  return new Promise((resolve) => setTimeout(resolve, time));
};