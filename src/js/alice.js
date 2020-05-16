const EthrDID = require('ethr-did');
const ETHEREUM_DID_REGISTRY_ADDRESS = require('./TrustAnchor').ETHEREUM_DID_REGISTRY_ADDRESS;
const requestDataAccessClaim = require('./TrustAnchor').requestDataAccessClaim;
const getNumberOfClaimsIssued = require('./TrustAnchor').getNumberOfIssuedClaims;
const authDataAccess = require('./ServiceProvider').authoriseDataAccessClaim;
const web3 = require('./TrustAnchor').web3;
const resolveDID = require('./TrustAnchor').resolveDID;
const BROKER_ID = "MosquittoBroker_CK_IE_0";

const keyPair = {
    address: process.env.EthrDID_ADDRESS_ALICE,
    privateKey: process.env.PRIVATE_KEY_ALICE
};


 //Instantiate the the Ethr DID for Alice. This will represent an identical DID document
 //every time (when resolved) as long as the same key pair is used.
 const ethrDid = new EthrDID({
    ...keyPair,
    provider: web3,
    registry: ETHEREUM_DID_REGISTRY_ADDRESS
});

/**
 * Convenience method to resovle a DID for Alice.
 */
const resolveMyDID = () => {
    let didDocument;
    resolveDID(ethrDid).then((result) => {
        didDocument = result;
        console.log("did Doc: ", didDocument);
    });
};


const getMyClaim = () => {
    requestDataAccessClaim(ethrDid).then((result) => {
        if(result === null) {
            console.log("Something went wrong, no token issued.");
            process.exit(1);
        } else {
            console.log("Alice's JWT> ", result);
            authDataAccess(result, ethrDid, BROKER_ID).then(auth => {
                console.log("IOT Data ?", auth);
                process.exit(0);
            });
        }
        // just end the process for now..
        //process.exit(0);
    });
};


const getNumberOfClaims = () => {
    getNumberOfClaimsIssued().then(result => {
        console.log("Number of claims issued from Trust Anchor: ", result.toNumber());
        process.exit(0);
    }).catch(error => {
        console.log("Failed to get the number of claims: ", error);
        process.exit(1);
    });
};


/**
 * Sample function to request for data to the service provider using Alice's claim.
 */
const getSensorData = () => {

};

//resolveMyDID();
getMyClaim();
//getNumberOfClaims();


