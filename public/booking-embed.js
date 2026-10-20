(function(){
 'use strict';
 if(typeof window==='undefined'||typeof document==='undefined')return;
 const SCRIPT='https://login.smoobu.com/js/Settings/BookingToolIframe.js';
 let started=false,observer,timer;
 function validURL(config){
  if(!config.bookingEnabled)return null;
  try{const u=new URL(config.bookingEmbedUrl);if(u.origin!=='https://login.smoobu.com'||u.username||u.password||!/^\/de\/booking-tool\/iframe\/\d+$/.test(u.pathname)||u.search||u.hash)return null;return u.href;}catch{return null;}
 }
 window.AltstadtBookingEmbed={mount(config){
  const url=validURL(config),shell=document.getElementById('smoobu-embed-shell'),target=document.getElementById('apartmentIframeAll'),status=document.getElementById('embed-loading');
  if(!url||!shell||!target||!status)return;
  shell.hidden=false;if(started)return;started=true;
  const fallback=()=>{status.hidden=false;status.textContent='Falls das Formular nicht erscheint, öffnen Sie es bitte über den Link unten in einem neuen Tab.';};
  function inspect(){
   const frame=target.querySelector('iframe');if(!frame)return;
   frame.setAttribute('title','Altstadt Living – Verfügbarkeit und Buchung über Smoobu');
   frame.setAttribute('referrerpolicy','strict-origin-when-cross-origin');
   // Keep the provider resizer. Never infer a booking/payment from iframe load.
   frame.addEventListener('load',()=>{status.hidden=true;clearTimeout(timer);},{once:true});
   observer?.disconnect();
  }
  if(typeof MutationObserver!=='undefined'){observer=new MutationObserver(inspect);observer.observe(target,{childList:true,subtree:true});}
  function initialize(){
   try{
    if(typeof window.BookingToolIframe?.initialize!=='function')throw new Error('Provider script unavailable');
    window.BookingToolIframe.initialize({url,baseUrl:'https://login.smoobu.com',target:'#apartmentIframeAll'});inspect();
   }catch{observer?.disconnect();fallback();}
  }
  timer=setTimeout(fallback,15000);
  if(window.BookingToolIframe){initialize();return;}
  const script=document.createElement('script');script.src=SCRIPT;script.async=true;
  script.onload=initialize;script.onerror=()=>{clearTimeout(timer);observer?.disconnect();fallback();};document.head.appendChild(script);
 }};
})();
