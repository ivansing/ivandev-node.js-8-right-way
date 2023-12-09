'use strict';
const fs = require('fs');
fs.watch('target.txt', () => console.log('File changed!'))
console.log('Now watching tarjet.txt for changes...')