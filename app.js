var express = require('express.io');
var path = require('path');
var app = express().http().io();
// configuring our environments
app.configure(function(){
  app.use(express.cookieParser());  
  app.use(express.json());    //for handling post data
  app.use(express.urlencoded());    //for handling post data
  app.use(express.static(path.join(__dirname, 'public'))); //for handling static contents
  app.use(express.session({secret: 'monster'})); //for using sessions
  app.set('view engine', 'ejs');
});
// using routes/index.js handle all of our routing
var route = require('./routes/index.js')(app);
var port = 4321;
app.listen(port);
console.log('listening on port', port);