import './recipes.css';
import { createClient } from '@supabase/supabase-js';

const RECIPES_ROUTE = './?page=recipes';
const RECIPE_IMAGE = 'https://images.unsplash.com/photo-1613158556069-e7d8eae76214?auto=format&fit=crop&fm=jpg&q=82&w=1800';
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';
const supabase = SUPABASE_URL && SUPABASE_KEY ? createClient(SUPABASE_URL, SUPABASE_KEY) : null;

const esc = value => String(value ?? '').replace(/[&<>'\"]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','\"':'&quot;'}[char]));

function addHomeCard(){
  const journal=document.querySelector('#journalHomeCard');
  const grid=document.querySelector('.command-grid');
  if(!journal||!grid||grid.querySelector('#recipesHomeCard'))return;
  const card=document.createElement('a');
  card.className='command-card recipes-command';
  card.id='recipesHomeCard';
  card.href=RECIPES_ROUTE;
  card.setAttribute('aria-label','Open My Recipes');
  card.innerHTML=`<img class="recipes-card-image" src="${RECIPE_IMAGE}" alt="Dark coffee in a black ceramic cup"><div class="command-copy"><h2>My Recipes</h2></div><b>→</b>`;
  journal.insertAdjacentElement('afterend',card);
}

function wireMenuLink(){
  const menuItem=document.querySelector('#drawerSaved');
  if(!menuItem)return;
  menuItem.onclick=event=>{
    event.preventDefault();
    event.stopPropagation();
    window.location.href=RECIPES_ROUTE;
  };
}

function recipeForm(){
  return `<section class="panel recipe-entry">
    <div class="recipe-entry-head"><div><div class="eyebrow">ADD TO LIBRARY</div><h2>Enter a recipe</h2><p>Save your own brew method with the same details used by Pocket Barista.</p></div></div>
    <div class="recipe-entry-grid">
      <label>Recipe name<input id="myRecipeName" type="text" placeholder="Sunday V60" autocomplete="off"></label>
      <label>Method<select id="myRecipeMethod"><option>Pour Over</option><option>AeroPress</option><option>French Press</option><option>V60 Switch</option><option>Espresso</option><option>Cold Brew</option></select></label>
      <label>Coffee (g)<input id="myRecipeCoffee" type="number" min="0.1" step="0.1" value="20"></label>
      <label>Water (g)<input id="myRecipeWater" type="number" min="0.1" step="0.1" value="320"></label>
      <label>Grind<select id="myRecipeGrind"><option>Medium-fine</option><option>Fine</option><option>Medium</option><option>Medium-coarse</option><option>Coarse</option></select></label>
      <label>Temperature °C<input id="myRecipeTemp" type="number" min="0" step="0.5" value="94"></label>
      <label>Brew time (sec)<input id="myRecipeTime" type="number" min="0" step="1" value="180"></label>
      <label class="recipe-entry-wide">Tasting notes<textarea id="myRecipeNotes" rows="3" placeholder="Sweet, juicy, clean…"></textarea></label>
    </div>
    <div class="recipe-entry-actions"><span id="recipeEntryStatus" role="status"></span><button class="primary" id="saveMyRecipe">Save recipe</button></div>
  </section>`;
}

function toast(message){
  const existing=document.querySelector('.recipes-toast');
  existing?.remove();
  const t=document.createElement('div');
  t.className='toast recipes-toast';
  t.textContent=message;
  document.body.appendChild(t);
  setTimeout(()=>t.remove(),2800);
}

