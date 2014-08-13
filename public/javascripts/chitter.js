// // checking that chitter.ejs was connecting to this file
// alert('hello');

$(document).ready(function(){
	io = io.connect();
	var user_count=0;
	var me={};
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
	function returnHome(){
		window.location.href='/';
	}
	$('#exit').on('click', function(){
		returnHome();
		io.emit('user_departure', {name:me.name, id: me.id});
	});
	$(window).unload(function() {
  		io.emit('user_departure', {name:me.name, id: me.id});
	});
	io.emit('request_setup', {message:'nada'});
	io.on('user_setup', function(data){
		if(isEmpty(data.current_user)){
			returnHome();
			io.emit('user_departure', {name:me.name, id: me.id});
		};
		console.log('current user:', data.current_user, 'chitterers:', data.chitterers, 'chitter', data.chitter);
		for(i in data.chitterers){
			if(data.chitterers[i].id===data.current_user.id){
				// $('#user_list').append('<h2>Me</h2>');
				$('#user_list').append('<div id="'+data.chitterers[i].id+'"class="active_user"><div class="user_color" style="background-color:'+data.chitterers[i].colour+'"></div><h3 class="user_name" style="color:'+data.chitterers[i].colour+'">'+data.chitterers[i].name+'</h3><div class="clear"></div></div>');
				user_count++;
			}
		}
		$('#user_list').append('<h2>Other Users</h2>');
		for(i in data.chitterers){
			if(data.chitterers[i].id!==data.current_user.id){
		    // var user_colour = colour_wheel[user_count%colour_wheel.length];
		    $('#user_list').append('<div id="'+data.chitterers[i].id+'"class="active_user"><div class="user_color" style="background-color:'+data.chitterers[i].colour+'"></div><h3 class="user_name" style="color:'+data.chitterers[i].colour+'">'+data.chitterers[i].name+'</h3><div class="clear"></div></div>');
				user_count++;
			}
			else{
				$('#name_span').append(data.current_user.name);
			}
		}
		for(i in data.chitter){
			$('#chitter_space').append('<p style="color:'+data.chitter[i].colour+'"><strong>'+data.chitter[i].name+': </strong>'+data.chitter[i].message+'</p>'); 
		}
		me={name: data.current_user.name, colour: data.current_user.colour, id: data.current_user.id};
		// console.log(data.current_user.name, data.current_user.id);
		// $('#user_list').append('<p>'+data.current_user.name+' '+data.current_user.id +'</p>');
	});
	io.on('user_arrived', function(data){
		// user_count++;
		// var user_colour = colour_wheel[user_count%colour_wheel.length-1];
		$('#chitter_space').append('<p style="color:'+data.colour+'">'+'['+data.name+' has entered the chat room]</p>'); 
		$('#user_list').append('<div id="'+data.id+'"class="active_user"><div class="user_color" style="background-color:'+data.colour+'"></div><h3 class="user_name" style="color:'+data.colour+'">'+data.name+'</h3><div class="clear"></div></div>');    
	});
	io.on('user_departed', function(data){
		// console.log(data, data.id, data.name);
		$('#chitter_space').append('<p style="color:'+data.colour+'">'+'['+data.name+' has left to go chitter in RL]</p>'); 
		$('#'+data.id).remove();
	});
	$('#form').submit(function(){
		// console.log('chitter_post', me.name, me.id, $('#message').val());
		io.emit('chitter_post', {name: me.name, id: me.id, colour:me.colour, message:$('#message').val()});
		return false;
	});
	document.onkeydown = function(e){
		var keyCode = (window.event) ? event.keyCode : e.keyCode;
		if(keyCode===13){
			$('#form').submit();
		}
	}
	io.on('chitter_posted', function(data){
		// console.log('chitter_posted', data.colour, data.name, data.message);
		$('#chitter_space').append('<p style="color:'+data.colour+'"><strong>'+data.name+': </strong>'+data.message+'</p>');
        //get total height of overflow element
        var height = $('#chitter_space')[0].scrollHeight;
		//pass total height to scrollTop to push slider to bottom of page.
		$('#chitter_space').scrollTop(height);
	})
	io.on('clear_form', function(){
		// console.log('clear_form sent');
		$('#form').closest('form').find("textarea").val("")
	})
})
