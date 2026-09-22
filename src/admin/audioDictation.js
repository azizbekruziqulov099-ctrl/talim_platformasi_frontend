// One bounded microphone recording, followed by automatic language transcription.
export class AudioDictation {
  constructor({ transcribe, onText, onState, onError, mediaDevices = globalThis.navigator?.mediaDevices,
    Recorder = globalThis.MediaRecorder, setTimer = setTimeout, clearTimer = clearTimeout }) {
    Object.assign(this, { transcribe, onText, onState, onError, mediaDevices, Recorder, setTimer, clearTimer });
    this.generation = 0; this.busy = false;
  }
  async start({language='auto'}={}) {
    if (this.busy) return;
    this.busy = true;
    const generation = ++this.generation;
    this.onState('starting');
    try {
      const stream = await this.mediaDevices.getUserMedia({ audio: true });
      if (generation !== this.generation) { stream.getTracks().forEach(track => track.stop()); return; }
      this.stream = stream;
      const mimeType = ['audio/webm;codecs=opus', 'audio/mp4', 'audio/ogg;codecs=opus'].find(type => this.Recorder.isTypeSupported?.(type));
      const recorder = new this.Recorder(stream, mimeType ? { mimeType } : undefined);
      this.recorder = recorder;
      const parts = []; let bytes = 0;
      recorder.ondataavailable = event => {
        if (!event.data.size || generation !== this.generation) return;
        bytes += event.data.size;
        if (bytes > 8 * 1024 * 1024) { this.cancel(); this.onError('Yozuv juda katta. Qisqaroq gapirib yozing.'); return; }
        parts.push(event.data);
      };
      recorder.onerror = () => { if(generation!==this.generation)return;this.cancel();this.onError('Mikrofondan yozib bo‘lmadi. Qayta urinib ko‘ring.'); };
      recorder.onstop = async () => {
        if (generation !== this.generation) return;
        this.release();
        this.onState('transcribing');
        const controller = new AbortController(); this.controller = controller;
        try {
          const blob = new Blob(parts, { type: recorder.mimeType || mimeType || 'audio/webm' });
          if (!blob.size) throw new Error('Ovoz yozuvi bo‘sh. Qayta gapirib ko‘ring.');
          const result = await this.transcribe(blob, controller.signal, language);
          if (generation === this.generation) this.onText(result);
        } catch (error) { if (generation === this.generation && error.name !== 'AbortError') this.onError(error.message); }
        finally { if (generation === this.generation) { this.busy = false; this.controller = null; this.onState('idle'); } }
      };
      recorder.start(1000);
      this.onState('recording');
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
  stop() {
    if (this.recorder?.state === 'recording') this.recorder.stop();
    else if(this.busy)this.cancel();
  }
  release() {
    this.clearTimer(this.timer); this.timer = null;
    this.stream?.getTracks().forEach(track => track.stop()); this.stream = null; this.recorder = null;
  }
  cancel() {
    ++this.generation;
    this.controller?.abort(); this.controller = null;
    if (this.recorder) {
      this.recorder.ondataavailable = this.recorder.onstop = this.recorder.onerror = null;
      if (this.recorder.state === 'recording') this.recorder.stop();
    }
    this.release(); this.busy = false; this.onState('idle');
  }
}
