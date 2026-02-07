/**
 * ローカル開発用APIサーバー（モックデータ使用）
 * 実行: node server/local-api.js
 * フロントエンドの VITE_API_URL を http://localhost:3001/api に設定して使用
 */

import { createServer } from 'http';

const MOCK_GUESTS = {
  abc123: {
    inviteCode: 'abc123',
    name: '山田家',
    message: 'いつもお世話になっております。ぜひお越しください。',
    rsvpStatus: 'pending',
    rsvpMessage: null,
    members: [
      { name: '山田太郎', attending: undefined },
      { name: '山田花子', attending: undefined },
      { name: '山田一郎', attending: undefined },
    ],
  },
  xyz789: {
    inviteCode: 'xyz789',
    name: '佐藤家',
    message: 'お二人の門出を心よりお祝い申し上げます。',
    rsvpStatus: 'pending',
    rsvpMessage: null,
    members: [
      { name: '佐藤花子', attending: undefined },
      { name: '佐藤健一', attending: undefined },
    ],
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
        const members = Array.isArray(data.members) ? data.members : [];
        const anyAttending = members.some((m) => m.attending);
        const allDeclined = members.length > 0 && members.every((m) => !m.attending);
        const rsvpStatus = allDeclined ? 'declined' : anyAttending ? 'attending' : 'pending';
        const membersToSave = members.map((m) => ({
          name: m.name,
          attending: !!m.attending,
          allergy: m.allergy || undefined,
          note: m.note || undefined,
        }));
        const updated = {
          ...guest,
          members: membersToSave.length > 0 ? membersToSave : guest.members,
          rsvpStatus,
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
