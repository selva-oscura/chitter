// // checking that chitter.ejs was connecting to this file
// alert('hello');

$(document).ready(function(){
  io = io.connect();
  var user_count=0;
  var me={};
  var colour_wheel = ['blue', 'red', 'green', 'purple', 'brown', 'orange', 'black', 'gray'];
  function returnHome(){
    window.location.href='/';
  }
  $('#exit').on('click', function(){
  	returnHome();
  	io.emit('user_departure', {name:me.name, id: me.id});
  });
  io.emit('request_setup', {message:'nada'});
  io.on('user_setup', function(data){
  	console.log(data);
  	console.log('current user:', data.current_user, 'chitterers:', data.chitterers);
  	for(i in data.chitterers){
  		if(data.chitterers[i].id!==data.current_user.id){
		    var user_colour = colour_wheel[user_count%colour_wheel.length];
		    $('#user_list').append('<div id="'+data.chitterers[i].id+'"class="active_user"><div class="user_color" style="background-color:'+user_colour+'"></div><h3 class="user_name" style="color:'+user_colour+'">'+data.chitterers[i].name+'</h3><div class="clear"></div></div>');
  			user_count++;
  		}
  		else{
  			$('#name_span').append(data.current_user.name);
  		}
  	}
  	me={name: data.current_user.name, id: data.current_user.id};
  	// console.log(data.current_user.name, data.current_user.id);
  	// $('#user_list').append('<p>'+data.current_user.name+' '+data.current_user.id +'</p>');
  });
  io.on('user_arrived', function(data){
    user_count++;
    var user_colour = colour_wheel[user_count%colour_wheel.length-1];
    $('#user_list').append('<div id="'+data.new_arrival_id+'"class="active_user"><div class="user_color" style="background-color:'+user_colour+'"></div><h3 class="user_name" style="color:'+user_colour+'">'+data.new_arrival_name+'</h3><div class="clear"></div></div>');    
  });
  io.on('user_departed', function(data){
  	// console.log(data, data.id, data.name);
  	$('#'+data.id).remove();
  });
})
