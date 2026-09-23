import {audioFileBlob,MAX_AUDIO_BYTES} from './transcriptionClient.js';

function stopTracks(stream) {
  // A detached device can throw for one track; still release every other track.
  let tracks=[];
  try { tracks=stream?.getTracks() || []; } catch { /* device disconnected */ }
  for(const track of tracks) { try { track.stop(); } catch { /* already stopped */ } }
}

// Keep the complete recording until the user discards it, even after a failed upload.
export class AudioDictation {
  constructor({ transcribe, onText, onState, onError, onRecording=()=>{}, mediaDevices = globalThis.navigator?.mediaDevices,
    Recorder = globalThis.MediaRecorder, setTimer = setTimeout, clearTimer = clearTimeout }) {
    Object.assign(this, { transcribe, onText, onState, onError, onRecording, mediaDevices, Recorder, setTimer, clearTimer });
    this.generation = 0; this.busy = false; this.phase='idle';this.lastRecording=null;
  }
  state(value){this.phase=value;this.onState(value);}
  remember(blob,language){this.lastRecording={blob,language};this.onRecording(this.lastRecording);}
  async start({language='auto'}={}) {
    if (this.busy) return;
    this.busy = true;
    const generation = ++this.generation;
    this.state('starting');
    this.timer=this.setTimer(()=>{
      if(generation!==this.generation||this.phase!=='starting')return;
      this.cancel();
      this.onError('Mikrofonga ruxsat kutilmoqda. Brauzerda mikrofonni yoqing va qayta bosing.');
    },20000);
    try {
      const stream = await this.mediaDevices.getUserMedia({ audio: true });
      if (generation !== this.generation) { stopTracks(stream); return; }
      this.clearTimer(this.timer);this.timer=null;
      this.stream = stream;
      const mimeType = ['audio/webm;codecs=opus', 'audio/mp4', 'audio/ogg;codecs=opus'].find(type => this.Recorder.isTypeSupported?.(type));
      const recorder = new this.Recorder(stream, mimeType ? { mimeType } : undefined);
      this.recorder = recorder;
      const parts = []; let bytes = 0;
      recorder.ondataavailable = event => {
        if (!event.data.size || generation !== this.generation) return;
        bytes += event.data.size;
        if (bytes > MAX_AUDIO_BYTES) { this.cancel(); this.onError('Yozuv juda katta. Qisqaroq gapirib yozing.'); return; }
        parts.push(event.data);
      };
      recorder.onerror = () => { if(generation!==this.generation)return;this.cancel();this.onError('Mikrofondan yozib bo‘lmadi. Qayta urinib ko‘ring.'); };
      recorder.onstop = async () => {
        if (generation !== this.generation) return;
        this.release();
        const blob = new Blob(parts, { type: recorder.mimeType || mimeType || 'audio/webm' });
        if(!blob.size){this.busy=false;this.state('idle');this.onError('Ovoz yozuvi bo‘sh. Qayta gapirib ko‘ring.');return;}
        this.remember(blob,language);
        await this.submit(blob,language,generation);
      };
      recorder.start(1000);
      this.state('recording');
      this.timer = this.setTimer(() => this.stop(), 120000);
    } catch (error) {
      if (generation !== this.generation) return;
      this.cancel();
      this.onError(error.name === 'NotAllowedError' ? 'Mikrofonga ruxsat berilmadi. Brauzerning sayt ruxsatlaridan mikrofonni yoqing.'
        : error.name === 'NotFoundError' ? 'Mikrofon topilmadi. Mikrofonni ulang va qayta urinib ko‘ring.'
        : error.name === 'NotReadableError' ? 'Mikrofon boshqa dasturda band yoki qurilmada o‘chirilgan.'
        : 'Mikrofonni ochib bo‘lmadi. Qayta urinib ko‘ring.');
    }
  }
  async submit(blob,language,generation) {
    this.state('transcribing');
    const controller=new AbortController();this.controller=controller;
    try {
      const result=await this.transcribe(blob,controller.signal,language);
      if(generation!==this.generation)return;
      if(typeof result?.text!=='string'||!result.text.trim())throw new Error('Ovoz xizmati matn qaytarmadi. Yozuvni tinglab, qayta yuboring.');
      this.onText(result);
    } catch(error) {if(generation===this.generation&&error.name!=='AbortError')this.onError(error.message||'Yozuv yuborilmadi. Qayta urinib ko‘ring.');}
    finally {if(generation===this.generation){this.busy=false;this.controller=null;this.state('idle');}}
  }
  selectFile(file,{language='auto'}={}) {
    if(this.busy)return;
    try {this.remember(audioFileBlob(file),language);}
    catch(error){this.onError(error.message);}
  }
  async retry({language=this.lastRecording?.language||'auto'}={}) {
    if(this.busy||!this.lastRecording)return;
    this.busy=true;const generation=++this.generation;
    const {blob}=this.lastRecording;this.remember(blob,language);
    await this.submit(blob,language,generation);
  }
  discard(){if(!this.busy){this.lastRecording=null;this.onRecording(null);}}
  stop() {
    if(this.phase==='recording'&&this.recorder?.state==='recording') {
      // stop() queues final dataavailable/onstop events. A second click must
      // leave those handlers attached until the complete Blob is assembled.
      this.state('stopping');
      this.clearTimer(this.timer);
      this.timer=this.setTimer(()=>{
        if(this.phase==='stopping'){this.cancel();this.onError('Mikrofon yozuvi yakunlanmadi. Qayta yozib ko‘ring.');}
      },5000);
      try{this.recorder.stop();}catch{this.cancel();this.onError('Yozuvni to‘xtatib bo‘lmadi. Qayta yozib ko‘ring.');}
    } else if(this.phase==='starting')this.cancel();
  }
  release() {
    this.clearTimer(this.timer); this.timer = null;
    const stream=this.stream;this.stream=null;this.recorder=null;
    stopTracks(stream);
  }
  cancel() {
    ++this.generation;
    const controller=this.controller;this.controller=null;
    try { controller?.abort(); } catch { /* cancellation must still release the microphone */ }
    const recorder=this.recorder;
    if (recorder) {
      recorder.ondataavailable = recorder.onstop = recorder.onerror = null;
      try { if (recorder.state !== 'inactive') recorder.stop(); } catch { /* already closed */ }
    }
    this.release(); this.busy = false; this.state('idle');
  }
  dispose(){
    // React StrictMode and navigation may dispose more than once. Never update
    // the previous editor from cleanup or a late microphone/network response.
    this.onText=this.onState=this.onError=this.onRecording=()=>{};
    this.cancel();this.lastRecording=null;
  }
}
