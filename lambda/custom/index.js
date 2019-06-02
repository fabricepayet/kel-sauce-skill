const Alexa = require("ask-sdk-core");
var AWS = require("aws-sdk");
const util = require("util");

const docClient = new AWS.DynamoDB.DocumentClient();

function getSaucesForMeal(meal, callback) {
  const params = {
    TableName: "sauce",
    Limit: 3,
    FilterExpression: "contains(#meals, :v)",
    ExpressionAttributeNames: { "#meals": "meals" },
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

function getSauceByName(sauceName, callback) {
  const params = {
    TableName: "sauce",
    Limit: 3,
    FilterExpression: "#name = :v",
    ExpressionAttributeNames: { "#name": "name" },
    ExpressionAttributeValues: { ":v": sauceName }
  };

  docClient.scan(params, function(err, data) {
    console.log("getSauceByName DATA", data);
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
      handlerInput.requestEnvelope.request.intent.name === "Meal" &&
      sessionAttributes.step !== "choiceSauce"
    );
  },
  async handle(handlerInput) {
    const attributesManager = handlerInput.attributesManager;
    const sessionAttributes = attributesManager.getSessionAttributes();

    let speechOutput = "";
    const intent = handlerInput.requestEnvelope.request.intent;
    const mealValue = intent.slots.Repas.value;
    const sauceDocs = await util.promisify(getSaucesForMeal)(mealValue);
    sessionAttributes.step = "choiceSauce";
    if (sauceDocs.length) {
      if (sauceDocs.length > 1) {
        sessionAttributes.saucesNames = sauceDocs.map(sauce => sauce.name);
        attributesManager.setSessionAttributes(sessionAttributes);
        const saucesNames = sauceDocs
          .map(sauce => sauce.name)
          .toString()
          .replace(/,/g, " ou ");

        speechOutput =
          "J'ai trouvé plusieurs sauces pouvant accompagner ce plat : " +
          saucesNames +
          ". Laquelle préférez-vous ?";
      } else {
        const sauceName = sauceDocs[0].name;
        sessionAttributes.sauceName = sauceName;
        attributesManager.setSessionAttributes(sessionAttributes);
        speechOutput =
          "Je vous propose la sauce " +
          sauceName +
          " pour accompagner ce plat. Est-ce-que cela vous convient ?";
      }
    } else {
      speechOutput = "Je ne trouve pas de sauce pour ce plat. A la prochaine.";
      return handlerInput.responseBuilder.speak(speechOutput).getResponse();
    }
    return handlerInput.responseBuilder
      .speak(speechOutput)
      .reprompt(speechOutput)
      .getResponse();
  }
};

function renderSteps() {
  return "";
}

const ChoiceIntentHandler = {
  canHandle(handlerInput) {
    const attributesManager = handlerInput.attributesManager;
    const sessionAttributes = attributesManager.getSessionAttributes();
    console.log(
      "Choice intent handler (canHandle) sessionAttributes",
      sessionAttributes
    );
    return (
      handlerInput.requestEnvelope.request.type === "IntentRequest" &&
      handlerInput.requestEnvelope.request.intent.name === "ChoiceIntent" &&
      sessionAttributes.step === "choiceSauce"
    );
  },
  handle(handlerInput) {
    const attributesManager = handlerInput.attributesManager;
    const sessionAttributes = attributesManager.getSessionAttributes();
    sessionAttributes.step = "choiceMeal";
    attributesManager.setSessionAttributes(sessionAttributes);
    let speechOutput = "";
    const renderIngredientsList = "";
    if (
      true
      // vérifier si la sauce est dans les attributes de session
    ) {
      console.log(
        "ChoiceIntentHandler intent",
        handlerInput.requestEnvelope.request.intent
      );
      const name = "Blanche";
      getSauceByName(name, err => {
        if (err) {
          console.error(err);
          return;
        } else {
          speechOutput =
            "Pour la sauce " +
            handlerInput.requestEnvelope.request.intent.slots.Sauce.value +
            ", il vous faudra " +
            renderIngredientsList +
            "." +
            "Les différentes étapes sont :" +
            renderSteps();
        }
        return handlerInput.responseBuilder
          .speak(speechOutput)
          .reprompt(speechOutput)
          .getResponse();
      });
    }
  }
};

const ConfirmIntentHandler = {
  canHandle(handlerInput) {
    return (
      handlerInput.requestEnvelope.request.type === "IntentRequest" &&
      handlerInput.requestEnvelope.request.intent.name === "AMAZON.YesIntent"
    );
  },
  handle(handlerInput) {
    let speechText = "";

    speechText = "C'est parti pour la sauce";

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
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
    ChoiceIntentHandler,
    ConfirmIntentHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();
