'use strict';
const icons = {
 book:'<path d="M4 4h6a3 3 0 0 1 3 3v14a4 4 0 0 0-4-2H4z"/><path d="M13 7a3 3 0 0 1 3-3h5v15h-5a4 4 0 0 0-3 2"/>',
 heart:'<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/>',
 spark:'<path d="m12 3 2.7 6.3L21 12l-6.3 2.7L12 21l-2.7-6.3L3 12l6.3-2.7Z"/><path d="m20 2 .7 1.3L22 4l-1.3.7L20 6l-.7-1.3L18 4l1.3-.7Z"/>',
 lock:'<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3"/>',
 shield:'<path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6Z"/><path d="m8 12 3 3 5-6"/>',
 settings:'<path d="m9 3-.7 3-2 .9-2.7-.8-2 3.5 2.1 2.1v2.4l-2.1 2.1 2 3.5 2.7-.8 2 .9.7 3h4l.7-3 2-.9 2.7.8 2-3.5-2.1-2.1v-2.4l2.1-2.1-2-3.5-2.7.8-2-.9L13 3Z" transform="translate(1 -1) scale(.95)"/><circle cx="12" cy="12" r="3"/>',
 download:'<path d="M12 3v12m-4-4 4 4 4-4M4 16v4h16v-4"/>',
 plus:'<path d="M12 5v14M5 12h14"/>',
 arrow:'<path d="M4 12h16m-6-6 6 6-6 6"/>',
 search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
 sort:'<path d="M5 5v14m-3-3 3 3 3-3M12 5h9M12 10h7M12 15h5M12 20h3"/>',
 clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
 close:'<path d="m6 6 12 12M6 18 18 6"/>',
 edit:'<path d="m15 4 5 5M4 20l5-1L21 7a2.8 2.8 0 0 0-4-4L5 15Z"/>',
 info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7v.1"/>',
 refresh:'<path d="M20 7v5h-5M4 17v-5h5"/><path d="M5.5 7a8 8 0 0 1 13-1L20 12M4 12l1.5 6a8 8 0 0 0 13-1"/>',
 people:'<circle cx="9" cy="7" r="3"/><path d="M3 21v-3a6 6 0 0 1 12 0v3M17 4a3 3 0 0 1 0 6M18 14a5 5 0 0 1 3 4v3"/>',
 print:'<path d="M6 8V3h12v5M6 18H3V9h18v9h-3M6 14h12v7H6ZM17 11h1"/>',
 check:'<path d="m5 12 4 4L19 6"/>'
};
const icon = name => `<svg viewBox="0 0 24 24" aria-hidden="true">${icons[name] || icons.book}</svg>`;
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const categories = ['Comfort food','Quick & easy','Something sweet','For sharing'];
const STORAGE_KEY = 'sunday-table-cookbook-v1';
const SAMPLE_NOTES = "Nani's Sunday dal. Wash one cup of red lentils until the water is clear. Put in the pot with three cups water, half a teaspoon turmeric and salt to taste. Simmer until the lentils are soft. In a little pan warm one tablespoon ghee, add one teaspoon cumin seeds and two sliced garlic cloves. When the garlic smells good, pour this over the dal. Add a squeeze of lemon and a handful of coriander. Serves four. Nani always said: don't rush the tempering, and always make enough for one more person.";
const seeds = [
 {id:'nani-dal',title:'Nani’s Sunday dal',author:'Nani',description:'A warm hug, in a bowl. Just like she made it.',category:'Comfort food',time:'35 min',servings:'4',image:'soup',favorite:true,ingredients:['1 cup red lentils, rinsed','3 cups water','½ tsp turmeric','1 tbsp ghee','1 tsp cumin seeds','2 garlic cloves, sliced','Salt, to taste','Lemon juice, to taste','A handful of fresh coriander'],steps:['Add the lentils, water, turmeric and salt to a saucepan. Bring to a gentle boil.','Reduce the heat and simmer, stirring occasionally, until the lentils are tender, about 20–25 minutes. Add water if needed.','Warm the ghee in a small pan. Add cumin, then garlic. Cook gently until fragrant and lightly golden.','Pour the tempering over the dal. Stir in lemon juice, scatter with coriander and serve.'],notes:'“Don’t rush the tempering. And always make enough for one more person.”',uncertainties:[]},
 {id:'papa-pasta',title:'Papa’s tomato pasta',author:'Papa',description:'His only recipe. And honestly, his best one.',category:'Quick & easy',time:'25 min',servings:'2',image:'pasta',favorite:false,ingredients:['200 g pasta','2 tbsp olive oil','2 garlic cloves, sliced','400 g canned tomatoes','A small handful of basil','Salt and black pepper, to taste'],steps:['Boil the pasta in salted water according to the packet. Keep a cup of the cooking water.','Warm the oil and gently cook the garlic until fragrant. Add tomatoes and simmer for 15 minutes.','Toss the drained pasta with the sauce. Add a splash of cooking water to loosen it. Finish with basil and season to taste.'],notes:'The kitchen was always a mess. The plates were always empty.',uncertainties:[]},
 {id:'mira-salad',title:'The “bring a bowl” salad',author:'Mira',description:'For slow lunches and the friends who stay.',category:'For sharing',time:'15 min',servings:'4',image:'salad',favorite:false,ingredients:['150 g mixed salad leaves','250 g cherry tomatoes, halved','1 cucumber, chopped','3 tbsp olive oil','1 tbsp lemon juice','Salt and black pepper, to taste'],steps:['Wash and dry the leaves. Place in a large serving bowl with tomatoes and cucumber.','Whisk the oil and lemon juice with salt and pepper.','Dress the salad just before serving, and toss gently.'],notes:'Everyone brings something. Someone always forgets a bowl.',uncertainties:[]},
 {id:'nani-biscuits',title:'Her cardamom biscuits',author:'Nani',description:'The tin that was never, ever empty.',category:'Something sweet',time:'40 min',servings:'16 biscuits',image:'cookies',favorite:true,ingredients:['150 g plain flour','100 g softened butter','60 g caster sugar','½ tsp ground cardamom','A pinch of salt'],steps:['Heat the oven to 170°C. Line a baking sheet.','Cream the butter and sugar. Mix in the flour, cardamom and salt to form a soft dough.','Shape into 16 small balls, flatten lightly, and space them on the tray.','Bake for 15–18 minutes until the edges are lightly golden. Let cool on the tray before moving.'],notes:'“Take a few for the journey.” Even when the journey was ten minutes.',uncertainties:[]},
 {id:'mira-rice',title:'A little lemon rice',author:'Mira',description:'A bright little reset for a very long day.',category:'Quick & easy',time:'20 min',servings:'2',image:'rice',favorite:false,ingredients:['1 cup uncooked rice','Water, as directed on rice packet','1 tbsp oil','½ tsp mustard seeds','¼ tsp turmeric','Juice of ½ lemon','A handful of coriander','Salt, to taste'],steps:['Cook the rice according to the packet instructions.','Warm the oil in a pan. Add mustard seeds and let them crackle, then stir in turmeric.','Fold in the hot cooked rice. Add lemon juice and salt to taste, then finish with coriander.'],notes:'For the evenings when cooking something small feels like looking after yourself.',uncertainties:[]},
 {id:'papa-curry',title:'The everyone’s-coming curry',author:'Papa',description:'One big pot. As many chairs as we can find.',category:'For sharing',time:'45 min',servings:'6',image:'curry',favorite:false,ingredients:['2 tbsp oil','1 onion, chopped','3 garlic cloves, minced','1 tbsp grated ginger','2 tsp ground cumin','1 tsp ground coriander','800 g canned chickpeas, drained','400 g canned tomatoes','400 ml coconut milk','Salt, to taste'],steps:['Warm the oil. Cook the onion until softened, then add garlic and ginger.','Stir in the spices for a minute, then add the chickpeas, tomatoes and coconut milk.','Simmer gently for 25 minutes, stirring occasionally. Season to taste and serve with rice.'],notes:'There was no guest list. Just a message: come hungry.',uncertainties:[]}
].map(r=>({...r,source:'Illustrative sample recipe',createdAt:'2026-01-01T12:00:00.000Z',originalNotes:''}));
let recipes, storageHealthy = true;
try {
 const saved = localStorage.getItem(STORAGE_KEY);
 if (saved !== null) { recipes = JSON.parse(saved); if (!Array.isArray(recipes) || !recipes.every(validRecipe)) throw Error('Invalid saved cookbook'); }
 else recipes = structuredClone(seeds);
} catch { recipes = structuredClone(seeds); storageHealthy = false; }
let view = 'all', filter = 'All recipes', search = '', sortAlphabetical = false, editingId = null, draftMeta = {}, currentRecipeId = null, aiReady = false, busy = false;
function validRecipe(r) {
 return r && typeof r === 'object' && ['title','author','category','time','servings','description','notes'].every(k=>typeof r[k] === 'string' && r[k].length<=6000) && r.title.trim() && categories.includes(r.category) && ['ingredients','steps','uncertainties'].every(k=>Array.isArray(r[k]) && r[k].length<=100 && r[k].every(v=>typeof v==='string' && v.length<=4000));
}
function hydrateIcons(root=document) { root.querySelectorAll('[data-icon]').forEach(el=>{el.innerHTML=icon(el.dataset.icon);}); }
function toast(message) { const el=$('#toast'); el.textContent=message; el.classList.add('visible'); clearTimeout(toast.timer); toast.timer=setTimeout(()=>el.classList.remove('visible'),4500); }
function persist(next) {
 if (!storageHealthy) { toast('Saved data could not be read. Export your current view before resetting browser storage.'); return false; }
 try { localStorage.setItem(STORAGE_KEY,JSON.stringify(next)); recipes=next; return true; }
 catch { toast('Your browser could not save this. Free storage or export a backup before closing.'); return false; }
}
function imageFor(r) { return ['soup','pasta','salad','cookies','rice','curry'].includes(r.image) ? r.image : ({'Comfort food':'soup','Quick & easy':'rice','Something sweet':'cookies','For sharing':'salad'}[r.category]||'soup'); }
function selectedRecipes() {
 let result=recipes.filter(r=>(view!=='favorites'||r.favorite) && (filter==='All recipes'||r.category===filter) && [r.title,r.author,r.description,...r.ingredients].join(' ').toLowerCase().includes(search.toLowerCase()));
 if(sortAlphabetical)result.sort((a,b)=>a.title.localeCompare(b.title));
 return result;
}
function render() {
 $('#total-count').textContent=recipes.length; $('#favorite-count').textContent=recipes.filter(r=>r.favorite).length;
 $$('.nav-item').forEach(el=>el.classList.toggle('active',el.dataset.view===view));
 const story=view==='stories'; $('#hero').hidden=view!=='all'; $('#collection').hidden=story; $('#stories').hidden=!story;
 $('#page-title').innerHTML=view==='all'?'Recipes worth keeping<span>.</span>':view==='favorites'?'The ones you come back to<span>.</span>':'Every recipe has a person<span>.</span>';
 $('#page-subtitle').textContent=view==='all'?'The meals you grew up with. The people you carry with you.':view==='favorites'?'A few favorites. A thousand little memories.':'Behind every familiar flavor, someone who made it with love.';
 $('#breadcrumb-name').textContent=view==='all'?'My cookbook':view==='favorites'?'Made with love':'The people behind it';
 $('#collection-title').textContent=view==='favorites'?'Made with love':'Your cookbook';
 if(story){renderStories();return;}
 const list=selectedRecipes(); $('#recipe-count').textContent=`${list.length} ${list.length===1?'recipe':'recipes'}`;
 $('#recipe-grid').innerHTML=list.map(r=>`<article class="recipe-card"><button class="favorite-button ${r.favorite?'selected':''}" data-favorite="${escapeHTML(r.id)}" aria-label="${r.favorite?'Unfavorite':'Favorite'} ${escapeHTML(r.title)}" aria-pressed="${!!r.favorite}">${icon('heart')}</button><button class="card-open" data-open="${escapeHTML(r.id)}" aria-label="Open ${escapeHTML(r.title)}"><div class="recipe-image"><img src="/${imageFor(r)}.svg" alt="Illustration of ${escapeHTML(r.title)}" loading="lazy"><span class="image-tag">${escapeHTML(r.category)}</span></div><div class="card-body"><h3>${escapeHTML(r.title)}</h3><p>${escapeHTML(r.description||'A new page in your family story.')}</p><div class="card-bottom"><span><span class="author-dot">${escapeHTML(r.author[0]||'♡')}</span>From ${escapeHTML(r.author)}’s kitchen</span><span>${icon('clock')}${escapeHTML(r.time)}</span></div></div></button></article>`).join('');
 $('#empty-state').hidden=list.length>0;
 $('#empty-message').textContent=view==='favorites' && !search && filter==='All recipes'?'Tap a heart on any recipe to keep it close.':'No recipes match your search. Try another ingredient or collection.';
 $('#empty-action').textContent=view==='favorites'?'Browse all recipes':'Clear filters';
}
function renderStories(){
 const authors=[...new Set(recipes.map(r=>r.author))];
 const stories={Nani:'The patient teacher. The extra portion. The voice that says, “Just a little more.”',Papa:'A handful of reliable recipes, always made with more enthusiasm than measurements.',Mira:'Collecting the little things now, so the next generation can find them later.'};
 $('#stories').innerHTML=`<div class="story-intro"><p class="eyebrow">BUILT FOR SOMEONE, NOT EVERYONE</p><h2>For Mira. And for the people she carries with her.</h2><p>Mira wants to keep her grandmother’s recipes from becoming a folder of forgotten messages. Sunday Table gives each one a place, a person, and a way to cook it again. This is an illustrative demo family, not a claimed real-world testimonial. Make this cookbook your own by adding the people and recipes that matter to you.</p></div><div class="people-grid">${authors.map(author=>`<article class="person-card"><span class="avatar">${escapeHTML(author[0]||'♡')}</span><h3>${escapeHTML(author)}</h3><p>${escapeHTML(stories[author]||'A familiar flavor. A story only they could tell.')}</p><button class="text-button" data-author="${escapeHTML(author)}">${recipes.filter(r=>r.author===author).length} recipes from this kitchen →</button></article>`).join('')}</div>`;
}
function openDialog(selector){const el=$(selector);if(!el.open)el.showModal();}
function closeDialog(el){el.closest('dialog').close();}
function openCapture(){ $('#capture-error').hidden=true; openDialog('#capture-dialog'); }
function showEditor(recipe=null, meta={}) {
 editingId=meta.editingId||null; draftMeta=meta;
 const form=$('#recipe-form');form.reset();
 const defaults={title:'',author:'',category:'Comfort food',time:'Not specified',servings:'Not specified',description:'',ingredients:[],steps:[],notes:'',uncertainties:[]};
 const r={...defaults,...recipe};
 for(const key of Object.keys(defaults))form.elements[key].value=Array.isArray(r[key])?r[key].join('\n'):r[key];
 $('#editor-title').textContent=editingId?'A little fine-tuning.':'Make it yours.';
 $('#editor-eyebrow').textContent=meta.sample?'SAMPLE DRAFT · NOT AN AI RESULT':meta.model?`DRAFTED LOCALLY WITH ${meta.model}`:'A NEW PAGE IN YOUR COOKBOOK';
 const notice=$('#review-notice');notice.hidden=!meta.model&&!meta.sample&&!r.uncertainties.length;
 notice.innerHTML=meta.sample?'<strong>This is a prewritten sample draft.</strong> Explore the review flow, or connect Ollama to extract your own notes.':meta.model?'<strong>AI draft — please review before saving.</strong> Check every quantity, step, and dietary requirement against the original note.':'';
 if(r.uncertainties.length)notice.innerHTML+=`<ul>${r.uncertainties.map(u=>`<li>${escapeHTML(u)}</li>`).join('')}</ul>`;
 $('#capture-dialog').close();$('#recipe-dialog').close();openDialog('#editor-dialog');
}
function openRecipe(id){
 const r=recipes.find(r=>r.id===id);if(!r)return;currentRecipeId=id;
 $('#recipe-detail').innerHTML=`<div class="detail-cover"><img src="/${imageFor(r)}.svg" alt="Illustration of ${escapeHTML(r.title)}"><button class="icon-button close-dialog" aria-label="Close">${icon('close')}</button></div><div class="detail-content"><div class="detail-kicker"><span>${escapeHTML(r.category)}</span><span>${escapeHTML(r.source||'Family recipe')}</span></div><h2>${escapeHTML(r.title)}</h2><p class="detail-description">${escapeHTML(r.description)}</p><div class="detail-meta"><span>${icon('people')}From ${escapeHTML(r.author)}’s kitchen</span><span>${icon('clock')}${escapeHTML(r.time)}</span><span>Servings: ${escapeHTML(r.servings)}</span></div>${r.uncertainties.length?`<div class="review-notice"><strong>A few details to check</strong><ul>${r.uncertainties.map(u=>`<li>${escapeHTML(u)}</li>`).join('')}</ul></div>`:''}<div class="detail-columns"><div><h3>What you’ll need</h3><ul class="ingredient-list">${r.ingredients.map(i=>`<li><label><input type="checkbox"><span>${escapeHTML(i)}</span></label></li>`).join('')}</ul></div><div><h3>How it comes together</h3><ol class="method-list">${r.steps.map(s=>`<li>${escapeHTML(s)}</li>`).join('')}</ol></div></div>${r.notes?`<div class="memory-note"><p class="eyebrow">THE PART YOU WON’T FIND IN A COOKBOOK</p><p>${escapeHTML(r.notes)}</p></div>`:''}${r.originalNotes?`<details class="source-notes"><summary>The original note</summary><p>${escapeHTML(r.originalNotes)}</p></details>`:''}<div class="detail-actions"><button class="button secondary" id="edit-current">${icon('edit')}Edit recipe</button><button class="button secondary" id="download-current">${icon('download')}Save recipe</button><button class="button secondary" id="print-current">${icon('print')}Print</button><button class="text-button delete-recipe" id="delete-current">Remove recipe</button></div></div>`;
 openDialog('#recipe-dialog');
}
async function checkModel(showFeedback=false){
 const btn=$('#check-model');btn.disabled=true;
 try{
  const result=await fetch('/api/health',{signal:AbortSignal.timeout(7000)});if(!result.ok)throw Error();const data=await result.json();aiReady=data.connected===true;
  $('#ai-label').textContent=aiReady?'Local AI connected':'Local AI setup';$('.status-dot').classList.toggle('connected',aiReady);
  $('#settings-status').textContent=aiReady?`Connected · ${data.model} · ready to preserve a recipe`:data.service?`Ollama is running, but ${data.model} isn’t installed. Pull the model, then check again.`:`Ollama is not connected. Your cookbook and manual editor still work. Expected model: ${data.model}.`;
  $('#capture-notice').hidden=aiReady;
  if(showFeedback)toast(aiReady?'Your local model is ready.':'No model connected yet. Follow the setup steps.');
 }catch{aiReady=false;$('#settings-status').textContent='Could not reach the app server. Start it with python server.py, then try again.';$('#ai-label').textContent='Server unavailable';$('.status-dot').classList.remove('connected');$('#capture-notice').hidden=false;if(showFeedback)toast('Could not reach the app server.');}
 finally{btn.disabled=false;}
}
async function extract(){
 if(busy)return;
 const notes=$('#recipe-notes').value.trim(),error=$('#capture-error');error.hidden=true;
 if(notes.length<20){error.textContent='Add at least 20 characters so the model has a recipe to work with.';error.hidden=false;return;}
 busy=true;const button=$('#extract-button');button.disabled=true;button.innerHTML=icon('refresh')+'Preserving the details…';button.classList.add('spin');
 try{
  const response=await fetch('/api/extract',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({notes}),signal:AbortSignal.timeout(190000)});
  const data=await response.json();if(!response.ok)throw Error(data.error||'Could not extract this recipe. Try again.');if(!validRecipe(data.recipe))throw Error('The model returned an incomplete recipe. Try again or use the manual editor.');
  if($('#capture-dialog').open)showEditor(data.recipe,{model:data.model,originalNotes:notes});
  else toast('Extraction finished after the editor was closed. Your notes are still in Add a recipe.');
 }catch(err){error.textContent=err.name==='TimeoutError'?'The model took too long. Your notes are still here; try again.':err.message;error.hidden=false;}
 finally{busy=false;button.disabled=false;button.classList.remove('spin');button.innerHTML=icon('spark')+'Make it a recipe';}
}
function download(filename,body,type='application/json'){
 const url=URL.createObjectURL(new Blob([body],{type}));const a=document.createElement('a');a.href=url;a.download=filename;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function exportCookbook(){download('sunday-table-cookbook.json',JSON.stringify({app:'Sunday Table',version:1,exportedAt:new Date().toISOString(),recipes},null,2));toast('Your cookbook is ready to keep somewhere safe.');}
function recipeMarkdown(r){return `# ${r.title}\n\nFrom ${r.author}’s kitchen · ${r.time} · Servings: ${r.servings}\n\n${r.description}\n\n## Ingredients\n\n${r.ingredients.map(i=>'- '+i).join('\n')}\n\n## Method\n\n${r.steps.map((s,i)=>`${i+1}. ${s}`).join('\n\n')}\n\n## A memory\n\n${r.notes}\n\n${r.uncertainties.length?'## Details to check\n\n'+r.uncertainties.map(u=>'- '+u).join('\n')+'\n\n':''}Source: ${r.source||'Family recipe'}\n${r.originalNotes?'\n## Original note\n\n'+r.originalNotes+'\n':''}`;}
$('#recipe-form').addEventListener('submit',event=>{
 event.preventDefault();const form=new FormData(event.target);const data=Object.fromEntries(form.entries());
 ['ingredients','steps','uncertainties'].forEach(k=>{data[k]=data[k].split('\n').map(s=>s.trim()).filter(Boolean);});
 data.title=data.title.trim();data.author=data.author.trim();data.time=data.time.trim()||'Not specified';data.servings=data.servings.trim()||'Not specified';
 if(!data.title||!data.author||!data.ingredients.length||!data.steps.length){toast('Add a name, a person, ingredients and at least one step.');return;}
 if(!validRecipe(data)){toast('Please shorten long fields before saving.');return;}
 const existing=recipes.find(r=>r.id===editingId);
 const next={...existing,...data,id:editingId||crypto.randomUUID(),favorite:existing?.favorite||false,image:existing?.image||imageFor(data),createdAt:existing?.createdAt||new Date().toISOString(),source:existing?.source||(draftMeta.sample?'Prewritten sample draft':draftMeta.model?`AI-assisted · ${draftMeta.model}`:'Written by hand'),originalNotes:existing?.originalNotes||draftMeta.originalNotes||''};
 const updated=editingId?recipes.map(r=>r.id===editingId?next:r):[next,...recipes];
 if(!persist(updated))return;
 $('#editor-dialog').close();filter='All recipes';search='';$('#search').value='';view='all';updateFilters();render();toast('A little piece of history, safely kept.');
});
function updateFilters(){$$('.filter').forEach(el=>el.classList.toggle('active',el.dataset.filter===filter));}
document.addEventListener('click',event=>{
 const close=event.target.closest('.close-dialog');if(close){closeDialog(close);return;}
 const nav=event.target.closest('[data-view]');if(nav){view=nav.dataset.view;filter='All recipes';search='';$('#search').value='';updateFilters();render();return;}
 const f=event.target.closest('[data-filter]');if(f){filter=f.dataset.filter;updateFilters();render();return;}
 const favorite=event.target.closest('[data-favorite]');if(favorite){if(persist(recipes.map(r=>r.id===favorite.dataset.favorite?{...r,favorite:!r.favorite}:r)))render();return;}
 const card=event.target.closest('[data-open]');if(card){openRecipe(card.dataset.open);return;}
 const author=event.target.closest('[data-author]');if(author){view='all';search=author.dataset.author;$('#search').value=search;filter='All recipes';updateFilters();render();return;}
 const mode=event.target.closest('[data-mode]');if(mode?.dataset.mode==='manual'){showEditor();return;}
 if(event.target.closest('#edit-current'))showEditor(recipes.find(r=>r.id===currentRecipeId),{editingId:currentRecipeId});
 if(event.target.closest('#download-current')){const r=recipes.find(r=>r.id===currentRecipeId);download(r.title.replace(/[^a-z0-9]+/gi,'-').toLowerCase()+'.md',recipeMarkdown(r),'text/markdown');}
 if(event.target.closest('#print-current'))window.print();
 if(event.target.closest('#delete-current')){const r=recipes.find(r=>r.id===currentRecipeId);if(confirm(`Remove “${r.title}” from this browser’s cookbook? Export it first if you want a backup.`)&&persist(recipes.filter(r=>r.id!==currentRecipeId))){$('#recipe-dialog').close();render();toast('Recipe removed from this cookbook.');}}
});
$('#add-recipe').onclick=openCapture;$('#preserve-button').onclick=openCapture;
$('#search').oninput=event=>{search=event.target.value;render();};
$('#sort-button').onclick=()=>{sortAlphabetical=!sortAlphabetical;$('#sort-button').setAttribute('aria-label',sortAlphabetical?'Sort recipes by newest':'Sort recipes by title');$('#sort-button').title=sortAlphabetical?'Showing A–Z; click for newest':'Showing newest; click for A–Z';render();toast(sortAlphabetical?'Recipes sorted A–Z.':'Newest recipes first.');};
$('#empty-action').onclick=()=>{if(view==='favorites')view='all';filter='All recipes';search='';$('#search').value='';updateFilters();render();};
$('#recipe-notes').oninput=event=>{$('#character-count').textContent=`${event.target.value.length.toLocaleString()} / 12,000`;};
$('#sample-notes').onclick=()=>{$('#recipe-notes').value=SAMPLE_NOTES;$('#recipe-notes').dispatchEvent(new Event('input'));};
$('#sample-draft').onclick=()=>{const sample=structuredClone(seeds[0]);sample.time='Not specified';sample.uncertainties=['The original note gives no cooking time. Cook the lentils until fully tender.','“A squeeze” of lemon and “a handful” of coriander have no exact quantities.'];showEditor(sample,{sample:true,originalNotes:SAMPLE_NOTES});};
$('#extract-button').onclick=extract;
function openSettings(){openDialog('#settings-dialog');checkModel();}
$('#ai-settings').onclick=openSettings;$('#privacy-link').onclick=openSettings;$('#capture-settings').onclick=openSettings;$('#check-model').onclick=()=>checkModel(true);
$('#export-button').onclick=exportCookbook;
$('#import-button').onclick=()=>$('#import-file').click();
$('#import-file').onchange=async event=>{
 const file=event.target.files[0];if(!file)return;
 try{
  if(file.size>5000000)throw Error('Choose a cookbook smaller than 5 MB.');
  const imported=JSON.parse(await file.text());
  if(imported.app!=='Sunday Table'||imported.version!==1||!Array.isArray(imported.recipes)||!imported.recipes.length||imported.recipes.length>500||!imported.recipes.every(validRecipe))throw Error('This file is not a valid Sunday Table cookbook.');
  const existingIds=new Set(recipes.map(r=>r.id));
  const additions=imported.recipes.filter(r=>!existingIds.has(r.id)).map(r=>({title:r.title,author:r.author,description:r.description,category:r.category,time:r.time,servings:r.servings,ingredients:r.ingredients,steps:r.steps,notes:r.notes,uncertainties:r.uncertainties,id:typeof r.id==='string'&&r.id.length<=100?r.id:crypto.randomUUID(),image:imageFor(r),favorite:!!r.favorite,source:typeof r.source==='string'?r.source.slice(0,160):'Imported recipe',originalNotes:typeof r.originalNotes==='string'?r.originalNotes.slice(0,12000):'',createdAt:typeof r.createdAt==='string'?r.createdAt:new Date().toISOString()}));
  const seen=new Set();const unique=additions.filter(r=>{if(seen.has(r.id))return false;seen.add(r.id);return true;});
  if(persist([...unique,...recipes])){render();toast(unique.length?`Imported ${unique.length} recipes. Existing recipes were kept.`:'These recipes are already in your cookbook.');}
 }catch(error){toast(error instanceof SyntaxError?'This file is not valid JSON.':error.message);}
 finally{event.target.value='';}
};
$$('dialog').forEach(dialog=>dialog.addEventListener('click',event=>{if(event.target===dialog){const rect=dialog.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)dialog.close();}}));
$('.brand').onclick=event=>{event.preventDefault();view='all';filter='All recipes';search='';$('#search').value='';updateFilters();render();window.scrollTo({top:0,behavior:'smooth'});};
hydrateIcons();render();checkModel();
if(!storageHealthy)setTimeout(()=>toast('Could not read saved data. Sample recipes are shown; your original storage has not been changed.'),700);
