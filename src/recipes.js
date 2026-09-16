import './recipes.css';

const RECIPES_PAGE = 'my-recipes.html';
const RECIPE_IMAGE = 'https://images.pexels.com/photos/4017487/pexels-photo-4017487.jpeg?cs=srgb&fm=jpg&w=1800';

function addHomeCard(){
  const journal=document.querySelector('#journalHomeCard');
  const grid=document.querySelector('.command-grid');
  if(!journal||!grid||grid.querySelector('#recipesHomeCard'))return;
  const card=document.createElement('a');
  card.className='command-card recipes-command';
  card.id='recipesHomeCard';
  card.href=RECIPES_PAGE;
  card.setAttribute('aria-label','Open My Recipes');
  card.innerHTML=`<img class="recipes-card-image" src="${RECIPE_IMAGE}" alt="Dark, moody coffee mug surrounded by roasted coffee beans"><div class="command-copy"><h2>My Recipes</h2></div><b>→</b>`;
  journal.insertAdjacentElement('afterend',card);
}

function watchHome(){
  addHomeCard();
  new MutationObserver(addHomeCard).observe(document.body,{childList:true,subtree:true});
}

watchHome();
