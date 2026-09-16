import './recipes.css';

const RECIPES_PAGE = '/Pocket_Barista/my-recipes.html';
const RECIPE_IMAGE = 'https://images.unsplash.com/photo-1652507733698-b0c536a92cd4?auto=format&fit=crop&fm=jpg&q=82&w=1800';

function addHomeCard(){
  const journal=document.querySelector('#journalHomeCard');
  const grid=document.querySelector('.command-grid');
  if(!journal||!grid||grid.querySelector('#recipesHomeCard'))return;
  const card=document.createElement('a');
  card.className='command-card recipes-command';
  card.id='recipesHomeCard';
  card.href=RECIPES_PAGE;
  card.setAttribute('aria-label','Open My Recipes');
  card.innerHTML=`<img class="recipes-card-image" src="${RECIPE_IMAGE}" alt="Dark coffee cup surrounded by roasted coffee beans"><div class="command-copy"><h2>My Recipes</h2></div><b>→</b>`;
  journal.insertAdjacentElement('afterend',card);
}

function watchHome(){
  addHomeCard();
  new MutationObserver(addHomeCard).observe(document.body,{childList:true,subtree:true});
}

watchHome();
