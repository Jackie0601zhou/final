import { MachineConfig, send, Action, assign, ActionObject, Event, AssignAction, actions } from 'xstate';
import FuzzySet from 'fuzzyset.js';

interface GrammarEntry {
  utterance: string;
  intent: string;
  entities: { [key: string]: string };
}
interface Grammar {
  [key: string]: GrammarEntry;
}

const yingxiong = [
  "Aatrox",
  "Ahri",
  "Akali",
  "Alistar",
  "Amumu",
  "Anivia",
  "Annie",
  "Aphelios",
  "Ashe",
  "Aurelion Sol",
  "Azir",
  "Bard",
  "Blitzcrank",
  "Brand",
  "Braum",
  "Caitlyn",
  "Camille",
  "Cassiopeia",
  "Cho'Gath",
  "Corki",
  "Darius",
  "Diana",
  "Dr. Mundo",
  "Draven",
  "Ekko",
  "Elise",
  "Evelynn",
  "Ezreal",
  "Fiddlesticks",
  "Fiora",
  "Fizz",
  "Galio",
  "Gangplank",
  "Garen",
  "Gnar",
  "Gragas",
  "Graves",
  "Gwen",
  "Hecarim",
  "Heimerdinger",
  "Illaoi",
  "Irelia",
  "Ivern",
  "Janna",
  "Jarvan IV",
  "Jax",
  "Jayce",
  "Jhin",
  "Jinx",
  "Kai'Sa",
  "Kalista",
  "Karma",
  "Karthus",
  "Kassadin",
  "Katarina",
  "Kayle",
  "Kayn",
  "Kennen",
  "Kha'Zix",
  "Kindred",
  "Kled",
  "Kog'Maw",
  "LeBlanc",
  "Lee Sin",
  "Leona",
  "Lillia",
  "Lissandra",
  "Lucian",
  "Lulu",
  "Lux",
  "Malphite",
  "Malzahar",
  "Maokai",
  "Master Yi",
  "Miss Fortune",
  "Mordekaiser",
  "Morgana",
  "Nami",
  "Nasus",
  "Nautilus",
  "Neeko",
  "Nidalee",
  "Nocturne",
  "Nunu & Willump",
  "Olaf",
  "Orianna",
  "Ornn",
  "Pantheon",
  "Poppy",
  "Pyke",
  "Qiyana",
  "Quinn",
  "Rakan",
  "Rammus",
  "Rek'Sai",
  "Rell",
  "Renekton",
  "Rengar",
  "Riven",
  "Rumble",
  "Ryze",
  "Samira",
  "Sejuani",
  "Senna",
  "Seraphine",
  "Sett",
  "Shaco",
  "Shen",
  "Shyvana",
  "Singed",
  "Sion",
  "Sivir",
  "Skarner",
  "Sona",
  "Soraka",
  "Swain",
  "Sylas",
  "Syndra",
  "Tahm Kench",
  "Taliyah",
  "Talon",
  "Taric",
  "Teemo",
  "Thresh",
  "Tristana",
  "Trundle",
  "Tryndamere",
  "Twisted Fate",
  "Twitch",
  "Udyr",
  "Urgot",
  "Varus",
  "Vayne",
  "Veigar",
  "Vel'Koz",
  "Vi",
  "Viego",
  "Viktor",
  "Vladimir",
  "Volibear",
  "Warwick",
  "Wukong",
  "Xayah",
  "Xerath",
  "Xin Zhao",
  "Yasuo",
  "Yone",
  "Yorick",
  "Yuumi",
  "Zac",
  "Zed",
  "Ziggs",
  "Zilean",
  "Zoe",
  "Zyra",
  ];
