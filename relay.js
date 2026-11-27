// file: relay.js — node relay.js  (Railway: start command = node relay.js)
const { WebSocketServer } = require('ws');

const PORT = process.env.PORT || 8080;
const wss = new WebSocketServer({ port: PORT });

let sender = null;
const receivers = new Set();

wss.on('connection', (ws) => {
  console.log('client connected');

  ws.on('message', (raw) => {
    let msg;
    try {
      msg = JSON.parse(raw.toString());
    } catch {
      return; // ignore non-json
    }

    if (msg.role === 'sender') {
      sender = ws;
      if (msg.code) {
        const out = JSON.stringify({ code: msg.code });
        for (const r of receivers) {
          if (r.readyState === 1) r.send(out);
        }
        console.log('forwarded code to', receivers.size, 'receiver(s)');
      }
    }

    if (msg.role === 'receiver') {
      receivers.add(ws);
      console.log('receivers:', receivers.size);
    }
  });

  ws.on('close', () => {
    receivers.delete(ws);
    if (ws === sender) sender = null;
    console.log('client left');
  });
});

console.log('relay listening on', PORT);
