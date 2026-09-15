import fs from 'node:fs';

const main = fs.readFileSync('src/main.js', 'utf8');
const index = fs.readFileSync('index.html', 'utf8');

const required = [
  ['AeroPress recipes', "const A=["],
  ['V60 Switch recipes', "const S=["],
  ['method page renderer', 'function methodPage('],
  ['method card binding', 'function bindMethodCards('],
  ['method brew starter', 'function startMethodRecipe('],
  ['shared recipe scaler', 'function scaledRecipe('],
];

for (const [label, needle] of required) {
  if (!main.includes(needle)) throw new Error(`Missing ${label}: ${needle}`);
}

if (!main.includes('data-method-brew="${kind}"')) throw new Error('Method cards do not expose data-method-brew.');
if (!main.includes('data-recipe-id="${r.id}"')) throw new Error('Method cards do not expose data-recipe-id.');
if (!main.includes("state.guide={r:scaledRecipe(base,scale),step:0,elapsed:0,running:false}")) throw new Error('Method brew does not enter the shared guided-brew state.');
if (!main.includes('function renderGuide()')) throw new Error('Shared guide renderer is missing.');

// The temporary interception workaround must not be present in main.js.
if (main.includes('stopImmediatePropagation();')) throw new Error('Temporary global click interception is still present in main.js.');

// The production page should load only the app entry point; method behaviour belongs in main.js.
if (index.includes('method-interactions.js')) throw new Error('Temporary method-interactions.js workaround is still loaded by index.html.');

console.log('Method interaction structure verified.');
console.log('AeroPress + V60 Switch use the shared guided-brew path.');
