/**
 * Simple JS client to publish to my local broker.
 * Using MQTT.js https://github.com/mqttjs/MQTT.js as the client.
 */
var mqtt = require('mqtt');
var client  = mqtt.connect('mqtt://localhost:1883');

client.on('connect', function () {
    console.log("publishing now...");
    client.publish('TestTopic', 'Hello there on TestTopic');
});


