const mongoose = require("mongoose");
const mongodb = require("mongodb");


mongoose.connect(process.env.MONGO_URI, {useNewUrlParser: true});

const urlSchema = new mongoose.Schema({
    original_url: {type: String, required: true},
    short_url: {type: Number}
  });

var Url = mongoose.model('Url', urlSchema);

const createSampleUrl = function (done) {
  const url = new Url({
    original_url: "www.vg.no",
    short_url: 1
  });
      
  url.save((err, data) => {
    if(err) {return done(err)}
    return done(null, data)
  });
}

function findLastNumber(done) {
  Url.find({}).sort({short_url: 'desc'})
    .limit(1)
    .select("short_url")
    .exec((err, data) => {
    if (err) {return done(err)}
    return done(null, data);
  })
}

function findUrlByNumber(number, done) {
  Url.findOne({short_url: number}).select("original_url short_url -_id").exec((err, data) => {
    if (err) {return done(err)}
    return done(null, data)
  });
}

function shortenUrl(originalUrl, done) {
  // check if url already exists
  Url.exists({original_url: originalUrl}, (err, exists) => {
    if (err) {return done(err)}
    if (exists) {
      Url.findOne({original_url:originalUrl})
          .select("-_id -__v")
          .exec((err, data) => {
              if (err) {return done(err)}
              return done(null, data);
          });
    }
    else {
      Url.find({}).sort({short_url: 'desc'})
          .limit(1)
          .exec((err, data) => {
            if (err) {return done(err)}
          let newNumber = 0;
            if (data[0]) {
              newNumber = parseInt(data[0].short_url) + 1;
            }

            const url = new Url({
              original_url: originalUrl,
              short_url: newNumber});

            url.save((err, data) => {
              if (err) {return done(err)}
              const responseData = {original_url: data.original_url, short_url: data.short_url}
              return done(null, responseData);
          });
        });
      }
  });
}

exports.Url = Url;
exports.createSampleUrl = createSampleUrl;
exports.findLastNumber = findLastNumber;
exports.shortenUrl = shortenUrl;
exports.findUrlByNumber = findUrlByNumber;
