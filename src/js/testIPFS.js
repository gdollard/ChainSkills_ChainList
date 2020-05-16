// Just a playground for trying out IPFS code.
'use strict'
var fs = require('fs');

const IPFS = require('ipfs');
const all = require('it-all');

// takes the full path (including file name)
async function main (messageFileFullPath) {
  const node = await IPFS.create()
  //const version = await node.version()

  let fileBuffer = fs.readFileSync(messageFileFullPath);

  for await (const file of await node.add({
    path: 'hello.txt',
    content: fileBuffer
  }))
   {
    //console.log('Added file:', file.path, file.cid.toString())

    // read back the file using the CID
    //const data = Buffer.concat(await all(node.cat(file.cid)))

    //console.log('Added file contents:', data.toString())
    return file.cid;
  }
}

/**
 * Verify we can retrieve previously stored data using a given CID.
 */
const testGetDataFromNode = async() => {
    const node = await IPFS.create();
    const data = Buffer.concat(await all(node.cat('QmcHtsrdNwh8DjeySHCaK9xdwVhHwfqWsnKugA9Chdvpmi')));
    console.log('Added file contents:', data.toString());
}

const writeToFile = (message) => {
    fs.open('input.txt', 'w', function(err, fd) {
        if (err) {
           return console.error(err);
        }
        fs.writeFile('input.txt', message +"\n", function(err) {
            if (err) throw err;

            console.log("File Updated!");
            fs.close(fd, error => {
                if(error) {
                    console.error(error);
                }
                console.log("File closed.");
            });     
        });
     });
}

const MESSAGE_FILE_NAME="input.txt";

// Handy append method, the mqttSubscriber could use this, to pass a file to IPFS publish.
const appendFile = (message) => {
    fs.appendFile(MESSAGE_FILE_NAME, message + '\n', (err) => {
        if (err) throw err;
        console.log('Message added to file!');
    });
};
 
const deleteMessageFile = (filename) => {
    fs.unlink(filename, function(err) {
        if (err) {
           return console.error(err);
        }
        console.log("File deleted successfully!");
     });
};
 
// const writeToFile = (text) => {
//     fs.writeFile('input.txt', 'a', text +"\n", function(err) {
//         if (err) {
//            return console.error(err);
//         }
//     });
// };

//writeToFile("New string");
appendFile("this is some text 4");

testGetDataFromNode();

const testWriteToIPFS = async () => {
    let cid = await main(MESSAGE_FILE_NAME);
    console.log("Done writing, CID is: ", cid);
};

//deleteMessageFile(MESSAGE_FILE_NAME);
//testWriteToIPFS();
