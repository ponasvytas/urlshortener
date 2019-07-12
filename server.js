'use strict';

var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');
const dns = require("dns");

const myApp = require('./myApp.js');


var cors = require('cors');

var app = express();

// Basic Configuration 
var port = process.env.PORT || 3000;

/** this project needs a db !! **/ 
// mongoose.connect(process.env.MONGOLAB_URI);

app.use(cors());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

  
// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});


const Url = require("./myApp.js").Url;
const createSampleUrl = require("./myApp.js").createSampleUrl;

app.get("/sample", (req, res, next) => {
  createSampleUrl((err, data) => {
    if (err) {return next(err)}
    res.json(data);
    
  })
});

const findLastNumber = require("./myApp.js").findLastNumber;
app.get("/findlast", (req, res, next) => {
  findLastNumber((err, data) => {
    if (err) {return next(err)}
    res.send(data);
  })
});

const findUrlByNumber = require("./myApp.js").findUrlByNumber;
const shortenUrl = require("./myApp.js").shortenUrl;

app.get("/api/shorturl/:urlId", (req, res, next) => {
  const url = req.params.urlId;
  console.log(url)
  // check if url is a whole number
  if (parseInt(url)) {
    // retrieve stored original_url
    const urlNumber = parseInt(url);
    findUrlByNumber(urlNumber, (err, data) =>{
      if (err) {return next(err)} 
      if (data) {
        console.log("redirecting...")
        res.redirect(200, "https://" + data.original_url);
        // res.json(data);
        next(data);
        console.log("after next")
      } else {
        res.json({error: "invalid Short URL"});
      }
    })
  } else {
    // check if it is a valid ulr
    dns.lookup(url, (err, address, family)=>{
      if (err) {res.json({error: "invalid URL"})}
      
      // valid url -> need to shorten ir and return to user.
      shortenUrl(url, (err, data) => {
        console.log("shortening")
        if (err) {return next(err)}
        res.json(data);
      }); 
    });    
  }
});

app.listen(port, function () {
  console.log('Node.js listening ...');
});
