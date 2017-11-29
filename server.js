const express = require('express');
const expressHandlebars = require('express-handlebars');
const bodyParser = require('body-parser');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const finder = require('findit');

var app = express();

//init Handlebars
app.engine('handlebars', expressHandlebars({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');
//init body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// finder.on('directory', function(dir, stat, stop) {
//   var base = path.basename(dir);
//   // console.log(base);
//     if (base === 'uploads' ) {
//       stop()
//       console.log(base)
//     }
// })

var MAGIC_NUMBERS = {
  jpg: 'ffd8ffe0',
 jpg1: 'ffd8ffe1',
 png: '89504e47',
 gif: '47494638'
}

function checkMagicNumbers(magic) {
   if (magic == MAGIC_NUMBERS.jpg || magic == MAGIC_NUMBERS.jpg1 || magic == MAGIC_NUMBERS.png || magic == MAGIC_NUMBERS.gif) return true
}

app.get('/api/file', function(req, res) {
  res.render('uploadForm')
});

app.post('/api/file', function(req, res){
  var upload = multer({
    storage: multer.memoryStorage()
  }).single('userFile')
  upload(req, res, function(err){
    var buffer = req.file.buffer;
    var magic = buffer.toString('hex', 0, 4);
    var filename = req.file.fieldname + '-' + Date.now() + path.extname(req.file.originalname);
    if(checkMagicNumbers(magic)) {
      fs.writeFile('./uploads/' + filename, buffer, 'binary', function(err){
        if (err) throw err;
        res.redirect('/api/getFiles');

      })
    } else {
      res.send('File is no valid');
    }
  })
});

// Working progress
app.get('/api/getFiles', function async(req, res){
    let fileData = [];

  await fs.readdir('./uploads', function (err, files) {
      if (err) throw err;
      files.forEach((file) => {
        fs.readFile("./uploads/" + file, function(err, data) {
          if (err) throw err;

          fileData.push(data)
        })
      })
    });


  res.send(fileData)
  // res.render('dashboard');
});

var port = process.env.PORT || 8000;

app.listen(port, function(){
    console.log('Node.js listening on port ' + port);
})
