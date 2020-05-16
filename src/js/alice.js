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
            console.log("Alice's Claim: ", result);
            authDataAccess(result, ethrDid, BROKER_ID, timestamp).then(auth => {
                console.log("IOT Data ?", auth);
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
        console.log("IOT Data ?", result);
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


//----------- Test Code -----------------------

ALICE_CLAIM = "eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NkstUiJ9.eyJpYXQiOjE1ODk2MzYxNjYsImV4cCI6MTk1NzQ2MzQyMSwiYXVkIjoiZGlkOmV0aHI6MHhmMjRhNzI2MGQxMDA3NTdlZGI5OWY0NTRlNWFlOTQ3Y2UzN2M1ZGE0IiwiY2xhaW1zIjp7Im5hbWUiOiJNUVRUX0FjY2Vzc0NsYWltIiwiYWRtaW4iOmZhbHNlLCJyZWFkTVFUVCI6dHJ1ZSwic29tZXRoaW5nRWxzZSI6dHJ1ZX0sIm5hbWUiOiJSZWFkIE1RVFQgZm9yIGRpZDpldGhyOjB4ZjI0YTcyNjBkMTAwNzU3ZWRiOTlmNDU0ZTVhZTk0N2NlMzdjNWRhNCIsImlzcyI6ImRpZDpldGhyOjB4OWQxOTYzZWNkNWFmNjVmZjFmMDQ3ZjliMTc3MjA3ZGFhMGY5MGJhYyJ9.UBbbniqhUti_bg6fuSAzpxO2sZ0x9rbIdKq8eRlH_Wu71XFgjojxbX92a-Qa1pYPgenhgcRwoKtx8aYEiVYeOgE";
//resolveMyDID();
//getClaimAndIoTData("1589620285606");
//requestDataWithMyClaim(ALICE_CLAIM, "1589620285606");
//getAvailableTimestamps(ALICE_CLAIM);
//getNumberOfClaims();


