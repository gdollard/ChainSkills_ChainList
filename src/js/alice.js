/**
 * Alice represents a typical user wishing to request claims from the Trust Anchor and
 * IoT Data from the Service Provider.
 * 
 * G.Dollard
 */

const EthrDID = require('ethr-did');
const ETHEREUM_DID_REGISTRY_ADDRESS = require('./TrustAnchor').ETHEREUM_DID_REGISTRY_ADDRESS;
const requestDataAccessClaim = require('./TrustAnchor').requestDataAccessClaim;
const getNumberOfClaimsIssued = require('./TrustAnchor').getNumberOfIssuedClaims;
const getTimestampsForPublishedFiles = require('./ServiceProvider').getPublishedTimestamps;
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


const getClaimAndIoTData = (timestamp) => {
    requestDataAccessClaim(ethrDid).then((result) => {
        if(result === null) {
            console.log("Something went wrong, no token issued.");
            process.exit(1);
        } else {
            console.log("Alice: Received a signed claim, requesting data from Service Provider.. ", result);
            authDataAccess(result, ethrDid, BROKER_ID, timestamp).then(data => {
                console.log("Returned Data from Decenralised Storage:\n", data);
                process.exit(0);
            });
        }
    });
};

/**
 * 
 * @param {string} claim - the raw JWT string representing a (valid) claim 
 */
const requestDataWithMyClaim = (claim, timestamp) => {
    authDataAccess(claim, ethrDid, BROKER_ID, timestamp).then(result => {
        console.log("Returned Data from Decenralised Storage:\n", result);
        process.exit(0);
    });
};

/**
 * Gets a list of timestamps which marked when files were published.
 * @param {string} claim - the raw JWT string representing a (valid) claim 
 */
const getAvailableTimestamps = (claim) => {
    getTimestampsForPublishedFiles(claim, ethrDid, BROKER_ID).then(result => {
        console.log("Available Timestamps:", result);
        process.exit(0);
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

// testing

// 1. Get available timestamps
// getAvailableTimestamps(process.env.ALICE_CLAIM);

// 2. Request the data, either with an existing claim or request a claim too
//requestDataWithMyClaim(process.env.ALICE_CLAIM, '1589919106025');
// OR
getClaimAndIoTData('1589832099917');