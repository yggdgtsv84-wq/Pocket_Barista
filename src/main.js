import './style.css';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';
const supabase = SUPABASE_URL && SUPABASE_KEY ? createClient(SUPABASE_URL, SUPABASE_KEY) : null;

const state = { user: null, recipes: [], timer: 180, timerRunning: false, timerId: null, editingId: null };
const app = document.querySelector('#app');

const esc = (value = '') => String(value).replace(/[&<>'"]/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;' }[c]));
const ratio = () => Number(document.querySelector('#coffee')?.value || 0) ? Number(document.querySelector('#water')?.value || 0) / Number(document.querySelector('#coffee')?.value || 1) : 0;
const fmtTime = s => `${String(Math.floor(s / 60)).padStart(2,'0')}:${String(s % 60).padStart(2,'0')}`;

function render() {
  app.innerHTML = `
    <header class="topbar">
      <div><span class="eyebrow">POCKET BARISTA</span><h1>Brew better, anywhere.</h1></div>
      <button class="icon-btn" id="authBtn" aria-label="Account">${state.user ? '↪' : '☕'}</button>
    </header>
    <main>
      <section class="hero card">
        <div><p class="eyebrow">TODAY'S BREW</p><h2>Dial in your cup.</h2><p class="muted">Calculate your recipe, start the timer, then save what worked.</p></div>
        <div class="bean-mark">☕</div>
      </section>

      <section class="section-head"><div><p class="eyebrow">BREW CALCULATOR</p><h2>Your recipe</h2></div><span class="pill" id="ratioPill">1:${ratio() ? ratio().toFixed(1) : '16.0'}</span></section>
      <section class="card calculator">
        <div class="grid two">
          <label>Coffee (g)<input id="coffee" type="number" min="1" step="0.1" value="20"></label>
          <label>Water (g)<input id="water" type="number" min="1" step="1" value="320"></label>
        </div>
        <div class="grid two">
          <label>Method<select id="method"><option>Pour Over</option><option>AeroPress</option><option>French Press</option><option>Espresso</option><option>Cold Brew</option></select></label>
          <label>Grind<select id="grind"><option>Medium-fine</option><option>Fine</option><option>Medium</option><option>Medium-coarse</option><option>Coarse</option></select></label>
        </div>
        <div class="grid two">
          <label>Temperature (°C)<input id="temp" type="number" value="94"></label>
          <label>Brew time (sec)<input id="brewTime" type="number" value="180"></label>
        </div>
        <label>Recipe name<input id="recipeName" placeholder="e.g. Sunday V60"></label>
        <label>Tasting notes<textarea id="notes" rows="3" placeholder="Sweet, juicy, clean…"></textarea></label>
        <div class="actions"><button class="primary" id="saveBtn">Save recipe</button><button class="secondary" id="resetBtn">Reset</button></div>
      </section>

      <section class="section-head"><div><p class="eyebrow">BREW TIMER</p><h2>Stay in the moment.</h2></div></section>
      <section class="card timer-card"><div class="timer" id="timer">${fmtTime(state.timer)}</div><div class="timer-actions"><button class="primary" id="timerToggle">${state.timerRunning ? 'Pause' : 'Start'}</button><button class="secondary" id="timerReset">Reset</button></div></section>

      <section class="section-head"><div><p class="eyebrow">MY RECIPES</p><h2>Saved brews</h2></div></section>
      <section id="recipes" class="recipe-list">${recipeMarkup()}</section>
    </main>
    <nav class="bottom-nav"><a class="active" href="#top">☕<span>Brew</span></a><a href="#recipes">▤<span>Recipes</span></a><button id="navTimer">◷<span>Timer</span></button></nav>
    <div id="modal"></div>
  `;
  bind();
}

function recipeMarkup() {
  if (!state.user) return `<div class="empty card"><div class="empty-icon">☕</div><h3>Your recipe book is waiting.</h3><p class="muted">Sign in to save your favourite brews across devices.</p><button class="primary" id="emptyAuth">Sign in / create account</button></div>`;
  if (!state.recipes.length) return `<div class="empty card"><div class="empty-icon">✦</div><h3>No saved recipes yet.</h3><p class="muted">Dial in the calculator above and save your first brew.</p></div>`;
  return state.recipes.map(r => `<article class="recipe card"><div><div class="recipe-title">${esc(r.name)}</div><div class="muted">${esc(r.method)} · ${r.coffee_g}g coffee · ${r.water_g}g water</div><div class="recipe-meta">1:${Number(r.ratio || r.water_g / r.coffee_g).toFixed(1)} · ${esc(r.grind || '—')} · ${r.temperature_c || '—'}°C</div></div><div class="recipe-actions"><button data-load="${r.id}" title="Load">↺</button><button data-delete="${r.id}" title="Delete">×</button></div></article>`).join('');
}

async function bind() {
  document.querySelector('#coffee').addEventListener('input', updateRatio);
  document.querySelector('#water').addEventListener('input', updateRatio);
  document.querySelector('#saveBtn').addEventListener('click', saveRecipe);
  document.querySelector('#resetBtn').addEventListener('click', resetForm);
  document.querySelector('#timerToggle').addEventListener('click', toggleTimer);
  document.querySelector('#timerReset').addEventListener('click', resetTimer);
  document.querySelector('#navTimer').addEventListener('click', () => document.querySelector('#timer')?.scrollIntoView({ behavior:'smooth' }));
  document.querySelector('#authBtn').addEventListener('click', openAuth);
  document.querySelector('#emptyAuth')?.addEventListener('click', openAuth);
  document.querySelectorAll('[data-load]').forEach(b => b.addEventListener('click', () => loadRecipe(b.dataset.load)));
  document.querySelectorAll('[data-delete]').forEach(b => b.addEventListener('click', () => deleteRecipe(b.dataset.delete)));
}

