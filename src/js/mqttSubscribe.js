/**
 * Simple JS client to subscribe to my local broker topics.
 * Using MQTT.js https://github.com/mqttjs/MQTT.js as the client.
 */
var mqtt = require('mqtt');
var client  = mqtt.connect('mqtt://localhost:1883');

// Once we connect to the broker provide a sub function
client.on('connect', function () {
  client.subscribe('TestTopic', function (err) {
    if (!err) {
      console.log("Subscribed..");
    }
  });
});

// specify a callback when a message is published
client.on('message', function (topic, message) {
    // message is Buffer
    console.log("Received a message: ", message.toString());
    client.end();
  });