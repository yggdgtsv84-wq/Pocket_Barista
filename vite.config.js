import { defineConfig } from 'vite';

const methodPatch = {
  name: 'pocket-barista-method-controls',
  transform(code, id) {
    if (!id.endsWith('/src/main.js')) return null;
    const oldPage = 'function methodPage(kind,title,eyebrow,intro,recipes){return `';
    const startPage = code.indexOf(oldPage);
    const endPage = code.indexOf('\nfunction ', startPage + 1);
    if (startPage < 0 || endPage < 0) return null;
    const page = String.raw`function methodPage(kind,title,eyebrow,intro,recipes){return \`<section class="page-head"><button class="back-btn" data-page="home">← Dashboard</button><div class="eyebrow">\${eyebrow}</div><h1>\${title}</h1><p>\${intro}</p></section><section class="recipe-deck">\${recipes.map((r,i)=>\`<article class="recipe-panel" data-recipe-card="\${r.id}"><div class="recipe-index">\${String(i+1).padStart(2,'0')}</div><div class="recipe-main"><div class="recipe-line"><span class="recipe-badge">\${esc(r.badge)}</span><span>\${esc(r.creator)}</span></div><h2>\${esc(r.name)}</h2><p>\${esc(r.notes)}</p><div class="specs"><span><b data-method-coffee="\${r.id}">\${r.coffee_g}g</b> coffee</span><span><b data-method-water="\${r.id}">\${r.water_g}g</b> water</span><span><b>1:\${r.ratio}</b> ratio</span><span><b>\${r.temperature_c}°</b> water</span><span><b>\${fmt(r.brew_seconds)}</b> target</span></div><div class="recipe-scale"><div class="recipe-scale-head"><span>BREW SIZE</span><strong data-method-scale-value="\${r.id}">1.00×</strong></div><input class="recipe-scale-slider" data-method-scale="\${r.id}" type="range" min="0.50" max="1.50" step="0.05" value="1" aria-label="Adjust coffee and water volume"></div><div class="recipe-buttons"><button type="button" class="primary" data-method-brew="\${kind}" data-recipe-id="\${r.id}">Brew</button>\${r.sourceUrl?\`<a class="source-link" href="\${r.sourceUrl}" target="_blank" rel="noreferrer">Source ↗</a>\`:''}</div></div></article>\`).join('')}</section>\`}`;
    code = code.slice(0, startPage) + page + code.slice(endPage);

    const startBind = code.indexOf('function bindMethodCards(){');
    const endBind = code.indexOf('\nfunction ', startBind + 1);
    const bind = String.raw`function bindMethodCards(){
 document.querySelectorAll('[data-method-brew]').forEach(btn=>btn.addEventListener('click',e=>{
  e.preventDefault();
  e.stopPropagation();
  const card=btn.closest('[data-recipe-card]');
  const scale=Number(card?.querySelector('[data-method-scale]')?.value||1);
  startMethodRecipe(btn.dataset.method,btn.dataset.recipeId,scale);
 }));
 document.querySelectorAll('[data-method-scale]').forEach(sl=>sl.addEventListener('input',()=>{
  const id=sl.dataset.methodScale;
  const r=(A.find(x=>x.id===id)||S.find(x=>x.id===id));
  if(!r)return;
  const scale=Number(sl.value)||1;
  const card=sl.closest('[data-recipe-card]');
  const value=card?.querySelector('[data-method-scale-value]');
  const coffee=card?.querySelector('[data-method-coffee]');
  const water=card?.querySelector('[data-method-water]');
  if(value)value.textContent=scale.toFixed(2)+'×';
  if(coffee)coffee.textContent=roundBrew(r.coffee_g*scale)+'g';
  if(water)water.textContent=roundBrew(r.water_g*scale)+'g';
 }));
}`;
    if (startBind >= 0 && endBind >= 0) code = code.slice(0, startBind) + bind + code.slice(endBind);

    const startRecipe = code.indexOf('function startMethodRecipe(');
    const endRecipe = code.indexOf('\nfunction ', startRecipe + 1);
    const recipe = String.raw`function startMethodRecipe(kind,id,scale=1){
 const base=(kind==='aero'?A:S).find(x=>x.id===id);if(!base)return;
 stopGuide();
 state.guide={r:scaledRecipe(base,scale),step:0,elapsed:0,running:false};renderGuide();
}`;
    if (startRecipe >= 0 && endRecipe >= 0) code = code.slice(0, startRecipe) + recipe + code.slice(endRecipe);
    code = code.replace(/\ndocument\.addEventListener\(\\"click\\", e => \{[\s\S]*?\n\}, true\);\s*$/,'');
    return { code, map: null };
  }
};

export default defineConfig({ base: '/Pocket_Barista/', plugins: [methodPatch] });
