module.exports = function Route(app){
  var user={};
  var chitterers = [];
  var chitter = [];
  var message={};
  var user_count=0;
  var colour_wheel = ['blue', 'red', 'green', 'purple', 'brown', 'orange', 'black', 'gray'];
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
    req.io.emit('user_setup', {current_user: user, chitterers:chitterers});
    user={};
  })
  app.io.route('user_departure', function(req){
    chitterers=chitterers.filter(function(el){
      return el.name !== req.data.name;
    });
    app.io.broadcast('user_departed', {id:req.data.id, name:req.data.name});
  })
  app.io.route('chitter_post', function(req){
    message={name:req.data.name, id:req.data.id, message:req.data.message, colour:req.data.colour};
    chitter.push(message);
    app.io.broadcast('chitter_posted', {name:req.data.name, message:req.data.message, colour:req.data.colour});
  });
  app.post('/process', function(req, res){
    /* set some session data */
    req.session.post_info = req.body;
    var user_colour = colour_wheel[user_count%colour_wheel.length];
    user_count++;
    user={name: req.body.name, id:req.sessionID, colour: user_colour};
    chitterers.push(user);
    // user={};
    req.session.save(function(){
      res.redirect('/chat');
      app.io.broadcast('user_arrived', {name: req.body.name, id:req.sessionID, colour:user_colour});
    });
  });
}