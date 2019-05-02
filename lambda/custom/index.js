const Alexa = require("ask-sdk-core");
const helpers = require("./helpers.js");
var AWS = require("aws-sdk");
const util = require("util");

const docClient = new AWS.DynamoDB.DocumentClient();

function getSauceFromDatabase(callback) {
  const meals = [];
  const params = {
    TableName: "sauce",
    IndexName: "id-NameSauce-index",
    Limit: 100,
    KeyConditionExpression: "id = :id",
    ExpressionAttributeValues: {
      ":id": 1
    }
  };

  docClient.query(params, function(err, data) {
    if (err) {
      callback(err);
    } else {
      data.Items.forEach(result => meals.push(...result.Meals));
      callback(null, meals);
    }
  });
}

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === "LaunchRequest";
  },
  handle(handlerInput) {
    const speechText =
      "Demandez moi avec quelle sauce vous pourriez accompagner un repas";

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .getResponse();
  }
};

const SauceIntentHandler = {
  canHandle(handlerInput) {
    return (
      handlerInput.requestEnvelope.request.type === "IntentRequest" &&
      handlerInput.requestEnvelope.request.intent.name === "sauce"
    );
  },
  async handle(handlerInput) {
    let speechOutput = "";
    const meals = await util.promisify(getSauceFromDatabase)();
    if (meals.indexOf("agneau") === -1) {
      speechOutput += "Je ne trouve pas de sauce pour ce plat";
    } else {
      speechOutput = "J'ai trouvé une sauce pour ce plat";
    }
    return handlerInput.responseBuilder.speak(speechOutput).getResponse();
  }
};

const HelpIntentHandler = {
  canHandle(handlerInput) {
    return (
      handlerInput.requestEnvelope.request.type === "IntentRequest" &&
      handlerInput.requestEnvelope.request.intent.name === "AMAZON.HelpIntent"
    );
  },
  handle(handlerInput) {
    const speechText = "You can say hello to me!";

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard("Hello World", speechText)
      .getResponse();
  }
};

const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return (
      handlerInput.requestEnvelope.request.type === "IntentRequest" &&
      (handlerInput.requestEnvelope.request.intent.name ===
        "AMAZON.CancelIntent" ||
        handlerInput.requestEnvelope.request.intent.name ===
          "AMAZON.StopIntent")
    );
  },
  handle(handlerInput) {
    const speechText = "Au revoir!";

    return handlerInput.responseBuilder.speak(speechText).getResponse();
  }
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === "SessionEndedRequest";
  },
  handle(handlerInput) {
    console.log(
      `Session ended with reason: ${
        handlerInput.requestEnvelope.request.reason
      }`
    );

    return handlerInput.responseBuilder.getResponse();
  }
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);

    return handlerInput.responseBuilder
      .speak("Désolé je n'arrive pas à comprendre la commande.")
      .reprompt("Désolé je n'arrive pas à comprendre la commande.")
      .getResponse();
  }
};

const skillBuilder = Alexa.SkillBuilders.custom();

exports.handler = skillBuilder
  .addRequestHandlers(
    LaunchRequestHandler,
    SauceIntentHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();
