const FILE_TYPES={mp3:'audio/mpeg',mpeg:'audio/mpeg',mpga:'audio/mpeg',wav:'audio/wav',m4a:'audio/x-m4a',
 mp4:'audio/mp4',webm:'audio/webm',ogg:'audio/ogg',flac:'audio/flac'};
const ALLOWED_TYPES=new Set([...Object.values(FILE_TYPES),'audio/mp3','audio/m4a','audio/x-wav','audio/x-flac','video/mp4','video/webm']);
export const MAX_AUDIO_BYTES=8*1024*1024;

// A service limit switches engines; an invalid file or expired login does not.
export function dictationFallbackMessage(error) {
 const message=String(error?.message||error||'');
 if(/^STT_LIMIT(?:\b|:)/.test(message))return 'Groq limiti tugadi. Keyingi gaplar brauzer orqali yoziladi.';
 if(/^STT_(?:NOT_CONFIGURED|PROVIDER_KEY|PROVIDER_ACCESS|CONNECTION|TIMEOUT|MODEL)(?:\b|:)/.test(message))
  return 'Groq hozir ishlamayapti. Keyingi gaplar brauzer orqali yoziladi.';
 return '';
}

export function audioFileBlob(file) {
 if(!file?.size)throw new Error('Ovoz fayli bo‘sh. Boshqa yozuv tanlang.');
 if(file.size>MAX_AUDIO_BYTES)throw new Error('Ovoz fayli 8 MB dan oshmasligi kerak. Qisqaroq yozuv tanlang.');
 const declared=String(file.type||'').split(';')[0].toLowerCase();
 const extension=String(file.name||'').split('.').at(-1).toLowerCase();
 const type=ALLOWED_TYPES.has(declared)?file.type:FILE_TYPES[extension];
 if(!type)throw new Error('MP3, WAV, M4A, MP4, WEBM, OGG yoki FLAC ovoz faylini tanlang.');
 return file.slice(0,file.size,type);
}

// A 200 HTML page, empty JSON and a hanging request must not look like success.
export async function transcribeRecording({apiBase,token,blob,language='auto',signal,
 fetchImpl=globalThis.fetch,timeoutMs=75000,setTimer=setTimeout,clearTimer=clearTimeout}) {
 const controller=new AbortController();let timedOut=false;
 const abort=()=>controller.abort();
 signal?.addEventListener('abort',abort,{once:true});
 if(signal?.aborted)controller.abort();
 const timer=setTimer(()=>{timedOut=true;controller.abort();},timeoutMs);
 try {
  if(controller.signal.aborted)throw new DOMException('Aborted','AbortError');
  const response=await fetchImpl(`${String(apiBase).replace(/\/+$/,'')}/api/admin/speech/dictate?${new URLSearchParams({token,language})}`,{
   method:'POST',headers:{'Content-Type':blob.type||'audio/webm'},body:blob,signal:controller.signal});
  const data=await response.json().catch(()=>null);
  if(!response.ok) {
   const detail=typeof data?.detail==='string'?data.detail:typeof data?.detail?.message==='string'?data.detail.message:'';
   const fallback={401:'Kirish muddati tugagan. Saytga qayta kiring.',403:'Ovozni matnga aylantirishga ruxsat yo‘q.',
    404:'Ovozni matnga aylantirish manzili topilmadi. Backend yangilanganini tekshiring.',
    413:'Ovoz yozuvi juda katta. Qisqaroq yozuv yuboring.',429:'Ovoz tanish limiti tugadi. Keyinroq qayta yuboring.',
    502:'Ovoz serveridan noto‘g‘ri javob keldi.',504:'Ovoz serveri vaqtida javob bermadi.'};
   const message=detail||fallback[response.status]||`Ovozni matnga aylantirib bo‘lmadi (HTTP ${response.status}).`;
   // A proxy may return an HTML 429 without the backend's STT_LIMIT code.
   throw new Error(response.status===429&&!message.startsWith('STT_LIMIT')?`STT_LIMIT: ${message}`:message);
  }
  if(!data||typeof data.text!=='string')throw new Error('STT_RESPONSE: Server matnli javob qaytarmadi. Backend manzilini tekshiring.');
  if(!data.text.trim())throw new Error('STT_NO_SPEECH: Yozuvda nutq topilmadi. Saqlangan yozuvni tinglab tekshiring.');
  return {text:data.text.trim(),language:typeof data.language==='string'?data.language:(language==='auto'?'':language)};
 } catch(error) {
  if(timedOut)throw new Error('STT_TIMEOUT: Matnga aylantirish cho‘zildi. Shu yozuvni qayta yuboring.');
  if(error.name==='TypeError')throw new Error('STT_CONNECTION: Server bilan aloqa uzildi. Internetni tekshirib, shu yozuvni qayta yuboring.');
  throw error;
 } finally {clearTimer(timer);signal?.removeEventListener('abort',abort);}
}
