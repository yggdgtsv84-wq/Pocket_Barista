import { createClient } from '@supabase/supabase-js';
import './journal.css';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';
const supabase = SUPABASE_URL && SUPABASE_KEY ? createClient(SUPABASE_URL, SUPABASE_KEY) : null;
const STORAGE_KEY = 'pocket-barista-journal-v1';
let entries = loadLocal();
let user = null;
let cloudAvailable = false;

function esc(v=''){return String(v).replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]))}
function loadLocal(){try{return JSON.parse(localStorage.getItem(STORAGE_KEY)||'[]')}catch{return[]}}
function persistLocal(){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(entries))}catch{}}
function uid(){return crypto?.randomUUID?.()||`${Date.now()}-${Math.random().toString(16).slice(2)}`}
function dateLabel(value){const d=new Date(value);return Number.isNaN(d.getTime())?'':new Intl.DateTimeFormat('en-AU',{day:'numeric',month:'short',year:'numeric'}).format(d)}
function stars(n){const r=Math.max(0,Math.min(5,Number(n)||0));return '★'.repeat(r)+'☆'.repeat(5-r)}

async function loadCloud(){
 if(!supabase||!user)return false;
 const {data,error}=await supabase.from('coffee_journal').select('*').order('created_at',{ascending:false});
 if(error)return false;
 entries=(data||[]).map(x=>({id:x.id,title:x.title,bean:x.bean,roaster:x.roaster,origin:x.origin,recipe:x.recipe,brew_method:x.brew_method,dose:x.dose,water:x.water,grind:x.grind,temperature:x.temperature,tasting_notes:x.tasting_notes,changes:x.changes,rating:x.rating,created_at:x.created_at,updated_at:x.updated_at}));
 persistLocal();
 cloudAvailable=true;
 return true;
}

function render(){
 const existing=document.querySelector('#journalView');
 if(existing)existing.remove();
 const wrap=document.createElement('div');wrap.id='journalView';wrap.className='journal-backdrop';
 wrap.innerHTML=`<section class="journal-shell" role="dialog" aria-modal="true" aria-label="Coffee Journal">
 <header class="journal-head"><div><span class="eyebrow">BREW MEMORY</span><h1>Coffee Journal</h1><p>Keep the details that make the next cup better.</p></div><button class="close" id="journalClose">×</button></header>
 <div class="journal-toolbar"><button class="primary" id="journalNew">+ New entry</button><span>${entries.length} ${entries.length===1?'entry':'entries'}</span></div>
 <div class="journal-list">${entries.length?entries.map(entryCard).join(''):`<div class="journal-empty"><div>✦</div><h2>Nothing logged yet.</h2><p>Record a bean, the recipe you used, what you tasted and what you want to change next time.</p><button class="secondary" id="journalEmptyNew">Start your first entry</button></div>`}</div>
 </section>`;
 document.body.appendChild(wrap);
 document.querySelector('#journalClose').onclick=closeJournal;
 document.querySelector('#journalNew')?.addEventListener('click',()=>openEditor());
 document.querySelector('#journalEmptyNew')?.addEventListener('click',()=>openEditor());
 wrap.addEventListener('click',e=>{if(e.target===wrap)closeJournal();const edit=e.target.closest('[data-journal-edit]');if(edit)openEditor(edit.dataset.journalEdit);const del=e.target.closest('[data-journal-delete]');if(del)removeEntry(del.dataset.journalDelete)});
}

