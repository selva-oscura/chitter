module.exports = function Route(app){
  var users={};
  var user={};
  var chitterers = [];
  var chitter = [];
  app.get('/', function(req, res){                 	// '/' index route   .get refers to the response to a get request (as opposed to post)
    res.render('index', {title: 'Chitter'});
  });
  app.get('/chat', function(req, res){                 	// '/' index route   .get refers to the response to a get request (as opposed to post)
    res.render('chat', {title: 'Chitter'});
  });
  app.io.on('connection', function(req){
  	console.log('Connecting, baby!');
  });
  app.io.route('request_setup', function(req){
    req.io.emit('user_setup', {current_user: user, users:users, chitterers:chitterers});   
  })
  app.io.route('user_departure', function(req){
    console.log('user_departure', req.data.name, req.data.id);
    chitterers=chitterers.filter(function(el){
      return el.name !== req.data.name;
    });
    app.io.broadcast('user_departed', {id:req.data.id, name:req.data.name});
  })
  app.post('/process', function(req, res){
    /* set some session data */
    req.session.post_info = req.body;
    users[req.sessionID] = {name: req.body.name, id:req.sessionID};
    user={name: req.body.name, id:req.sessionID};
    chitterers.push(user);
    req.session.save(function(){
      res.redirect('/chat');
      app.io.broadcast('user_arrived', {new_arrival_name: req.body.name, new_arrival_id:req.sessionID , user_list:users});
    });
  });
}