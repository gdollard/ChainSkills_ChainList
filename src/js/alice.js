const trustAnchor = require('./TrustAnchor').requestDataAccess;
const createDID = require('./TrustAnchor').createDID;

const ropsten_0_address = '0xEdAA87f3a3096bc7C0CE73971b1c463f20Cf3Af5';
trustAnchor(ropsten_0_address).then(result => {
    console.log("Good to go...");
    process.exit(0);
}).catch(error => {
    console.log("Nope.");
    process.exit(1);
});


myDID = createDID();