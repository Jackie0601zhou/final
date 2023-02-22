
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
    intent: "Dialogue systems lecture",
    entities: { title: "Dialogue systems lecture" },
  },
  lunch: {
    intent: "Lunch at the canteen",
    entities: { title: "Lunch at the canteen" },
  },
  dinner: {
    intent: "Dinner at the home",
    entities: { title: "Dinner at the home" },
  },
  coffee: {
    intent: "Take a coffee",
    entities: { title: "Take a coffee" }
  },
  breakfast: {
    intent: "Take breakfast",
    entities: { title: "Take breakfast" }
  },
  supermarket: {
    intent: "Go to supermarket",
    entities: { title: "Go to supermarket" }
  },
  friends: {
    intent: "Meet friends",
    entities: { title: "Meet friends" }
  },
  cats: {
    intent: "feed cats",
    entities: { title: "feed cats" }
  },
  exam: {
    intent: "exam",
    entities: { title: "exam"},
  },
  trip: {
    intent: "trip",
    entities: { title: "trip"},
  },
  "Weekly Meeting": {
    intent: "Weekly Meeting",
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
    intent: "11",
    entities: {time: "11 AM"},
  },    
  "12 PM": {
    intent: "12",
    entities: {time: "12 PM"},
  },  
  "1": {
    intent: "1",
    entities: {time: "1"},
  },
  "2": {
    intent: "2",
    entities: {time: "2"},
  },  
  "3": {
    intent: "3",
    entities: {time: "3"},
  },  
  "4": {
    intent: "4",
    entities: {time: "4"},
  },  
  "5": {
    intent: "5",
    entities: {time: "5"},
  }, 
  "6": {
    intent: "6",
    entities: {time: "6"},
  },  
  "7": {
    intent: "7",
    entities: {time: "7"},
  },  
  "8": {
    intent: "8",
    entities: {time: "8"},
  },  
  "9": {
    intent: "9",
    entities: {time: "9"},
  },  
  "10": {
    intent: "10",
    entities: {time: "10"},
  }, 
    
  "one hour later": {
    intent: "one hour later",
    entities: {time: "one hour later"},
  },  
  "two hours later": {
    intent: "two hours later",
    entities: {time: "two hours later"},
  },
  "three hours later": {
    intent: "three hours later",
    entities: {time: "three hours later"},
  },
  "in the morning": {
    intent: "morning",
    entities: {time: "morning"},
  },
  "in the afternoon": {
    intent: "afternoon",
    entities: {time: "afternoon"},
  },
  "in the evening": {
    intent: "evening",
    entities: {time: "evening"},
  },
  "March 1, 2022": {
    intent: "March 1, 2022",
    entities: {date: "March 1, 2022"
    },
  },
  friday: {
    intent: "Friday",
    entities: {date: "Friday"},
  },  
  saturday: {
    intent: "Saturday",
    entities: {date: "Saturday"},
  },
  sunday: {
    intent: "Sunday",
    entities: {date: "Sunday"},
  },
  monday: {
    intent: "Monday",
    entities: {date: "Monday"},
  },
  tuesday: {
    intent: "Tuesday",
    entities: {date: "Tuesday"},
  },  
  wednesday: {
    intent: "Wednesday",
    entities: {date: "Wednesday"},
  },
  thursday: {
    intent: "Thursday",
    entities: {date: "Thursday"},
  },
  today: {
    intent: "today",
    entities: {date: "today"},
  },  
  tomorrow: {
    intent: "tomorrow",
    entities: {date: "tomorrow"},
  },
  "create a meeting": {
    intent: "None",
    entities: { meetinganswer: "create a meeting" },
  },
  "ask a question about someone": {
    intent: "ask a 'who is' question",
    entities: { answerperson: "ask a 'who is' question" },
  },
  "ask about someone": {
    intent: "ask a 'who is' question",
    entities: { answerperson: "ask a 'who is' question" },
  },
  "ask a question": {
    intent: "ask a 'who is' question",
    entities: { answerperson: "ask a 'who is' question" },
  },
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
    welcome:{
      initial: "prompt",
      on:{
        RECOGNISED: [
          {
            target: "Meeting",
            cond: (context) =>  !!getEntity(context,"meetinganswer"),
            actions: assign({
              meetinganswer:(context) => getEntity(context,"meetinganswer"),
            }), 
          },
          {
            target: "getPersonInfo",
            cond: (context) =>  !!getEntity(context,"answerperson"),
            actions: assign({
              answerperson:(context) => getEntity(context,"answerperson"),
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
          entry:send ("LISTEN"),
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
            actions: assign({whois:  
              context => {return context.recResult[0].utterance}
            })
              
            },
          {
            target: ".notmatch",
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
            value: `Sorry, I can't find any information about ${context.whois}. Anyone else you want to know?`
          })),   
          on: { ENDSPEECH: "ask" },
        },
        prompt: {
          entry: say("Whom would you want to know about?"),
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
            target: "day",
            cond: (context) => !!getEntity(context, "date"),
            actions: assign({
              date: (context) => getEntity(context, "date"),
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
    confirmwholeday: {
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
            value: `Do you want me to create a meeting titled ${context.title}, on ${context.date} for the whole day?`,
          })),
          on: { ENDSPEECH: "ask" },
        },
        ask: {
          entry: send("LISTEN"),
        },
        notmatch: {
          entry: say(
            "Sorry, I do not understand. Do you want me to create a meeting for the whole day?"
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
      entry: say('OK! You have a meeting titled ${context.title}, on ${context.date} at ${context.time}.'),
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
            
            
            
            
      
