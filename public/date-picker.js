(function(){
 'use strict';
 const iso=d=>d.toISOString().slice(0,10);
 const parse=s=>/^\d{4}-\d{2}-\d{2}$/.test(s||'')&&Number.isFinite(Date.parse(s+'T12:00:00Z'))&&iso(new Date(s+'T12:00:00Z'))===s?new Date(s+'T12:00:00Z'):null;
 const add=(s,n)=>{const d=parse(s);if(!d)return '';d.setUTCDate(d.getUTCDate()+n);return iso(d);};
 const nights=(a,b)=>parse(a)&&parse(b)?Math.round((parse(b)-parse(a))/86400000):0;
 const valid=(a,b,min,max)=>!!(parse(a)&&parse(b)&&a>=min&&b>a&&(!max||b<=max));
 const monthShift=(s,n)=>{const d=parse(s);d.setUTCDate(1);d.setUTCMonth(d.getUTCMonth()+n);return iso(d);};
 if(typeof module!=='undefined'&&module.exports)module.exports={parse,add,nights,valid,monthShift};
 if(typeof document==='undefined')return;
 const inputs=[...document.querySelectorAll('input[type="date"][name="arrival"],input[type="date"][name="departure"]')];
 if(!inputs.length)return;
 const dateText=s=>parse(s)?new Intl.DateTimeFormat('de-DE',{day:'2-digit',month:'2-digit',year:'numeric',timeZone:'UTC'}).format(parse(s)):'Datum wählen';
 const fullText=s=>new Intl.DateTimeFormat('de-DE',{weekday:'long',day:'numeric',month:'long',year:'numeric',timeZone:'UTC'}).format(parse(s));
 const monthText=s=>new Intl.DateTimeFormat('de-DE',{month:'long',year:'numeric',timeZone:'UTC'}).format(parse(s));
 const today=()=>{const parts=new Intl.DateTimeFormat('en-CA',{year:'numeric',month:'2-digit',day:'2-digit',timeZone:'Europe/Berlin'}).formatToParts(new Date());const get=t=>parts.find(p=>p.type===t).value;return `${get('year')}-${get('month')}-${get('day')}`;};
 const icon='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><rect x="4" y="5" width="16" height="16" rx="4"/><path d="M8 3v4m8-4v4M4 11h16"/></svg>';
 const dialog=document.createElement('dialog');dialog.className='date-dialog';dialog.id='stay-calendar';dialog.setAttribute('aria-labelledby','calendar-title');
 dialog.innerHTML='<div class="calendar-heading"><div><p>IHRE ZEIT IN DÜSSELDORF</p><h2 id="calendar-title">Wann reisen Sie?</h2></div><button type="button" class="calendar-close" aria-label="Kalender schließen">×</button></div><div class="calendar-selection"><button type="button" data-field="arrival"><span>Anreise</span><strong>Datum wählen</strong></button><button type="button" data-field="departure"><span>Abreise</span><strong>Datum wählen</strong></button></div><p class="calendar-hint" role="status"></p><div class="calendar-toolbar"><button type="button" class="calendar-prev" aria-label="Vorheriger Monat">‹</button><span>Reisezeitraum auswählen</span><button type="button" class="calendar-next" aria-label="Nächster Monat">›</button></div><div class="calendar-months"></div><div class="calendar-bottom"><div><strong class="calendar-nights">Ihre Reisedaten</strong><small>Preise & Verfügbarkeit im nächsten Schritt</small></div><button type="button" class="calendar-apply">Übernehmen</button></div>';
 document.body.append(dialog);
 const months=dialog.querySelector('.calendar-months'),apply=dialog.querySelector('.calendar-apply');
 let active=null,start='',end='',mode='arrival',month='',minimum='',maximum='',focusDate='';
 const buttons=new Map();
 const visibleMonths=()=>window.matchMedia('(max-width:640px)').matches?1:2;
 function render(){
  dialog.querySelectorAll('[data-field]').forEach(b=>{const isStart=b.dataset.field==='arrival';b.classList.toggle('is-active',b.dataset.field===mode);b.setAttribute('aria-pressed',String(b.dataset.field===mode));b.querySelector('strong').textContent=dateText(isStart?start:end);});
  dialog.querySelector('.calendar-hint').textContent=mode==='arrival'?'Wählen Sie den Tag Ihrer Anreise.':'Wählen Sie einen Abreisetag nach Ihrer Anreise.';
  dialog.querySelector('.calendar-prev').disabled=month<=minimum.slice(0,7)+'-01';
  dialog.querySelector('.calendar-next').disabled=!!maximum&&monthShift(month,visibleMonths())>maximum;
  months.replaceChildren();
  for(let n=0;n<visibleMonths();n++){
   const first=monthShift(month,n),date=parse(first),offset=(date.getUTCDay()+6)%7;
   const days=new Date(Date.UTC(date.getUTCFullYear(),date.getUTCMonth()+1,0)).getUTCDate();
   const panel=document.createElement('section');panel.className='calendar-month';
   const title=document.createElement('h3');title.textContent=monthText(first);panel.append(title);
   const week=document.createElement('div');week.className='calendar-week';week.setAttribute('aria-hidden','true');
   for(const text of ['Mo','Di','Mi','Do','Fr','Sa','So']){const span=document.createElement('span');span.textContent=text;week.append(span);}panel.append(week);
   const grid=document.createElement('div');grid.className='calendar-grid';grid.setAttribute('role','group');grid.setAttribute('aria-label',monthText(first));
   for(let i=0;i<offset;i++){const blank=document.createElement('span');blank.setAttribute('aria-hidden','true');grid.append(blank);}
   for(let day=1;day<=days;day++){
    const value=add(first,day-1),b=document.createElement('button');b.type='button';b.textContent=day;b.dataset.date=value;
    b.setAttribute('aria-label',fullText(value));b.disabled=value<minimum||(!!maximum&&value>maximum)||(mode==='departure'&&!!start&&value<=start);
    b.classList.toggle('range-start',value===start);b.classList.toggle('range-end',value===end);b.classList.toggle('in-range',!!start&&!!end&&value>start&&value<end);
    b.setAttribute('aria-pressed',String(value===start||value===end));
    if(value===today())b.setAttribute('aria-current','date');
    b.tabIndex=-1;
    b.addEventListener('click',()=>choose(value));b.addEventListener('keydown',e=>keyboard(e,value));grid.append(b);
   }
   panel.append(grid);months.append(panel);
  }
  const enabled=[...months.querySelectorAll('button:not(:disabled)')];
  const target=enabled.find(b=>b.dataset.date===focusDate)||enabled.find(b=>b.dataset.date===(mode==='arrival'?start:end))||enabled[0];
  if(target)target.tabIndex=0;
  const count=nights(start,end);dialog.querySelector('.calendar-nights').textContent=count>0?count+(count===1?' Nacht':' Nächte'):'Ihre Reisedaten';
  apply.disabled=!valid(start,end,minimum,maximum);
 }
 function choose(value){
  if(mode==='arrival'){start=value;if(!end||end<=start)end='';mode='departure';focusDate=add(start,1);}
  else{end=value;focusDate=value;}
  render();const focused=months.querySelector(`button[data-date="${focusDate}"]:not(:disabled)`);(focused||apply).focus();
 }
 function keyboard(e,value){
  let next;const step={ArrowLeft:-1,ArrowRight:1,ArrowUp:-7,ArrowDown:7};
  if(e.key in step)next=add(value,step[e.key]);
  else if(e.key==='Home')next=add(value,-((parse(value).getUTCDay()+6)%7));
  else if(e.key==='End')next=add(value,6-((parse(value).getUTCDay()+6)%7));
  else if(e.key==='PageUp'||e.key==='PageDown')next=monthShift(value,e.key==='PageUp'?-1:1);
  else return;
  e.preventDefault();const floor=mode==='departure'&&start?add(start,1):minimum;
  if(next<floor)next=floor;if(maximum&&next>maximum)next=maximum;
  if(next<month||next>=monthShift(month,visibleMonths()))month=next.slice(0,7)+'-01';
  focusDate=next;render();months.querySelector(`button[data-date="${next}"]`)?.focus();
 }
 function refresh(){for(const [field,button]of buttons){button.querySelector('span').textContent=dateText(field.value);button.classList.toggle('has-value',!!field.value);button.setAttribute('aria-label',`${field.name==='arrival'?'Anreise':'Abreise'}: ${dateText(field.value)}`);}}
 function open(field){
  active=field;const form=field.form;start=form.elements.arrival.value;end=form.elements.departure.value;
  minimum=form.elements.arrival.min||today();if(minimum<today())minimum=today();maximum=form.elements.departure.max||'';
  if(start<minimum){start='';end='';}
  mode=field.name==='departure'&&start?'departure':'arrival';
  focusDate=(mode==='departure'?(end||add(start,1)):start)||minimum;month=focusDate.slice(0,7)+'-01';
  render();dialog.showModal();months.querySelector('button[tabindex="0"]')?.focus();
 }
 for(const field of inputs){
  const button=document.createElement('button');button.type='button';button.className='date-trigger';button.id=field.id+'-picker';button.innerHTML='<span></span>'+icon;button.setAttribute('aria-haspopup','dialog');button.setAttribute('aria-controls','stay-calendar');
  field.classList.add('date-native');field.tabIndex=-1;
  for(const label of field.labels)label.htmlFor=button.id;
  field.insertAdjacentElement('afterend',button);buttons.set(field,button);button.addEventListener('click',()=>open(field));
  field.addEventListener('invalid',event=>{event.preventDefault();if(!dialog.open)open(field);});
  field.addEventListener('focus',()=>{if(!dialog.open)open(field);});
 }
 document.addEventListener('change',refresh);
 dialog.querySelectorAll('[data-field]').forEach(b=>b.addEventListener('click',()=>{mode=b.dataset.field;if(mode==='departure'&&!start)mode='arrival';focusDate='';render();}));
 dialog.querySelector('.calendar-prev').addEventListener('click',()=>{month=monthShift(month,-1);focusDate='';render();});
 dialog.querySelector('.calendar-next').addEventListener('click',()=>{month=monthShift(month,1);focusDate='';render();});
 dialog.querySelector('.calendar-close').addEventListener('click',()=>dialog.close());
 dialog.addEventListener('close',()=>{buttons.get(active)?.focus();});
 dialog.addEventListener('click',e=>{if(e.target!==dialog)return;const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();});
 apply.addEventListener('click',()=>{
  if(!active||!valid(start,end,minimum,maximum))return;
  const fields=active.form.elements;
  fields.arrival.value=start;fields.arrival.dispatchEvent(new Event('change',{bubbles:true}));
  fields.departure.value=end;fields.departure.dispatchEvent(new Event('change',{bubbles:true}));
  refresh();dialog.close();
 });
 window.addEventListener('resize',()=>{if(dialog.open)render();});
 refresh();
})();
