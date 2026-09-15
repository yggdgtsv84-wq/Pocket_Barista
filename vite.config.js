import { defineConfig } from 'vite';

const methodPatch = {
  name: 'pocket-barista-method-controls',
  transform(code, id) {
    if (!id.endsWith('/src/main.js')) return null;
    let out = code;
    out = out.replace('<span><b>${r.coffee_g}g</b> coffee</span>', '<span><b data-method-coffee="${r.id}">${r.coffee_g}g</b> coffee</span>');
    out = out.replace('<span><b>${r.water_g}g</b> water</span>', '<span><b data-method-water="${r.id}">${r.water_g}g</b> water</span>');
    out = out.replace('<div class="recipe-buttons"><button type="button" class="primary" data-method-brew="${kind}" data-recipe-id="${r.id}">Brew</button>', '<div class="recipe-scale"><div class="recipe-scale-head"><span>BREW SIZE</span><strong data-method-scale-value="${r.id}">1.00×</strong></div><input class="recipe-scale-slider" data-method-scale="${r.id}" type="range" min="0.50" max="1.50" step="0.05" value="1" aria-label="Adjust coffee and water volume"></div><div class="recipe-buttons"><button type="button" class="primary" data-method-brew="${kind}" data-recipe-id="${r.id}">Brew</button>');

    const oldBind = "function bindMethodCards(){\n document.querySelectorAll('[data-method-brew]').forEach(btn=>btn.addEventListener('click',()=>startMethodRecipe(btn.dataset.method,btn.dataset.recipeId)));\n}";
    const newBind = "function bindMethodCards(){\n document.querySelectorAll('[data-method-brew]').forEach(btn=>btn.addEventListener('click',e=>{\n  e.preventDefault();\n  e.stopPropagation();\n  const card=btn.closest('[data-recipe-card]');\n  const scale=Number(card?.querySelector('[data-method-scale]')?.value||1);\n  startMethodRecipe(btn.dataset.method,btn.dataset.recipeId,scale);\n }));\n document.querySelectorAll('[data-method-scale]').forEach(sl=>sl.addEventListener('input',()=>{\n  const id=sl.dataset.methodScale;\n  const r=(A.find(x=>x.id===id)||S.find(x=>x.id===id));\n  if(!r)return;\n  const scale=Number(sl.value)||1;\n  const card=sl.closest('[data-recipe-card]');\n  const value=card?.querySelector('[data-method-scale-value]');\n  const coffee=card?.querySelector('[data-method-coffee]');\n  const water=card?.querySelector('[data-method-water]');\n  if(value)value.textContent=scale.toFixed(2)+'×';\n  if(coffee)coffee.textContent=roundBrew(r.coffee_g*scale)+'g';\n  if(water)water.textContent=roundBrew(r.water_g*scale)+'g';\n }));\n}";
    out = out.replace(oldBind, newBind);

    const oldRecipe = "function startMethodRecipe(kind,id){\n const r=(kind==='aero'?A:S).find(x=>x.id===id);if(!r)return;\n state.guide={r,step:0,elapsed:0,running:false};\n renderGuide();\n}";
    const newRecipe = "function startMethodRecipe(kind,id,scale=1){\n const base=(kind==='aero'?A:S).find(x=>x.id===id);if(!base)return;\n stopGuide();\n state.guide={r:scaledRecipe(base,scale),step:0,elapsed:0,running:false};\n renderGuide();\n}";
    out = out.replace(oldRecipe, newRecipe);
    out = out.replace(/\ndocument\.addEventListener\\(\"click\", e => \\{[\\s\\S]*?\\n\\}, true\\);\\s*$/, '');
    return { code: out, map: null };
  }
};

export default defineConfig({ base: '/Pocket_Barista/', plugins: [methodPatch] });
