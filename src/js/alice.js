/**
 * Alice represents a typical user wishing to request claims from the Trust Anchor and
 * IoT Data from the Service Provider.
 * 
 * G.Dollard
 */
require('dotenv').config();
const EthrDID = require('ethr-did');
const ETHEREUM_DID_REGISTRY_ADDRESS = require('./TrustAnchor').ETHEREUM_DID_REGISTRY_ADDRESS;
const requestDataAccessClaim = require('./TrustAnchor').requestDataAccessClaim;
const getNumberOfClaimsIssued = require('./TrustAnchor').getNumberOfIssuedClaims;
const getTimestampsForPublishedFiles = require('./ServiceProvider').getPublishedTimestamps;
const authDataAccess = require('./ServiceProvider').authoriseDataAccessClaim;
const web3 = require('./TrustAnchor').web3;
const resolveDID = require('./TrustAnchor').resolveDID;
const BROKER_ID = process.env.MOSQUITTO_BROKER_NAME;

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
 * This function will request a claim first and then request data using the claim.
 * @param {string} timestamp - time when a CID was written to the ledger.
 */
const getClaimAndIoTDataAtTime = (timestamp) => {
    requestDataAccessClaim(ethrDid).then((result) => {
        if(result === null) {
            console.log("Something went wrong, no token issued.");
            process.exit(1);
        } else {
            console.log("Alice: Received a signed claim, requesting data from Service Provider.. ", result);
            authDataAccess(result, ethrDid, BROKER_ID, timestamp).then(data => {
                if(data == null) {
                    console.log("No data returned from Decenralised Storage");
                } else {
                    console.log("Returned Data from Decenralised Storage:\n", data);
                }
                process.exit(0);
            });
        }
    });
};

/**
 * Makes a request for a claim, only Data access is available currently.
 */
const requestClaim = async () => {
    return requestDataAccessClaim(ethrDid).then((result) => {
        return result;
    });
};

/**
 * 
 * @param {string} claim - the raw JWT string representing a (valid) claim 
 */
const requestDataWithMyClaim = (claim, timestamp) => {
    authDataAccess(claim, ethrDid, BROKER_ID, timestamp).then(result => {
        if(result == null) {
            console.log("No data returned from Decenralised Storage");
        } else {
            console.log("Returned Data from Decenralised Storage:\n", result);
        }
        process.exit(0);
    }).catch(error => {
        console.log("An error occurred while requesting remote data request: ", error.message);
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


const program = require('commander');
program.version('0.0.1');

// command to view the DID for this agent
program.command('did')
.description('View the DID for Alice')
.action(() => {
  resolveDID(ethrDid).then((result) => {
    console.log("DID for Alice:\n%s", result);
    process.exit();
  }).catch((error) => {
    console.log("An error occurred when resolving DID:%s", error.message);
  });
});

// commands to show or request a claim
program.command('claim <option>')
.description('[show | request]')
.action((arg) => {
    if(arg == 'show') {
        console.log("Claim for Alice:\n%s", process.env.ALICE_CLAIM);
        process.exit();
    }
    else if(arg == 'request') {
        console.log("Requesting a claim...");
        requestClaim().then(result => {
            console.log("Claim Granted:\n%s", result);
            process.exit();

        });
    }
    else {
        console.log("Invalid request, run with -h for help");
    }
});


// Command to display available timestamps for underlying claim
program.command('timestamps')
.description('Get timestamps of available data')
.action(() => {
    getAvailableTimestamps(process.env.ALICE_CLAIM);
});


/**
 * This command allows the user to request data for a specified timestamp using
 * Alice's locally held claim or by specifying the -c (--create) it will request a 
 * new claim as part of the data request.  
 * NOTE: This command doesn't demonstrate getClaimAndIoTDataAtTime(time) where we request
 * a claim and data from the same single call. Add a new command for this.
 */ 
  program
  .command('getdata <timestamp>')
  .description('get data for a given timestamp [-c <claim_string>]')
  .option('-c,--claim <token_string>', 'JWT to override locally held claim for request,')
  .action((arg, options) => {
      if(options.claim) {
          console.log(`Use the claim: ${options.claim}`);
          console.log("Requesting new claim as part of data request.");
          requestDataWithMyClaim(`${options.claim}`, arg);
      }
      else {
          console.log("Requesting data using locally held claim.");
          requestDataWithMyClaim(process.env.ALICE_CLAIM, arg);
      }
  });

program.parse(process.argv);


// testing

// 1. Get available timestamps
// getAvailableTimestamps(process.env.ALICE_CLAIM);

// 2. Request the data, either with an existing claim or request a claim too
//requestDataWithMyClaim(process.env.ALICE_CLAIM, '1589923199185');
// OR
// getClaimAndIoTDataAtTime('1589919106025'); 

// timestamps posted to Ropsten: [ '1589919106025', '1589920243424', '1589920547829', '1589923911989' ]