const Alexa = require("ask-sdk-core");
const helpers = require("./helpers.js");
var AWS = require("aws-sdk");
meals = [];

var docClient = new AWS.DynamoDB.DocumentClient();

async function getSauceFromDatabase(handlerInput) {
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
  const data = await docClient.query(params);
  console.log("JSONData", JSON.stringify(data));
  data.forEach(result => meals.push(...result.Meals));
  return meals;
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
    const { intent } = handlerInput.requestEnvelope.request;
    console.log("----> intent", intent);
    // const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

    const filledSlots = handlerInput.requestEnvelope.request.intent;
    // const slotValues = helpers.getSlotValues(filledSlots);
    let speechOutput = "";

    const meals = await getSauceFromDatabase(handlerInput);

    if (meals.indexOf(meals) === -1) {
      speechOutput += "Je ne trouve pas de sauce pour ce plat";
    } else {
      speechOutput = "J'ai trouvé une sauce pour ce plat";
    }
    return handlerInput.responseBuilder.speak(speechOutput).getResponse();
  }
};

const HelloWorldIntentHandler = {
  canHandle(handlerInput) {
    return (
      handlerInput.requestEnvelope.request.type === "IntentRequest" &&
      handlerInput.requestEnvelope.request.intent.name === "HelloWorldIntent"
    );
  },
  handle(handlerInput) {
    const speechText = "Hello World!";

    return handlerInput.responseBuilder
      .speak(speechText)
      .withSimpleCard("Hello World", speechText)
      .getResponse();
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
    const speechText = "Goodbye!";

    return handlerInput.responseBuilder
      .speak(speechText)
      .withSimpleCard("Hello World", speechText)
      .getResponse();
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
      .speak("Sorry, I can't understand the command. Please say again.")
      .reprompt("Sorry, I can't understand the command. Please say again.")
      .getResponse();
  }
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
