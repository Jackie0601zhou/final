
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

/*
const grammar: Grammar = {
  lecture: {
    intent: "None",
    entities: { title: "Dialogue systems lecture" },
  },
  lunch: {
    intent: "None",
    entities: { title: "Lunch at the canteen" },
  },
  dinner: {
    intent: "None",
    entities: { title: "Dinner at the home" },
  },
  coffee: {
    intent: "None",
    entities: { title: "Take a coffee" }
  },
  breakfast: {
    intent: "None",
    entities: { title: "Take breakfast" }
  },
  supermarket: {
    intent: "None",
    entities: { title: "Go to supermarket" }
  },
  friends: {
    intent: "None",
    entities: { title: "Meet friends" }
  },
  cats: {
    intent: "None",
    entities: { title: "feed cats" }
  },
  exam: {
    intent: "None",
    entities: { title: "exam"},
  },
  trip: {
    intent: "None",
    entities: { title: "trip"},
  },
  "Weekly Meeting": {
    intent: "Nne",
    entities: {title: "Weekly Meeting"},
  },
  yes: {
    intent: "None",
    entities: {confirm:"yes"},
  },
  sure: {
    intent: "None",
    entities: {confirm:"sure"},
  },
  ok: {
    intent: "None",
    entities: {confirm:"ok"},
  },
  "of course": {
    intent: "None",
    entities: {confirm:"of course"},
  },  
  right: {
    intent: "None",
    entities: {confirm:"right"},
  },
  no: {
    intent: "None",
    entities: {reject:"no"},
  },  
  not: {
    intent: "None",
    entities: {reject:"not"},
  },  
  "no way": {
    intent: "None",
    entities: {reject:"no way"},
  },  

  
  "11 AM": {
    intent: "None",
    entities: {time: "11:00"},
  },    
  "12 PM": {
    intent: "None",
    entities: {time: "12:00"},
  },  
  "1 PM": {
    intent: "None",
    entities: {time: "13:00"},
  },
  "2 PM": {
    intent: "None",
    entities: {time: "14:00"},
  },  
  "3 PM": {
    intent: "None",
    entities: {time: "15:00"},
  },  
  "4 PM": {
    intent: "4",
    entities: {time: "16:00"},
  },  
  "5 PM": {
    intent: "5",
    entities: {time: "17:00"},
  }, 
  "6 PM": {
    intent: "6",
    entities: {time: "18:00"},
  },  
  "7 PM": {
    intent: "7",
    entities: {time: "19:00"},
  },  
  "8 PM": {
    intent: "8",
    entities: {time: "20:00"},
  },  
  "9 PM": {
    intent: "9",
    entities: {time: "21:00"},
  },  
  "10 PM": {
    intent: "10",
    entities: {time: "22:00"},
  }, 
  "6 AM": {
    intent: "6",
    entities: {time: "6:00"},
  },  
  "7 AM": {
    intent: "7",
    entities: {time: "7:00"},
  },  
  "8 AM": {
    intent: "8",
    entities: {time: "8:00"},
  },  
  "9 AM": {
    intent: "9",
    entities: {time: "9:00"},
  },  
  "10 AM": {
    intent: "10",
    entities: {time: "10:00"},
  }, 
  "one hour later": {
    intent: "None",
    entities: {time: "one hour later"},
  },  
  "two hours later": {
    intent: "None",
    entities: {time: "two hours later"},
  },
  "three hours later": {
    intent: "None",
    entities: {time: "three hours later"},
  },
  "in the morning": {
    intent: "None",
    entities: {time: "morning"},
  },
  "in the afternoon": {
    intent: "None",
    entities: {time: "afternoon"},
  },
  "in the evening": {
    intent: "None",
    entities: {time: "evening"},
  },
  friday: {
    intent: "None",
    entities: {date: "Friday"},
  },  
  saturday: {
    intent: "None",
    entities: {date: "Saturday"},
  },
  sunday: {
    intent: "None",
    entities: {date: "Sunday"},
  },
  monday: {
    intent: "None",
    entities: {date: "Monday"},
  },
  tuesday: {
    intent: "None",
    entities: {date: "Tuesday"},
  },  
  wednesday: {
    intent: "None",
    entities: {date: "Wednesday"},
  },
  thursday: {
    intent: "None",
    entities: {date: "Thursday"},
  },
  today: {
    intent: "None",
    entities: {date: "today"},
  },  
  tomorrow: {
    intent: "None",
    entities: {date: "tomorrow"},
  },
  "create a meeting": {
    intent: "None",
    entities: { meetinganswer: "create a meeting" },
  },  
  "schedule a meeting": {
    intent: "None",
    entities: { meetinganswer: "create a meeting" },
  },
  "ask a question about someone": {
    intent: "None",
    entities: { answerperson: "ask a 'who is' question" },
  },
  "ask about someone": {
    intent: "None",
    entities: { answerperson: "ask a 'who is' question" },
  },
  "ask a question": {
    intent: "None",
    entities: { answerperson: "ask a 'who is' question" },
  },
};
*/




const getIntent = (context: SDSContext) => {
  let u = context.nluResult.prediction.topIntent.toLowerCase().replace(/\.$/g, "");
  return u;
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
            cond: (context) => {
              const { nluResult } = context;
              return (
                nluResult &&
                nluResult.prediction &&
                nluResult.prediction.entities &&
                nluResult.prediction.entities.length > 0 &&
                nluResult.prediction.entities[0].category === 'username'
              );
            },            
            actions: assign({
              username: (context) => context.nluResult.prediction.entities[0].text.replace(/\.$/g, "")   
            }),
          },
          {
            target: ".notmatch"
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
              cond: (context) => getIntent(context) === "who is x",   
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
          getIntent: {
          }
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
            cond: (context ) => getIntent(context) === "create a meeting" ,
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
            cond: (context) => getIntent(context) ===  "date",
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
            cond: (context) => getIntent(context) === "time",
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
            
            
            
            