function updateRatio() { const r = ratio(); document.querySelector('#ratioPill').textContent = `1:${r ? r.toFixed(1) : '—'}`; }
function resetForm() { ['recipeName','notes'].forEach(id => document.querySelector('#'+id).value=''); document.querySelector('#coffee').value=20; document.querySelector('#water').value=320; document.querySelector('#temp').value=94; document.querySelector('#brewTime').value=180; updateRatio(); }

async function loadRecipes() {
  if (!supabase || !state.user) { state.recipes = []; render(); return; }
  const { data, error } = await supabase.from('recipes').select('*').order('created_at', { ascending:false });
  if (error) return toast(error.message);
  state.recipes = data || []; render();
}

async function saveRecipe() {
  if (!supabase) return toast('Connect Supabase first: add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.');
  if (!state.user) return openAuth();
  const coffee = Number(document.querySelector('#coffee').value), water = Number(document.querySelector('#water').value);
  const payload = { user_id: state.user.id, name: document.querySelector('#recipeName').value.trim() || `${document.querySelector('#method').value} recipe`, method: document.querySelector('#method').value, coffee_g: coffee, water_g: water, ratio: water / coffee, grind: document.querySelector('#grind').value, temperature_c: Number(document.querySelector('#temp').value), brew_seconds: Number(document.querySelector('#brewTime').value), notes: document.querySelector('#notes').value.trim(), rating: 0 };
  const { error } = await supabase.from('recipes').insert(payload);
  if (error) return toast(error.message);
  toast('Recipe saved ✓'); await loadRecipes();
}

function loadRecipe(id) { const r = state.recipes.find(x => x.id === id); if (!r) return; document.querySelector('#coffee').value=r.coffee_g; document.querySelector('#water').value=r.water_g; document.querySelector('#method').value=r.method; document.querySelector('#grind').value=r.grind || 'Medium'; document.querySelector('#temp').value=r.temperature_c || 94; document.querySelector('#brewTime').value=r.brew_seconds || 180; document.querySelector('#recipeName').value=r.name; document.querySelector('#notes').value=r.notes || ''; updateRatio(); window.scrollTo({top:0,behavior:'smooth'}); }
async function deleteRecipe(id) { if (!supabase || !confirm('Delete this recipe?')) return; const { error } = await supabase.from('recipes').delete().eq('id', id); if (error) return toast(error.message); await loadRecipes(); }

function openAuth() {
  if (state.user) return supabase.signOut();
  document.querySelector('#modal').innerHTML = `<div class="modal-backdrop"><div class="modal card"><button class="close" id="closeModal">×</button><p class="eyebrow">YOUR COFFEE BOOK</p><h2>Sign in</h2><p class="muted">Save recipes and access them on any device.</p><label>Email<input id="email" type="email" autocomplete="email"></label><label>Password<input id="password" type="password" autocomplete="current-password" minlength="6"></label><div class="actions"><button class="primary" id="signIn">Sign in</button><button class="secondary" id="signUp">Create account</button></div><p class="fine">No payment details. Your recipes belong to your account.</p></div></div>`;
  document.querySelector('#closeModal').onclick=closeModal; document.querySelector('#signIn').onclick=() => auth(false); document.querySelector('#signUp').onclick=() => auth(true);
}
async function auth(signUp) { if (!supabase) return toast('Supabase is not configured.'); const email=document.querySelector('#email').value.trim(), password=document.querySelector('#password').value; const result=signUp ? await supabase.auth.signUp({email,password}) : await supabase.auth.signInWithPassword({email,password}); if (result.error) return toast(result.error.message); closeModal(); if (signUp && !result.data.session) toast('Check your email to confirm your account.'); }
function closeModal() { document.querySelector('#modal').innerHTML=''; }
function toggleTimer() { state.timerRunning=!state.timerRunning; clearInterval(state.timerId); if (state.timerRunning) state.timerId=setInterval(()=>{ if(state.timer<=0){state.timerRunning=false;clearInterval(state.timerId);return;} state.timer--; renderTimerOnly(); },1000); renderTimerOnly(); }
function resetTimer() { clearInterval(state.timerId); state.timerRunning=false; state.timer=180; renderTimerOnly(); }
function renderTimerOnly(){ const el=document.querySelector('#timer'); if(el) el.textContent=fmtTime(state.timer); const b=document.querySelector('#timerToggle'); if(b) b.textContent=state.timerRunning?'Pause':'Start'; }
function toast(message) { const t=document.createElement('div'); t.className='toast'; t.textContent=message; document.body.appendChild(t); setTimeout(()=>t.remove(),3200); }

async function init() {
  render();
  if (!supabase) return;
  const { data } = await supabase.auth.getSession(); state.user=data.session?.user || null; await loadRecipes();
  supabase.auth.onAuthStateChange(async (_event, session) => { state.user=session?.user || null; await loadRecipes(); });
}
init();
if ('serviceWorker' in navigator) window.addEventListener('load', () => navigator.serviceWorker.register('/Pocket_Barista/sw.js').catch(()=>{}));
