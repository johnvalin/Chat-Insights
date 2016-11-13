var http = require('http');
var login = require("facebook-chat-api");
var natural = require('natural');

var testEmail = "i1029456@mvrht.com";
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
var bullyID = 1120837944702683; //ThreadID for bullying training data
var notbullyID = 1283400935053809; //ThreadID for nonbullying training data
var conversationID = 100009779980369; // ThreadID for conversation to analyze
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
        getAllHistory(conversationID, 100, function callback(error, history) {
            api.getThreadInfo(conversationID, function cb(err, info) {
                api.getUserInfo(info.participantIDs, function c(e, obj) {
                    var bullyCounts = {};
                    var totalCounts = {};
                    
                    for (var userID in obj) {
                        bullyCounts[obj[userID].name] = 0;
                        totalCounts[obj[userID].name] = 0;
                    }
                    
                    for (var i = 0; i < history.length; i++) {
                        if (history[i].body !== undefined) {
                            var classification = classifier.classify(history[i].body);
                            if (classification === 'bully') {
                                bullyCounts[history[i].senderName]++;
                            }
                            totalCounts[history[i].senderName]++;
                            console.log(history[i].senderName, ': ', history[i].body, ' - ', classification);
                        }
                    }
                    
                    for (var name in totalCounts) {
                        console.log(name, ': ', bullyCounts[name], ' / ', totalCounts[name]);
                    }
                });
            });
        });
    }
    
    // Initialize natural language classifier
    classifier = new natural.BayesClassifier();
    
    getAllHistory(bullyID, 100, function callback(error, history) {
        if (error) console.error(error);
        
        for (var i = 0; i < history.length; i++) {
            if (history[i].body !== undefined) {
                // Non-bullying messages mistakenly entered in the bully data training set
                if (history[i].body === 'yo' || history[i].body === '^^' || history[i].body === '?' || history[i].body === "It's Ben"
                        || history[i].body === "It's def not Arun" || history[i].body === "Who is lotaly" || history[i].body === "arun") {
                    console.log('Ignored (in bully data training set): ', history[i].body);
                }
                else {
                    classifier.addDocument(history[i].body, 'bully');
                }
            }
        }
        
        getAllHistory(notbullyID, 100, function cb(error, hist) {
            if (error) console.error(error);
            
            for (var i = 0; i < hist.length; i++) {
                if (hist[i].body !== undefined) classifier.addDocument(hist[i].body, 'not bully');
            }
            
            classifier.train();
            
            checkConvo(classifier);
    
            // Listener
            api.listen(function callback(error, message) {
                console.log(message.senderID);
                // add 1 to total in database under senderName
            });
        });
    });
});
