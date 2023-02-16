
import { MachineConfig, send, Action, assign } from "xstate";

import { SDSContext } from '/Users/jackie/Desktop/dialogue-systems-1-2023/src/react-app-env';
import { SDSEvent } from '/Users/jackie/Desktop/dialogue-systems-1-2023/src/react-app-env';

function say(text: (context: SDSContext) => string): Action<SDSContext, SDSEvent> {
  return send((context: SDSContext) => ({ type: "SPEAK", value: text(context) }));
}


interface Grammar {
  [index: string]: {
    intent: string;
    entities: {
      [index: string]: string;
    };
  };
}

const grammar: Grammar = {
  "create a meeting": {
    intent: "createMeeting",
    entities: {},
  },
  "who is :name": {
    intent: "getPersonInfo",
    entities: {
      "name": "",
    },
  },
  "whole day": {
    intent: "wholeDay",
    entities: {},
  },
  "yes": {
    intent: "affirm",
    entities: {},
  },
  "no": {
    intent: "reject",
    entities: {},
  },
  "of course": {
    intent: "affirm",
    entities: {},
  },
  "no way": {
    intent: "reject",
    entities: {},
  },
  "Lecture": {
    intent: "title",
    entities: {
      "title": "Lecture"
    },
  },
  "Weekly Meeting": {
    intent: "title",
    entities: {
      "title": "Weekly Meeting"
    },
  },
  "10:00 AM": {
    intent: "time",
    entities: {
      "time": "10:00 AM"
    },
  },
  "3:30 PM": {
    intent: "time",
    entities: {
      "time": "3:30 PM"
    },
  },
  "one hour later": {
    intent: "time",
    entities: {
      "time": "one hour later"
    },
  },
  "March 1, 2022": {
    intent: "date",
    entities: {
      "date": "March 1, 2022"
    },
  },
  "on Friday": {
    intent: "date",
    entities: {
      "date": "on Friday"
    },
  },
};

const getPersonInfo = (context: SDSContext) => {
  const name = context.recResult[0].matches.name;
  if (name === "Jack" || name === "Samantha") {
    return `${name} is the lead developer on this project. Do you want to meet them?`;
  } else if (name === "Emma" || name === "David") {
    return `${name} is one of our marketing specialists. Do you want to meet them?`;
  } else {
    return `I'm sorry, I don't know who ${name} is. Is there someone else you'd like to know about?`;
  }
};


const getIntent = (context: SDSContext) => {
  // lowercase the utterance and remove tailing "."
  let u = context.recResult[0].utterance.toLowerCase().replace(/.$/g, "");
  if (u in grammar) {
    return grammar[u].intent;
  }
  return false;
};

const events = {
  INIT: "INIT"
};

const getPersonInfo = (context: SDSContext) => {
  const name = context.recResult[0].matches.name;

  // Use the fetch function to get information about the person from the DuckDuckGo Instant Answer API
  fetch(`https://api.duckduckgo.com/?q=${name}&format=json&pretty=1`)
    .then(response => response.json())
    .then(data => {
      if (data.Abstract) {
        // If the API returns an Abstract, use it as the person's description
        return say(() => `${name} is ${data.Abstract}`)(context);
      } else {
        // Otherwise, use a default message
        return say(() => `I'm sorry, I don't have any information about ${name}.`)(context);
      }
    })
    .catch(error => {
      console.log("Error getting person info", error);
      return say(() => "I'm sorry, there was an error getting information about that person.")(context);
    });
};




