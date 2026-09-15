const round=n=>Math.round(n*10)/10;
const install=()=>{
  document.querySelectorAll('[data-method-brew]').forEach(btn=>{
    const card=btn.closest('[data-recipe-card]');
    if(!card||card.dataset.scaleReady)return;
    const specs=card.querySelector('.specs');
    const spans=specs?.querySelectorAll('span');
    if(!spans||spans.length<2)return;
    const coffeeNode=spans[0].querySelector('b');
    const waterNode=spans[1].querySelector('b');
    if(!coffeeNode||!waterNode)return;
    const coffee=Number.parseFloat(coffeeNode.textContent);
    const water=Number.parseFloat(waterNode.textContent);
    if(!Number.isFinite(coffee)||!Number.isFinite(water))return;
    card.dataset.scaleReady='1';
    const box=document.createElement('div');
    box.className='recipe-scale method-scale';
    box.innerHTML='<div class="recipe-scale-head"><span>BREW SIZE</span><strong>1.00×</strong></div><input class="recipe-scale-slider" type="range" min="0.50" max="1.50" step="0.05" value="1" aria-label="Adjust coffee and water volume">';
    card.querySelector('.recipe-buttons')?.before(box);
    const slider=box.querySelector('input');
    const value=box.querySelector('strong');
    slider.addEventListener('input',()=>{
      const scale=Number(slider.value)||1;
      value.textContent=scale.toFixed(2)+'×';
      coffeeNode.textContent=round(coffee*scale)+'g';
      waterNode.textContent=round(water*scale)+'g';
    });
  });
};
const style=document.createElement('style');
style.textContent='.method-scale{margin:18px 0 6px}.method-scale .recipe-scale-slider{width:100%}';
document.head.appendChild(style);
install();
new MutationObserver(install).observe(document.documentElement,{childList:true,subtree:true});
