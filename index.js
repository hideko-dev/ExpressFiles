const express = require('express');
const fileUpload = require('express-fileupload');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const JSONdb = require('simple-json-db');
const db = new JSONdb("./db.json");

const app = express();

app.use(fileUpload({
    createParentPath: true
}));

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.use(express.static("public"))

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/home.html");
});

app.post("/upload", (req, res) => {
  var file = req.files.file;
  var name = file.name;
  var originame = file.name;
  var type = file.mimetype;
  var size = file.size;
  if(size > 100000000){
    res.send("The file size is too large.");
  } else{
    number = 0
    if(Object.keys(db.storage).includes(name)){
      while(true){
        number += 1;
        name = String(number) + "-" + originame;
        if(!Object.keys(db.storage).includes(name)) break;
      }
    }
    db.set(name, {name:name, type:type, size:size});
    file.mv('./uploads/' + name);
    res.redirect("/details/" + name);
  }
});

app.get("/details/:filename", (req, res) => {
  filename = req.params.filename;
  if(Object.keys(db.storage).includes(filename)){
    info = db.get(filename);
    size = info.size;
    if(size > 1000000){
      size = String(Math.round(size / 10000) / 100) + " MB";
    } else if(size > 1000){
      size = String(Math.round(size / 10) / 100) + " KB";
    } else{
      size = String(size) + " Bytes";
    }
    res.render("details.html", {filename:info.name, type:info.type, size:size});
  } else{
    res.redirect("/");
  }
});

app.get("/details/:filename/download", (req, res) => {
  filename = req.params.filename;
  if(Object.keys(db.storage).includes(filename)){
    res.download(process.cwd() + "/uploads/" + filename);
  } else{
    res.redirect("/");
  }
});

app.get("/uploads/:filename", (req, res) => {
  filename = req.params.filename;
  if(Object.keys(db.storage).includes(filename)){
    res.sendFile(process.cwd() + "/uploads/" + filename);
  } else{
    res.redirect("/");
  }
});

app.get("/*", (req, res) => {
  res.sendFile(__dirname + "/views/404.html");
});

app.listen(3000, () => { 
  console.log('server started.')
});