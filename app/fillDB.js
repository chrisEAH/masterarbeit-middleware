var mqtt = require('mqtt');

var MongoClient = require('mongodb').MongoClient;


var config={
    mqttHost:"mqtt://localhost",
    mongoDB:"monitoring",
    collection:"messwert",
    mongoHost:"127.0.0.1",
    mongoPort:"27017"
};

if(process.env.mqttHost!=undefined){config.mqttHost=process.env.mqttHost};
if(process.env.mongoDB!=undefined){config.mongoDB=process.env.mongoDB};
if(process.env.collection!=undefined){config.collection=process.env.collection;}
if(process.env.mongoHost!=undefined){config.mongoHost=process.env.mongoHost};
if(process.env.mongoPort!=undefined){config.mongoPort=process.env.mongoPort;}




setTimeout(connectMongo,2000);


function connectMongo()
{
    
    MongoClient.connect("mongodb://"+config.mongoHost+":"+config.mongoPort,  {
         useNewUrlParser: true,
         reconnectTries:10,
         reconnectInterval:1000 },
         function(err, db){  
            if(err){
                    console.log( err);                
                }  
            else{
                    console.log("connect to monogo");
                    dbObject=db.db(config.mongoDB); 
                    connectToMqtt(dbObject);
                }  
        });  
}

function connectToMqtt(db)
{
    var clientMqtt  = mqtt.connect(config.mqttHost);
    clientMqtt.on('connect', function () {
        clientMqtt.subscribe('#', function (err) {
          if (!err) {
              console.log("connected to mqtt server")
          }
        })
    });
    
    clientMqtt.on('message', function (topic, message) {
        console.log(message.toString());
        insertMessageInDB(db,topic, JSON.parse(message));
    });
}

function insertMessageInDB(dbObject,topic,mqttMessageObject)
{  
    dbObject.collection(config.collection).insertOne(mqttMessageObject, function(err, res) {
		if (err) throw err;
	});
}

