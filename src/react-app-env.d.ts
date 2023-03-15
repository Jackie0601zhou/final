/// <reference types="react-scripts" />

declare module "react-speech-kit";
declare module "web-speech-cognitive-services/lib/SpeechServices/TextToSpeech";
declare module "web-speech-cognitive-services/lib/SpeechServices/SpeechToText";



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
  parameters: Parameters;
  asr: SpeechRecognition;
  tts: SpeechSynthesis;
  voice: SpeechSynthesisVoice;
  ttsUtterance: MySpeechSynthesisUtterance;
  recResult: Hypothesis[];
  ttsAgenda: string;
  azureAuthorizationToken: string;
  audioCtx: any;
  title: any;
  time: any;
  date:any;
  topic:string;
  confirm:any;
  reject:any;
  whois:any;
  meetinganswer:any;
  answerperson:any;
  info:any;
  nluResult: any;
  username:any;
  entities:any;
  topIntent:any;
  reprompts: number;
  help:any;
  counter:number;
}

type SDSEvent =
  | { type: "TTS_READY" }
  | { type: "TTS_ERROR" }
  | { type: "CLICK" }
  | { type: "SELECT"; value: any }
  | { type: "STARTSPEECH" }
  | { type: "RECOGNISED" ; value: string }
  | { type: "ASRRESULT"; value: Hypothesis[] }
  | { type: "ENDSPEECH" }
  | { type: "LISTEN" }
  | { type: "TIMEOUT" }
  | { type: "ERROR" }
  | { type: "SPEAK"; value: string }
  | { type: "HELP" }
  | { type: "NOINPUT" }

