// Quiz: loads questions from the Flask API, gives instant feedback, shows score.
let Q = [], i = 0, score = 0, total = 15;
const esc = s => s.replace(/[&<>]/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;'}[c]));

function home() {
  $('#quiz').innerHTML = `<p>Choose a mode. Questions include multiple choice, true/false, output prediction, pointer and C code questions.</p>
  <div class="actions"><button class="btn" id="full">Practice Quiz (15)</button><button class="btn alt" id="mini">Mini Exam (10)</button></div>`;
  $('#full').onclick = () => start(15); $('#mini').onclick = () => start(10);
}
async function start(n) {
  total = n;
  try { Q = (await (await fetch('/api/questions')).json()).sort(() => Math.random() - .5).slice(0, n); }
  catch (e) { return toast('Could not load questions'); }
  i = 0; score = 0; ask();
}
function ask() {
  const q = Q[i];
  $('#quiz').innerHTML = `<p class="muted">Question ${i + 1} of ${Q.length} · Score ${score}</p><h2>${esc(q.q)}</h2>` +
    (q.code ? `<pre><code>${esc(q.code)}</code></pre>` : '') +
    `<div>${q.o.map((o, k) => `<button class="opt" data-k="${k}">${esc(o)}</button>`).join('')}</div><div id="fb"></div>`;
  document.querySelectorAll('.opt').forEach(b => b.onclick = () => answer(+b.dataset.k));
}
function answer(k) {
  const q = Q[i], ok = k === q.a; if (ok) score++;
  document.querySelectorAll('.opt').forEach((b, j) => { b.disabled = true; if (j === q.a) b.classList.add('right'); else if (j === k) b.classList.add('wrong'); });
  $('#fb').innerHTML = `<p><b>${ok ? '✅ Correct!' : '❌ Wrong.'}</b> Correct answer: ${esc(q.o[q.a])}.<br>${esc(q.e)}</p><button class="btn" id="nx">${i + 1 < Q.length ? 'Next Question' : 'See Result'}</button>`;
  $('#nx').onclick = () => { i++; i < Q.length ? ask() : finish(); };
}
function finish() {
  const pct = Math.round(score / Q.length * 100);
  const msg = pct >= 80 ? 'Excellent' : pct >= 60 ? 'Good' : pct >= 40 ? 'Keep Practicing' : 'Review the concepts';
  mark('quiz');
  $('#quiz').innerHTML = `<h2>Result</h2><p>Score: <b>${score}/${Q.length}</b> · Percentage: <b>${pct}%</b> · Correct answers: <b>${score}</b></p><p class="msg">${msg}</p>
  <div class="actions"><button class="btn" id="again">Try Again</button><button class="btn alt" id="rs">Reset Quiz</button></div>`;
  $('#again').onclick = () => start(total); $('#rs').onclick = home;
}
home();
