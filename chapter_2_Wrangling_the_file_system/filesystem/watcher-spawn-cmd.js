const fs = require('fs')
const spawn = require('child_process').spawn
const filename = process.argv[2]

if(!filename) {
    throw Error('A file to watch must be specified!')
}

// Extract the command and its parameters from process.argv
const command = process.argv[3]
const commandArgs = process.argv.slice(4) // extract additonal arguments


// Watch events and if file deleted
const watchHandler = (eventType, filename) => {
    if(eventType === 'change' || eventType === 'rename') {
        const ls = spawn(command, [...commandArgs, filename])
        ls.stdout.pipe(process.stdout)
    }
}

fs.watch(filename, watchHandler)

console.log(`Now watching ${filename} for changes...`)