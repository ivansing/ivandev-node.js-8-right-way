const zmq = require('zeromq')
const filename = process.argv[2]

async function run() {

    const requester = new zmq.Request

    requester.connect("tcp://127.0.0.1:3000")

    for(let i = 1; i <= 5; i++) {
        console.log(`Sending a request ${i} for ${filename}`)
        await requester.send(JSON.stringify({ path: filename }));  
    
   
        const [response] = await requester.receive()
        const responseData = JSON.parse(response.toString())

        console.log("Received response:")
        console.log(JSON.stringify(responseData,null,2))
    }
}

run().catch(err => console.error(`Error in run: ${err.message}`))

