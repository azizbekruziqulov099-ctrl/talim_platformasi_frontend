import React,{useEffect,useState} from 'react';
import {useInterface} from './InterfacePreferences.jsx';
import {translationSession} from './interfaceRuntime.js';
import {translateContentText} from './contentTranslation.js';
// Educational source text only; never form values, names or answer identifiers.
export function useTranslatedContent(source){
 const {locale,translateContent}=useInterface(),{token,revision}=translationSession();
 const text=typeof source==='string'?source:'',key=JSON.stringify([revision,locale,text]);
 const [state,setState]=useState({key:'',text:'',status:'original'});
 useEffect(()=>{let live=true;
  if(!translateContent||!text.trim()){setState({key,text,status:'original'});return()=>{live=false;};}
  if(!token){setState({key,text,status:'sign_in'});return()=>{live=false;};}
  setState({key,text,status:'loading'});
  translateContentText(text,locale,token).then(value=>{if(live)setState({key,text:value,status:'translated'});},error=>{if(live)setState({key,text,status:error.message==='sign_in'?'sign_in':'failed'});});
  return()=>{live=false;};
 },[key,translateContent,token]);
 const valid=translateContent&&state.key===key;
 return {text:valid&&state.status==='translated'?state.text:source,status:valid?state.status:'original',locale};
}
export function ContentTranslationStatus({translation}){
 const {t}=useInterface(),{status}=translation;if(status==='original')return null;
 return <span className="kb-content-translation" translate="no" role="status">{status==='translated'?<>{t('Mashina tarjimasi')} · Google Translate</>:t(status==='loading'?'Tarjima qilinmoqda…':status==='sign_in'?'Tarjima uchun hisobingizga kiring.':'Tarjima vaqtincha ishlamayapti. Asl matn ko‘rsatilmoqda.')}</span>;
}
export default function TranslatedContent({text,sourceLanguage,showStatus=true}){
 const translation=useTranslatedContent(text);
 return <><span translate="no" lang={translation.status==='translated'?translation.locale:sourceLanguage}>{translation.text}</span>{showStatus&&<ContentTranslationStatus translation={translation}/>}</>;
}
