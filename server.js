var http = require('http');
var login = require("facebook-chat-api");

http.createServer(function (request, response) {
    response.writeHead(200, {
        'Content-Type': 'text/plain',
        'Access-Control-Allow-Origin' : '*'
    });
    response.end('Hello World\n');
}).listen(1337);



var login = require("facebook-chat-api");

var threadID = 100009779980369; // ThreadID between Ray and test account
var start = 1;
var end = 5;

// Gets the thread history
login({email: "i950770@mvrht.com", password: "uberhacks3.0"}, function callback (err, api) {
    if (err) return console.error(err);
    
    //api.getThreadList(0, 4, 'inbox', function callback (err, arr) {
    //    console.log(arr);
    //});
    
    api.getThreadHistory(threadID, start, end, null, function callback (error, history) {
        if (error) console.error(error);
        
        for (var i = 0; i < history.length; i++) {
            api.sendMessage(history[i].body, threadID);
        }
    });
});
