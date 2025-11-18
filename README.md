```markdown
# Chat Live (static + Workers Durable Object)

Questo repository contiene:
- front-end statico: index.html, style.css, main.js
- Cloudflare Worker + Durable Object per gestire WebSocket: worker/index.js
- wrangler.toml per la configurazione del Worker.

Prerequisiti
1. Account Cloudflare
2. Node.js + npm
3. wrangler (Cloudflare CLI) installato: `npm install -g wrangler`
4. Un repository GitHub (questa cartella verrà messa nel repo)

Istruzioni passo-passo
1) Crea il repository su GitHub (es. `meskrebooted/chat`) e push del contenuto.
   git init
   git add .
   git commit -m "init chat-live"
   git remote add origin git@github.com:TUO_ACCOUNT/chat.git
   git push -u origin main

2) Configura Cloudflare Pages (front-end)
   - Vai nel dashboard Cloudflare -> Pages -> Create a project.
   - Connetti il repository GitHub creato.
   - Configura:
     - Build command: (lascia vuoto)
     - Build output directory: `/` o lascia il default (servirà il file index.html alla radice)
   - Deploy: la Pages farà il deploy del front-end automaticamente.

3) Configura e pubblica il Worker (backend WebSocket)
   - Crea un API token in Cloudflare con permessi su Workers e Durable Objects, oppure usa la Global API Key se preferisci.
   - In locale:
     - `wrangler login` oppure `wrangler config` (segui la guida ufficiale)
     - Apri `wrangler.toml` e sostituisci `account_id` con il tuo Account ID.
   - Pubblica: `wrangler publish`
     - Dopo il deploy, wrangler ti darà un URL come `https://chat-worker.<account>.workers.dev`.
     - Prendi l'URL e costruisci il WebSocket URL: `wss://chat-worker.<account>.workers.dev/ws`
   - Modifica `main.js`: sostituisci `WORKER_WS_URL` con il tuo `wss://.../ws` ottenuto dal publish.

4) Testare
   - Apri la URL della Pages (es.: https://project.pages.dev) in due o più browser/device, inserisci nomi diversi e prova a scambiare messaggi.

Note e suggerimenti
- Puoi configurare Cloudflare Pages per pubblicare automaticamente ad ogni push su `main`.
- Per avere il Worker sotto lo stesso dominio della Pages serve un setup di routing su Cloudflare (Route o Workers on custom domain). In alternativa usa il wss su workers.dev (più semplice per iniziare).
- Sicurezza: questo esempio è minimo e non fa autenticazione né sanitizzazione complessa. Non usare per dati sensibili senza ulteriori controlli.
- Log e debugging: `wrangler tail` può aiutare a vedere i log del Worker.

Se vuoi, posso:
- generare una versione del repo pronta per upload (zip) o mostrarti i comandi esatti per creare il repo e pushare i file;
- guidarti passo‑passo nella console Cloudflare per creare l'API token e nelle impostazioni wrangler;
- aggiungere salvataggio della cronologia dei messaggi nella Durable Object.
```