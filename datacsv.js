var fs = require('fs')
var parse = require('csv-parse')

var inputPath = 'data3.csv'

fs.readFile(inputPath, function (err, fileData) {
     parse(fileData, {columns: false, trim: true}, function(err, rows) {
         for(var i=0; i<2; i++){
             for(var j=0; j<rows.length; j++){
                console.log(rows[j][i])
            }
         }
     })
})