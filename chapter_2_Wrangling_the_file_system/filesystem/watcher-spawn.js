const fs = require('fs')
const spawn = require('child_process').spawn
const filename = process.argv[2]

if(!filename) {
    throw Error('A file to watch must be specified!')
    return
}


// fs.watch(filename, () => {
//     const ls = spawn('ls', ['-l', '-h', filename])
//     ls.stdout.pipe(process.stdout)
// })


// Watch events and if file deleted
const watchHandler = (eventType, filename) => {
    if(eventType === 'change' || eventType === 'rename') {
        const ls = spawn('ls', ['-l', '-h', filename])
        ls.stdout.pipe(process.stdout)
    }
}

fs.watch(filename, watchHandler)

console.log(`Now watching ${filename} for changes...`)