const RECIPES={
  aero:{
    'aeropress-champion-2025':{name:'Némo Pop — World Champion',creator:'Némo Pop',coffee:18,water:100,brew:70,steps:[['Bypass',5,'Pour 70g bypass water into the carafe.','70g'],['Brew water',15,'Pour 100g brewing water and wet all grounds.','100g'],['Agitate',25,'At 0:25, stir NSNS-WEWE.','100g'],['Press',70,'Start a gentle press at 0:50 and finish around 1:10.','—']]},
    'aeropress-champion-2023':{name:'Tay Wipvasutt — World Champion',creator:'Tay Wipvasutt',coffee:18,water:155,brew:125,steps:[['First pour',30,'Add 16g coffee and pour to 100g water.','100g'],['Stir',30,'At 0:30, stir for 5 seconds.','100g'],['Second dose',55,'At 0:45 add the final 2g coffee, then stir at 0:55.','100g'],['Press',125,'At 1:35 flip and press for about 30 seconds.','—'],['Bypass',125,'Dilute to about 155g total.','155g']]},
    'aeropress-champion-2022':{name:'Jibbi Little — World Champion',creator:'Jibbi Little',coffee:18,water:150,brew:130,steps:[['Brew',20,'Pour 94g water and stir 35 times gently.','94g'],['Cap',80,'At 1:20 attach the cap and press out remaining air.','94g'],['Flip',100,'At 1:30 flip and settle on the server.','—'],['Press',130,'Press from 1:40 to 2:10.','—'],['Bypass',130,'Add 90°C water until the beverage reaches 150g.','150g']]}
  },
  switch:{
    'switch-chronicler':{name:'Coffee Chronicler Hybrid',creator:'Asser Christensen',coffee:20,water:320,brew:195,steps:[['Percolation',45,'Open the switch and pour 160g.','160g'],['Immersion',120,'Close the switch and pour to 320g total.','320g'],['Release',195,'Open the switch and let it drain completely.','—']]},
    'switch-hoffmann':{name:'James Hoffmann Switch',creator:'James Hoffmann',coffee:15,water:250,brew:165,steps:[['Bloom',30,'Close the switch and add about 30g water.','30g'],['Fill',60,'Add the remaining water to 250g.','250g'],['Stir',60,'Gently stir the slurry.','250g'],['Steep',120,'Let the coffee steep until 2:00.','250g'],['Drain',165,'Open the switch and let the brew drain.','—']]},
    'switch-fukahori':{name:'Emi Fukahori Switch',creator:'Emi Fukahori',coffee:14,water:200,brew:140,steps:[['Bloom',30,'Close the switch and pour 50g.','50g'],['Open',30,'At 0:30 open the switch.','50g'],['Main pour',70,'Pour continuously to 200g, aiming at the centre.','200g'],['Drawdown',140,'Let the brew drain completely.','—']]},
    'switch-kasuya-devil':{name:'Tetsu Kasuya Devil Switch',creator:'Tetsu Kasuya',coffee:20,water:280,brew:180,steps:[['First pour',30,'Open the switch and pour 60g hot water.','60g'],['Second pour',70,'Pour to 120g total.','120g'],['Cool water',75,'Close the switch and bring water temperature down toward 70°C.','120g'],['Immersion fill',90,'Pour to 280g total with cooler water.','280g'],['Release',105,'Open the switch and let the brew drain.','—']]}
  }
};

const esc=s=>String(s??'').replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]));
const fmt=s=>`${String(Math.floor(Math.max(0,s)/60)).padStart(2,'0')}:${String(Math.floor(Math.max(0,s)%60)).padStart(2,'0')}`;
const round=n=>Math.round(n*10)/10;

function addStyles(){
 if(document.getElementById('method-interaction-styles'))return;
 const style=document.createElement('style');style.id='method-interaction-styles';style.textContent=`
 .method-scale{margin:18px 0 6px;padding:14px 16px;border:1px solid rgba(255,255,255,.1);border-radius:14px;background:rgba(255,255,255,.025)}
 .method-scale-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:9px;font-size:11px;letter-spacing:.14em;text-transform:uppercase;opacity:.72}
 .method-scale-head strong{font-size:13px;letter-spacing:.02em;opacity:1}
 .method-scale input{width:100%;accent-color:currentColor}
 .method-guide-backdrop{position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.78);display:grid;place-items:center;padding:18px}
 .method-guide{width:min(560px,100%);max-height:calc(100dvh - 36px);overflow:auto;background:#0b0b0b;border:1px solid rgba(255,255,255,.12);border-radius:22px;padding:22px;box-shadow:0 30px 80px rgba(0,0,0,.5)}
 .method-guide-top{display:flex;justify-content:space-between;gap:16px}.method-guide-top h2{margin:5px 0 3px}.method-guide-top small{opacity:.6}.method-guide-close{border:0;background:none;color:inherit;font-size:28px;cursor:pointer}
 .method-guide-progress{height:3px;background:rgba(255,255,255,.1);margin:20px 0}.method-guide-progress span{display:block;height:100%;width:0;background:currentColor}
 .method-guide-clock{text-align:center;padding:12px 0 20px}.method-guide-count{font-size:64px;line-height:1;font-variant-numeric:tabular-nums}.method-guide-total{opacity:.6;margin-top:8px}
 .method-guide-step{padding:18px;border:1px solid rgba(255,255,255,.1);border-radius:16px}.method-guide-step h3{margin:6px 0}.method-guide-step p{margin:0 0 14px;line-height:1.5}.method-guide-target{display:flex;justify-content:space-between;font-size:13px;opacity:.75}.method-guide-controls{display:grid;grid-template-columns:1fr 1.4fr 1fr;gap:8px;margin-top:14px}
 `;document.head.appendChild(style);
}

