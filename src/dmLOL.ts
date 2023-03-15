
import { MachineConfig, send, Action, assign, ActionObject, Event,AssignAction} from "xstate";
import { createMachine } from 'xstate';

function say(text: string): ActionObject<SDSContext, SDSEvent> {
  return send((_context: SDSContext) => ({ type: "SPEAK", value: text }));
}

const assignMode = assign(
  (context: SDSContext, event: SDSEvent): Partial<SDSContext> => {
    const mode = getEntity(context, "Summoner_mode");
    if (mode) {
      return {
        mode: mode,
        flashCooldown: 300,
      };
    } else {
      return {
        mode: getEntity(context, "Howling_mode"),
        flashCooldown: 180,
      };
    }
  }
) as AssignAction<SDSContext, SDSEvent>;


interface Grammar {
  [index: string]: {
    utterance: string;
    intent: string;
    entities: {
      [index: string]: string;
    };
  };
}

const grammar: Grammar = {
  "Summoner's Rift": {
    utterance: "Summoner's Rift",
    intent: "None",
    entities: { Summoner_mode: "Summoner's Rift" },
  },
  "Howling Abyss": {
    utterance: "Howling Abyss",
    intent: "None",
    entities: { Howling_mode: "Howling Abyss" },
  },
  "Lulu flashed" : {
    utterance: "Lulu flashed",
    intent: "flash",
    entities: { champion: "Lulu" },
  },
  
  "Lux flashed" : {
    utterance: "Lux flashed",
    intent: "flash",
    entities: { champion: "Lux" },
  },
  
  "Is Lulu's flash ready?" : {
    utterance: "Is Lulu's flash ready?",
    intent: "check",
    entities: { champion: "Lulu" },
  },
  
  "Is Lux's flash ready?" : {
    utterance: "Is Lux's flash ready?",
    intent: "check",
    entities: { champion: "Lux" },
  },
};


const getEntity = (context: SDSContext, entity: string) => {
  // lowercase the utterance and remove tailing "."
  let u = context.recResult[0].utterance.toLowerCase().replace(/\.$/g, "");
  if (u in grammar) {
    if (entity in grammar[u].entities) {
      return grammar[u].entities[entity];
    }
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
      on: {
        RECOGNISED: [
          {
            target: "listening",
            cond: (context) => !!getEntity(context, "Summoner_mode"),
            actions: [
              assignMode,
              say("Ok! Welcome to Summoner's Rift!"),
            ],
          },
          {
            target: "listening",
            cond: (context) => !!getEntity(context, "Howling_mode"),
            actions: [
              assignMode,
              say("Ok! Welcome to Howling Abyss!"),
            ],
          },
          {
            target: ".notmatch",
          },
        ],
        TIMEOUT: ".prompt",
      },
      states:{
        prompt:{
          entry: say("Hi Summoner! Which mode do you want to play? Summoner's Rift or Howling Abyss?"),
          on:{ENDSPEECH:"ask"},
        },
        ask:{
          entry:send ("LISTEN"),
        },
        notmatch:{
          entry:say("Sorry I didn't hear you clearly. Would you like to play Summoner's Rift or Howling Abyss?"),
          on:{ENDSPEECH:"ask"},
        },
      },
    },

    listening: {
      initial: "idle",
      onEntry: send("LISTEN"),
      on: {
        RECOGNISED: {
          actions: assign((context: SDSContext, event: any): Partial<SDSContext> => {
            const utterance = event.value.toLowerCase().replace(/\.$/g, "");
            let updatedContext = {};
    
            if (utterance in grammar) {
              const intent = grammar[utterance].intent;
              const entities = grammar[utterance].entities;
    
              // Process intent and entities for the champions and their flash timers
              if (intent === "flash") {
                const champion = entities.champion;
                const currentTime = new Date().getTime();
                const newChampionData = {
                  cooldownEnd: currentTime + context.flashCooldown * 1000,
                  timerId: setTimeout(() => {
                    // Do something when the timer ends
                    console.log(`${champion}'s flash is ready`);
                  }, context.flashCooldown * 1000),
                };
    
                updatedContext = {
                  ...context,
                  champions: {
                    ...context.champions,
                    [champion]: newChampionData,
                  },
                };
              } else if (intent === "check") {
                const champion = entities.champion;
                const championData = context.champions[champion];
    
                if (championData) {
                  const currentTime = new Date().getTime();
                  const remainingTime = Math.ceil(
                    (championData.cooldownEnd - currentTime) / 1000
                  );
    
                  if (remainingTime > 0) {
                    console.log(`${champion}'s flash is not ready`);
                  } else {
                    console.log(`${champion}'s flash is ready`);
                  }
                } else {
                  console.log(`I don't have any information about ${champion}'s flash`);
                }
              }
            }
    
            return { ...context, ...updatedContext };
          }),
          target: ".idle",
        },
        TIMEOUT: ".idle",
      },
      states: {
        idle: {
          entry: send("LISTEN"),
        },
      },
    },    
  },
}; 
