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
      <section class="recipes-list">
        ${!user?`<div class="empty panel"><div class="empty-icon">✦</div><h3>Your private coffee book</h3><p>Sign in from the dashboard to save and view recipes across devices.</p><a class="primary recipes-action" href="./">Open Dashboard</a></div>`:
          !recipes.length?`<div class="empty panel"><h3>No saved recipes yet.</h3><p>Save a curated method or custom brew from the dashboard.</p><a class="primary recipes-action" href="./">Browse recipes</a></div>`:
          recipes.map(r=>`<article class="recipe panel"><div><div class="recipe-title">${esc(r.name)}</div><div>${esc(r.method)} · ${r.coffee_g}g / ${r.water_g}g</div><div class="recipe-meta">1:${(+(r.ratio)||r.water_g/r.coffee_g).toFixed(1)} · ${esc(r.grind||'—')} · ${r.temperature_c||'—'}°C · ${Number(r.brew_seconds)||0}s</div></div></article>`).join('')}
      </section>
    </main>
  </div>`;
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
