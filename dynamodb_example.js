var AWS = require("aws-sdk"); // first do:  npm install aws-sdk

AWS.config.update({
  region: "us-east-1", // doesn't matter while it's local but I'm running this out of Virginia so will matter when we go live
  endpoint: "http://localhost:8000" // if you have anything running on port 8000, dynamo will crash unless you specify it
});




// RUN THIS CODE EXACTLY ONCE. UNO. UN. 一. BAD THINGS HAPPEN IF IT IS RUN SEVERAL TIMES

var dynamodb = new AWS.DynamoDB();

var params = {
    TableName : "Threads",
    KeySchema: [       
        { AttributeName: "ThreadID", KeyType: "HASH"},  //Partition key - I actually have no fucking clue what HASH means so just go with it
    ],
    AttributeDefinitions: [       
        { AttributeName: "participantIDs", AttributeType: "SS" },
        { AttributeName: "name", AttributeType: "S"},
        { AttributeName: "emoji", AttributeType:"S"},
        { AttributeName: "nicknames", AttributeType:"M"},
        { AttributeName: "color", AttributeType:"S"},
        {AttributeType: "messages",AttributeType: "SS"} // SS might be incorrect. I hope it isn't. 
    ],
    ProvisionedThroughput: {       // I don't know what this means
        ReadCapacityUnits: 5, 
        WriteCapacityUnits: 5
    }
};

dynamodb.createTable(params, function(err, data) {
    if (err) {
        console.error("Unable to create table. Error JSON:", JSON.stringify(err, null, 2));
    } else {
        console.log("Created table. Table description JSON:", JSON.stringify(data, null, 2));
    }
});

// OK now that you've run that *ONCE*, we can get to the cool stuff.



/* MAP EXAMPLE

"info":{
            "plot": "Nothing happens at all.",
            "rating": 0
        }
*/




var docClient = new AWS.DynamoDB.DocumentClient();

var table = "Threads"; // that's the name of the table in AWS


var params = {
    TableName:table,
    Item:{
        "participantIDs": "FILL THIS IN WITH ACTUAL SHIT",
        "name": "SAME AS ABOVE",
        "emoji": "SAME AS ABOVE",
        "nicknames": "SAME AS ABOVE - make sure this is a MAP",
        "color": "SAME AS ABOVE",
        "messages":"THIS IS A SET OF STRINGS IDK HOW THAT WORKS"
           
    }
};

console.log("Adding a new item...");
docClient.put(params, function(err, data) {
    if (err) {
        console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
    } else {
        console.log("Added item:", JSON.stringify(data, null, 2));
    }
});