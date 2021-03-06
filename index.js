'use strict';
const
  express = require('express'),
  bodyParser = require('body-parser'),
  app = express().use(bodyParser.json()),// creates express http server
  request = require('request'),
  // nlp=require('node-nlp'),
  // nlpManager = new NlpManager({ languages: ['en'] }),
  // cities = require('all-the-cities'),
  PAGE_ACCESS_TOKEN="EAAl1RPpDf9oBAJHNmtDU1eWEDz6zkISX3SpRey0YhdT7R3btwNFnZABtKSvgdf9fmBKxWyASvGpXvneSZAovv888IzI5ELmUtNmqBYgSZCtQJZALsnup6QvnR79C77JqM2rs4XjXr45qTwjkW6Xes0DesPwaJtYeE4A71asOXPpZAx9BtdPfr";

 //wheather 
let apiKey = 'bdb10f3cb32042a751c327767214a4c0';
let city = 'portland';
// city=cities.filter(city => city.name.match(place))[0]["name"];
// console.log("city "+city);
let url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`;

// request(url, function (err, response, body) {
//   if(err){
//     console.log('error:', error);
//   } else {
//     let weather = JSON.parse(body)
//     let message = `It's ${weather.main.temp} degrees in ${weather.name}!`;
//     console.log(message);
//   }
// });


//end weather
function callSendAPI(sender_psid, response) {
  // Construct the message body
  let request_body = {
    "recipient": {
      "id": sender_psid
    },
    "message": response
  }
   // Send the HTTP request to the Messenger Platform
   request({
    "uri": "https://graph.facebook.com/v2.6/me/messages",
    "qs": { "access_token":PAGE_ACCESS_TOKEN },
    "method": "POST",
    "json": request_body
  }, (err, res, body) => {
    if (!err) {
      console.log('message sent!')
    } else {
      console.error("Unable to send message:" + err);
    }
  }); 
}
 


function handleMessage(sender_psid, received_message) {

  let response;

  // Check if the message contains text
  if (received_message.text) {    

    // Create the payload for a basic text message
    response = {
      "text": `You sent the message: "${received_message.text}". Now send me an image!`
    }
  }  
  
  // Sends the response message
  callSendAPI(sender_psid, response);    
  // var tokenizer = new nlp.WordTokenizer();
// console.log(tokenizer.tokenize(received_message.text));
}





function handlePostback(sender_psid, received_postback) {
  let response;
  
  // Get the payload for the postback
  let payload = received_postback.payload;

  // Set the response based on the postback payload
  if (payload === 'yes') {
    response = { "text": "Thanks!" }
  } else if (payload === 'no') {
    response = { "text": "Oops, try sending another image." }
  }
  // Send the message to acknowledge the postback
  callSendAPI(sender_psid, response);
}
// Imports dependencies and set up http server

// Sets server port and logs message on success
app.listen(process.env.PORT || 1337, () => console.log('webhook is listening'));


  
app.post('/webhook', (req, res) => {  

  // Parse the request body from the POST
  let body = req.body;
console.log("post "+body.object);
  // Check the webhook event is from a Page subscription
  if (body.object === 'page') {

    // Iterate over each entry - there may be multiple if batched
    body.entry.forEach(function(entry) {

      // Get the webhook event. entry.messaging is an array, but 
      // will only ever contain one event, so we get index 0
      let webhook_event = entry.messaging[0];
      console.log(webhook_event);
      let sender_psid = webhook_event.sender.id;
      console.log('Sender PSID: ' + sender_psid);
    
  // Check if the event is a message or postback and
  // pass the event to the appropriate handler function
  if (webhook_event.message) {
    handleMessage(sender_psid, webhook_event.message);        
  }
   else if (webhook_event.postback) {
    handlePostback(sender_psid, webhook_event.postback);
  }
    });
  
    // Return a '200 OK' response to all events
    res.status(200).send('EVENT_RECEIVED');

  } else {
    // Return a '404 Not Found' if event is not from a page subscription
    res.sendStatus(404);
  }

});
  
    


  // Adds support for GET requests to our webhook
app.get('/webhook', (req, res) => {

    // Your verify token. Should be a random string.
    let VERIFY_TOKEN = "EAAl1RPpDf9oBAC2zz4t1VZCg9YjmHhi6i3u98hTmziXplt2P1nn4TxyDua1zeen8yBNSO40E3uymp3q3aG5TSwRUYmBwe4IFih82pneWDpmU6JXcBjHasz69hfc2VZAyg1j1Q0RyAtd0qT8IdnIkKwPIGhMuC2UnN4PAAXREXoylDP9QZBu"
      
    // Parse the query params
    let mode = req.query['hub.mode'];
    let token = req.query['hub.verify_token'];
    let challenge = req.query['hub.challenge'];
      console.log("get "+mode);

    // Checks if a token and mode is in the query string of the request
    if (mode && token) {
    
      // Checks the mode and token sent is correct
      if (mode === 'subscribe' && token === VERIFY_TOKEN) {
        
        // Responds with the challenge token from the request
        console.log('WEBHOOK_VERIFIED');
        res.status(200).send(challenge);
      
      } else {
        // Responds with '403 Forbidden' if verify tokens do not match
        res.sendStatus(403);      
      }
    }
  });
