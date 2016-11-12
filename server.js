var http = require('http');
var login = require("facebook-chat-api");
var natural = require('natural');

// Create server
http.createServer(function (request, response) {
    response.writeHead(200, {
        'Content-Type': 'text/plain',
        'Access-Control-Allow-Origin' : '*'
    });
    response.end('Hello World\n');
}).listen(1337);

// Initialize natural language classifier
//classifier = new natural.BayesClassifier();

// Get Messenger data
var threadID = 100009779980369; // ThreadID between Ray and test account
login({email: "i950770@mvrht.com", password: "uberhacks3.0"}, function callback (err, api) {
    if (err) return console.error(err);
    
    function getAllHistory(threadID, n, cb) {        
        api.getThreadHistory(threadID, 1, n, null, function callback(error, history) {
            if (history.length === n) getAllHistory(threadID, n * 10, cb);
            else cb(error, history);
        });
    }
    
    //api.getThreadList(0, 4, 'inbox', function callback (err, arr) {
    //    console.log(arr);
    //});
    
    getAllHistory(threadID, 100, function callback (error, history) {
        if (error) console.error(error);
        
        console.log(history.length);
        
        for (var i = 0; i < history.length; i++) {
            //api.sendMessage(history[i].body, threadID);
            //console.log(history[i].body);
        }
    });
});
