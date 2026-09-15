// Method page interaction patch.
(function(){
  function getRecipe(kind,id){
    const list=kind==='aero'?window.__POCKET_AEROPRESS_RECIPES:window.__POCKET_SWITCH_RECIPES;
    return Array.isArray(list)?list.find(r=>r.id===id):null;
  }
  document.addEventListener('input',function(e){
    const slider=e.target.closest('[data-method-scale]');
    if(!slider)return;
    const card=slider.closest('[data-recipe-card]');
    if(!card)return;
    const scale=Number(slider.value)||1;
    const coffee=card.querySelector('[data-method-coffee]');
    const water=card.querySelector('[data-method-water]');
    const value=card.querySelector('[data-method-scale-value]');
    const recipe=getRecipe(slider.dataset.methodKind,slider.dataset.methodScale);
    if(recipe){
      if(coffee)coffee.textContent=Math.round(recipe.coffee_g*scale*10)/10+'g';
      if(water)water.textContent=Math.round(recipe.water_g*scale*10)/10+'g';
    }
    if(value)value.textContent=scale.toFixed(2)+'×';
  });
})();
// trigger
