// Prendi elementi HTML
const login = document.getElementById('login');
const joinBtn = document.getElementById('joinBtn');
const nameInput = document.getElementById('nameInput');
const app = document.getElementById('app');
const messagesEl = document.getElementById('messages');
const msgInput = document.getElementById('msgInput');
const sendBtn = document.getElementById('sendBtn');

let myName = '';

// Prendi Firebase dal codice che abbiamo messo in index.html
const { db, collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } = window.firebaseDB;

// Funzione per mostrare un messaggio
function mostraMessaggio(autore, testo, orario) {
  const el = document.createElement('div');
  el.className = 'message';
  
  const meta = document.createElement('div');
  meta.className = 'meta';
  meta. textContent = `${autore} ${orario ? '• ' + new Date(orario).toLocaleTimeString() : ''}`;
  
  const body = document. createElement('div');
  body. textContent = testo;
  
  el.appendChild(meta);
  el.appendChild(body);
  messagesEl.appendChild(el);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

// Quando clicchi "Entra"
joinBtn.addEventListener('click', () => {
  const nome = nameInput.value.trim();
  if (!nome) return alert('Inserisci un nome');
  myName = nome;
  login.classList.add('hidden');
  app.classList.remove('hidden');
});

// Quando clicchi "Invia"
sendBtn.addEventListener('click', async () => {
  const testo = msgInput.value. trim();
  if (!testo) return;
  
  try {
    // Salva il messaggio su Firebase
    await addDoc(collection(db, 'messaggi'), {
      autore: myName,
      testo: testo,
      orario: serverTimestamp()
    });
    msgInput.value = '';
  } catch (errore) {
    console.error('Errore:', errore);
    alert('Errore invio messaggio');
  }
});

// Invio con tasto Enter
msgInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') sendBtn.click();
});

// Ascolta i messaggi in tempo reale
const q = query(collection(db, 'messaggi'), orderBy('orario', 'asc'));
onSnapshot(q, (snapshot) => {
  messagesEl.innerHTML = ''; // Pulisci
  snapshot.forEach(doc => {
    const dati = doc.data();
    const ts = dati.orario ? dati.orario.toDate(). getTime() : Date.now();
    mostraMessaggio(dati.autore, dati. testo, ts);
  });
});
