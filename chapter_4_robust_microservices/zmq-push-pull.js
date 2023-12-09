const cluster = require('cluster')
const zmq = require('zeromq')
const fs = require('fs')

const numWorkers = require('os').cpus().length
const targetContent = fs.readFileSync('./target.txt', 'utf-8')

let readyWorkers = 0

async function runMaster() {
    // Create PUSH socket for seding jobs to workers
    const pushSocket = new zmq.Push()
    await pushSocket.bind('ipc://master-push.ipc')

    // Create PULL socket for receiving messages from workers
    const pullSocket = new zmq.Pull()
    await pullSocket.bind('ipc://master-pull.ipc')

    console.log('Master is ready.')

    // Listen for messages from workers
    async function receiveMessages() {
        while(true) {
            const [msg] = await pullSocket.receive()
            const message = msg.toString()

            if(message === 'ready') {
                readyWorkers++
                if(readyWorkers === numWorkers) {
                    // Send the content of 'target.txt' as a message to workers
                    pushSocket.send(targetContent)
                }
            } else {
                // Received reuslt message from worker
                console.log(`Result form worker ${message}`)
            }
        }
    }

    // Start receiving messages
    receiveMessages().catch(err => console.error(`Error in receivedMessage: ${err.message}`))

    // Fork worker processes
    for (let i = 0; i < numWorkers; i++) {
        cluster.fork()
    }
}

if(cluster.isMaster) {
    // Run the master process
    runMaster().catch(err => console.error(`Error in runMaster: ${err.message}`))

    // Listen for online events from workers
    cluster.on('online', worker => console.log(`Worker ${worker.process.pid} is online`))
} else {
    // Worker processes
    const pullSocketWorker = new zmq.Pull()
    pullSocketWorker.connect('ipc://master-push.ipc')

    const pushSocketWorker = new zmq.Push()
    pushSocketWorker.connect('ipc://master-pull.ipc')

    // Listen for job messages from master
    pullSocketWorker.receive().then(async (msg) => {
        // Simulate work on the received job
        const result = `Processed job: ${msg.toString()}, Worker PID: ${process.pid}`
        // Send the result back to the Master
        pushSocketWorker.send(result)
    })

    // Notify master that worker is ready
    pushSocketWorker.send('ready')
}


