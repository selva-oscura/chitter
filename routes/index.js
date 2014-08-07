module.exports = function Route(app){
  var users={};
  app.get('/', function(req, res){                 	// '/' index route   .get refers to the response to a get request (as opposed to post)
    res.render('index', {title: 'Chitter'});
  });
  app.get('/chat', function(req, res){                 	// '/' index route   .get refers to the response to a get request (as opposed to post)
    res.render('chat', {title: 'Chitter'});
  });
  app.io.on('connection', function(req){
  	console.log('Connecting, baby!');
   	// req.redirect('/chat');
  });
  app.post('/process', function(req, res){
   	/* set some session data */
   	req.session.post_info = req.body;
   	console.log('routes/index/js 16 -- logging', req.body.name);
  	users[req.sessionID] = {name: req.body.name}
  	console.log(users);
   	req.io.broadcast('new_user_broadcast', {message: req.body.name + ' has arrived'});
   	req.session.save(function(){
   		res.redirect('/chat');
   	});
  });
}
