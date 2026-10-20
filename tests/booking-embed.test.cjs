const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../public');
const config={bookingEnabled:true,bookingUrl:'https://booking.smoobu.com/9A1926791',bookingEmbedUrl:'https://login.smoobu.com/de/booking-tool/iframe/1926791'};
function fixture(){
 const nodes={},scripts=[],initialized=[],timers=[];let mutation;
 function node(id){return nodes[id]??={id,hidden:id==='smoobu-embed-shell',textContent:'',listeners:{},attrs:{},setAttribute(k,v){this.attrs[k]=v;},removeAttribute(k){delete this.attrs[k]},focus(){},addEventListener(k,f){this.listeners[k]=f},querySelector(){return nodes.frame||null},classList:{add(){},remove(){}}};}
 const document={getElementById:node,querySelector:s=>s==='#journey-form'?form:node(s.slice(1)),head:{appendChild(s){scripts.push(s)}},createElement(){return {}}};
 const form={elements:{apartment:{value:'apartment1'},guests:{value:'2'},arrival:{value:'',focus(){}},departure:{value:''}},listeners:{},addEventListener(k,f){this.listeners[k]=f}};
 const ctx={document,URL,URLSearchParams,Date,console,setTimeout:f=>{timers.push(f);return timers.length},clearTimeout(){},MutationObserver:class{constructor(f){mutation=f}observe(){}disconnect(){}},window:null};ctx.window=ctx;ctx.location={search:'?apartment=apartment2&arrival=2030-01-10&departure=2030-01-12&guests=4'};ctx.history={replaceState(){}};ctx.ALTSTADT_CONFIG=config;ctx.ALTSTADT_APARTMENTS={apartment1:{name:'Altstadt Living',image:'one.jpg',imageAlt:'Living',summary:'70 m²',childPolicy:'Adults'},apartment2:{name:'Altstadt Living Deluxe',image:'two.jpg',imageAlt:'Deluxe',summary:'80 m²',childPolicy:'Children welcome'}};
 vm.createContext(ctx);vm.runInContext(fs.readFileSync(root+'/booking-embed.js','utf8'),ctx);
 return {ctx,node,nodes,scripts,initialized,form,timers,provider(){ctx.BookingToolIframe={initialize(o){initialized.push(o);node('frame');mutation?.();}}}};
}
const f=fixture();vm.runInContext(fs.readFileSync(root+'/booking.js','utf8'),f.ctx);
assert.equal(f.scripts.length,0,'No external script before explicit submit');
assert.equal(f.node('summary-title').textContent,'Altstadt Living Deluxe');assert.equal(f.node('summary-guests').textContent,'4 Gäste');
f.form.listeners.submit({preventDefault(){}});assert.equal(f.scripts.length,1);assert.equal(f.scripts[0].src,'https://login.smoobu.com/js/Settings/BookingToolIframe.js');assert.equal(f.node('provider-link').href,config.bookingUrl);assert.equal(f.node('provider-panel').hidden,false);
f.provider();f.scripts[0].onload();assert.equal(f.initialized.length,1);assert.equal(f.initialized[0].url,config.bookingEmbedUrl);assert.equal(f.initialized[0].target,'#apartmentIframeAll');assert.match(f.node('frame').attrs.title,/Smoobu/);f.node('frame').listeners.load();assert.equal(f.node('embed-loading').hidden,true);
f.node('edit-stay').listeners.click();assert.equal(f.node('provider-panel').hidden,true);f.form.listeners.submit({preventDefault(){}});assert.equal(f.scripts.length,1);assert.equal(f.initialized.length,1,'No duplicate widget initialization');
const bad=fixture();bad.ctx.AltstadtBookingEmbed.mount({...config,bookingEmbedUrl:'https://evil.example'});assert.equal(bad.scripts.length,0);
const error=fixture();error.ctx.AltstadtBookingEmbed.mount(config);error.scripts[0].onerror();assert.match(error.node('embed-loading').textContent,/neuen Tab/);
const timeout=fixture();timeout.ctx.AltstadtBookingEmbed.mount(config);timeout.timers[0]();assert.match(timeout.node('embed-loading').textContent,/neuen Tab/);
const disabled=fixture();disabled.ctx.AltstadtBookingEmbed.mount({...config,bookingEnabled:false});assert.equal(disabled.scripts.length,0);
const invalidStay=fixture();vm.runInContext(fs.readFileSync(root+'/booking.js','utf8'),invalidStay.ctx);invalidStay.form.elements.guests.value='5';invalidStay.form.listeners.submit({preventDefault(){}});assert.equal(invalidStay.scripts.length,0);assert.match(invalidStay.node('journey-error').textContent,/1 bis 4/);
console.log('Smoobu integration: explicit loading, correct account URL, selection preserved, iframe title, edit/reopen, URL validation, timeout/error fallback and invalid input checks passed. No booking submitted.');