export const dmMachine: MachineConfig<SDSContext, any, SDSEvent> = {
  initial: "promptAction",
  states: {
    promptAction: {
      entry: [
        (context, event) => {
          // Check if speech synthesis is supported
          if ('speechSynthesis' in window) {
            // Get list of available voices
            let voices = window.speechSynthesis.getVoices();
            if (voices.length > 0) {
              // If there are voices, speak the text
              return say(() => `Hi ${context.username}! What would you like to do? Create a meeting or ask about someone?`)(context, event);
            } else {
              console.log("No voices available");
            }
          } else {
            console.log("Speech synthesis not supported");
          }
        },
        () => console.log("Hi {username}! What would you like to do? Create a meeting or ask about someone?"), // add console.log here
      ],
      on: { ENDSPEECH: "idle" },
    },

    idle: {
      on: {
        RECOGNISED: [
          {
            target: "createMeeting",
            cond: (context) => context.recResult[0].intent.name === "createMeeting",
            actions: [say(() => "Let's create a meeting."), () => console.log("Let's create a meeting")],
          },
          {
            target: "getPersonInfo",
            cond: (context) => context.recResult[0].intent.name === "getPersonInfo",
            actions: [say(() => getPersonInfo(context)), () => console.log(`Asked about ${context.recResult[0].matches.name}`)],
          },
        ],
      },
    },

    createMeeting: {
      on: {
        ENDSPEECH: "askTitle",
      },
    },

    askTitle: {
      entry: [say(() => "What is it about?"), () => console.log("What is it about?")],
      on: { ENDSPEECH: "askDate" },
    },

    askDate: {
      entry: [say(() => "On which day is it?")],
      on: { ENDSPEECH: "askWholeDay" },
    },

    askWholeDay: {
      entry: [say(() => "Will it take the whole day?")],
      on: {
        IS_WHOLE_DAY: [
          {
            target: "confirm",
            cond: (context) => getIntent(context) === "wholeDay",
            actions: assign({
              isWholeDay: true,
            }),
          },
          {
            target: "askTime",
            cond: (context) => getIntent(context) !== "wholeDay",
            actions: assign({
              isWholeDay: false,
            }),
          },
        ],
      },
    },

    askTime: {
      entry: [say(() => "What time is your meeting?")],
      on: { ENDSPEECH: "confirm" },
    },

    confirm: {
      entry: say(
        (context) =>
          `Do you want me to create a meeting titled ${context.title} on ${context.date} ${
            context.isWholeDay
              ? "for the whole day"
              : `at ${context.time}`
          }?`
      ),
      on: { ENDSPEECH: "askConfirm" },
    },

    askConfirm: {
      entry: send("LISTEN"),
      on: {
        RECOGNISED: [
          {
            target: "idle",
            cond: (context) => getIntent(context) === "no",
            actions: [
              say(() => "Okay, let's start again."),
              () => console.log("User said 'no', starting over.")
            ],
          },
          {
            target: "createMeetingConfirmed", // new final state
            cond: (context) => getIntent(context) === "yes",
            actions: [
              say((context) => `Your meeting titled "${context.title}" has been created on ${context.date} ${
                context.isWholeDay
                  ? "for the whole day"
                  : `at ${context.time}`
                }`
              ),
              () => console.log("User said 'yes', meeting created.")
            ],
          },
          {
            target: "askConfirm",
            cond: (context) => !getIntent(context),
            actions: [
              say(() => "I'm sorry, I didn't understand. Please say 'yes' or 'no'."),
              () => console.log("User did not say 'yes' or 'no', asking again.")
            ],
          },
        ],
      },
    },
    

    createMeetingConfirmed: {
      type: "final",
    },

    getPersonInfo: {
      entry: [
        (context, event) => {
          let name = context.recResult[0].matches.name;
          if (name in people) {
            return say(() => `${name} is ${people[name]}. Do you want to meet them?`)(context, event);
          } else {
            return say(() => `${name} is not in my records. Would you like to provide more information about them?`)(context, event);
          }
        },
        (context) => console.log(`Asked about ${context.recResult[0].matches.name}`),
      ],
      on: {
        RECOGNISED: [
          {
            target: "meetPerson",
            cond: (context) => getIntent(context) === "yes",
            actions: [
              assign({
                title: (context) => `Meeting with ${context.recResult[0].matches.name}`,
              }),
              () => console.log(`User said 'yes', meeting with ${context.recResult[0].matches.name}.`),
            ],
          },
          {
            target: "askPersonInfo",
            cond: (context) => getIntent(context) === "no",
            actions: [
              assign({
                name: (context) => context.recResult[0].matches.name,
              }),
              say(() => "What would you like to know about them?"),
              () => console.log("User said 'no', asking about person information."),
            ],
          },
          {
            target: "getPersonInfo",
            cond: (context) => !getIntent(context),
            actions: [say(() => "I'm sorry, I didn't understand. Can you please answer with 'yes' or 'no'?"), () => console.log("User did not say 'yes' or 'no', asking again.")],
          },
        ],
      },
    },
    askPersonInfo: {
      entry: send("LISTEN"),
      on: {
        RECOGNISED: [
          {
            target: "idle",
            actions: [
              (context, event) => {
                let name = context.name;
                let info = context.recResult[0].utterance;
                people[name] = info;
                console.log(`Added ${info} to ${name}'s records.`);
              },
              say(() => `Thanks for letting me know. Is there anything else I can help you with?`),
            ],
          },
        ],
      },
    },

    meetPerson: {
      entry: [
        (context) => {
          let name = context.recResult[0].matches.name;
          let title = context.title;
          return say(() => `Great! ${title} has been scheduled with ${name}. On which day would you like to schedule the meeting?`)(context);
        },
        (context) => console.log(`Scheduled a meeting with ${context.recResult[0].matches.name}`),
      ],
      on: {
        ENDSPEECH: "askDate",
      },
    },
  },
};

























