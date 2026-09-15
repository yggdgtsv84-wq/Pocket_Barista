from pathlib import Path
import re

p=Path('src/main.js')
s=p.read_text()
if 'aeropress-champion-2025' in s:
    raise SystemExit(0)
marker='\n\nconst state='
insert=r'''

const A=[
 {id:'aeropress-champion-2025',name:'Némo Pop — World Champion',creator:'Némo Pop',badge:'WAC 2025 Champion',method:'AeroPress',coffee_g:18,water_g:100,ratio:5.6,grind:'Fine / sifted',temperature_c:84,brew_seconds:70,notes:'Upright brew with 70g bypass water, 100g brew water, and a gentle 20-second press.',sourceUrl:'https://worldaeropresschampionship.com/pages/recipes',steps:[['Bypass',5,'Pour 70g bypass water into the carafe.','70g','Keep bypass water around 50°C.'],['Brew water',15,'Pour 100g brewing water and wet all grounds.','100g','84°C brewing water.'],['Agitate',25,'At 0:25, stir NSNS-WEWE.','100g','Thorough but controlled agitation.'],['Press',70,'Start a gentle press at 0:50 and finish around 1:10.','—','Aim for roughly 20 seconds of pressing.']]},
 {id:'aeropress-champion-2023',name:'Tay Wipvasutt — World Champion',creator:'Tay Wipvasutt',badge:'WAC 2023 Champion',method:'AeroPress',coffee_g:18,water_g:155,ratio:8.6,grind:'Medium-fine',temperature_c:89,brew_seconds:125,notes:'16g first dose, 2g second dose, then bypass to a final 155g beverage.',sourceUrl:'https://worldaeropresschampionship.com/pages/recipes',steps:[['First pour',30,'Add 16g coffee and pour to 100g water.','100g','Start inverted.'],['Stir',30,'At 0:30, stir for 5 seconds.','100g','Use a chopstick.'],['Second dose',55,'At 0:45 add the final 2g coffee, then stir at 0:55.','100g','The total dose is 18g.'],['Press',125,'At 1:35 flip and press for about 30 seconds.','—','Target roughly 75g output.'],['Bypass',125,'Dilute to about 155g total with room-temperature then hot water.','155g','Taste and adjust.']]},
 {id:'aeropress-champion-2022',name:'Jibbi Little — World Champion',creator:'Jibbi Little',badge:'WAC 2022 Champion',method:'AeroPress',coffee_g:18,water_g:150,ratio:8.3,grind:'Very coarse + fines sifted',temperature_c:90,brew_seconds:130,notes:'Inverted, 94g brew water, then bypass to 150g for a clean competition cup.',sourceUrl:'https://aeropress.com/pages/wac-recipes',steps:[['Brew',20,'Pour 94g water and stir 35 times gently.','94g','Start inverted.'],['Cap',80,'At 1:20 attach the cap and press out remaining air.','94g','Keep the brewer sealed.'],['Flip',100,'At 1:30 flip and settle on the server.','—','Set up carefully.'],['Press',130,'Press from 1:40 to 2:10.','—','Gentle, controlled pressure.'],['Bypass',130,'Add 90°C water until the beverage reaches 150g.','150g','Optional: chill with ice balls.']]}
];

const S=[
 {id:'switch-chronicler',name:'Coffee Chronicler Hybrid',creator:'Asser Christensen',badge:'Famous hybrid',method:'V60 Switch',coffee_g:20,water_g:320,ratio:16,grind:'Medium-fine',temperature_c:92,brew_seconds:195,notes:'50% open percolation, 50% closed immersion, then a clean drawdown.',sourceUrl:'https://coffeechronicler.com/hario-switch/',steps:[['Percolation',45,'Open the switch and pour 160g.','160g','Let the first half drain.'],['Immersion',120,'Close the switch and pour to 320g total.','320g','Steep with the valve closed.'],['Release',195,'At 2:00 open the switch and let it drain completely.','—','Target roughly 2:45–3:15.']]},
 {id:'switch-hoffmann',name:'James Hoffmann Switch',creator:'James Hoffmann',badge:'Immersion',method:'V60 Switch',coffee_g:15,water_g:250,ratio:16.7,grind:'Fine',temperature_c:93,brew_seconds:165,notes:'A full immersion brew with a final drain; Hario also publishes a 2:30 Switch + Sibarist version.',sourceUrl:'https://www.hario-usa.com/blogs/recipes-and-more-from-friends/james-hoffmann-switch-sibarist',steps:[['Bloom',30,'Close the switch and add about 30g water.','30g','Saturate the coffee.'],['Fill',60,'Add the remaining water to 250g.','250g','Keep the valve closed.'],['Stir',60,'Gently stir the slurry.','250g','Avoid aggressive agitation.'],['Steep',120,'Let the coffee steep until 2:00.','250g','Keep the switch closed.'],['Drain',165,'Open the switch and let the brew drain.','—','Aim around 2:45; faster with Sibarist.']]},
 {id:'switch-fukahori',name:'Emi Fukahori Switch',creator:'Emi Fukahori',badge:'WBrC 2018 Champion',method:'V60 Switch',coffee_g:14,water_g:200,ratio:14.3,grind:'Medium',temperature_c:93,brew_seconds:140,notes:'Closed bloom, then open the valve for one continuous centre pour.',sourceUrl:'https://europeancoffeetrip.com/easy-hario-switch-recipe-emi-fukahor/',steps:[['Bloom',30,'Close the switch and pour 50g.','50g','Let the coffee bloom.'],['Open',30,'At 0:30 open the switch.','50g','Begin percolation.'],['Main pour',70,'Pour continuously to 200g, aiming at the centre.','200g','Finish around 1:10.'],['Drawdown',140,'Let the brew drain completely.','—','Target about 2:20 total.']]},
 {id:'switch-kasuya-devil',name:'Tetsu Kasuya Devil Switch',creator:'Tetsu Kasuya',badge:'Hybrid classic',method:'V60 Switch',coffee_g:20,water_g:280,ratio:14,grind:'Medium-fine',temperature_c:90,brew_seconds:180,notes:'Hot open-valve extraction followed by cooler immersion, then release.',sourceUrl:'https://www.timer.coffee/recipes/hario-switch/tetsu-kasuya-devil-recipe-for-hario-switch/',steps:[['First pour',30,'Open the switch and pour 60g hot water.','60g','Use about 90°C water.'],['Second pour',70,'Pour to 120g total.','120g','Keep the valve open.'],['Cool water',75,'Close the switch and bring water temperature down toward 70°C.','120g','Prepare the cooler immersion phase.'],['Immersion fill',90,'Pour to 280g total with cooler water.','280g','Keep the switch closed.'],['Release',105,'Open the switch and let the brew drain.','—','Target 3:00 total.']]}
];

function methodPage(kind,title,eyebrow,intro,recipes){return `<section class="page-head"><button class="back-btn" data-page="home">← Dashboard</button><div class="eyebrow">${eyebrow}</div><h1>${title}</h1><p>${intro}</p></section><section class="recipe-deck">${recipes.map((r,i)=>`<article class="recipe-panel" data-recipe-card="${r.id}"><div class="recipe-index">${String(i+1).padStart(2,'0')}</div><div class="recipe-main"><div class="recipe-line"><span class="recipe-badge">${esc(r.badge)}</span><span>${esc(r.creator)}</span></div><h2>${esc(r.name)}</h2><p>${esc(r.notes)}</p><div class="specs"><span><b>${r.coffee_g}g</b> coffee</span><span><b>${r.water_g}g</b> water</span><span><b>1:${r.ratio}</b> ratio</span><span><b>${r.temperature_c}°</b> water</span><span><b>${fmt(r.brew_seconds)}</b> target</span></div><div class="recipe-buttons"><button class="primary" data-method-brew="${kind}" data-recipe-id="${r.id}">Brew</button>${r.sourceUrl?`<a class="source-link" href="${r.sourceUrl}" target="_blank" rel="noreferrer">Source ↗</a>`:''}</div></div></article>`).join('')}</section>`}

function aeroPage(){return methodPage('aero','AeroPress','METHOD 02 / AEROPRESS','World AeroPress Championship recipes, tuned for a repeatable guided brew.',A)}
function switchPage(){return methodPage('switch','V60 Switch','METHOD 03 / V60 SWITCH','Famous hybrid and immersion recipes for the Hario Switch.',S)}

function bindMethodCards(){
 document.querySelectorAll('[data-method-brew]').forEach(btn=>btn.addEventListener('click',()=>startMethodRecipe(btn.dataset.method,btn.dataset.recipeId)));
}
function startMethodRecipe(kind,id){
 const r=(kind==='aero'?A:S).find(x=>x.id===id);if(!r)return;
 state.guide={r,step:0,elapsed:0,running:false};
 renderGuide();
}
'''
if marker not in s: raise SystemExit('state marker not found')
s=s.replace(marker,insert+marker,1)
old_render="${state.page==='home'?homePage():state.page==='pour'?pourPage():espressoPage()}"
new_render="${state.page==='home'?homePage():state.page==='pour'?pourPage():state.page==='aero'?aeroPage():state.page==='switch'?switchPage():espressoPage()}"
if old_render not in s: raise SystemExit('render routing marker not found')
s=s.replace(old_render,new_render,1)
home=re.compile(r'function homePage\(\)\{.*?\n\nfunction pourPage\(\)',re.S)
replacement="""function homePage(){return `<section class=\"dashboard-head\"><div><h1>Good coffee.<br><em>Precisely made.</em></h1></div><div class=\"status-chip\"><i></i> SYSTEM READY</div></section>\n<section class=\"command-grid\">\n <button class=\"command-card hero-command\" data-page=\"pour\"><div class=\"command-icon pour-icon\">◒</div><div class=\"command-copy\"><h2>Pour Over</h2></div><b>→</b></button>\n <button class=\"command-card\" data-page=\"espresso\"><div class=\"command-icon\">◉</div><div class=\"command-copy\"><h2>Espresso</h2></div><b>→</b></button>\n <button class=\"command-card method-command aero-command\" data-page=\"aero\"><div class=\"command-copy\"><h2>AeroPress</h2></div><b>→</b></button>\n <button class=\"command-card method-command switch-command\" data-page=\"switch\"><div class=\"command-copy\"><h2>V60 Switch</h2></div><b>→</b></button>\n</section>}\n\nfunction pourPage()"""
s,count=home.subn(replacement,s,count=1)
if count!=1: raise SystemExit('homePage regex failed')
s=s.replace('bind();\n}','bind();bindMethodCards();\n}',1)
p.write_text(s)
