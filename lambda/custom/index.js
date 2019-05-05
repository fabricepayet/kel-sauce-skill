const Alexa = require("ask-sdk-core");
var AWS = require("aws-sdk");
const util = require("util");

const docClient = new AWS.DynamoDB.DocumentClient();

function getSaucesForMeal(meal, callback) {
  const params = {
    TableName: "sauce",
    Limit: 3,
    FilterExpression: "contains(#Meals, :v)",
    ExpressionAttributeNames: { "#Meals": "Meals" },
    ExpressionAttributeValues: { ":v": meal }
  };

  docClient.scan(params, function(err, data) {
    if (err) {
      callback(err);
    } else {
      callback(null, data.Items);
    }
  });
}

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === "LaunchRequest";
  },
  handle(handlerInput) {
    const speechText = "Pour quel repas cherchez vous une sauce ?";

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
      handlerInput.requestEnvelope.request.intent.name === "Meal"
    );
  },
  async handle(handlerInput) {
    let speechOutput = "";
    const intent = handlerInput.requestEnvelope.request.intent;
    const mealValue = intent.slots.Repas.value;
    const sauceDocs = await util.promisify(getSaucesForMeal)(mealValue);
    if (sauceDocs.length) {
      if (sauceDocs.length > 1) {
        const saucesNames = sauceDocs
          .map(sauce => sauce.NameSauce)
          .toString()
          .replace(",", " ou ");

        speechOutput =
          "J'ai trouvé plusieurs sauces pouvant accompagner ce plat : " +
          saucesNames +
          ". Laquelle préférez-vous ?";
      } else {
        const sauceName = sauceDocs[0].NameSauce;
        speechOutput =
          "Je vous propose la sauce " + sauceName + " pour accompagner ce plat";
      }
    } else {
      speechOutput += "Je ne trouve pas de sauce pour ce plat. A la prochaine.";
      return handlerInput.responseBuilder.speak(speechOutput).getResponse();
    }
    return handlerInput.responseBuilder
      .speak(speechOutput)
      .reprompt(speechOutput)
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
    const speechText = "Je peux vous aider";

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
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
      .speak("Une erreur s'est produite, veillez vérifier les journaux")
      .reprompt("Une erreur s'est produite, veillez vérifier les journaux")
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
