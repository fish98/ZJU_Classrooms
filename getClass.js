const cheerio = require('cheerio')
const FormData = require('form-data')
var fs = require('fs');
const classRoom = require('./ClassRoom').data

// let fish = ''
// const input = fs.createReadStream('./ClassRoom.html')
// let ClassRoom = []

// function readLines(input, func) {
//   var remaining = '';
//    input.on('data', function(data) {
//     remaining += data;
//     var index = remaining.indexOf('\n');
//     var last  = 0;
//     while (index > -1) {
//       var line = remaining.substring(last, index);
//       last = index + 1;
//       func(line);
//       index = remaining.indexOf('\n', last);
//     }

//     remaining = remaining.substring(last);
//   })
//   input.on('end', function() {
//     if (remaining.length > 0) {
//       func(remaining);
//     }
//    });
//  }

// function func(data) {
//     fish.concat(toString(data))
    
// }

  //  readLines(input, func)
    console.log(classRoom)