function entryCard(e){return `<article class="journal-card"><div class="journal-card-top"><div><span class="journal-date">${dateLabel(e.created_at)}</span><h2>${esc(e.title||e.bean||'Coffee log')}</h2><p>${esc([e.roaster,e.origin].filter(Boolean).join(' · ')||'Bean details not added')}</p></div><div class="journal-rating" aria-label="${e.rating||0} out of 5">${stars(e.rating)}</div></div><div class="journal-facts">${e.recipe?`<span><b>RECIPE</b>${esc(e.recipe)}</span>`:''}${e.brew_method?`<span><b>METHOD</b>${esc(e.brew_method)}</span>`:''}${e.dose?`<span><b>DOSE</b>${esc(e.dose)}g</span>`:''}${e.water?`<span><b>WATER</b>${esc(e.water)}g</span>`:''}${e.grind?`<span><b>GRIND</b>${esc(e.grind)}</span>`:''}${e.temperature?`<span><b>TEMP</b>${esc(e.temperature)}°C</span>`:''}</div>${e.tasting_notes?`<div class="journal-note"><b>TASTING NOTES</b><p>${esc(e.tasting_notes)}</p></div>`:''}${e.changes?`<div class="journal-note next"><b>NEXT TIME</b><p>${esc(e.changes)}</p></div>`:''}<div class="journal-card-actions"><button class="secondary" data-journal-edit="${esc(e.id)}">Edit</button><button class="ghost" data-journal-delete="${esc(e.id)}">Delete</button></div></article>`}

function openEditor(id){
 const existing=entries.find(x=>x.id===id)||{id:'',title:'',bean:'',roaster:'',origin:'',recipe:'',brew_method:'',dose:'',water:'',grind:'',temperature:'',tasting_notes:'',changes:'',rating:0};
 const modal=document.createElement('div');modal.id='journalEditor';modal.className='journal-editor-backdrop';
 modal.innerHTML=`<form class="journal-editor"><button type="button" class="close" id="journalEditorClose">×</button><span class="eyebrow">${id?'EDIT ENTRY':'NEW ENTRY'}</span><h2>Log the cup.</h2><div class="journal-grid"><label>Entry title<input name="title" value="${esc(existing.title)}" placeholder="Sunday morning V60"></label><label>Bean<input name="bean" value="${esc(existing.bean)}" placeholder="Ethiopia Guji"></label><label>Roaster<input name="roaster" value="${esc(existing.roaster)}" placeholder="Roaster name"></label><label>Origin / lot<input name="origin" value="${esc(existing.origin)}" placeholder="Guji · Hambela"></label><label>Recipe used<input name="recipe" value="${esc(existing.recipe)}" placeholder="James Hoffmann V60"></label><label>Method<input name="brew_method" value="${esc(existing.brew_method)}" placeholder="Pour Over"></label><label>Dose (g)<input name="dose" type="number" step="0.1" value="${esc(existing.dose)}"></label><label>Water (g)<input name="water" type="number" step="0.1" value="${esc(existing.water)}"></label><label>Grind<input name="grind" value="${esc(existing.grind)}" placeholder="Medium-fine"></label><label>Temperature °C<input name="temperature" type="number" step="1" value="${esc(existing.temperature)}"></label></div><label>Tasting notes<textarea name="tasting_notes" rows="4" placeholder="Floral, stone fruit, tea-like, drying…">${esc(existing.tasting_notes)}</textarea></label><label>Change next time<textarea name="changes" rows="4" placeholder="Grind a touch finer, lower the final pour, extend drawdown…">${esc(existing.changes)}</textarea></label><fieldset><legend>Rating</legend><div class="journal-stars">${[1,2,3,4,5].map(n=>`<label><input type="radio" name="rating" value="${n}" ${Number(existing.rating)===n?'checked':''}><span>${n}</span></label>`).join('')}</div></fieldset><div class="actions"><button type="button" class="secondary" id="journalEditorCancel">Cancel</button><button type="submit" class="primary">Save entry</button></div><p class="journal-storage-note">${cloudAvailable?'Synced to your coffee journal.':'Saved on this device. Cloud journal sync can be enabled when the journal table is added.'}</p></form>`;
 document.body.appendChild(modal);
 const close=()=>modal.remove();modal.querySelector('#journalEditorClose').onclick=close;modal.querySelector('#journalEditorCancel').onclick=close;
 modal.addEventListener('click',e=>{if(e.target===modal)close()});
 modal.querySelector('form').onsubmit=async e=>{e.preventDefault();const fd=new FormData(e.currentTarget);const payload={id:existing.id||uid(),title:String(fd.get('title')||'').trim()||'Coffee log',bean:String(fd.get('bean')||'').trim(),roaster:String(fd.get('roaster')||'').trim(),origin:String(fd.get('origin')||'').trim(),recipe:String(fd.get('recipe')||'').trim(),brew_method:String(fd.get('brew_method')||'').trim(),dose:String(fd.get('dose')||'').trim(),water:String(fd.get('water')||'').trim(),grind:String(fd.get('grind')||'').trim(),temperature:String(fd.get('temperature')||'').trim(),tasting_notes:String(fd.get('tasting_notes')||'').trim(),changes:String(fd.get('changes')||'').trim(),rating:Number(fd.get('rating')||0),created_at:existing.created_at||new Date().toISOString(),updated_at:new Date().toISOString()};await saveEntry(payload);close();render()};
}

