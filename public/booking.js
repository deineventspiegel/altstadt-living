(function(){
 'use strict';
 const localDate=date=>`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
 function day(value){
  if(!/^\d{4}-\d{2}-\d{2}$/.test(value||''))return null;
  const date=new Date(value+'T00:00:00Z');
  return Number.isFinite(date.getTime())&&date.toISOString().slice(0,10)===value?date.getTime():null;
 }
 function validate(stay,today=localDate(new Date())){
  if(!['apartment1','apartment2'].includes(stay.apartment))return 'Bitte wählen Sie ein Apartment.';
  if(!['1','2','3','4'].includes(String(stay.guests)))return 'Bitte wählen Sie 1 bis 4 Gäste.';
  if(day(stay.arrival)===null||stay.arrival<today)return 'Bitte wählen Sie eine gültige Anreise ab heute.';
  if(day(stay.departure)===null||day(stay.departure)<=day(stay.arrival))return 'Die Abreise muss nach der Anreise liegen.';
  return '';
 }
 function providerURL(config,unit){
  if(!config.bookingEnabled||!['apartment1','apartment2'].includes(unit))return null;
  try{const url=new URL(config.bookingUrl);if(url.protocol!=='https:'||url.hostname!=='booking.smoobu.com'||url.username||url.password)return null;return url.href;}catch{return null;}
 }
 function embedURL(config){
  if(!config.bookingEnabled)return null;
  try{const url=new URL(config.bookingEmbedUrl);if(url.protocol!=='https:'||url.hostname!=='login.smoobu.com'||url.username||url.password||!/^\/de\/booking-tool\/iframe\/\d+$/.test(url.pathname)||url.search||url.hash)return null;return url.href;}catch{return null;}
 }
 function nights(stay){return Math.round((day(stay.departure)-day(stay.arrival))/86400000);}
 if(typeof module!=='undefined'&&module.exports)module.exports={validate,providerURL,embedURL,nights};
 if(typeof document==='undefined')return;
 const form=document.querySelector('#journey-form');if(!form)return;
 const config=window.ALTSTADT_CONFIG||{}, params=new URLSearchParams(window.location.search);
 const fields=form.elements,error=document.querySelector('#journey-error');
 const state=()=>({apartment:fields.apartment.value,arrival:fields.arrival.value,departure:fields.departure.value,guests:fields.guests.value});
 for(const key of ['apartment','arrival','departure','guests']){
  const value=params.get(key);
  if(key==='apartment'&&['apartment1','apartment2'].includes(value))fields[key].value=value;
  if(key==='guests'&&['1','2','3','4'].includes(value))fields[key].value=value;
  if(['arrival','departure'].includes(key)&&day(value)!==null)fields[key].value=value;
 }
 fields.arrival.min=localDate(new Date());
 const format=value=>day(value)===null?'Bitte auswählen':new Date(value+'T12:00:00').toLocaleDateString('de-DE',{day:'2-digit',month:'2-digit',year:'numeric'});
 function render(){
  const s=state(),apartment=window.ALTSTADT_APARTMENTS[s.apartment];
  document.querySelector('#summary-title').textContent=apartment.name;
  const img=document.querySelector('#summary-image');img.src=apartment.image;img.alt=apartment.imageAlt;
  document.querySelector('#summary-details').textContent=apartment.summary;
  document.querySelector('#summary-policy').textContent=apartment.childPolicy;
  document.querySelector('#summary-arrival').textContent=format(s.arrival);
  document.querySelector('#summary-departure').textContent=format(s.departure);
  const n=day(s.arrival)!==null&&day(s.departure)!==null?nights(s):0;
  document.querySelector('#summary-nights').textContent=n>0?n+(n===1?' Nacht':' Nächte'):'—';
  document.querySelector('#summary-guests').textContent=s.guests+(s.guests==='1'?' Gast':' Gäste');
  if(day(s.arrival)!==null)fields.departure.min=new Date(day(s.arrival)+86400000).toISOString().slice(0,10);
  else fields.departure.min='';
 }
 form.addEventListener('change',()=>{error.textContent='';render();});render();
 form.addEventListener('submit',event=>{
  event.preventDefault();const s=state();const message=validate(s);if(message){error.textContent=message;return;}
  const query=new URLSearchParams(s);window.history.replaceState(null,'','buchen.html?'+query.toString());
  document.querySelector('#stay-panel').hidden=true;document.querySelector('#provider-panel').hidden=false;
  document.querySelector('#step-stay').removeAttribute('aria-current');document.querySelector('#step-provider').setAttribute('aria-current','step');
  const target=providerURL(config,s.apartment),link=document.querySelector('#provider-link');
  document.querySelector('.checkout-layout').classList.add('provider-active');
  if(target){
   link.href=target;link.hidden=false;
   document.querySelector('#provider-status').textContent='Bitte wählen oder bestätigen Sie Apartment, Reisedaten und Gästezahl im Smoobu-Formular erneut. Dort gelten die aktuellen Verfügbarkeiten, Preise und Zahlungsarten.';
   window.AltstadtBookingEmbed?.mount(config);
  }else{
   link.hidden=true;link.removeAttribute('href');
   document.querySelector('#provider-status').textContent='Das Buchungsformular ist derzeit nicht verfügbar. Ihre Auswahl wurde nicht reserviert.';
  }
  const panel=document.querySelector('#provider-panel');panel.setAttribute('tabindex','-1');panel.focus();
 });
 document.querySelector('#edit-stay').addEventListener('click',()=>{
  document.querySelector('#provider-panel').hidden=true;document.querySelector('#stay-panel').hidden=false;
  document.querySelector('.checkout-layout').classList.remove('provider-active');
  document.querySelector('#step-provider').removeAttribute('aria-current');document.querySelector('#step-stay').setAttribute('aria-current','step');fields.arrival.focus();
 });
})();