function decorate(){
 addStyles();
 document.querySelectorAll('[data-method-scale]').forEach(()=>{});
 document.querySelectorAll('[data-method-brew]').forEach(btn=>{
   const card=btn.closest('[data-recipe-card]');if(!card||card.querySelector('.method-scale'))return;
   const id=btn.dataset.recipeId,kind=btn.dataset.method,r=RECIPES[kind]?.[id];if(!r)return;
   const box=document.createElement('div');box.className='method-scale';box.innerHTML=`<div class="method-scale-head"><span>BREW SIZE</span><strong>1.00×</strong></div><input type="range" min="0.50" max="1.50" step="0.05" value="1" aria-label="Adjust brew size">`;
   const specs=card.querySelector('.specs');const buttons=card.querySelector('.recipe-buttons');
   if(buttons)buttons.parentNode.insertBefore(box,buttons);else specs?.after(box);
   const [coffee,water]=specs?.querySelectorAll('span')||[];
   const slider=box.querySelector('input');
   slider.addEventListener('input',()=>{const scale=Number(slider.value);box.querySelector('strong').textContent=scale.toFixed(2)+'×';if(coffee)coffee.querySelector('b').textContent=round(r.coffee*scale)+'g';if(water)water.querySelector('b').textContent=round(r.water*scale)+'g';});
 });
}

function openGuide(kind,id,scale){
 const base=RECIPES[kind]?.[id];if(!base)return;
 const factor=Number(scale)||1;const steps=base.steps.map(([name,time,desc,target])=>[name,time,desc.replace(/(\d+(?:\.\d+)?)g\b/g,(_,n)=>round(+n*factor)+'g'),target.replace(/(\d+(?:\.\d+)?)g\b/g,(_,n)=>round(+n*factor)+'g')]);
 const g={elapsed:0,step:0,running:false};
 const modal=document.createElement('div');modal.className='method-guide-backdrop';modal.innerHTML=`<div class="method-guide"><header class="method-guide-top"><div><div class="eyebrow">GUIDED BREW · ${esc(base.creator)}</div><h2>${esc(base.name)}</h2><small>${round(base.coffee*factor)}g coffee · ${round(base.water*factor)}g water · ${factor.toFixed(2)}×</small></div><button class="method-guide-close" aria-label="Close">×</button></header><div class="method-guide-progress"><span></span></div><div class="method-guide-clock"><div class="method-guide-count">${fmt(steps[0][1])}</div><div class="method-guide-total">TOTAL · 00:00 / ${fmt(base.brew)}</div></div><div class="method-guide-step"><div class="eyebrow">STEP 1 / ${steps.length}</div><h3>${esc(steps[0][0])}</h3><p>${esc(steps[0][2])}</p><div class="method-guide-target"><span>SCALE TARGET</span><strong>${esc(steps[0][3])}</strong></div></div><div class="method-guide-controls"><button class="secondary" data-mg="reset">Reset</button><button class="primary" data-mg="toggle">Start brew</button><button class="secondary" data-mg="next">Next</button></div></div>`;
 document.body.appendChild(modal);
 const count=modal.querySelector('.method-guide-count'),total=modal.querySelector('.method-guide-total'),bar=modal.querySelector('.method-guide-progress span'),stepEl=modal.querySelector('.method-guide-step'),toggle=modal.querySelector('[data-mg="toggle"]');
 const render=()=>{const s=steps[g.step],end=Number(s[1])||0;count.textContent=fmt(Math.max(0,end-g.elapsed));total.textContent=`TOTAL · ${fmt(Math.floor(g.elapsed))} / ${fmt(base.brew)}`;bar.style.width=Math.min(100,g.elapsed/base.brew*100)+'%';stepEl.innerHTML=`<div class="eyebrow">STEP ${g.step+1} / ${steps.length}</div><h3>${esc(s[0])}</h3><p>${esc(s[2])}</p><div class="method-guide-target"><span>SCALE TARGET</span><strong>${esc(s[3])}</strong></div>`;toggle.textContent=g.running?'Pause':'Start brew'};
 let timer=null;const stop=()=>{clearInterval(timer);timer=null;g.running=false};const close=()=>{stop();modal.remove()};
 modal.querySelector('.method-guide-close').onclick=close;modal.querySelector('[data-mg="reset"]').onclick=()=>{stop();g.elapsed=0;g.step=0;render()};modal.querySelector('[data-mg="next"]').onclick=()=>{if(g.step<steps.length-1){g.step++;render()}else{stop();g.elapsed=base.brew;render()}};
 toggle.onclick=()=>{g.running=!g.running;if(g.running){timer=setInterval(()=>{g.elapsed+=0.1;const end=Number(steps[g.step][1])||0;if(g.elapsed>=end){if(g.step<steps.length-1)g.step++;else{stop();g.elapsed=base.brew}}render()},100)}else stop();render()};
 render();
}

const observer=new MutationObserver(()=>decorate());
observer.observe(document.documentElement,{childList:true,subtree:true});

// Register before main.js so this capture handler owns method Brew clicks.
document.addEventListener('click',e=>{const btn=e.target.closest('[data-method-brew]');if(!btn)return;e.preventDefault();e.stopImmediatePropagation();const card=btn.closest('[data-recipe-card]');const slider=card?.querySelector('.method-scale input');openGuide(btn.dataset.method,btn.dataset.recipeId,slider?.value||1)},true);

decorate();