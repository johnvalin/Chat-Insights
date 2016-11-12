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

// Create simple echo bot
login({email: "i950770@mvrht.com", password: "uberhacks3.0"}, function callback (err, api) {
    if(err) return console.error(err);
    
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
});
