const fs = require('fs')
fs.readFile('target.txt', (err, data) => {
    if(err && !data) {
        throw err
    }
    console.log(data.toString())
})