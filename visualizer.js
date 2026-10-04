// Visualizer: each operation builds a list of steps {m: message, l: list, h: highlighted indexes, n: pending new node}.
let list = [10, 20, 30], steps = [], cur = 0, timer = null;
const S = (m, l, h = [], n = null) => ({m, l: [...l], h, n});
const node = (v, c = '') => `<div class="node ${c}"><span class="p">PREV</span><b>${v}</b><span class="n">NEXT</span></div>`;

function draw(l, hl = [], nv = null) {
  const row = l.length
    ? '<span class="nul">NULL</span>' + l.map((v, i) => (i ? '<span class="arr">⇄</span>' : '<span class="arr">←</span>') + node(v, hl.includes(i) ? 'hl' : '')).join('') + '<span class="arr">→</span><span class="nul">NULL</span>'
    : '<span class="nul">head = NULL (empty list)</span>';
  $('#stage').innerHTML = (nv !== null ? `<div class="newrow">New node: ${node(nv, 'new')}</div>` : '') + `<div class="row">${row}</div>` +
    (l.length ? `<div class="labels">head → ${l[0]} &nbsp;|&nbsp; tail → ${l[l.length - 1]}</div>` : '');
}

const ops = {
  head(v) { const o = list, n = [v, ...o];
    return [S(`Step 1: Create a new node with data ${v}.`, o, [], v),
      S('Step 2: newNode->next = head.', o, o.length ? [0] : [], v),
      S('Step 3: newNode->prev = NULL.', o, [], v),
      S(o.length ? 'Step 4: head->prev = newNode.' : 'Step 4: List was empty, so there is no head->prev to update.', o, o.length ? [0] : [], v),
      S('Step 5: head = newNode. Done!', n, [0])]; },
  tail(v) { const o = list, n = [...o, v], L = o.length - 1;
    if (!o.length) return [S(`Step 1: Create a new node with data ${v}.`, o, [], v), S('Step 2: List is empty, so head = newNode. Done!', n, [0])];
    return [S(`Step 1: Create a new node with data ${v}.`, o, [], v),
      S('Step 2: Move temp along next until temp->next == NULL.', o, [L], v),
      S('Step 3: temp->next = newNode.', o, [L], v),
      S('Step 4: newNode->prev = temp; newNode->next = NULL. Done!', n, [L, L + 1])]; },
  pos(v, p) { const o = list; if (p === 1) return ops.head(v); if (p === o.length + 1) return ops.tail(v);
    const k = p - 2, n = [...o]; n.splice(p - 1, 0, v);
    return [S(`Step 1: Create a new node with data ${v}.`, o, [], v),
      S(`Step 2: Move temp to position ${p - 1} (node ${o[k]}).`, o, [k], v),
      S(`Step 3: newNode->next = temp->next (${o[k + 1]}); newNode->prev = temp (${o[k]}).`, o, [k, k + 1], v),
      S('Step 4: temp->next->prev = newNode.', o, [k + 1], v),
      S('Step 5: temp->next = newNode. Done!', n, [k, k + 1, k + 2])]; },
  delhead() { const o = list;
    if (o.length === 1) return [S('Step 1: temp = head.', o, [0]), S('Step 2: Only one node, so head = NULL; free(temp). Done!', [])];
    return [S('Step 1: temp = head.', o, [0]), S('Step 2: head = head->next.', o, [1]),
      S('Step 3: head->prev = NULL.', o.slice(1), [0]), S(`Step 4: free(temp) removes ${o[0]}. Done!`, o.slice(1), [0])]; },
  deltail() { const o = list, L = o.length - 1; if (!L) return ops.delhead();
    return [S('Step 1: Move temp to the last node.', o, [L]), S('Step 2: temp->prev->next = NULL.', o, [L - 1]),
      S(`Step 3: free(temp) removes ${o[L]}. Done!`, o.slice(0, L), [L - 1])]; },
  delpos(_, p) { const o = list; if (p === 1) return ops.delhead(); if (p === o.length) return ops.deltail();
    const k = p - 1, n = [...o]; n.splice(k, 1);
    return [S(`Step 1: Move temp to position ${p} (node ${o[k]}).`, o, [k]),
      S('Step 2: temp->prev->next = temp->next.', o, [k - 1, k + 1]),
      S('Step 3: temp->next->prev = temp->prev.', o, [k - 1, k + 1]),
      S(`Step 4: free(temp) removes ${o[k]}. Done!`, n, [k - 1, k])]; },
  fwd() { const o = list;
    return [...o.map((v, i) => S(`Visit ${v}, then temp = temp->next.`, o, [i])), S('temp == NULL, forward traversal finished: ' + o.join(' → '), o)]; },
  bwd() { const o = list, r = [...o.keys()].reverse();
    return [S('Move temp to the tail (last node).', o, [o.length - 1]), ...r.map(i => S(`Visit ${o[i]}, then temp = temp->prev.`, o, [i])),
      S('temp == NULL, backward traversal finished: ' + [...o].reverse().join(' → '), o)]; }
};

function show(i) {
  cur = Math.max(0, Math.min(i, steps.length - 1)); const s = steps[cur]; if (!s) return;
  draw(s.l, s.h, s.n); $('#msg').textContent = s.m;
  $('#steps').innerHTML = steps.map((x, k) => `<li class="${k === cur ? 'on' : k < cur ? 'done' : ''}">${x.m}</li>`).join('');
}
function stop() { clearInterval(timer); timer = null; $('#play').textContent = '▶ Play Animation'; }
function play() {
  if (!steps.length) return toast('Run an operation first');
  if (timer) return stop();
  if (cur >= steps.length - 1) show(0);
  $('#play').textContent = '⏸ Pause';
  timer = setInterval(() => { if (cur >= steps.length - 1) return stop(); show(cur + 1); }, 1200);
}

function exec(op) {
  stop();
  if (op === 'clear') { list = []; steps = []; draw(list); $('#steps').innerHTML = ''; $('#msg').textContent = 'List cleared.'; return toast('List cleared'); }
  const v = parseInt($('#val').value, 10), p = parseInt($('#pos').value, 10), n = list.length;
  const ins = ['head', 'tail', 'pos'].includes(op);
  if (ins && Number.isNaN(v)) return toast('Enter an integer value first');
  if (ins && n >= 8) return toast('Maximum 8 nodes in the visualizer');
  if (!ins && !n) return toast('List is empty (underflow)');
  if (['pos', 'delpos'].includes(op)) { const max = op === 'pos' ? n + 1 : n; if (!(p >= 1 && p <= max)) return toast(`Position must be between 1 and ${max}`); }
  steps = ops[op](v, p);
  if (!['fwd', 'bwd'].includes(op)) list = steps[steps.length - 1].l;
  mark('visualizer'); show(0); play();
}

document.querySelectorAll('[data-op]').forEach(b => b.onclick = () => exec(b.dataset.op));
$('#prev').onclick = () => { stop(); show(cur - 1); };
$('#next').onclick = () => { stop(); show(cur + 1); };
$('#play').onclick = play;
$('#reset').onclick = () => { stop(); show(0); };
draw(list);
