
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
    entities: { title: "Lunch at the home" },
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
    intent: "None",
    entities: {"title": "Weekly Meeting"},
  },
  yes: {
    intent: "None",
    entities: {confirm:"yes"},
  },
  sure: {
    intent: "None",
    entities: {confirm:"sure"},
  },
  ok" {
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
  "6 AM": {
    intent: "None",
    entities: {"time": "6 AM"},
  },  
  "7 AM": {
    intent: "None",
    entities: {"time": "7 AM"},
  },  
  "8 AM": {
    intent: "None",
    entities: {"time": "8 AM"},
  },  
  "9 AM": {
    intent: "None",
    entities: {"time": "9 AM"},
  },  
  "10 AM": {
    intent: "None",
    entities: {"time": "10 AM"},
  },  
  "11 AM": {
    intent: "None",
    entities: {"time": "11 AM"},
  },    
  "12 PM": {
    intent: "None",
    entities: {"time": "12 PM"},
  },  
  "1 PM": {
    intent: "None",
    entities: {"time": "1 PM"},
  },  
  "2 PM": {
    intent: "None",
    entities: {"time": "2 PM"},
  },  
  "3 PM": {
    intent: "None",
    entities: {"time": "3 PM"},
  },  
  "4 PM": {
    intent: "None",
    entities: {"time": "4 PM"},
  },  
  "5 PM": {
    intent: "None",
    entities: {"time": "5 PM"},
  }, 
  "6 PM": {
    intent: "None",
    entities: {"time": "6 PM"},
  },  
  "7 PM": {
    intent: "None",
    entities: {"time": "7 PM"},
  },  
  "8 PM": {
    intent: "None",
    entities: {"time": "8 PM"},
  },  
  "9 PM": {
    intent: "None",
    entities: {"time": "9 PM"},
  },  
  "10 PM": {
    intent: "None",
    entities: {"time": "10 PM"},
  }, 
    
  "one hour later": {
    intent: "None",
    entities: {"time": "one hour later"},
  },  
  "two hours later": {
    intent: "None",
    entities: {"time": "two hours later"},
  },
  "three hours later": {
    intent: "None",
    entities: {"time": "three hours later"},
  },
  "in the morning": {
    intent: "None",
    entities: {"time": "morning"},
  },
  "in the afternoon": {
    intent: "None",
    entities: {"time": "afternoon"},
  },
  "in the evening": {
    intent: "None",
    entities: {"time": "evening"},
  },
  "March 1, 2022": {
    intent: "date",
    entities: {
      "date": "March 1, 2022"
    },
  },
  "on Friday": {
    intent: "None",
    entities: {"date": "Friday"},
  },  
  "on Saturday": {
    intent: "None",
    entities: {"date": "Saturday"},
  },
  "on Sunday": {
    intent: "None",
    entities: {"date": "Sunday"},
  },
  "on Monday": {
    intent: "None",
    entities: {"date": "Monday"},
  },
  "on Tuesday": {
    intent: "None",
    entities: {"date": "Tuesday"},
  },  
  "on Wednesday": {
    intent: "None",
    entities: {"date": "Wednesday"},
  },
  "on Thursday": {
    intent: "None",
    entities: {"date": "Thursday"},
  },
  "create a meeting": {
    intent: "None",
    entities: { answer: "create a meeting" },
  },
  "ask a question about someone": {
    intent: "None",
    entities: { whois: "ask a 'who is' question" },
  },
  "ask a question": {
    intent: "None",
    entities: { whois: "ask a 'who is' question" },
  },
};

    
};



const getEntity = (context: SDSContext,entity: string) => {
  // lowercase the utterance and remove tailing "."
  let u = context.recResult[0].utterance.toLowerCase().replace(/.$/g, "");
  if (u in grammar) {
    return grammar[u].intent;
  }
  return false;
};


