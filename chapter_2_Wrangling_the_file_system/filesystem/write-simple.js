const fs = require('fs')
fs.writeFile('target.txt', 'another line', (err) => {
    if(err) {
        throw err
    }
    console.log('File saved!')
})