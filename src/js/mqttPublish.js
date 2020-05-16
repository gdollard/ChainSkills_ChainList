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
  
  console.log("CONNECTED TO BROKER...");

    while(true) {
      let randNumber = Math.floor(Math.random() * 100);
      await sleep(process.env.MOSQUITTO_PUBLISH_FREQUENCY_MS);
      console.log("Publishing message...");
      client.publish('TestTopic', 'Test message_' + randNumber);
    }
};

client.on('connect', function () {
  publishMessages();
});

// sleep time expects milliseconds
const sleep = (time) => {
  return new Promise((resolve) => setTimeout(resolve, time));
};