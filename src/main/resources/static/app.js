const $ = id => document.getElementById(id);
const log = $('log'), input = $('input'), send = $('send'), form = $('form');
const drop = $('drop'), fileInput = $('file'), filesEl = $('files');

/* ---------- mensagens ---------- */
function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// markdown mínimo e seguro: **negrito**, `código`, listas e parágrafos
function render(text) {
  const inline = s => escapeHtml(s)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/`(.+?)`/g, '<code>$1</code>');
  const out = [];
  let list = false;
  for (const line of text.split('\n')) {
    const m = line.match(/^\s*(?:[-*•]|\d+\.)\s+(.*)/);
    if (m) {
      if (!list) { out.push('<ul>'); list = true; }
      out.push('<li>' + inline(m[1]) + '</li>');
    } else {
      if (list) { out.push('</ul>'); list = false; }
      if (line.trim()) out.push('<p>' + inline(line) + '</p>');
    }
  }
  if (list) out.push('</ul>');
  return out.join('');
}

function add(cls, content, html = false) {
  $('empty')?.remove();
  const div = document.createElement('div');
  div.className = 'msg ' + cls;
  html ? (div.innerHTML = content) : (div.textContent = content);
  log.appendChild(div);
  log.scrollTop = log.scrollHeight;
  return div;
}

async function ask(message) {
  add('user', message);
  const bot = add('bot', '<span class="dots"><i></i><i></i><i></i></span>', true);
  send.disabled = true;
  try {
    const res = await fetch('/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ' + res.status);
    bot.innerHTML = render(data.reply);
  } catch (err) {
    bot.className = 'msg bot error';
    bot.textContent = err.message;
  } finally {
    send.disabled = false;
    log.scrollTop = log.scrollHeight;
    input.focus();
  }
}

form.addEventListener('submit', e => {
  e.preventDefault();
  const message = input.value.trim();
  if (!message || send.disabled) return;
  input.value = '';
  autoGrow();
  ask(message);
});

input.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); form.requestSubmit(); }
});

function autoGrow() {
  input.style.height = 'auto';
  input.style.height = Math.min(input.scrollHeight, 160) + 'px';
}
input.addEventListener('input', autoGrow);

document.querySelectorAll('.chip').forEach(c => c.onclick = () => ask(c.textContent));

/* ---------- arquivos ---------- */
function renderFiles(files) {
  filesEl.innerHTML = '';
  for (const f of files) {
    const ext = (f.name.split('.').pop() || '').slice(0, 4);
    const li = document.createElement('li');
    li.innerHTML = '<span class="ext"></span><span class="name"></span><button class="rm" title="Remover">×</button>';
    li.querySelector('.ext').textContent = ext;
    li.querySelector('.name').innerHTML = escapeHtml(f.name) +
      '<small>' + f.chars.toLocaleString('pt-BR') + ' caracteres' + (f.truncated ? ' · truncado' : '') + '</small>';
    li.querySelector('.rm').onclick = async () => {
      await fetch('/upload?name=' + encodeURIComponent(f.name), { method: 'DELETE' });
      add('note', f.name + ' removido. A IA não enxerga mais esse arquivo.');
      loadFiles();
    };
    filesEl.appendChild(li);
  }
  const has = files.length > 0;
  $('clear').hidden = !has;
  const badge = $('status');
  badge.className = 'badge ' + (has ? 'on' : 'off');
  badge.textContent = has ? files.length + (files.length === 1 ? ' arquivo ativo' : ' arquivos ativos') : 'Sem arquivos';
}

async function loadFiles() {
  try { renderFiles(await (await fetch('/upload')).json()); } catch { /* servidor offline */ }
}

async function upload(file) {
  const li = document.createElement('li');
  li.className = 'loading';
  li.innerHTML = '<span class="ext">...</span><span class="name"></span>';
  li.querySelector('.name').textContent = 'Lendo ' + file.name + '...';
  filesEl.appendChild(li);
  const fd = new FormData();
  fd.append('file', file);
  try {
    const res = await fetch('/upload', { method: 'POST', body: fd });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ' + res.status);
    add('note', '📎 ' + data.name + ' enviado. Agora a IA consegue ler esse arquivo.');
  } catch (err) {
    add('bot error', 'Não consegui ler ' + file.name + ': ' + err.message);
  }
  loadFiles();
}

async function uploadAll(list) {
  for (const f of list) await upload(f);
}

fileInput.addEventListener('change', async () => {
  await uploadAll([...fileInput.files]);
  fileInput.value = '';
});

['dragenter', 'dragover'].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.add('over'); }));
['dragleave', 'drop'].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.remove('over'); }));
drop.addEventListener('drop', e => uploadAll([...e.dataTransfer.files]));

$('clear').onclick = async () => {
  await fetch('/upload', { method: 'DELETE' });
  add('note', 'Todos os arquivos foram removidos.');
  loadFiles();
};

loadFiles();
