// ATTENZIONE: sostituisci WORKER_WS_URL con l'URL wss del Worker (vedi README)
// es: const WORKER_WS_URL = "wss://nome-worker.username.workers.dev/ws";
const WORKER_WS_URL = "wss://REPLACE_WITH_YOUR_WORKER_DOMAIN/ws";

const login = document.getElementById('login');
const joinBtn = document.getElementById('joinBtn');
const nameInput = document.getElementById('nameInput');

const app = document.getElementById('app');
const statusEl = document.getElementById('status');
const messagesEl = document.getElementById('messages');
const msgInput = document.getElementById('msgInput');
const sendBtn = document.getElementById('sendBtn');

let ws = null;
let myName = '';

function appendMessage(author, text, time = null) {
  const el = document.createElement('div');
  el.className = 'message';
  const meta = document.createElement('div');
  meta.className = 'meta';
  meta.textContent = `${author} ${time ? '• ' + new Date(time).toLocaleTimeString() : ''}`;
  const body = document.createElement('div');
  body.textContent = text;
  el.appendChild(meta);
  el.appendChild(body);
  messagesEl.appendChild(el);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function setStatus(s) {
  statusEl.textContent = s;
}

function connect() {
  if (!myName) return;
  try {
    ws = new WebSocket(WORKER_WS_URL);
  } catch (e) {
    setStatus('errore connessione');
    return;
  }

  ws.addEventListener('open', () => {
    setStatus('connesso');
    // invia evento di join
    ws.send(JSON.stringify({ type: 'join', name: myName }));
  });

  ws.addEventListener('message', (e) => {
    try {
      const msg = JSON.parse(e.data);
      if (msg.type === 'message') {
        appendMessage(msg.name, msg.text, msg.time);
      } else if (msg.type === 'system') {
        appendMessage('Sistema', msg.text);
      }
    } catch (err) {
      console.error('invalid message', e.data);
    }
  });

  ws.addEventListener('close', () => {
    setStatus('disconnesso');
    appendMessage('Sistema', 'Sei stato disconnesso. Ricarica la pagina per riconnetterti.');
    ws = null;
  });

  ws.addEventListener('error', () => {
    setStatus('errore');
  });
}

joinBtn.addEventListener('click', () => {
  const nm = nameInput.value.trim();
  if (!nm) return alert('Inserisci un nome');
  myName = nm;
  login.classList.add('hidden');
  app.classList.remove('hidden');
  connect();
});

sendBtn.addEventListener('click', () => {
  const text = msgInput.value.trim();
  if (!text || !ws || ws.readyState !== WebSocket.OPEN) return;
  const payload = { type: 'message', name: myName, text, time: Date.now() };
  ws.send(JSON.stringify(payload));
  msgInput.value = '';
});

msgInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') sendBtn.click();
});