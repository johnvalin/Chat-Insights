var http = require('http');
var login = require("facebook-chat-api");
var natural = require('natural');
var start = 1;
var end = 50;
var timestamp = null;

var AWS = require("aws-sdk");


AWS.config.update({
    region: "us-east-1", // doesn't matter while it's local but I'm running this out of Virginia so will matter when we go live
    endpoint: "https://dynamodb.us-east-1.amazonaws.com"
// Access keys are enviro variables
}); 



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

// Gets the thread history
login({email: "i1029456@mvrht.com", password: "uberhacks3.0"}, function callback (err, api) {
    var docClient = new AWS.DynamoDB.DocumentClient();    
    if(err) return console.error(err);
	
      function getAllHistory(threadID, n, cb) {        
         api.getThreadHistory(threadID, 1, n, null, function callback(error, history) {
             if (history.length === n) getAllHistory(threadID, n * 10, cb);
              else cb(error, history);
          });
      }

	function checkConvo(classifier, conversationID) {
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
	                    // UPDATE DATABASE HERE
	                }
	            });
	        });
	    });
    }

	function processThread(threadList, j) {
		//gets all the history for each thread
		getAllHistory(threadList[j].threadID, 10, function callback (error, history) {
		    if (error) console.error(error);
		    //console.log(history);
			var result = [];
			var name = history[0].senderName;
			var time = history[0].timestamp;
			for (var message in history) {
				console.log(history[message]);
				if (history[message].body === undefined || history[message].body == "") {
				    continue;
				}
				else if (history[message].senderName != name) {
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
		    console.log(result);
		    var params = {
		        TableName: table,
		        Item: {
		            "ThreadID": threadList[j].threadID, // string
		            "participantIDs": threadList[j].participantIDs, // set of strings
		            "name": threadList[j].name, // string
		            "lastInfo": {'name' : name, 'time' : time}, // map of last user and last message
		            "messages": result // set of jsons with messages
		        }
		    };

		    console.log("Adding a new item...");
		    console.log(params);
		    console.log(params.messages);
		    docClient.put(params, function(err, data) {
		        if (err) {
		            console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
		        } else {
		            console.log("Added item:", JSON.stringify(data, null, 2));
			    console.log(data);
		        }
		    });
		//console.log(result);
		//put the results (items) in the table one by one
		});

        // NATURAL LANGUAGE PROCESSING
		getAllHistory(bullyID, 100, function callback(error, history) {
            if (error) console.error(error);

	    // Initialize natural language classifier
	    classifier = new natural.BayesClassifier();
            
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
                
                checkConvo(classifier, threadList[j].threadID);
        
                // Listener
                //api.listen(function callback(error, message) {
                //    api.getUserInfo(message.senderID, function cb(err, obj) {
                //        var senderName = obj[message.senderID].name;
                //        if (message.body !== undefined) {
                //            // READ DATABASE HERE
                //            // UPDATE DATABASE HERE: add 1 to total count in database for this name
                //            if (classifier.classify(message.body) === 'bully') {
                //            
                //            } // UPDATE DATABASE HERE
                //        }
                //   }
                //});
            });
        });
		
		if (j < threadList.length-1) {
		    processThread(threadList, j+1);
		}
    }
    
    api.getThreadList(start, end, 'inbox', function callback (error, threadList) {
    	processThread(threadList, 0);
    });
});
