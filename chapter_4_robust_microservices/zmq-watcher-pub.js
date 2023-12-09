const fs = require('fs');
const zmq = require('zeromq');
const filename = process.argv[2];

// Create the publisher endpoint.
async function run() {
    const sock = new zmq.Publisher;

    await sock.bind("tcp://127.0.0.1:3000")
    console.log("Publisher bound to port 3000")

    while(true) {
        console.log("Sending a multipart message envelope")
         fs.watch(filename, () => {
            sock.send(JSON.stringify({
                type: 'changed',
                file: filename,
                timestamp: Date.now()
            }))
        }) 
        await new Promise(resolve => { setTimeout(resolve, 2000)})
    }
    
}

run()