async function saveEntry(entry){
 const index=entries.findIndex(x=>x.id===entry.id);
 if(index>=0)entries[index]=entry;else entries.unshift(entry);
 persistLocal();
 if(supabase&&user&&cloudAvailable){const row={id:entry.id,user_id:user.id,title:entry.title,bean:entry.bean,roaster:entry.roaster,origin:entry.origin,recipe:entry.recipe,brew_method:entry.brew_method,dose:entry.dose,water:entry.water,grind:entry.grind,temperature:entry.temperature,tasting_notes:entry.tasting_notes,changes:entry.changes,rating:entry.rating,created_at:entry.created_at,updated_at:entry.updated_at};const {error}=await supabase.from('coffee_journal').upsert(row,{onConflict:'id'});if(error){cloudAvailable=false;}}
}
async function removeEntry(id){if(!confirm('Delete this journal entry?'))return;entries=entries.filter(x=>x.id!==id);persistLocal();if(supabase&&user&&cloudAvailable)await supabase.from('coffee_journal').delete().eq('id',id);render()}
function closeJournal(){document.querySelector('#journalView')?.remove()}
function addMenuItem(){const drawer=document.querySelector('.drawer');if(!drawer||drawer.querySelector('#drawerJournal'))return;const label=[...drawer.querySelectorAll('.drawer-label')].find(x=>x.textContent.trim()==='LIBRARY');const btn=document.createElement('button');btn.className='drawer-item';btn.id='drawerJournal';btn.innerHTML='<b>05</b><span>Coffee Journal</span><i>→</i>';if(label)label.insertAdjacentElement('afterend',btn);else drawer.appendChild(btn);btn.onclick=()=>{closeMenuCompat();openJournal()}}
function addHomeCard(){const grid=document.querySelector('.command-grid');if(!grid||grid.querySelector('#journalHomeCard'))return;const card=document.createElement('button');card.type='button';card.className='command-card journal-command';card.id='journalHomeCard';card.setAttribute('aria-label','Open Coffee Journal');card.innerHTML='<div class="command-copy"><h2>Coffee Journal</h2></div><b>→</b>';grid.appendChild(card);card.onclick=openJournal}
function closeMenuCompat(){document.querySelector('#modal').innerHTML=''}
function openJournal(){closeJournal();render()}
function watchMenu(){addMenuItem();addHomeCard();new MutationObserver(()=>{addMenuItem();addHomeCard()}).observe(document.body,{childList:true,subtree:true})}

(async()=>{if(supabase){const {data}=await supabase.auth.getSession();user=data.session?.user||null;cloudAvailable=!!user&&await loadCloud();supabase.auth.onAuthStateChange(async(_,session)=>{user=session?.user||null;if(user)await loadCloud();else cloudAvailable=false})}watchMenu()})();