export const dmMachine: MachineConfig<SDSContext, any, SDSEvent> = {
  initial: "idle",
  states: {
    idle: {
      on: {
        CLICK:"init",
      },
    },
    init:{
      on:{
        TTS_READY:"welcome",
        CLICK:"welcome",
      },
    },
    welcome:
      initial: "prompt",
      on:{
        RECOGNISED: [
          {
            target: "Meeting",
            cond: (context) =>  !!getEntity(context,"answer"),
            actions: assign({
              answer:(context) => getEntity(context,"answer"),
            }), 
          },
          {
            target: "getPersonInfo",
            cond: (context) =>  !!getEntity(context,"answerperson"),
            actions: assign({
              answer:(context) => getEntity(context,"answerperson"),
            }), 
          },
          {
            target:".notmatch"
          },
        ],
        TIMEOUT:".prompt",
      },
      states:{
        prompt:{
          entry: say("Hello Jackie! Would you like to create a meeting or ask about someone?"),
          on:{ENDSPEECH:"ask"},
        },
        ask:{
          entry:sned ("LISTEN"),
        },
        notmatch:{
          entry:say("Sorry I don't understand. Would you like to create a meeting or ask about someone?"),
          on:{ENDSPEECH:"ask"},
        },
      },
    },
    Meeting: {
      entry: say("Ok!"),
      on: { ENDSPEECH: "createmeeting" },
      },
    getPersonInfo: {
      entry: send((context) => ({
        type: "SPEAK",
        value: `OK, ${context.answerperson}.`,
      })),
      on: { ENDSPEECH: "WhoIsX" }, // askQuestion ==> What would you like to ask?
      },
    WhoIsX: {
      initial: "prompt",
      on: {
        RECOGNISED: [
          { target: ".info",
            actions: assign({personIs:  
              context => {return context.recResult[0].utterance}
            })
              
            },
          {
            target: ".nomatch",
          },
        ],
        TIMEOUT: ".prompt",
      },
      states: {
        info: {
          invoke: {
            id: 'getInfo',
            src: (context, event) => kbRequest(context.whois),
            onDone: [{
              target: 'success',
              cond: (context, event) => event.data.Abstract !== "",
              actions: assign({ info: (context, event) => event.data })
            },
            {
              target: 'failure',
            },
          ],
            onError: {
              target: 'failure',
            }
          }
        },
        success: {
          entry: send((context) => ({
            type: "SPEAK",
            value: `Here is some information about ${context.whois} ${context.info.Abstract}`
          })),
          on: {ENDSPEECH: "#meetX"}
        },
        failure: {
          entry: send((context) => ({
            type: "SPEAK",
            value: `Sorry, I can't find any information about ${context.personIs}. Anyone else you want to know?`
          })),   
          on: { ENDSPEECH: "ask" },
        },
        ask: {
          entry: send("LISTEN"),
        },
        notmatch: {
          entry: say(
            "Sorry, could you please repeat aganin?"
          ),
          on: { ENDSPEECH: "ask" },
        },
      },
    },
    meetX: {
      id:"meetX",
      initial: "prompt",
      on: {
        RECOGNISED: [
          {
            target: "refusemeeting",
            cond: (context) => !!getEntity(context, "reject"),
            actions: assign({
              reject: (context) => getEntity(context, "reject"),
            }), 
          },
          {
            target: "acceptmeeting",
            cond: (context) => !!getEntity(context, "confirm"),
            actions: assign({
              confirm: (context) => getEntity(context, "confirm"),
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
        assign((context) => ({title: `meeting with ${context.whois}`}))
      ],
      on: { ENDSPEECH: "askDate" },
      },
    createmeeting: {
      initial: "prompt",
      on: {
        RECOGNISED: [
          {
            target: "info",
            cond: (context ) => !!getEntity(context, "title"),
            actions: assign({
              title: (context) => getEntity(context, "title"),
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
            target: "date",
            cond: (context) => !!getEntity(context, "date"),
            actions: assign({
              day: (context) => getEntity(context, "date"),
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
    date: {
      entry: send((context) => ({
        type: "SPEAK",
        value: `OK, meeting scheduled for ${context.date}`,
      })),
      on: { ENDSPEECH: "isWholeDay" },
    },
    isWholeDay: {
      initial: "prompt",
      on: {
        RECOGNISED: [
          {
            target: "negative",
            cond: (context) => !!getEntity(context, "reject"),
            actions: assign({
              reject: (context) => getEntity(context, "reject"),
            }), 
          },
          {
            target: "positive",
            cond: (context) => !!getEntity(context, "confirm"),
            actions: assign({
              confirm: (context) => getEntity(context, "confirm"),
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
      entry: say("Not for the whole day."),
      on: { ENDSPEECH: "Time" },
    },
    positive: {
      entry: say("For the whole day."),
      on: { ENDSPEECH: "confirmwholeday" },
    },
    confirmWholeDay: {
      initial: "prompt",
      on: {
        RECOGNISED: [
          {
            target: "wholeDayPositive",
            cond: (context) => !!getEntity(context, "confirm"),
            actions: assign({
              confirm: (context) => getEntity(context, "confirm"),
            }), 
          },
          {
            target: "wholeDayNegative",
            cond: (context) => !!getEntity(context, "reject"),
            actions: assign({
              reject: (context) => getEntity(context, "reject"),
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
            value: `Do you want me to create a meeting titled ${context.title}, on ${context.day} for the whole day?`,
          })),
          on: { ENDSPEECH: "ask" },
        },
        ask: {
          entry: send("LISTEN"),
        },
        notmatch: {
          entry: say(
            "Sorry, I don't understand. Do you want me to create a meeting titled ${context.title}, on ${context.date} for the whole day?"
          ),
          on: { ENDSPEECH: "ask" },
        },
      },
    },
    wholeDayPositive: {
      entry: say("Great!"),
      on: { ENDSPEECH: "meetingcreated" },
    },
    wholeDayNegative: {
      entry: say("Very well! Starting over!"),
      on: { ENDSPEECH: "welcome" },
    },
    Time: {
      initial: "prompt",
      on: {
        RECOGNISED: [
          {
            target: "time",
            cond: (context) => !!getEntity(context, "time"),
            actions: assign({
              time: (context) => getEntity(context, "time"),
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
        value: `OK, time is set for ${context.time}`,
      })),
      on: { ENDSPEECH: "meetConfirm" },
    },
    meetConfirm: {
      initial: "prompt",
      on: {
        RECOGNISED: [
          {
            target: "meetingcreated",
            cond: (context) => !!getEntity(context, "confirm"),
            actions: assign({
              confirm: (context) => getEntity(context, "confirm"),
            }), 
          },
          {
            target: "rethink",
            cond: (context) => !!getEntity(context, "reject"),
            actions: assign({
              reject: (context) => getEntity(context, "reject"),
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
      entry: say("OK！You have a meeting titled ${context.title}, on ${context.date} at ${context.time}."),
      on: { ENDSPEECH: "init" },
    },
    rethink: {
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
            
            
            
            
      
