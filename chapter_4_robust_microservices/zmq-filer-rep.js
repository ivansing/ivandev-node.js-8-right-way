const fs = require('fs');
const zmq = require('zeromq');

// In simple terms, this code sets up a server that listens for requests, 
// reads a specified file, and sends back the content or an error message. 
// It handles interruptions gracefully.


async function run() {
    const sock = new zmq.Reply // endpoint

    await sock.bind("tcp://127.0.0.1:3000") // clients connection
    console.log('Listening for zmq requesters...')
    
    // Start a loop to continuoulsy listen for incoming messages on the socket.
    for await (const [msg] of sock) {

        // Parse JSON Request:
        // Take the received message, assumed to be in JSON format, 
        // and convert it into a JavaScript object to extract request details.
        const request = JSON.parse(msg.toString())

        console.log(`Received request to get: ${request.path}`)

        fs.readFile(request.path, (err, content) => {
            if(err) {
                console.log(`Error reading file: ${err.message}`)
                sock.send(JSON.stringify({
                    status: 'error',
                    error: err.message,
                    timestamp: Date.now(),
                    pid: process.pid
                }))
            } else {
                console.log('Sending response content.')
                sock.send(JSON.stringify({
                    status: 'success',
                    content: content.toString(),
                    timestamp: Date.now(),
                    pid: process.pid
                }))
            }
        })
    }
}

run().catch(err => console.error(`Error in run: ${err.message}`))

// Close the responder when the Node process ends.
process.on('SIGINT', () => {
    console.log('Shutting down...')
    process.exit(0);
})

process.on('SIGTERM', () => {
    console.log(`Received SIGTERM. Shutting down...`)
    // Perform cleanup operations here if needed
    process.exit(0)
})

process.on('uncaughtException', (err) => {
    console.error(`Uncaught Exception: ${err.message}`)
    process.exit(1)
})



