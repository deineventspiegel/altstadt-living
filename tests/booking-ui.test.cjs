// Event-logic tests using a small DOM fixture. This is not a browser rendering test.
const {readFileSync}=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const root=require('node:path').join(__dirname,'..','public');
function attrs(s){return Object.fromEntries([...s.matchAll(/([\w-]+)="([^"]*)"/g)].map(m=>[m[1],m[2]]));}
class Element{
 constructor(a={}){this.id=a.id;this.value=a.value||'';this.min='';this.href=a.href||'';this.textContent='';this.dataset={};this.listeners={};this.open=false;this.classList={contains:n=>(a.class||'').split(' ').includes(n)};for(const k in a)if(k.startsWith('data-'))this.dataset[k.slice(5)]=a[k];}
 addEventListener(type,fn){(this.listeners[type]||=[]).push(fn);}
 fire(type,extra={}){for(const fn of this.listeners[type]||[])fn({target:this,currentTarget:this,preventDefault(){},...extra});}
 showModal(){this.open=true;} close(){this.open=false;}
 getBoundingClientRect(){return {left:500,right:980,top:16,bottom:700};}
}
function setup(file,config={}){
 const html=readFileSync(root+'/'+file,'utf8');const ids={};
 for(const match of html.matchAll(/<(input|select|button|dialog|a|p|h2)\b([^>]*)(?:>([\s\S]*?)<\/\1>)?/g)){
  const a=attrs(match[2]);if(!a.id)continue;const e=new Element(a);
  if(match[1]==='select'){
   const options=[...(match[3]||'').matchAll(/<option\b([^>]*)>/g)];
   const chosen=options.find(m=>/\bselected\b/.test(m[1]))||options[0];
   if(chosen)e.value=attrs(chosen[1]).value;
  }ids[a.id]=e;
 }
 const forms=[...html.matchAll(/<form\b([^>]*)>([\s\S]*?)<\/form>/g)].map(m=>{
  const form=new Element(attrs(m[1]));form.elements={};form.status=new Element();
  for(const field of m[2].matchAll(/<(input|select)\b([^>]*)>/g)){const a=attrs(field[2]);form.elements[a.name]=ids[a.id];}
  form.querySelector=()=>form.status;
  form.reportValidity=()=>Object.values(form.elements).every(e=>e.value && (!e.min||e.value>=e.min));
  return form;
 });
 const mobile=new Element(attrs(html.match(/<a\b([^>]*class="dock-submit dock-mobile"[^>]*)>/)[1]));
 const closes=Object.values(ids).filter(e=>false);
 const menuLink=new Element();
 const legalButtons=[];
 const single=selector=>selector==='.dock-booking'?forms.find(f=>f.classList.contains('dock-booking')):selector==='.dock-mobile'?mobile:ids[selector.slice(1)];
 const all=selector=>selector==='.stay-form'?forms:selector==='#menu-open,[data-menu-open]'?[ids['menu-open']]:selector==='#menu a[href]'?[menuLink]:selector==='dialog .close'?closes:selector==='[data-legal]'?legalButtons:[];
 const redirects=[];
 const context={window:{ALTSTADT_CONFIG:config,location:{assign:u=>redirects.push(u)}},document:{querySelector:single,querySelectorAll:all},Date,URL,URLSearchParams};
 vm.runInNewContext(readFileSync(root+'/app.js','utf8'),context,{filename:'app.js'});
 return {ids,forms,mobile,redirects,menuLink};
}
const disabled={bookingEnabled:false};
for(const file of ['index.html','apartment-1.html','apartment-2.html']){
 const ui=setup(file,disabled);const initial=file==='apartment-2.html'?'apartment-2.html':'apartment-1.html';
 assert.equal(new URL(ui.mobile.href,'https://example.test/').searchParams.get('apartment'),initial==='apartment-2.html'?'apartment2':'apartment1');
 const dock=ui.forms.find(f=>f.classList.contains('dock-booking'));
 ui.ids['quick-apartment'].value='apartment-2.html';ui.ids['quick-apartment'].fire('change');
 assert.equal(dock.dataset.apartment,'apartment2');assert.equal(new URL(ui.mobile.href,'https://example.test/').searchParams.get('apartment'),'apartment2');
 if(ui.ids.apartment){assert.equal(ui.ids.apartment.value,'apartment2');ui.ids.apartment.value='apartment1';ui.ids.apartment.fire('change');assert.equal(ui.ids['quick-apartment'].value,'apartment-1.html');}
 const first=ui.forms[0];
 for(const f of ui.forms)assert.ok(f.elements.guests,'Guest selection in every form');
 first.elements.guests.value='4';first.elements.guests.fire('change');
 for(const f of ui.forms)assert.equal(f.elements.guests.value,'4');
 first.elements.guests.value='1';first.elements.guests.fire('change');
 for(const f of ui.forms)assert.equal(f.elements.guests.value,'1');
 first.elements.arrival.value='2030-01-10';first.elements.arrival.fire('change');first.elements.departure.value='2030-01-12';first.elements.departure.fire('change');
 for(const f of ui.forms){assert.equal(f.elements.arrival.value,'2030-01-10');assert.equal(f.elements.departure.value,'2030-01-12');assert.equal(f.elements.departure.min,'2030-01-11');}
 first.elements.arrival.value='2030-01-15';first.elements.arrival.fire('change');
 for(const f of ui.forms)assert.equal(f.elements.departure.value,'');
 dock.fire('submit');assert.equal(ui.redirects.length,0);
 dock.elements.departure.value='2030-01-17';dock.elements.departure.fire('change');dock.fire('submit');
 assert.equal(ui.redirects.length,1);const route=new URL(ui.redirects[0],'https://example.test/');assert.equal(route.pathname,'/buchen.html');assert.equal(route.searchParams.get('arrival'),'2030-01-15');assert.equal(route.searchParams.get('departure'),'2030-01-17');assert.equal(route.searchParams.get('guests'),'1');
 ui.ids['menu-open'].fire('click');assert.equal(ui.ids.menu.open,true);ui.menuLink.fire('click');assert.equal(ui.ids.menu.open,false);
 ui.ids['menu-open'].fire('click');ui.ids.menu.fire('click',{clientX:100,clientY:100});assert.equal(ui.ids.menu.open,false);
 console.log(file+': selection, date sync/validation, local booking handoff and menu OK');
}
console.log('All valid submissions enter the local booking journey; no provider or payment requests made.');
