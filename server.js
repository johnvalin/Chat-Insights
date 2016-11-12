var http = require('http');
var login = require("facebook-chat-api");
var start = 1;
var end = 50;
var timestamp = null;


http.createServer(function (request, response) {
    response.writeHead(200, {
        'Content-Type': 'text/plain',
        'Access-Control-Allow-Origin' : '*'
    });
    response.end('Hello World\n');
}).listen(1337);



var login = require("facebook-chat-api");

// Gets the thread history
login({email: "i950770@mvrht.com", password: "uberhacks3.0"}, function callback (err, api) {
    if(err) return console.error(err);
    
    function getAllHistory(threadID, n, cb) {        
        api.getThreadHistory(threadID, 1, n, null, function callback(error, history) {
            if (history.length === n) getAllHistory(threadID, n * 10, cb);
            else cb(error, history);
        });
    }
    
//gets all the history for the conversation between john and the bot.
    getAllHistory('100002528536269', end, function callback (error, history) {
        if (error) console.error(error);
        console.log(history);
	for (var i = 0; i < history.length; i++) {
            console.log(history[i].body, history[i].threadID);
        }
	
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

	console.log(result);

	

    });
    
});