const generateGrammar = (yingxiong: string[]): Grammar => {
  const grammar: Grammar = {};
  for (const champion of yingxiong) {
    const key = champion.toLowerCase() + " flashed";
    grammar[key] = {
      utterance: champion + " flashed",
      intent: "CHAMPION_FLASHED",
      entities: { champion: champion },
    };
  }

  for (const champion of yingxiong) {
    const key = "is " + champion.toLowerCase().replace(/'/g, '') + " flash ready";
    const keyWithApostrophe = "is " + champion.toLowerCase() + "'s flash ready";
    grammar[key] = {
      utterance: "Is " + champion + " flash ready",
      intent: "CHECK_COOLDOWN",
      entities: { champion: champion.toLowerCase() },
    };
    grammar[keyWithApostrophe] = {
      utterance: "Is " + champion + "'s flash ready",
      intent: "CHECK_COOLDOWN",
      entities: { champion: champion.toLowerCase() },
    };
  }
  grammar["summoners rift"] = {
    utterance: "Summoner's Rift",
    intent: "None",
    entities: { Summoner_mode: "Summoner's Rift" },
  };
  grammar["howling abyss"] = {
    utterance: "Howling Abyss",
    intent: "None",
    entities: { Howling_mode: "Howling Abyss" },
  };

  return grammar;
};
const grammar = generateGrammar(yingxiong);
const fuzzyChampionNames = FuzzySet(yingxiong);

const getChampionFromUtterance = (utterance: string) => {
  // Remove any non-alphabetic characters and split the utterance into words
  const words = utterance.replace(/[^a-zA-Z\s]/g, '').split(' ');

  let bestMatchScore = 0;
  let bestMatchChampion = "";

  // Find the best matching champion name
  for (const word of words) {
    const result = fuzzyChampionNames.get(word);
    if (result && result[0][0] > bestMatchScore) {
      bestMatchScore = result[0][0];
      bestMatchChampion = result[0][1];
    }
  }
  return bestMatchChampion;
};

const getEntity = (context: SDSContext, entity: string) => {
  if (!context.recResult[0] || !context.recResult[0].utterance) {
    return undefined;
  }
  let u = context.recResult[0].utterance.toLowerCase().replace(/\.$/g, '');
  if (u in grammar) {
    if (entity in grammar[u].entities) {
      return grammar[u].entities[entity];
    }
  }
  if (entity === 'champion') {
    return getChampionFromUtterance(u);
  }

  return undefined;
};


const getUtterance = (context: SDSContext) => {
  if (!context.recResult || context.recResult.length === 0) {
    return undefined;
  }
  return context.recResult[0].utterance;
};

const assignMode = assign(
  (context: SDSContext, event: SDSEvent): Partial<SDSContext> => {
    const mode = getEntity(context, 'Summoner_mode');
    if (mode) {
      return {
        mode: mode,
        flashCooldown: 300,
      };
    } else {
      return {
        mode: getEntity(context, 'Howling_mode'),
        flashCooldown: 25,
      };
    }
  }
) as AssignAction<SDSContext, SDSEvent>;

const announceFlashCooldown = (context: SDSContext, championName: string, remainingTime: number) => {
  if (remainingTime === 10) {
    setTimeout(() => send({ type: 'TO_LISTENING' }), 1000);
    return { type: 'SPEAK', value: `${championName}'s Flash will be ready in 10 seconds.` };
  } else if (remainingTime === 0) {
    setTimeout(() => send({ type: 'TO_LISTENING' }), 1000);
    return { type: 'SPEAK', value: `${championName}'s Flash is ready.` };
  }
  return;
};


function say(text: string): ActionObject<SDSContext, SDSEvent> {
  return send((_context: SDSContext) => ({ type: 'SPEAK', value: text }));
}

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
            target: "readyToListen",
            cond: (context) => !!getEntity(context, "Summoner_mode"),
            actions: [
              assignMode,
              say("Ok! Welcome to Summoner's Rift!"),
            ],
          },
          {
            target: "readyToListen",
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

    readyToListen: {
      on: {
        ENDSPEECH: "Listening",
      },
    },
    Listening: {
      entry: send('LISTEN'),
      on: {
        RECOGNISED: [
          {
            target: "cooldown_status",
            cond: (context) => {
              if (!context.recResult || context.recResult.length === 0) {
                return false;
              }
              const utterance = context.recResult[0].utterance.toLowerCase().replace(/\.$/g, '');
              const checkCooldownPattern = /^is (\S+)[']?s? flash ready\??$/;
              return checkCooldownPattern.test(utterance);
            },
          },
          {
            target: "flash",
            cond: (context) => {
              if (!context.recResult || context.recResult.length === 0) {
                return false;
              }
              const utterance = context.recResult[0].utterance.toLowerCase().replace(/\.$/g, '');
              const words = utterance.split(' ');
              const lastWord = words[words.length - 1];
              const championName = words.slice(0, -1).join(' ');
        
              if (lastWord === 'flashed') {
                const result = fuzzyChampionNames.get(championName);
                if (result && result[0][0] >= 0.4) {
                  return true;
                } else {
                  return false;
                }
              }
              return false;
            },
            actions: assign((context: SDSContext) => {
              const utterance = context.recResult[0].utterance.toLowerCase().replace(/\.$/g, '');
              const words = utterance.split(' ');
              const championName = words.slice(0, -1).join(' ');
              const result = fuzzyChampionNames.get(championName);
              if (result) {
                return { selectedChampionName: result[0][1] };
              }
              return {};
            }),
          },
          {
            target: "unrecognized",
          },
        ],
      },
    },

    unrecognized: {
      entry: say("Can you say again?"),
      on: {
        ENDSPEECH: "Listening",
      },
    },

    flash: {
      entry: [
      assign((context: SDSContext, event: SDSEvent) => {
        const champion = context.selectedChampionName as string;
        const currentTime = Math.floor(Date.now() / 1000);
        return {
          championCooldowns: {
            ...context.championCooldowns,
            [champion.toLowerCase()]: currentTime + context.flashCooldown,
          },
          reminderDelay: (context.flashCooldown - 10) * 1000,
          championName: champion,
        };
      }),
      send((context: SDSContext) => {
        const championName = getEntity(context, "champion");
        if (championName) {
          return {
            type: 'SPEAK',
            value: `Ok, ${championName} flashed`,
          };
        } else {
          return { type: 'NONE' };
        }
      }),
      send((context: SDSContext) => {
        const championName = getEntity(context, "champion");
        const reminderDelay = context.reminderDelay;
        if (championName && reminderDelay) {
          setTimeout(() => {
            const message = announceFlashCooldown(context, championName, 10);
            if (message) {
              console.log(`${championName}'s flash will be ready in 10 seconds.`)
              say(`${championName}'s flash will be ready in 10 seconds.`,
              );
            }
          }, reminderDelay);
          setTimeout(() => {
            const message = announceFlashCooldown(context, championName, 0);
            if (message) {
              console.log(`${championName}'s flash is ready.`)
              say(`${championName}'s flash is ready.`,
              );
            }
          }, context.flashCooldown * 1000);
        }
        return { type: 'NONE' };
      }),
    ],
    on: {
      ENDSPEECH: "Listening",
    },
  },
    
    cooldown_status: {
      entry: [
        send((context: SDSContext) => {
          const championName = (() => {
            const utterance = context.recResult[0].utterance.toLowerCase().replace(/\.$/g, '');
            const checkCooldownPattern = /^is (\S+)['’]?s? flash ready\??$/;
            const match = utterance.match(checkCooldownPattern);
            if (match) {
              return match[1];
            }
            return undefined;
          })();
    
          const fuzzyResult = fuzzyChampionNames.get(championName);
          const matchedChampionName = fuzzyResult ? fuzzyResult[0][1] : undefined;
          const championNameLower = matchedChampionName ? matchedChampionName.toLowerCase() : undefined;
    
          if (championNameLower) {
            const cooldownEndTime = context.championCooldowns[championNameLower];
            const currentTime = Math.floor(Date.now() / 1000);
            const remainingCooldown = cooldownEndTime - currentTime;
            if (remainingCooldown > 0) {
              const remainingMinutes = Math.floor(remainingCooldown / 60);
              const remainingSeconds = remainingCooldown % 60;
              return {
                type: 'SPEAK',
                value: `No, ${championName}'s Flash will be ready in ${remainingMinutes} minutes and ${remainingSeconds} seconds.`,
              };
            } else {
              return {
                type: 'SPEAK',
                value: `Yes, ${championName}'s Flash is ready.`,
              };
            }
          } else {
            return { type: 'NONE' };
          }
        }),
      ],
      on: {
        ENDSPEECH: "Listening",
      },
    },
  },
};




