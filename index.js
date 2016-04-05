/* Config options */
var config = require("./config.json");

/* Dependecy load */
var WhatCD = require("whatcd");
var _ = require("underscore");
var client = new WhatCD("https://what.cd", config.username, config.password);
var express = require('express');
var exphbs  = require('express-handlebars');

/* Express setup */
var app = express();
var hbs = exphbs.create({defaultLayout:'main'});

app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
app.use(express.static('static'));
/* Homepage */
app.get('/', function (req, res) {
  res.render('home');
});

app.get('/top', function(req, res){
  var searchParams = {
    type: "name",
    query: req.query.artist
  }
  getArtist(searchParams, function(results){+
    res.render('topTable', {data:{torrents:results}});
  });
  
})


function getArtist(params, callback){
  var searchParams  = {};
  var flacTorrents = [];
  if ( params.type == "id" ){

  } else {
    searchParams.artistname = params.query;
  };
  
  client.artist(searchParams,function(err, data) {
    if (err) {
      return console.log(err);
    }
   
    var torrentGroups = data.torrentgroup;  
    torrentGroups.forEach(function(torrentGroup){
    	if ( parseInt(torrentGroup.releaseType) == 1 ){
    		var albumTitle = torrentGroup.groupName;
    		torrentGroup.torrent.forEach(function(torrent){
    			if ( torrent.format == "FLAC"  && (torrent.media =="CD" || torrent.media == "Vinyl")){
    				torrent.title = albumTitle;
    				flacTorrents.push(torrent);
    			}
    			
    		}) 		
    	};
    });
    flacTorrents = _.sortBy(flacTorrents, "snatched");
    var uniqueFlacs = _.uniq(flacTorrents, JSON.stringify);
    uniqueFlacs.reverse();
    callback(uniqueFlacs);
  });
}


/* Express JS boot */
app.listen(config.expressPort, function () {
  console.log('what.cd artist top listening on port: ' + config.expressPort);
});