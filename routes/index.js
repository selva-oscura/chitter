module.exports = function Route(app){
  var user={};
  var chitterers = [];
  var message={};
  var chitter = [];
  var user_count=0;
  var colour_wheel = ['blue', 'crimson', 'green','deeppink', 'indigo', 'maroon', 'darkblue', 'orangered', 'darkgreen','black', 'fuchsia', 'gray'];

  // route for landing (index) page
  app.get('/', function(req, res){
    res.render('index', {title: 'Chitter'});
  });

  // routing for sign-in from landing page
  //  creates a sessionID and assigns a colour to the user profile
  //  redirects new arrival to landing page
  //  broadcasts user_arrived to all users but new arrival
  //    id, name, colour for new arrival
  app.post('/process', function(req, res){
    /* set some session data */
    req.session.post_info = req.body;
    var user_colour = colour_wheel[user_count%colour_wheel.length];
    user_count++;
    user={name: req.body.name, id:req.sessionID, colour: user_colour};
    chitterers.push(user);
    req.session.save(function(){
      res.redirect('/chat');
      app.io.broadcast('user_arrived', {name: req.body.name, id:req.sessionID, colour:user_colour});
    });
  });

  // route for actual app (chat) page
  app.get('/chat', function(req, res){
    res.render('chat', {title: 'Chitter'});
  });

  // checking connection
  app.io.on('connection', function(req){
    console.log('Connecting, baby!');
  });

  // request_setup (sent by most recent arrival)
  // action: 
  //  emits user_setup to most recent arrival
  //    current_user (most recent arrival's id, name, colour for posts), 
  //    chitterers (id, name, colour for all users), 
  //    chitter (most recent posts with user name, colour, and message content)
  app.io.route('request_setup', function(req){
    req.io.emit('user_setup', {current_user: user, chitterers:chitterers, chitter:chitter});
    user={};
  })

  // user_departure (sent by most recent departure)
  // action: 
  //  broadcasts user_departure to all users 
  //    id, name, and colour for most recent departure
  //  removes most recent departure from chitterers (array of all users)
  app.io.route('user_departure', function(req){
    var colour;
    for(i in chitterers){
      if(chitterers[i].id===req.data.id){
        colour=chitterers[i].colour;
        app.io.broadcast('user_departed', {id:req.data.id, name:req.data.name, colour:colour});
      }
    }
    chitterers=chitterers.filter(function(el){
      return el.name !== req.data.name;
    });
  })

  // chitter_post (sent by any current user)
  // action:
  //  if message isn't empty (length>0)
  //    a message object is created with the most recent post (name, id, message, colour)
  //    the message object is pushed into the chitter array (history of messages)
  //    broadcasts chitter_posted with name, message, and colour information
  //    emits clear_form to original sender a trigger to clear the message form
  app.io.route('chitter_post', function(req){
    if(req.data.message.length>0){    
      message={name:req.data.name, id:req.data.id, message:req.data.message, colour:req.data.colour};
      chitter.push(message);
      if(chitter.length>20){chitter.shift();};
      app.io.broadcast('chitter_posted', {name:req.data.name, message:req.data.message, colour:req.data.colour});
      req.io.emit('clear_form',{message:'clear_form'});
    }
  });
}