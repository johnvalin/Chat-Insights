var login = require("facebook-chat-api");
var http = require('http');

http.createServer(function(request, response) {
    response.writeHead(200, {
        'Content-Type': 'text/plain',
        'Access-Control-Allow-Origin': '*'
    });
    response.end('Hello World\n');
}).listen(1337);


// Create simple echo bot
login({ email: "i950770@mvrht.com", password: "uberhacks3.0" }, function callback(err, api) {
    if (err) return console.error(err);

    api.listen(function callback(err, message) {
        api.sendMessage(message.body, message.threadID);
        api.getThreadInfo(message.threadID, function(err, info) {
            if (!err) console.log(info);

        });
    });
});