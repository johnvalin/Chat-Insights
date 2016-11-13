var http = require('http');
var login = require("facebook-chat-api");
var start = 1;
var end = 50;
var timestamp = null;


var AWS = require("aws-sdk");

AWS.config.update({
    region: "us-east-1", // doesn't matter while it's local but I'm running this out of Virginia so will matter when we go live
    endpoint: "http://localhost:8000" // if you have anything running on port 8000, dynamo will crash unless you specify it
});


http.createServer(function (request, response) {
    response.writeHead(200, {
        'Content-Type': 'text/plain',
        'Access-Control-Allow-Origin' : '*'
    });
    response.end('Hello World\n');
}).listen(1337);

// Gets the thread history
login({email: "i1029456@mvrht.com", password: "uberhacks3.0"}, function callback (err, api) {
    if(err) return console.error(err);
    var docClient = new AWS.DynamoDB.DocumentClient();    

    function getAllHistory(threadID, n, cb) {        
        api.getThreadHistory(threadID, 1, n, null, function callback(error, history) {
            if (history.length === n) getAllHistory(threadID, n * 10, cb);
            else cb(error, history);
        });
    }

    api.getThreadList(start, end, 'inbox', function callback (error, threadList) {
    	for(var j = 0; j < threadList.length; j++) {
	        //gets all the history for each thread
	        getAllHistory(threadList[j].threadID, end, function callback (error, history) {
	            if (error) console.error(error);
	            //console.log(history);
		        var result = [];
		        var name = history[0].senderName;
		        var time = history[0].timestamp;
		        for (var message in history) {
			        if (history[message].senderName != name) {
	            			result.push({senderName: history[message].senderName, timestamp: history[message].timestamp, delta: history[message].timestamp-time, body: history[message].body});
			        name = history[message].senderName;
			        time = history[message].timestamp;
			        }
			        else {
				        result.push({senderName: history[message].senderName, timestamp: history[message].timestamp, delta: null, body: history[message].body});
			        }
		        }
	            var docClient = new AWS.DynamoDB.DocumentClient();

	            var table = "Threads"; // that's the name of the table in AWS
	            console.log(threadList);
	            console.log(j);
	            console.log(threadList[j]);
	            var params = {
	                TableName: table,
	                Item: {
	                    "ThreadID": threadList[j].threadID, // string
	                    "participantIDs": threadList[j].participantIDs, // set of strings
	                    "name": threadList[j].name, // string
	                    "emoji": threadList[j].emoji, //string (no chars allowed)
	                    "nicknames": threadList[j].nicknames, // MAP of IDs to nicknames
	                    "color": threadList[j].color, // string #ffffff for example
	                    "lastInfo": {name : time}, // map of last user and last message
	                    "messages": results // set of jsons with messages
	                }
	            };
	
	            console.log("Adding a new item...");
	            docClient.put(params, function(err, data) {
	                if (err) {
	                    console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
	                } else {
	                    console.log("Added item:", JSON.stringify(data, null, 2));
	                }
	            });
	        //console.log(result);
	        //put the results (items) in the table one by one
            });
	    }
    });
});
