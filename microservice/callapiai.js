module['exports'] = function echoHttp (hook) {
	var apiai = require('apiai');
  	var https = require('https');
  	var querystring = require('querystring');
	
	var app = apiai("<<replace it with your cliend id>>", "<<replace it with your subscription key>>");
	var deviceid = "<<replace it with your photon device id>>";
	var atoken = "<<replace it with your particle access token>>";
	
  	var query = hook.params["text"];
  
  	console.log(query);
  
	var qtext = query.replace("particle, ", "");
  
  	console.log(qtext);
  
  	var request = app.textRequest(qtext);
  
	request.on('response', function(response) {
    	console.log(response);
      
      	var statusCode = response["status"]["code"];
      
      	if(statusCode != 200){
          	var returnValue = {
				'statusCode': response["status"]["code"],
          		'errorType': response["status"]["errorType"],
        	}
            
            hook.res.end(returnValue);
        }
      
      	var result = response["result"];
      	var action = result["action"];
      	var result, parameters, sensor, room, op;
      
      	if(action === 'wisdom.unknown' || action === 'input.unknown'){
          	result = 0;
        }
      	else{
          	result = 1;
          
          	parameters = response["result"]["parameters"];
          	sensor = parameters["sensor"];
          	room = parameters["room"];
          	op = parameters['op'];
        }
      
      	var returnValue = {
	      	'response': JSON.stringify(response, false, 2),
			'statusCode': response["status"]["code"],
          	'errorType': response["status"]["errorType"],
          	'action': action,
          	'result': result,
          	'parameter': parameters,
          	'sensor': sensor,
          	'room': room
        } 	
        
        var func;
      	var arg;
        
        if(action === 'get-sensor'){
          	if(sensor === 'temperature'){
          		func = 'getroomtemp';
            }
          	else if(sensor === 'humidity'){
              	func = 'getroomhumid';
            }
          
          	if(room === "living room"){
              	arg = 0;
            }
          	else if(room === "bedroom"){
              	arg = 1;
            }
          	else if(room === "kitchen"){
              	arg = 2;
            }
        }
      	else if(action === 'control-light'){
          	func = 'ctrllight'
            
            if(room === "living room"){
              	arg = 0;
            }
          	else if(room === "bedroom"){
              	arg = 1;
            }
          	else if(room === "kitchen"){
              	arg = 2;
            }
          
          	if(arg != undefined){
              	if(op === 'on'){
                  	arg += ",1";
                }
              	else if(op === 'off'){
                  	arg += ",0";
                }
            }
        }
      
      	if(func != undefined && arg != undefined){
          	var path = "/v1/devices/" + devideid + "/" + func
          
            var data = querystring.stringify({
              	arg: arg,
              	access_token: atoken
            });
          
          	var options = {
				hostname: 'api.particle.io',
              	port: 443,
              	path: path,
              	method: 'POST',
              
              	headers: {
                  	'Content-Type': 'application/x-www-form-urlencoded'
            	}
            };
               
      		var req = https.request(options, function(res) {
				console.log('statusCode: ', res.statusCode);
            	console.log('headers: ', res.headers);
              
              	res.setEncoding('utf8');

            	res.on('data', function(d) {
                  
            	});
              
              	res.on('end', function () {
    				console.log(result);
                  
                  	hook.res.end(returnValue);
  				});
          	});
          
          	req.on('error', function(error){
              	hook.res.end("Error: " + returnValue);
            });
          
          	console.log(data);
      
          	req.write(data);
          	req.end();
        }
      	else{
          	hook.res.end(returnValue);
        }
	});
 
	request.on('error', function(error) {
    	console.log(error);
      
      	hook.res.end("Error: " + error);
	});
 
	request.end()
};