async function saveMyRecipe(){
  if(!supabase)return toast('Supabase is not configured.');
  const session=await supabase.auth.getSession();
  const user=session.data.session?.user;
  if(!user)return toast('Please sign in before saving a recipe.');
  const name=document.querySelector('#myRecipeName')?.value.trim()||'';
  const coffee=Number(document.querySelector('#myRecipeCoffee')?.value);
  const water=Number(document.querySelector('#myRecipeWater')?.value);
  const method=document.querySelector('#myRecipeMethod')?.value||'Pour Over';
  const grind=document.querySelector('#myRecipeGrind')?.value||'Medium-fine';
  const temperature=Number(document.querySelector('#myRecipeTemp')?.value);
  const brewSeconds=Number(document.querySelector('#myRecipeTime')?.value);
  const notes=document.querySelector('#myRecipeNotes')?.value.trim()||'';
  if(!name)return toast('Give your recipe a name.');
  if(!(coffee>0)||!(water>0))return toast('Enter coffee and water amounts.');
  const button=document.querySelector('#saveMyRecipe');
  if(button){button.disabled=true;button.textContent='Saving…';}
  const {error}=await supabase.from('recipes').insert({
    user_id:user.id,
    name,
    method,
    coffee_g:coffee,
    water_g:water,
    ratio:water/coffee,
    grind,
    temperature_c:Number.isFinite(temperature)?temperature:null,
    brew_seconds:Number.isFinite(brewSeconds)?Math.round(brewSeconds):null,
    notes,
    rating:0
  });
  if(error){
    if(button){button.disabled=false;button.textContent='Save recipe';}
    return toast(error.message);
  }
  toast('Recipe saved ✓');
  await renderRecipesPage();
}

function bindRecipeForm(){
  document.querySelector('#saveMyRecipe')?.addEventListener('click',saveMyRecipe);
}

async function renderRecipesPage(){
  const app=document.querySelector('#app');
  if(!app)return;
  let user=null;
  let recipes=[];
  if(supabase){
    const session=await supabase.auth.getSession();
    user=session.data.session?.user||null;
    if(user){
      const result=await supabase.from('recipes').select('*').order('created_at',{ascending:false});
      recipes=result.data||[];
    }
  }
  app.innerHTML=`<div class="app-shell recipes-library-shell">
    <header class="topbar"><a class="recipes-dashboard-link" href="./">← Dashboard</a><div class="brand"><div class="brand-mark"><span></span></div><div><div class="eyebrow">A MINOR INCONVENIENCE</div><div class="brand-title">POCKET BARISTA</div></div></div></header>
    <main class="recipes-library">
      <section class="page-head"><div class="eyebrow">POCKET BARISTA / LIBRARY</div><h1>My Recipes</h1><p>Your saved coffee recipes, ready to revisit, refine and brew.</p></section>
      ${user?recipeForm():''}
      <section class="recipes-list">
        ${!user?`<div class="empty panel"><div class="empty-icon">✦</div><h3>Your private coffee book</h3><p>Sign in from the dashboard to save and view recipes across devices.</p><a class="primary recipes-action" href="./">Open Dashboard</a></div>`:
          !recipes.length?`<div class="empty panel"><h3>No saved recipes yet.</h3><p>Use the form above to enter your first recipe.</p></div>`:
          recipes.map(r=>`<article class="recipe panel"><div><div class="recipe-title">${esc(r.name)}</div><div>${esc(r.method)} · ${r.coffee_g}g / ${r.water_g}g</div><div class="recipe-meta">1:${(+(r.ratio)||r.water_g/r.coffee_g).toFixed(1)} · ${esc(r.grind||'—')} · ${r.temperature_c||'—'}°C · ${Number(r.brew_seconds)||0}s</div>${r.notes?`<div class="recipe-notes">${esc(r.notes)}</div>`:''}</div></article>`).join('')}
      </section>
    </main>
  </div>`;
  bindRecipeForm();
}

function isRecipesRoute(){
  return new URLSearchParams(window.location.search).get('page')==='recipes';
}

function watchHome(){
  addHomeCard();
  wireMenuLink();
  const observer=new MutationObserver(()=>{
    addHomeCard();
    wireMenuLink();
    if(isRecipesRoute() && !document.querySelector('.recipes-library-shell')){
      renderRecipesPage();
    }
  });
  observer.observe(document.body,{childList:true,subtree:true});
  if(isRecipesRoute())setTimeout(renderRecipesPage,0);
}

watchHome();
