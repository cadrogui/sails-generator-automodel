#! /usr/bin/env node

var mysqlAutogen = require('./lib')

mysqlAutogen
.getDBVars()
.then(mysqlAutogen.generate)
.then(mysqlAutogen.writeFiles)
.then((files) => {
  console.log('Models Generated: ', files.models.length);
  console.log(files.models);
})
