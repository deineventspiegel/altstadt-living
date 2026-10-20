'use strict';
const config = window.ALTSTADT_CONFIG || {};
const localDay = date => `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
document.querySelectorAll('.stay-form').forEach(form=>{
 const arrival=form.elements.arrival, departure=form.elements.departure, status=form.querySelector('.form-status');
 if(form.classList.contains('dock-booking'))status.textContent='';
 arrival.min=localDay(new Date());
 function updateDeparture(){if(!arrival.value){departure.min='';return;}const next=new Date(arrival.value+'T12:00:00');next.setDate(next.getDate()+1);departure.min=localDay(next);if(departure.value && departure.value<departure.min)departure.value='';}
 arrival.addEventListener('change',updateDeparture);
 form.addEventListener('submit',event=>{event.preventDefault();updateDeparture();if(!form.reportValidity())return;if(departure.value<=arrival.value){status.textContent='Bitte wählen Sie eine Abreise nach der Anreise.';return;}const apartment=form.dataset.apartment||form.elements.apartment?.value||'apartment1';const guests=form.elements.guests?.value||'2';if(!['1','2','3','4'].includes(guests))return;const query=new URLSearchParams({apartment,arrival:arrival.value,departure:departure.value,guests});window.location.assign('buchen.html?'+query.toString());});
});
document.querySelectorAll('dialog .close').forEach(button=>button.addEventListener('click',()=>button.closest('dialog').close()));
const menu=document.querySelector('#menu');document.querySelectorAll('#menu-open,[data-menu-open]').forEach(button=>button.addEventListener('click',()=>menu.showModal()));
document.querySelectorAll('#menu a[href]').forEach(link=>link.addEventListener('click',()=>menu.close()));
document.querySelectorAll('[data-legal]').forEach(button=>button.addEventListener('click',()=>{const privacy=button.dataset.legal==='datenschutz';document.querySelector('#legal-title').textContent=privacy?'Datenschutz':'Impressum';document.querySelector('#legal-copy').textContent=privacy?'Vorläufige Gestaltungsvorschau. Die Website setzt selbst keine Analyse- oder Marketing-Cookies. Beim Klick auf „Weiter zur Buchung“ wird das externe Smoobu-Buchungsformular geladen. Dabei werden Verbindungsdaten an Smoobu und dessen technische Dienstleister übertragen. Daten, die Sie im Smoobu-Formular eingeben, werden dort zur Buchungsabwicklung verarbeitet. Die eingebettete Google-Karte stellt eine Verbindung zu Google her; dabei erhält Google unter anderem Ihre IP-Adresse. Externe Links öffnen die Seiten der jeweiligen Anbieter. Die vollständigen Angaben zum Verantwortlichen, Hosting und zur Buchungs- und Zahlungsabwicklung werden vor dem Buchungsstart ergänzt.':'Die Betreiberangaben, ladungsfähige Anschrift und Kontaktinformationen werden vor dem öffentlichen Start ergänzt. Diese Gestaltungsvorschau ist noch kein freigegebener Buchungsauftritt.';document.querySelector('#legal').showModal();}));
const quickApartment=document.querySelector('#quick-apartment');
const mainApartment=document.querySelector('#apartment');
const dockForm=document.querySelector('.dock-booking');
const mobileBooking=document.querySelector('.dock-mobile');
function updateMobileBooking(){
 if(!mobileBooking||!dockForm)return;
 const query=new URLSearchParams({apartment:dockForm.dataset.apartment||'apartment1',guests:dockForm.elements.guests?.value||'2'});
 for(const field of ['arrival','departure'])if(dockForm.elements[field]?.value)query.set(field,dockForm.elements[field].value);
 mobileBooking.href='buchen.html?'+query.toString();
}
function syncApartment(unit){
 if(!['apartment1','apartment2'].includes(unit))return;
 const target=unit==='apartment2'?'apartment-2.html':'apartment-1.html';
 if(quickApartment)quickApartment.value=target;
 if(dockForm)dockForm.dataset.apartment=unit;
 if(mainApartment)mainApartment.value=unit;
 updateMobileBooking();
}
if(quickApartment)syncApartment(quickApartment.value==='apartment-2.html'?'apartment2':'apartment1');
quickApartment?.addEventListener('change',()=>syncApartment(quickApartment.value==='apartment-2.html'?'apartment2':'apartment1'));
mainApartment?.addEventListener('change',()=>syncApartment(mainApartment.value));
menu?.addEventListener('click',event=>{if(event.target!==menu)return;const bounds=menu.getBoundingClientRect();if(event.clientX<bounds.left || event.clientX>bounds.right || event.clientY<bounds.top || event.clientY>bounds.bottom)menu.close();});

const stayForms=[...document.querySelectorAll('.stay-form')];
stayForms.forEach(source=>{
 ['arrival','departure'].forEach(field=>source.elements[field].addEventListener('change',()=>{
  stayForms.forEach(target=>{
   if(target===source)return;
   target.elements.arrival.value=source.elements.arrival.value;
   target.elements.departure.value=source.elements.departure.value;
   target.elements.departure.min=source.elements.departure.min;
  });
  updateMobileBooking();
 }));
});

// Keep the guest count consistent across all booking entry points.
stayForms.forEach(source=>source.elements.guests?.addEventListener('change',()=>{
 const guests=source.elements.guests.value;
 if(!['1','2','3','4'].includes(guests))return;
 stayForms.forEach(target=>{if(target.elements.guests)target.elements.guests.value=guests;});
 updateMobileBooking();
}));
// Contact links become active only after the owner's actual details are supplied.
document.querySelectorAll('[data-contact]').forEach(link=>{
 const kind=link.dataset.contact;
 const value=String(kind==='phone'?config.contactPhone||'':config.contactEmail||'').trim();
 const valid=kind==='phone'?/^\+?[\d\s()/.-]{6,}$/.test(value):/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
 if(!valid)return;
 link.href=kind==='phone'?'tel:'+value.replace(/[^+\d]/g,''):'mailto:'+value;
 link.querySelector('[data-contact-value]').textContent=value;
 link.removeAttribute('aria-disabled');
});
