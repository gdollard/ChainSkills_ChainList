// This is the hypothetical Service Provider. It will receive a request for a service and via a Token verification
// will determine if the request is to be granted.

var Web3 = require('web3');
const HDWalletProvider = require("truffle-hdwallet-provider");
var walletProvider =  new HDWalletProvider(process.env.MNEMONIC, "https://ropsten.infura.io/v3/" + process.env.INFURA_API_KEY);
var web3 = new Web3(walletProvider);
const didJWT = require('did-jwt');
const Resolver = require('did-resolver').Resolver;
const getResolver = require('ethr-did-resolver').getResolver;

//Ethereum DID Registery address (smart contract)
const ETHEREUM_DID_REGISTRY_ADDRESS = '0xdCa7EF03e98e0DC2B855bE647C39ABe984fcF21B'

//Registering Ethr Did To Resolver
const ethrDidResolver = getResolver({
    web3,
    registry: ETHEREUM_DID_REGISTRY_ADDRESS,
})
/**
 * create a DID resolver based on the ethr DID resolver, if using a different DID Method (uPort, nacl, https etc)
 * I would pass that specific resolver to the Resolver object.
 */
const didResolver = new Resolver(ethrDidResolver);


/**
 * This function will be called by Alice to request a service. She will present her
 * her JWT (token) and DID object. The provider will verify the token using the did-jwt
 * library. Part of the checks will include using the ethr-did-resolver to resolve the 
 * presented DID object against the ethr-did-registry on the ledger. If all checks come 
 * good then the request is authorised.
 * 
 */
const authoriseDataAccessClaim = async (jwt, didObject) => {
    let result = didJWT.verifyJWT(jwt, {resolver: didResolver, audience: didObject.did }).then((verifiedResponse) => {
        console.log("Service Provider: Alice's verified JWT ", verifiedResponse);
        return verifiedResponse;
        }).catch(error => {
            console.log("Sorry Alice, Service Provider says No! ", error.message);
        });
    return result;
 };

 module.exports = {authoriseDataAccessClaim};