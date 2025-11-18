// Worker + Durable Object per chat
export class Chat {
  constructor(state, env) {
    this.state = state;
    this.env = env;
    this.sockets = []; // array of WebSocket
  }

  async fetch(request) {
    // Quando la fetch proviene dal binding con webSocket server, request.webSocket è disponibile
    const { webSocket } = request;
    if (!webSocket) {
      return new Response('Expected WebSocket', { status: 400 });
    }

    // Accept the connection
    webSocket.accept();
    this.sockets.push(webSocket);

    // Inform others
    this.broadcastSystem(`${this.sockets.length} partecipanti`);

    webSocket.addEventListener('message', (evt) => {
      // riceve stringa dal client
      try {
        const data = JSON.parse(evt.data);
        if (data.type === 'message') {
          // rilancia a tutti
          const out = JSON.stringify({ type: 'message', name: data.name, text: data.text, time: data.time || Date.now() });
          this.broadcast(out, webSocket);
        } else if (data.type === 'join') {
          const out = JSON.stringify({ type: 'system', text: `${data.name} si è unito alla chat` });
          this.broadcast(out);
        }
      } catch (err) {
        // ignore
      }
    });

    webSocket.addEventListener('close', () => {
      this.sockets = this.sockets.filter(s => s !== webSocket);
      this.broadcastSystem(`${this.sockets.length} partecipanti`);
    });

    webSocket.addEventListener('error', () => {
      this.sockets = this.sockets.filter(s => s !== webSocket);
      this.broadcastSystem(`${this.sockets.length} partecipanti`);
    });

    return new Response(null, { status: 200 });
  }

  broadcast(msg, exceptSocket = null) {
    for (const s of this.sockets) {
      try {
        if (s !== exceptSocket && s.readyState === 1) {
          s.send(msg);
        }
      } catch (e) { /* ignore */ }
    }
  }

  broadcastSystem(text) {
    const out = JSON.stringify({ type: 'system', text });
    this.broadcast(out);
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/ws') {
      if (request.headers.get('upgrade') !== 'websocket') {
        return new Response('Expected websocket', { status: 400 });
      }
      // Ottieni l'ID della durable object (qui usiamo sempre lo stesso "room")
      const id = env.CHAT.idFromName('global-room');
      const obj = env.CHAT.get(id);

      const pair = new WebSocketPair();
      const [client, server] = Object.values(pair);

      // Passiamo il lato "server" al Durable Object
      // la chiamata obj.fetch riceverà la connessione webSocket sul request
      await obj.fetch(request, { webSocket: server });

      // Restituiamo al client il lato "client"
      return new Response(null, { status: 101, webSocket: client });
    }

    // Root: serve una semplice risposta o usata per healthcheck
    return new Response('Chat Worker OK', { status: 200 });
  }
};