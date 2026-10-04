// Shared helpers: toast, theme, progress tracker, search, code highlighting/copy.
const $ = (s, r = document) => r.querySelector(s);
const SECTIONS = {intro:'Introduction',node:'Node Structure',ops:'Operations',visualizer:'Visualization',code:'C Programming',complexity:'Complexity',quiz:'Quiz',viva:'Viva'};

function toast(m){const t=document.createElement('div');t.className='toast';t.textContent=m;$('#toasts').append(t);setTimeout(()=>t.remove(),2600);}

// ---- Dark / light mode (saved in localStorage) ----
const root = document.documentElement;
root.dataset.theme = localStorage.getItem('dll_theme') || 'light';
$('#theme').onclick = () => { const n = root.dataset.theme === 'dark' ? 'light' : 'dark'; root.dataset.theme = n; localStorage.setItem('dll_theme', n); };

// ---- Progress tracker (localStorage, also synced to /api/progress) ----
function done(){try{return JSON.parse(localStorage.getItem('dll_done'))||[]}catch(e){return[]}}
function save(d){localStorage.setItem('dll_done',JSON.stringify(d));fetch('/api/progress',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({done:d})}).catch(()=>{});}
function mark(id){const d=done();if(!d.includes(id)){d.push(id);save(d);toast('✓ '+SECTIONS[id]+' completed');}drawProgress();}
function drawProgress(){const d=done(),p=Math.round(d.length/8*100);$('#bar').style.width=p+'%';$('#pct').textContent=p+'%';
  const c=$('#checklist');if(c)c.innerHTML=Object.entries(SECTIONS).map(([k,v])=>`<li class="${d.includes(k)?'ok':''}">${d.includes(k)?'✓':'○'} ${v}</li>`).join('');}
drawProgress();
fetch('/api/progress').then(r=>r.json()).then(s=>{const d=[...new Set([...done(),...(s.done||[])])].filter(k=>k in SECTIONS);localStorage.setItem('dll_done',JSON.stringify(d));drawProgress();}).catch(()=>{});
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){mark(e.target.dataset.track);io.unobserve(e.target);}}),{threshold:.4});
document.querySelectorAll('[data-track]').forEach(s=>io.observe(s));

// ---- Search ----
const IDX=[['node struct data prev next pointer','Node Structure','/learn#node'],['linked list doubly introduction what is','Introduction','/learn#intro'],
['how it works create connect traverse','How it works','/learn#works'],['insertion insert deletion delete traversal operations algorithm','Operations','/learn#ops'],
['c code program menu malloc','C Program','/learn#code'],['complexity time space big o','Complexity','/learn#complexity'],['singly compare difference','Singly vs Doubly','/learn#compare'],
['advantages disadvantages','Pros and Cons','/learn#pros'],['applications browser undo playlist lru','Applications','/learn#apps'],['mistakes pointer null','Common Mistakes','/learn#mistakes'],
['visualizer animation visualize','Visualizer','/visualizer'],['quiz exam mcq score','Quiz','/quiz'],['viva challenges practice coding','Practice & Viva','/practice']];
$('#search').oninput=e=>{const q=e.target.value.trim().toLowerCase(),r=$('#results');if(!q){r.hidden=true;return;}
  const h=IDX.filter(i=>i[0].includes(q)||i[1].toLowerCase().includes(q));r.hidden=false;r.innerHTML=h.length?h.map(x=>`<a href="${x[2]}">${x[1]}</a>`).join(''):'<span>No match found</span>';};

// ---- C syntax highlighting + Copy button ----
document.querySelectorAll('pre code').forEach(c=>{
  const raw=c.textContent;
  c.innerHTML=raw.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/(\/\/.*|#include.*|"[^"]*"|\b(?:struct|int|void|if|else|while|return|for|switch|case|break|default|do)\b|\b(?:printf|scanf|malloc|free|NULL)\b|\b\d+\b)/g,
    m=>`<span class="t-${m[0]==='/'||m[0]==='#'?'c':m[0]==='"'?'s':/^\d/.test(m)?'n':/^(printf|scanf|malloc|free|NULL)$/.test(m)?'f':'k'}">${m}</span>`);
  const b=document.createElement('button');b.className='btn small copy';b.textContent='Copy Code';
  b.onclick=()=>navigator.clipboard.writeText(raw).then(()=>toast('Code copied!'),()=>toast('Copy failed'));
  c.parentElement.before(b);
});
