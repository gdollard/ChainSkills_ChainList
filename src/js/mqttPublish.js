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

client.on('connect', function () {
    console.log("CONNECTED TO BROKER, publishing now...");
    client.publish('TestTopic', 'Hello there on TestTopic');
});
