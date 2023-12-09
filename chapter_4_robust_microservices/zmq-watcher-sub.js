const zmq = require('zeromq');

async function run() {
    const sock = new zmq.Subscriber

    sock.connect("tcp://127.0.0.1:3000")
    sock.subscribe('')
    console.log("Subscriber connected to port 3000")

    

    for await (const msg of sock) {
        const parseMsg = JSON.parse(msg.toString())
        const date = new Date(parseMsg.timestamp)
        console.log(`File "${parseMsg.file}" ${parseMsg.type} at ${date}`)
    }
}
run()

