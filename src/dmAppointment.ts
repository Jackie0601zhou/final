
import { MachineConfig, send, Action, assign } from "xstate";
import { createMachine } from 'xstate';

function say(text: string): Action<SDSContext, SDSEvent> {
  return send((_context: SDSContext) => ({ type: "SPEAK", value: text}));
}


interface Grammar {
  [index: string]: {
    intent: string;
    entities: {
      [index: string]: string;
    };
  };
}


const getEntity = (context: SDSContext, category: string) => {
  const result = [];
  if (context.nluResult && typeof context.nluResult === 'object') {
    const entities = context.nluResult.prediction.entities;
    for (let i = 0; i < entities.length; i++) {
      if (entities[i].category === category) {
        result.push(entities[i].text);
        return result
      }
    }
  } else {
    // Handle case where context.nluResult is not properly set
  }
  return false;
};


const getIntent = (context: SDSContext) => {
  if (context.nluResult && typeof context.nluResult === 'object') {
    let u = context.nluResult.prediction.topIntent.toLowerCase().replace(/\.$/g, "");
    return u;
  } else {
    // Handle case where context.nluResult is not properly set
    return "";
  }
};


export const dmMachine: MachineConfig<SDSContext, any, SDSEvent> = {
  initial: "idle",
  states: {
    idle: {
      on: {
        CLICK: "init",
      },
    },
    init: {
      on: {
        TTS_READY: "usersname", 
        CLICK: "usersname", 
      },
    },
    usersname: {
      initial: "prompt",
      on: {
        RECOGNISED: [
          {
            target: "welcome",
            actions: assign({
              username: (context) => context.recResult[0].utterance.replace(/\.$/g, "")
            }),
          },
          {
            target: ".notmatch",
          },
        ],
        TIMEOUT: ".prompt",
      },
      states: {
        prompt: {
          entry: say("Hello! Can you tell me your name or how you'd like me to address you?"),
          on: { ENDSPEECH: "ask" },
        },
        ask: {
          entry: send("LISTEN"),
        },
        notmatch: {
          entry: say("Sorry, could you repeat again?"),
          on: { ENDSPEECH: "ask" },
        }
      },
    },
    
    welcome: { 
      initial: "prompt",
        on: {
          RECOGNISED: [
            {target: "Meeting",
              cond: (context) => getIntent(context) === "create a meeting",
              actions: assign({
                meetinganswer: (context) => {return context.nluResult.query} 
              }),
            },
            {target: ".getInfo",
              cond: (context) => !!getEntity(context, "peoplename"),   
              actions: assign({answerperson:  
                (context) => {return context.nluResult.prediction.entities[0].text.replace("é","e").replace(/\.$/g, "")}
              }),          
              },
            {
              target: ".notmatch",
            },
          ],
          TIMEOUT: ".prompt",
        },
        states: {
          getInfo: {
            invoke: {
              id: 'getInfo',
              src: (context, event) => kbRequest(context.whois),
              onDone: [{
                target: 'success',
                cond: (context, event) => event.data.Abstract !== "",
                actions: assign({ info: (context, event) => event.data })
              },
              {
                target: 'fail',
              },
            ],
              onError: {
                target: 'fail',
              }
            }
          },
          success: {
            entry: send((context) => ({
              type: "SPEAK",
              value: `This is what I found on the web about ${context.whois}. ${context.info.Abstract}`
            })),
            on: {ENDSPEECH: "#meetX"}
          },
          fail: {
            entry: send((context) => ({
              type: "SPEAK",
              value: `Sorry, I cannot find anything about ${context.whois}.`
            })),
            on: {ENDSPEECH: "prompt"}
          },
          prompt: {
            entry: send((context) => ({
              type: "SPEAK",
              value: `Hi ${context.username}! Would you like to create a meeting or ask a question?`,
            })),
            on: { ENDSPEECH: "ask" },
          },
          ask: {
            entry: send("LISTEN"),
          },
          notmatch: {
            entry: say(
              "Sorry, I don't understand. Would you like to create a meeting or ask a question?"
            ),
            on: { ENDSPEECH: "ask" },
          },
        },
      },
    Meeting: {
      entry: say("Ok!"),
      on: { ENDSPEECH: "createmeeting" },
      },
    meetX: {
      id:"meetX",
      initial: "prompt",
      on: {
        RECOGNISED: [
          {
            target: "acceptmeeting",
            cond: (context) => getIntent(context) === "confirm",
            actions: assign({
              confirm: (context) => context.nluResult.query,
            }), 
          },
          {
            target: "refusemeeting",
            cond: (context) => getIntent(context) === "reject",
            actions: assign({
              reject: (context) => context.nluResult.query,
            }), 
          },
          {
            target: ".notmatch",
          },
        ],
        TIMEOUT: ".prompt",
      },
      states: {
        prompt: {
          entry: say("Do you want to meet them?"),
          on: { ENDSPEECH: "ask" },
        },
        ask: {
          entry: send("LISTEN"),
        },
        notmatch: {
          entry: say(
            "Sorry, could you please repeat aganin?"
          ),
          on: {ENDSPEECH: "prompt"},
        },
      },
    },
    refusemeeting: {
      entry: say("OK!"),
      on: { ENDSPEECH: "init" },
    },
    acceptmeeting: {
      entry: [
        say("OK! Let's schedule a meeting!"),
        assign((context) => ({title: `meeting with ${context.whois.replace(/\.$/g, "")}`}))
      ],
      on: { ENDSPEECH: "askDate" },
      },
    createmeeting: {
      initial: "prompt",
      on: {
        RECOGNISED: [
          {
            target: "info",
            cond: (context ) => !!getEntity(context, "create a meeting") ,
            actions: assign({
              title: (context) => context.nluResult.prediction.entities[0].text.replace(/\.$/g, ""),
            }),
          },
          {
            target: ".notmatch",
          },
        ],
        TIMEOUT: ".prompt",
      },
      states: {
        prompt: {
          entry: say("Let's create a meeting. What is it about?"),
          on: { ENDSPEECH: "ask" },
        },
        ask: {
          entry: send("LISTEN"),
        },
        notmatch: {
          entry: say(
            "Sorry, I don't know what it is. Please tell me what is the meeting about?"
          ),
          on: { ENDSPEECH: "ask" },
        },
      },
    },
    info: {
      entry: send((context) => ({
        type: "SPEAK",
        value: `OK, ${context.title}`,
      })),
      on: { ENDSPEECH: "askDate" },
      },
    askDate: {
      initial: "prompt",
      on: {
        RECOGNISED: [
          {
            target: "day",
            cond: (context) => !!getEntity(context, "date"),
            actions: assign({
              date: (context) => context.nluResult.prediction.entities[0].text.replace(/\.$/g, ""),
            }), 
          },
          {
            target: ".notmatch",
          },
        ],
        TIMEOUT: ".prompt",
      },
      states: {
        prompt: {
          entry: say("On which day is the meeting?"),
          on: { ENDSPEECH: "ask" },
        },
        ask: {
          entry: send("LISTEN"),
        },
        notmatch: {
          entry: say(
            "Sorry, I don't understand! Could you please repeat again?"
          ),
          on: { ENDSPEECH: "ask" },
        },
      },
    },
    day: {
      entry: send((context) => ({
        type: "SPEAK",
        value: `OK, the meeting has been scheduled on ${context.date}`,
      })),
      on: { ENDSPEECH: "isWholeDay" },
    },
    isWholeDay: {
      initial: "prompt",
      on: {
        RECOGNISED: [
          {
            target: "negative",
            cond: (context) => getIntent(context) === "reject",
            actions: assign({
              reject: (context) => context.nluResult.query,
            }), 
          },
          {
            target: "positive",
            cond: (context) => getIntent(context) === "confirm",
            actions: assign({
              confirm: (context) => context.nluResult.query,
            }), 
          },
          {
            target: ".notmatch",
          },
        ],
        TIMEOUT: ".prompt",
      },
      states: {
        prompt: {
          entry: say("Will it take the whole day?"),
          on: { ENDSPEECH: "ask" },
        },
        ask: {
          entry: send("LISTEN"),
        },
        notmatch: {
          entry: say(
            "Sorry, I don't understand. Will it take the whole day?"
          ),
          on: { ENDSPEECH: "ask" },
        },
      },
    },
    negative: {
      entry: say("The meeting will not last for the whole day."),
      on: { ENDSPEECH: "Time" },
    },
    positive: {
      entry: say("The meeting will last for the whole day."),
      on: { ENDSPEECH: "meetingcreated" },
    },
    Time: {
      initial: "prompt",
      on: {
        RECOGNISED: [
          {
            target: "time",
            cond: (context) => !!getEntity(context,"time"),
            actions: assign({
              time: (context) => context.nluResult.prediction.entities[0].text.replace(/\.$/g, ""),
            }), 
          },
          {
            target: ".notmatch",
          },
        ],
        TIMEOUT: ".prompt",
      },
      states: {
        prompt: {
          entry: say("What time is it?"),
          on: { ENDSPEECH: "ask" },
        },
        ask: {
          entry: send("LISTEN"),
        },
        notmatch: {
          entry: say(
            "Sorry, I don't understand. What time is your meeting?"
          ),
          on: { ENDSPEECH: "ask" },
        },
      },
    },
    time: {
      entry: send((context) => ({
        type: "SPEAK",
        value: `OK, time of the meeting is ${context.time}`,
      })),
      on: { ENDSPEECH: "meetConfirm" },
    },
    meetConfirm: {
      initial: "prompt",
      on: {
        RECOGNISED: [
          {
            target: "meetingcreated",
            cond: (context) => getIntent(context) === "confirm",
            actions: assign({
              confirm: (context) => context.nluResult.query,
            }), 
          },
          {
            target: "meetingrescheduled",
            cond: (context) => getIntent(context) === "reject",
            actions: assign({
              reject: (context) => context.nluResult.query,
          }),  
          },
          {
            target: ".notmatch",
          },
        ],
        TIMEOUT: ".prompt",
      },
      states: {
        prompt: {
          entry: send((context) => ({
            type: "SPEAK",
            value: `Do you want me to create a meeting titled ${context.title}, on ${context.date} at ${context.time}?`,
          })),
          on: { ENDSPEECH: "ask" },
        },
        ask: {
          entry: send("LISTEN"),
        },
        notmatch: {
          entry: say(
            "Sorry, I don't understand. Could you repeat again?"
          ),
          on: { ENDSPEECH: "ask" },
        },
      },
    },
    meetingcreated: {
      entry: say('OK! Your meeting has been created successfully'),
      on: { ENDSPEECH: "init" },
    },
    meetingrescheduled: {
      entry: say("ok!, starting over!"),
      on: { ENDSPEECH: "welcome" },
    },
  },
};


const kbRequest = (text: string) =>
  fetch(
    new Request(
      `https://cors.eu.org/https://api.duckduckgo.com/?q=${text}&format=json&skip_disambig=1`
    )
  ).then((data) => data.json());
            
            
            
            
      
