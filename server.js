var http = require('http');
var login = require("facebook-chat-api");
var natural = require('natural');

var testEmail = "i950770@mvrht.com";
var testPassword = "uberhacks3.0";

// Create server
http.createServer(function (request, response) {
    response.writeHead(200, {
        'Content-Type': 'text/plain',
        'Access-Control-Allow-Origin' : '*'
    });
    response.end('Hello World\n');
}).listen(1337);

// Get Messenger data
var bullyID = 1120837944702683; //ThreadID for bullying test data
var notbullyID = 1283400935053809; //ThreadID for nonbullying test data
var conversationID = 100009779980369; // ThreadID between Ray and test account
login({email: testEmail, password: testPassword}, function callback (err, api) {
    if (err) return console.error(err);
    
    //api.getThreadList(0, 8, 'inbox', function callback (err, arr) {
    //    console.log(arr);
    //});
    
    function getAllHistory(threadID, n, cb) {        
        api.getThreadHistory(threadID, 1, n, null, function callback(error, history) {
            if (history.length === n) getAllHistory(threadID, n * 10, cb);
            else cb(error, history);
        });
    }
    
    function checkConvo(classifier) {
        getAllHistory(conversationID, 100, function callback (error, history) {
            for (var i = 0; i < history.length; i++) {
                if (history[i].body !== undefined) console.log(history[i].body, classifier.classify(history[i].body));
            }
        });
    }
    
    // Initialize natural language classifier
    classifier = new natural.BayesClassifier();
    
    getAllHistory(bullyID, 100, function callback (error, history) {
        if (error) console.error(error);
        
        for (var i = 0; i < history.length; i++) {
            if (history[i].body !== undefined) {
                if (history[i].body === 'yo' || history[i].body === '^^' || history[i].body === '?' || history[i].body === "It's Ben"
                        || history[i].body === "It's def not Arun" || history[i].body === "Who is lotaly" || history[i].body === "arun") {
                    console.log('Ignored bully text: ', history[i].body);
                }
                else {
                    classifier.addDocument(history[i].body, 'bully');
                }
            }
        }
        
        getAllHistory(notbullyID, 100, function cb (error, hist) {
            if (error) console.error(error);
            
            for (var i = 0; i < hist.length; i++) {
                if (hist[i].body !== undefined) classifier.addDocument(hist[i].body, 'notbully');
            }
            
            classifier.train();
            
            checkConvo(classifier);
        });
    });
});
