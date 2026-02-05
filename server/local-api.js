/**
 * ローカル開発用APIサーバー（モックデータ使用）
 * 実行: node server/local-api.js
 * フロントエンドの VITE_API_URL を http://localhost:3001/api に設定して使用
 */

import { createServer } from 'http';

const MOCK_GUESTS = {
  abc123: {
    inviteCode: 'abc123',
    name: '山田太郎',
    message: 'いつもお世話になっております。ぜひお越しください。',
    rsvpStatus: 'pending',
    plusOneCount: 0,
    rsvpMessage: null,
  },
  xyz789: {
    inviteCode: 'xyz789',
    name: '佐藤花子',
    message: 'お二人の門出を心よりお祝い申し上げます。',
    rsvpStatus: 'pending',
    plusOneCount: 0,
    rsvpMessage: null,
  },
};

const guests = { ...MOCK_GUESTS };

const server = createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const getMatch = req.url?.match(/^\/api\/guests\/([^/]+)$/);
  const postMatch = req.url?.match(/^\/api\/guests\/([^/]+)\/rsvp$/);

  if (getMatch && req.method === 'GET') {
    const code = getMatch[1];
    const guest = guests[code];
    if (!guest) {
      res.writeHead(404);
      res.end(JSON.stringify({ error: 'Guest not found' }));
      return;
    }
    res.writeHead(200);
    res.end(JSON.stringify(guest));
    return;
  }

  if (postMatch && req.method === 'POST') {
    const code = postMatch[1];
    const guest = guests[code];
    if (!guest) {
      res.writeHead(404);
      res.end(JSON.stringify({ error: 'Guest not found' }));
      return;
    }
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        const updated = {
          ...guest,
          rsvpStatus: data.rsvpStatus || 'attending',
          plusOneCount: data.plusOneCount ?? 0,
          rsvpMessage: data.rsvpMessage || null,
          updatedAt: new Date().toISOString(),
        };
        guests[code] = updated;
        res.writeHead(200);
        res.end(JSON.stringify(updated));
      } catch {
        res.writeHead(400);
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }
    });
    return;
  }

  res.writeHead(404);
  res.end(JSON.stringify({ error: 'Not found' }));
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`Local API running at http://localhost:${PORT}`);
  console.log('  GET  /api/guests/:code');
  console.log('  POST /api/guests/:code/rsvp');
  console.log('\nSet VITE_API_URL=http://localhost:3001 in .env.local');
});
