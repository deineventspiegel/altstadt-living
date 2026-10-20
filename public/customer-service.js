(() => {
  'use strict';
  const kb=window.ALTSTADT_SERVICE;
  const trigger=document.getElementById('service-open');
  if(!kb||!trigger)return;
  const dialog=document.createElement('dialog');
  dialog.id='customer-service';
  dialog.className='service-dialog';
  dialog.setAttribute('aria-labelledby','service-title');
  dialog.innerHTML=`<div class="service-heading"><div class="service-symbol" aria-hidden="true">${trigger.querySelector('svg').outerHTML}</div><div><p class="eyebrow">Altstadt Living</p><h2 id="service-title">Kundenservice</h2><p class="service-subtitle">Automatischer FAQ-Assistent</p></div><button class="service-close" type="button" aria-label="Kundenservice schließen">×</button></div><div class="service-property"><label for="service-apartment">Ihr Apartment</label><select id="service-apartment"><option value="apartment1">Altstadt Living</option><option value="apartment2">Altstadt Living Deluxe</option></select></div><div class="service-conversation" role="log" aria-label="Chatverlauf" aria-live="polite" aria-relevant="additions"></div><div class="service-topics" aria-label="Häufige Themen"></div><div class="service-links"><a class="service-book" href="buchen.html">Preise & freie Termine prüfen ↗</a><a class="service-details" href="apartment-1.html">Apartment ansehen</a></div><form class="service-form"><label for="service-question" class="service-sr-only">Ihre Frage</label><input id="service-question" name="question" placeholder="Was möchten Sie wissen?" maxlength="600" autocomplete="off" required><button type="submit" aria-label="Frage senden">↑</button></form><p class="service-disclosure">Allgemeine Auskünfte, kein Live-Chat. Bitte keine persönlichen Buchungs- oder Zahlungsdaten eingeben.</p><button class="service-reset" type="button">Verlauf löschen</button>`;
  document.body.append(dialog);
  const select=dialog.querySelector('select'),log=dialog.querySelector('[role="log"]'),input=dialog.querySelector('input'),form=dialog.querySelector('form');
  const initial=new URLSearchParams(location.search).get('apartment');
  select.value=kb.apartments[initial]?initial:location.pathname.endsWith('apartment-2.html')?'apartment2':'apartment1';
  function links(){
    const params=new URLSearchParams({apartment:select.value});
    const source=document.querySelector('.dock-booking')||document.querySelector('.stay-form');
    for(const name of ['arrival','departure','guests']){
      const value=source?.elements[name]?.value||new URLSearchParams(location.search).get(name);
      if(value&&((name==='guests'&&/^[1-4]$/.test(value))||(name!=='guests'&&/^\d{4}-\d{2}-\d{2}$/.test(value))))params.set(name,value);
    }
    dialog.querySelector('.service-book').href='buchen.html?'+params;
    dialog.querySelector('.service-details').href=kb.apartments[select.value].page;
  }
  function append(text,kind){
    const message=document.createElement('div');message.className='service-message '+kind;
    const label=document.createElement('span');label.className='service-message-label';label.textContent=kind==='guest'?'Sie':'Kundenservice';
    const p=document.createElement('p');p.textContent=text;message.append(label,p);log.append(message);
    while(log.children.length>40)log.firstElementChild.remove();
    if(dialog.open)message.scrollIntoView({block:'nearest',behavior:'instant'});
  }
  function welcome(){log.replaceChildren();append('Schön, dass Sie da sind. Ich helfe Ihnen mit Informationen zu unseren beiden Apartments. Worum geht es bei Ihrer Reise?','assistant');}
  function ask(question){
    const value=question.trim().slice(0,600);if(!value)return;
    append(value,'guest');const result=kb.resolve(value,select.value);select.value=result.apartment;links();append(result.text,'assistant');
  }
  kb.topics.forEach(topic=>{
    const button=document.createElement('button');button.type='button';button.textContent=topic.label;
    button.addEventListener('click',()=>{append(topic.label,'guest');append(topic.answer(kb.apartments[select.value]),'assistant');links();});
    dialog.querySelector('.service-topics').append(button);
  });
  form.addEventListener('submit',e=>{e.preventDefault();ask(input.value);input.value='';input.focus();});
  select.addEventListener('change',()=>{links();append(`Ihre nächsten Fragen beziehen sich auf ${kb.apartments[select.value].name}.`,'assistant');});
  trigger.addEventListener('click',()=>{document.querySelector('#menu[open]')?.close();links();dialog.showModal();trigger.setAttribute('aria-expanded','true');input.focus();});
  dialog.querySelector('.service-close').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('close',()=>{trigger.setAttribute('aria-expanded','false');trigger.focus();});
  dialog.addEventListener('click',e=>{if(e.target!==dialog)return;const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();});
  dialog.querySelector('.service-reset').addEventListener('click',()=>{welcome();input.value='';input.focus();});
  // Conversation stays in this page's memory only; no network requests or storage.
  welcome();links();
})();
