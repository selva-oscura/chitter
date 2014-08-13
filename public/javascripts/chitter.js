// // checking that chitter.ejs was connecting to this file
// alert('hello');

$(document).ready(function(){
	io = io.connect();
	// stores user's id, name, colour information
	var me={};
	// function for checking if an object is empty
	var hasOwnProperty = Object.prototype.hasOwnProperty;
	function isEmpty(obj) {
		// null and undefined are "empty"
		if (obj == null) return true;
		// Assume if it has a length property with a non-zero value that that property is correct.
		if (obj.length > 0)    return false;
		if (obj.length === 0)  return true;
		// Otherwise, does it have any properties of its own? 
		// Note: this doesn't handle toString and valueOf enumeration bugs in IE < 9
		for (var key in obj) {
		    if (hasOwnProperty.call(obj, key)) return false;
		}
		return true;
	}

	//redirect to home/landing/index page
	function returnHome(){
		window.location.href='/';
	}

	// on detecting user clicking exit button, redirect to hom/landing/index page and emit user_departure to server
	$('#exit').on('click', function(){
		returnHome();
		io.emit('user_departure', {name:me.name, id: me.id});
	});
	// on detect user leaving page, emit user_departure to server
	$(window).unload(function() {
  		io.emit('user_departure', {name:me.name, id: me.id});
	});

	// on arrival at chat.ejs, new arrival requests server for setup information
	io.emit('request_setup', {message:'nada'});

	// user_setup emit to new arrival by server triggers 
	//	set-up of list of users and recent messages
	//	saving of user's information
	io.on('user_setup', function(data){
		// redirect to landing page for sign-in if no current_user information is available (and, therefore, sent)
		if(isEmpty(data.current_user)){
			returnHome();
			io.emit('user_departure', {name:me.name, id: me.id});
		};
		// place div with user's name and colour in list of current users
		$('#user_list').append('<div id="'+data.current_user.id+'"class="active_user"><div class="user_color" style="background-color:'+data.current_user.colour+'"></div><h3 class="user_name" style="color:'+data.current_user.colour+'">'+data.current_user.name+'</h3><div class="clear"></div></div>');
		$('#name_span').append(data.current_user.name);
		// append div with user's name and colour for all other current users
		$('#user_list').append('<h2>Other Users</h2>');
		for(i in data.chitterers){
			if(data.chitterers[i].id!==data.current_user.id){
		    $('#user_list').append('<div id="'+data.chitterers[i].id+'"class="active_user"><div class="user_color" style="background-color:'+data.chitterers[i].colour+'"></div><h3 class="user_name" style="color:'+data.chitterers[i].colour+'">'+data.chitterers[i].name+'</h3><div class="clear"></div></div>');
			}
		}
		// appends most recent messages to message area (chitter_space)
		for(i in data.chitter){
			$('#chitter_space').append('<p style="color:'+data.chitter[i].colour+'"><strong>'+data.chitter[i].name+': </strong>'+data.chitter[i].message+'</p>'); 
		}
		//get total height of overflow element and pass to scrollTop to push slider to bottom of page.
        var height = $('#chitter_space')[0].scrollHeight;
		$('#chitter_space').scrollTop(height);
		// saves new arrival's data to me object
		me={name: data.current_user.name, colour: data.current_user.colour, id: data.current_user.id};
	});

	// user_arrived broadcast triggers 
	//	appending div with new user's name and colour to list of users 
	//	appending of announcement of user arrival announcement to messages area (chitter_space)
	io.on('user_arrived', function(data){
		// announces user arrival in the chitter space
		$('#chitter_space').append('<p style="color:'+data.colour+'">'+'['+data.name+' has entered the chat room]</p>'); 
		// appends div with new arrival's name and colour in list of users
		$('#user_list').append('<div id="'+data.id+'"class="active_user"><div class="user_color" style="background-color:'+data.colour+'"></div><h3 class="user_name" style="color:'+data.colour+'">'+data.name+'</h3><div class="clear"></div></div>');    
        //get total height of overflow element and pass to scrollTop to push slider to bottom of page.
        var height = $('#chitter_space')[0].scrollHeight;
		$('#chitter_space').scrollTop(height);
	});

	// user_departed broadcast triggers 
	//	removal of div with new user's name and colour to list of users 
	//	appending of announcement of user departure announcement to messages area (chitter_space)
	io.on('user_departed', function(data){
		// announces user departure in the chitter space
		$('#chitter_space').append('<p style="color:'+data.colour+'">'+'['+data.name+' has left to go chitter in RL]</p>');
		// removes div with departing user's name and colour from list of users 
		$('#'+data.id).remove();
        //get total height of overflow element and pass to scrollTop to push slider to bottom of page.
        var height = $('#chitter_space')[0].scrollHeight;
		$('#chitter_space').scrollTop(height);
	});

	// submit chat message (emit chitter_post to server) by clicking submit button
	$('#form').submit(function(){
		io.emit('chitter_post', {name: me.name, id: me.id, colour:me.colour, message:$('#message').val()});
		return false;
	});

	// submit chat message (emit chitter_post to server) by hitting Enter
	document.onkeydown = function(e){
		var keyCode = (window.event) ? event.keyCode : e.keyCode;
		if(keyCode===13){
			$('#form').submit();
		}
	}

	// on receipt of a valid message, server emits to poster clear_form, triggering reset of chat message form
	io.on('clear_form', function(){
		// clears message form's textarea
		$('#form').closest('form').find("textarea").val("")
	})

	// on receipt of a valid message, server broadcasts to all chitter_posted, triggering reset of chat message form
	io.on('chitter_posted', function(data){
		// appends most recent message to message area (chitter_space)
		$('#chitter_space').append('<p style="color:'+data.colour+'"><strong>'+data.name+': </strong>'+data.message+'</p>');
        //get total height of overflow element and pass to scrollTop to push slider to bottom of page.
        var height = $('#chitter_space')[0].scrollHeight;
		$('#chitter_space').scrollTop(height);
	})	
})
