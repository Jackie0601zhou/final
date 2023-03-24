/// <reference types="react-scripts" />

declare module "react-speech-kit";
declare module "web-speech-cognitive-services/lib/SpeechServices/TextToSpeech";
declare module "web-speech-cognitive-services/lib/SpeechServices/SpeechToText";
declare module 'fuzzyset.js';



interface Hypothesis {
  utterance: string;
  confidence: number;
}


interface MySpeechSynthesisUtterance extends SpeechSynthesisUtterance {
  new (s: string);
}

interface MySpeechRecognition extends SpeechRecognition {
  new (s: string);
}



interface Settings {
  ttsVoice: string;
  ttsLexicon: string;
  asrLanguage: string;
  azureKey: string;
}

interface SDSContext {
  listeningPaused:boolean;
  listeningResumed:boolean;
  parameters: Parameters;
  asr: SpeechRecognition;
  tts: SpeechSynthesis;
  voice: SpeechSynthesisVoice;
  ttsUtterance: MySpeechSynthesisUtterance;
  recResult: any
  ttsAgenda: string;
  azureAuthorizationToken: string;
  audioCtx: any;
  Summoner_mode: any;
  Howling_mode: any;
  mode:string;
  flashCooldown:number;
  champions:any;
  Summoner_mode:any;
  Howling_mode:any;
  nluResult: any;
  entities:any;
  topIntent:any;
  champion:any;
  championCooldowns: { [champion: string]: number };
  announceFlashCooldown:any;
  timerIds:any;
  countdown:number;
  timer:any;
  announceMessage:any;
  reminderDelay:any;
  currentChampion:any;
  proposedChampionName:any;
  selectedChampionName?: string;
  message:any;
}

type SDSEvent =
  | { type: "TTS_READY" }
  | { type: "TTS_ERROR" }
  | { type: "CLICK" }
  | { type: "SELECT"; value: any }
  | { type: "STARTSPEECH" }
  | { type: "RECOGNISED" }
  | { type: "ASRRESULT"; value: Hypothesis[] }
  | { type: "ENDSPEECH" }
  | { type: "LISTEN" }
  | { type: "TIMEOUT" }
  | { type: 'CHAMPION_FLASHED' }
  | { type: 'CHECK_COOLDOWN' }
  | { type: 'UNRECOGNIZED_FLASH' }
  | { type: 'SET_TIMER' }
  | { type: "SPEAK"; value: string }
  | { type: "PAUSE" }
  | { type: "RESUME" };
