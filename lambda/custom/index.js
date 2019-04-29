/* eslint-disable  func-names */
/* eslint-disable  no-console */

const Alexa = require('ask-sdk-core');
const helpers = require('./helpers.js');
var AWS = require("aws-sdk");
meals = [];

//const ddbAdapter = require('ask-sdk-dynamodb-persistence-adapter');





var docClient = new AWS.DynamoDB.DocumentClient();

console.log("Querying for movies from 1985.");

var params = {
    TableName : "sauce",
    IndexName : 'id-NameSauce-index',
    Limit: 100,
    KeyConditionExpression: 'id = :id',
    ExpressionAttributeValues: {
    ':id': 1
  }
    
    };

function getSauce(handlerInput) {
  const sessionAttributes = {}; 
  let meals = []; 

docClient.query(params, function(err, data) {
 meals = []; 
    if (err) {
        console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
    } else {
        
        console.log("Query succeeded.");
        data.Items.forEach(function(item) {
          meals = [];
        console.log(item.meals);
       
                           });
                           
      
                                        
                                        
      
               }
             
              Object.assign(sessionAttributes, {
                meals: meals
                                              });

            });
            handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
         }


function sauce(handlerInput){
  const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
  
  const filledSlots = handlerInput.requestEnvelope.request.intent;
  const slotValues = helpers.getSlotValues(filledSlots);
  let speechOutput = "";
  
  getSauce(handlerInput);
  
  if (handlerInput.requestEnvelope.request.intent.sauce === `${sessionAttributes.meals}`) {
    
    speechOutput = 'Super';
  }
  else {
    speechOutput = "Mole";
    
    console.log(sessionAttributes.meals);
  }
    return handlerInput.responseBuilder
    .speak(speechOutput)
    .getResponse();
  }
  




const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
  },
  handle(handlerInput) {
    const speechText = 'Demandez moi avec quelle sauce vous pourriez accompagner un repas';

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .getResponse();
  },
};

 const SauceIntentHandler = {
  canHandle(handlerInput) {
    
   
    
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
    && handlerInput.requestEnvelope.request.intent.name === 'sauce';
  },
   handle(handlerInput) {
    
     
    
     return sauce(handlerInput);
  },
}; 

const HelloWorldIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'HelloWorldIntent';
  },
  handle(handlerInput) {
    const speechText = 'Hello World!';

    return handlerInput.responseBuilder
      .speak(speechText)
      .withSimpleCard('Hello World', speechText)
      .getResponse();
  },
};

const HelpIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    const speechText = 'You can say hello to me!';

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard('Hello World', speechText)
      .getResponse();
  },
};

const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
        || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    const speechText = 'Goodbye!';

    return handlerInput.responseBuilder
      .speak(speechText)
      .withSimpleCard('Hello World', speechText)
      .getResponse();
  },
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);

    return handlerInput.responseBuilder.getResponse();
  },
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);

    return handlerInput.responseBuilder
      .speak('Sorry, I can\'t understand the command. Please say again.')
      .reprompt('Sorry, I can\'t understand the command. Please say again.')
      .getResponse();
  },
};

const skillBuilder = Alexa.SkillBuilders.custom();

exports.handler = skillBuilder
  .addRequestHandlers(
    LaunchRequestHandler,
    SauceIntentHandler,
    HelloWorldIntentHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();
