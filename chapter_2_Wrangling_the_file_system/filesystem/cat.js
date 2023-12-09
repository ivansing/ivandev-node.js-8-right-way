#!/usr/bin/env node
'use strict'
require('fs').createReadStream(process.argv[2]).pipe(process.stdout)

// use #! to execute program directly in Unix-like systems