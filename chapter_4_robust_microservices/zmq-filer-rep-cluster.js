const cluster = require('cluster');
const fs = require('fs');
const zmq = require('zeromq');
const numWorkers = require('os').cpus().length;

async function runRouter() {
    const router = new zmq.Router();

    router.bind('tcp://127.0.0.1:3000');
    console.log('Router bound to port 3000');

    for await (const [clientId, ...frames] of router) {
        console.log(`Received message from client ${clientId}: ${frames.toString()}`)
        await router.send([clientId, 'Hello from Router']);
    }
}

async function runDealer() {
    const responder = new zmq.Dealer();

    responder.connect('ipc://filer-dealer.ipc')

    for (let i = 1; i <= 5; i++) {
        console.log(`Sending message to router from Dealer: ${i}`)
        await responder.send([`Client_${i}, 'Hello from Dealer`])

        const [responseId, response] = await responder.receive()
        console.log(`Received response from router to ${responseId}: ${response}`)

        fs.readFile('./target.txt', (err, content) => {
            if(err) {
                console.error(`Error reading file: ${err.message}`)
            } else {
                console.log(`File content: ${content.toString()}`)
            }
        })
    }
}

if(cluster.isMaster) {
    // Master process created ROUTER and DEALER sockets and binds endpoints.
    const workers = []

    // Create workers
    for(let i = 0; i < numWorkers; i++) {
        const worker = cluster.fork()
        workers.push(worker)

        console.log(`Worker ${worker.process.pid} is online`)

        // Listen for the exit event of the worker
        worker.on('exit', (code, signal) => {
            console.log(`Worker ${worker.process.pid} exited with code ${code} and ${signal}`)
            // Restart the worker when it exits
            const newWorker = cluster.fork()
            workers.push(newWorker)
            console.log(`New worker ${newWorker.process.pid} is online`)
        })
    }

    // Run Router in the background
    runRouter().catch(err => console.error(`Error in runRouter: ${err.message}`))

    // Listen for messages from workers
    cluster.on('message', (worker, message) => {
        console.log(`Received message from worker ${worker.process.pid}: ${message}`)
    })

    // Fork a worker process for each CPU
    for (const worker of workers) {
        worker.send('Hello from Master')
    }
} else {
    // Worker processes create a DEALER socket and connect to the ROUTER.
    const responder = new zmq.Dealer()
    responder.connect('tcp://127.0.0.1:3000')

    // responder.on('message', data => {
    //     console.log(`${process.pid} received message from router: ${data.toString()}`)
    //     process.send(`Hello from Worker ${process.pid}`)
    // })

    // Run Dealer
    runDealer().catch(err => console.error(`Error in runDealer: ${err.message}`))
}


