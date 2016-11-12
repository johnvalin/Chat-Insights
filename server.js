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

    api.getThreadHistory(ThreadID, start, end, timestamp, function callback(err) {
        if(err) return console.error(err);
    });
});
