window.onload = function (){
    
  //Avisa que el documents està ready
  console.log( "ready!" );
  var master;

  //videocall
  navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
  
  //variables del joc_run2live
  var enemyYPositions = [];
  var enemyXPositions = [];
  var avatarX = 0;
  var avatarY = 0;
  var avatar2x = 0;
  var avatar2y = 0;
  var img_avatar;
  var img_enemy;


  // Connect to PeerJS, have server assign an ID instead of providing one
  // Showing off some of the configs available with PeerJS :).
  //connexió al PeerJS server 
  var peer = new Peer({
  // Set API key for cloud server (you don't need this if you're running your
  // own.
  key: 'x7fwx2kavpy6tj4i',

  // Set highest debug level (log everything!).
  debug: 3,

    // Set a logging function:
    logFunction: function() {
      var copy = Array.prototype.slice.call(arguments).join(' ');
      $('.log').append(copy + '<br>');
    }
  });
  //fi de la conf del server//
  
    
  var connectedPeers = {};


  //mostrar id aleatori
  //usage 
  peer.on('open', function(id){
    $('#pid').text(id);

    console.log(id);
    
  });

  /****/
  //videocall//

    // Receiving a call
    peer.on('call', function(call){
      // Answer the call automatically (instead of prompting user) for demo purposes
      call.answer(window.localStream);
      step3(call);
    });

    peer.on('error', function(err){
      alert(err.message);
      // Return to step 2 if error occurs
      $('#step1, #step3').hide();
    });

    $('#end-call').click(function(){
      window.existingCall.close();
      $('#step1, #step3').hide();
    });

      // Retry if getUserMedia fails
    $('#step1-retry').click(function(){
       $('#step1-error').hide();
       step1();
    });

    // Get things started
    step1();
 

    function step1 () {
      // Get audio/video stream
      navigator.getUserMedia({audio: true, video: true}, function(stream){
        // Set your video displays
        $('#my-video').prop('src', URL.createObjectURL(stream));

        window.localStream = stream;
        $('#step1, #step3').hide();
      }, function(){ $('#step1-error').show(); });
    }

    function step3 (call) {
      // Hang up on an existing call if present
      if (window.existingCall) {
        window.existingCall.close();
      }

      // Wait for stream on the call, then set peer video display
      call.on('stream', function(stream){
        $('#their-video').prop('src', URL.createObjectURL(stream));
      });

      // UI stuff
      window.existingCall = call;
      $('#their-id').text(call.peer);
      call.on('close', $('#step1, #step3').hide());
      $('#step1').hide();
      $('#step3').show();
    }

  //end_videocall
  /**************/

  // Esperant les connexions
  //receive connetions
  peer.on('connection', connect);

  // Handle a connection object.
  function connect(c) {
    
    // Handle a chat connection.
    if (c.label === 'chat') {
       
     
      /*CREACIÓ DEL XAT MOSTRANT ID DEL CLIENT */
      var chatbox = $('<div></div>').addClass('connection').addClass('active').attr('id', c.peer);
      var header = $('<h1></h1>').html('Chat with <strong>' + c.peer + '</strong>');
      var messages = $('<div><em>Connexió establerta.</em></div>').addClass('messages');
      //c.peer id del client.
      
      
      //append dels atributs creats anteriorment
      chatbox.append(header);
      chatbox.append(messages);
  
            
      //Seleccionar handler de la connexió
      //Quant fem click a chatbox...
      chatbox.on('click', function() {
    	//Si l'index de l'atribut "active" és igual a -1 
    	if ($(this).attr('class').indexOf('active') === -1) {
    	  //si no existeix afeigeix la Classe sino elimina la classe.
    	  $(this).addClass('active');
    	} else {
    	  $(this).removeClass('active');
    	}
      });
      
      
      //Oculta el div que diu q no hi ha connexions ja que la connexió s¡ha establert.
      $('.filler').hide();
      //afegim el xat al div a connections
      $('#connections').append(chatbox);

      
      //L'event data s'envia quan es reben les dades de connexió
      c.on('data', function(data)
      {
      	//append dels missatges que envien
      	messages.append('<div><span class="peer">' + c.peer + '</span>: '+ data +'</div>');
      });

      //si actualitza la pag o marxa la connexió és queda close.
      c.on('close', function() {
    	//alert que t'avisa que l'usuari ha marxat de la pàgina
    	alert(c.peer + ' has left the chat.');
    	//elimina el chat
    	chatbox.remove();
	
    	//si la connexió és = 0 vol dir que no hi ha connexió per tant
    	//mostra el div amb el text "no hi ha connexió establerta"
    	if ($('.connection').length === 0) {
    	     $('.filler').show();
    	}
    	
    	//eliminar/finalitza "la connexió" (el client) de la variable connectedPeers
    	//console.log("c.peer left"+connectedPeers[c.peer]);
    	delete connectedPeers[c.peer];
          });
      
    }
    //*********************************************************************************************************//
    else if (c.label === 'Joc_connection') { 

        //connexió OK--inciar el joc
        //setInterval(joc,25);
        setUpGame();
        setInterval(joc,25);

            c.on('data', function(data) {

               var json = JSON.parse(data);
               if(aux>parseInt(json["token"])){
                    master=true;
                    //console.log("Soc master");
               }else{
                    master=false;
                    //console.log("Soc esclau :/");
               }

              
                if(json["Joc_connection_x"]!=undefined){
                  if(master==false)
                  {
                    x_enemics=json["Joc_connection_x"];
                    y_enemics=json["Joc_connection_y"];
                    num_enemies=json["num_enemies"];
                    x_avatar=json["avatarX"];
                    y_avatar=json["avatarY"];
                  
                    handleTick(x_enemics,y_enemics,num_enemies,x_avatar,y_avatar,avatar2x,avatar2y);
                  
                  }
                }

                if(master==true){
                  if(local_mov!=undefined)
                  {
                    json_local=JSON.parse(local_mov);
                    x_enemics=json_local["Joc_connection_x"];
                    y_enemics=json_local["Joc_connection_y"];
                    num_enemies=json_local["num_enemies"];
                    handleTick(x_enemics,y_enemics,num_enemies,avatarX,avatarY,json["avatar2x"],json["avatar2y"]);
                  }
                  
                }
                
                

            });

            c.on('close', function() {
                //alert que t'avisa que l'usuari ha marxat de la pàgina
                console.log(c.peer + ' close.');
         
            
                //si la connexió és = 0 vol dir que no hi ha connexió per tant
                //mostra el div amb el text "no hi ha connexió establerta"
                //if ($('.connection').length === 0) {
                  //   $('.filler').show();
                //}
          
                //eliminar/finalitza "la connexió" (el client) de la variable connectedPeers
                //console.log("c.peer left"+connectedPeers[c.peer]);
                //delete connectedPeers[c.peer];
            });
    };
    //*********************************************************************************************************//

    connectedPeers[c.peer] = 1;
  }
  
   // Connect to a peer
   $('#connect').click(function() {
    //videocall
     var call = peer.call($('#rid').val(), window.localStream);

     
     //videocall end

     requestedPeer = $('#rid').val();
     if (!connectedPeers[requestedPeer])
     {
        	// Create 2 connections, one labelled chat and another labelled file.
          	var c = peer.connect(requestedPeer, {
          	  label: 'chat',
          	  serialization: 'none',
          	  metadata: {message: 'hi i want to chat with you!'}
          	});
        	
        	//creació de les dos connexions
        	c.on('open', function() {
        	  connect(c);
        	});
        	
        	c.on('error', function(err) { alert(err); });
          	
            //connexió per els enemics
            /**********************************************************************************************/
            /**********************************************************************************************/
            //var f = peer.connect(requestedPeer, { label: 'Joc_connection', reliable: true });
            var f = peer.connect(requestedPeer, {
              label: 'Joc_connection',
              serialization: 'none',
              metadata: {message: 'mov'}
            });
          	
          	f.on('open', function() {
          	  connect(f);
          	});

          	f.on('error', function(err) { alert(err); });
            }
                connectedPeers[requestedPeer] = 1;
                //videocall
                step3(call);
             });
            /**********************************************************************************************/
            /**********************************************************************************************/
    
     // Close a connection.
     $('#close').click(function() {
        eachActiveConnection(function(c) {
        c.close();
        });
    });

    // Send a chat message to all active connections.
    $('#send').submit(function(e) {
      e.preventDefault();
      // For each active connection, send the message.
      var msg = $('#text').val();
      eachActiveConnection(function(c, $c) {
      	if (c.label === 'chat')
        {
      	  //setInterval(handleTick, 25);
      	  c.send(msg);
      	  $c.find('.messages').append('<div><span class="you">You: </span>' + msg + '</div>');
      	}
      });
      $('#text').val('');
      $('#text').focus();
    });

/**************************************************************************************/
      var token= Math.floor((Math.random() * 100) + 1);
      var aux = token;
      num_enemies=0;
      enemyXPositions=[];
      enemyYPositions=[];
      max_enemies=20;
      var local_mov;
      var au=0; 
      function joc() {
       // console.log("estic foradela funcio eachActiveConnection però din de joc");
       eachActiveConnection(function(c, $c) {
       if (c.label === 'Joc_connection') {
          
          document.getElementById("gameCanvas").addEventListener("mousemove", mouse_avatar2);
          //c.send(JSON.stringify({"avatar2x":avatar2x,"avatar2y":avatar2y}));
          c.send(JSON.stringify({"token":token,"avatar2x":avatar2x,"avatar2y":avatar2y}));
          
          var current_enemies = 0;
          var num_enemies = enemyXPositions.length;
      
          if (Math.random() < 1/20)
          {
            enemyYPositions.push(0);
            enemyXPositions.push(Math.random() * 400);
          }

          while (current_enemies < num_enemies) {
            enemyYPositions[current_enemies] = enemyYPositions[current_enemies] + 1;
            current_enemies = current_enemies + 1;
          }
          

        //nomes el master s'encarrega d'enviar dades
          if(master==true){
          
          document.getElementById("gameCanvas").addEventListener("mousemove", handleMouseMovement);
          c.send(JSON.stringify({"Joc_connection_x" : enemyXPositions, "Joc_connection_y": enemyYPositions, "num_enemies":num_enemies,"avatarX":avatarX,"avatarY":avatarY}));
          //desas les dadesamb els moviments que envies.
          local_mov=JSON.stringify({"Joc_connection_x" : enemyXPositions, "Joc_connection_y": enemyYPositions, "num_enemies":num_enemies});
        }

        }
       });
    };
    
/**************************************************************************************/


    // Goes through each active peer and calls FN on its connections.
    //passa per els interlocutors actius i agafa FN
    function eachActiveConnection(fn) {
      var actives = $('.active');
      //var per les ids...
      var checkedIds = {};
      
      //funció que agafa les connexions actives.
      actives.each(function() {
    	var peerId = $(this).attr('id');
    	//si la connexions actives son diferent al peerID la meva id
    	if (!checkedIds[peerId]) {
    	  var conns = peer.connections[peerId];
    	  for (var i = 0, ii = conns.length; i < ii; i += 1) {
    	    var conn = conns[i];
    	    fn(conn, $(this));
    	  }
    	}

    	checkedIds[peerId] = 1;
          });
    }

    // mostraversió del navegador
    $('#browsers').text(navigator.userAgent);

    

    // Make sure things clean up properly.//netejar
    window.onunload = window.onbeforeunload = function(e) {
      if (!!peer && !peer.destroyed) {
	peer.destroy();
      }
    };

    
  /****************************************************************/  
  //funcions del joc
  function setUpGame() {
	  var gameCanvas = document.getElementById("gameCanvas");
	  img_avatar = new Image();
    img_avatar2 = new Image();
	  img_enemy = new Image();
	  img_enemy.src = "img/enemy.png";
	  img_avatar.src = "img/avatar.png";
    img_avatar2.src = "img/avatar2.png";
	  
	  gameCanvas.getContext("2d").drawImage(img_avatar, Math.random() * 100, Math.random() * 100);
    gameCanvas.getContext("2d").drawImage(img_avatar2, Math.random() * 100, Math.random() * 100);
	  
	  //gameCanvas.addEventListener("mousemove", handleMouseMovement);  

  }

function handleMouseMovement(mouseEvent) {
        avatarX = mouseEvent.offsetX;
        avatarY = mouseEvent.offsetY;
 }

 function mouse_avatar2(mouseEvent) {
        avatar2x = mouseEvent.offsetX;
        avatar2y= mouseEvent.offsetY;
 }
  var current_enemies = 0;
  function handleTick(enemyXPositions,enemyYPositions,num_enemies,avatarX,avatarY,avatar2x,avatar2y)
  {
      var gameCanvas = document.getElementById("gameCanvas");
      gameCanvas.width = 400;   //this erases the contents of the canvas
      gameCanvas.getContext("2d").drawImage(img_avatar, avatarX, avatarY);
      gameCanvas.getContext("2d").drawImage(img_avatar2, avatar2x, avatar2y);
      
      current_enemies = 0;
      while (current_enemies < num_enemies) {
          gameCanvas.getContext("2d").drawImage(img_enemy, enemyXPositions[current_enemies], enemyYPositions[current_enemies]);
          current_enemies = current_enemies + 1;
      }

      current_enemies = 0;
      while (current_enemies < num_enemies) {
        if ( ( (avatarX < enemyXPositions[current_enemies] && enemyXPositions[current_enemies] < avatarX + 32) || (enemyXPositions[current_enemies] < avatarX && avatarX < enemyXPositions[current_enemies] + 32) ) && ( (avatarY < enemyYPositions[current_enemies] && enemyYPositions[current_enemies] < avatarY + 32) || (enemyYPositions[current_enemies] < avatarY && avatarY < enemyYPositions[current_enemies] + 32) ) ) {
          console.log("master_hit");
        }
         if ( ( (avatar2x < enemyXPositions[current_enemies] && enemyXPositions[current_enemies] < avatar2x + 23) || (enemyXPositions[current_enemies] < avatar2x && avatar2x < enemyXPositions[current_enemies] + 23) ) && ( (avatar2y < enemyYPositions[current_enemies] && enemyYPositions[current_enemies] < avatar2y + 43) || (enemyYPositions[current_enemies] < avatar2y && avatar2y < enemyYPositions[current_enemies] + 32) ) ) {
          console.log("esclau_hit");
        }
        current_enemies = current_enemies + 1;
      } 
  }

 

}