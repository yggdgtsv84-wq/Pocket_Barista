import './recipes.css';

function addHomeCard(){
  const journal=document.querySelector('#journalHomeCard');
  const grid=document.querySelector('.command-grid');
  if(!journal||!grid||grid.querySelector('#recipesHomeCard'))return;
  const card=document.createElement('button');
  card.type='button';
  card.className='command-card recipes-command';
  card.id='recipesHomeCard';
  card.setAttribute('aria-label','Open My Recipes');
  card.innerHTML='<div class="command-copy"><h2>My Recipes</h2></div><b>→</b>';
  journal.insertAdjacentElement('afterend',card);
}

function watchHome(){
  addHomeCard();
  new MutationObserver(addHomeCard).observe(document.body,{childList:true,subtree:true});
}

watchHome();
