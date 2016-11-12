var http = require('http');
var login = require("facebook-chat-api");
var ThreadID = 1142870729093699; //Thread ID for our groupchat
var start = 1;
var end = 500;
var timestamp = 1478963082; //"2016-10-30T08:30:00+00:00";


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
<<<<<<< HEAD
    
    api.getThreadList(0, 4, 'inbox', function callback (err, arr) {
        console.log(arr);
    });
    
    api.getThreadHistory('100002528536269', 1, 4, null, function callback (error, history) {
        if (error) console.error(error);
        
        for (var i = 0; i < history.length; i++) {
            api.sendMessage(history[i].body, history[i].threadId);
        }
    });
    
    //api.listen(function callback(err, message) {
    //    api.sendMessage(message.body, message.threadID);
    //});
=======

    api.getThreadHistory(ThreadID, start, end, timestamp, function callback(err, history) {
        if(err!=null) return console.error(err);
        
        else console.log(history);
    });
>>>>>>> origin/history
});
