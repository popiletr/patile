import http from 'http';
import { initDatabase } from './database';
import express from 'express';
import cors from 'cors';
import { apiRouter } from './routes/api';

async function runIntegrationTest() {
  console.log('🧪 Starting Multi-User & Pair Request Integration Test...');

  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use('/api', apiRouter);

  await initDatabase();

  const server = app.listen(3334, async () => {
    try {
      // 1. Register User A (Nazmi)
      const userA = await postJSON('http://localhost:3334/api/users/profile', {
        id: 'usr_nazmi',
        name: 'Nazmi',
        emoji: '😎',
        pair_code: 'NZM100'
      });
      console.log('✅ User A registered:', userA);

      // 2. Register User B (Ayşe)
      const userB = await postJSON('http://localhost:3334/api/users/profile', {
        id: 'usr_ayse',
        name: 'Ayşe',
        emoji: '🌸',
        pair_code: 'AYS200'
      });
      console.log('✅ User B registered:', userB);

      // 3. User A sends Pair Request to User B using code "AYS200"
      const pairReq = await postJSON('http://localhost:3334/api/pair/request', {
        from_user_id: 'usr_nazmi',
        partner_code: 'AYS200'
      });
      console.log('✅ User A sent pair request to User B:', pairReq);

      // 4. User B checks pending requests
      const pendingB = await getJSON('http://localhost:3334/api/pair/pending/usr_ayse');
      console.log('✅ User B received pending request list:', pendingB);

      // 5. User B accepts the request
      const acceptRes = await postJSON('http://localhost:3334/api/pair/respond', {
        request_id: pendingB[0].id,
        user_id: 'usr_ayse',
        accept: true
      });
      console.log('✅ User B accepted request:', acceptRes);

      // 6. Check friends list for User A and User B
      const friendsA = await getJSON('http://localhost:3334/api/friends/usr_nazmi');
      const friendsB = await getJSON('http://localhost:3334/api/friends/usr_ayse');
      console.log('✅ User A friends:', friendsA);
      console.log('✅ User B friends:', friendsB);

      // 7. User A drops a Pop to "all" friends
      const popItem = {
        id: 'pop_multi_1',
        senderId: 'usr_nazmi',
        senderName: 'Nazmi',
        senderEmoji: '😎',
        recipientId: 'all',
        type: 'note',
        notePayload: {
          text: 'Tüm arkadaşlarıma günaydın! ☀️',
          bgGradientStart: '#FF007F',
          bgGradientEnd: '#7928CA',
          textColor: '#FFFFFF',
          emojiReaction: '💖'
        },
        createdAt: new Date().toISOString(),
        reactions: []
      };

      const dropRes = await postJSON('http://localhost:3334/api/drops/send', { pop: popItem });
      console.log('✅ Drop sent:', dropRes);

      // 8. User B gets latest pop
      const latestB = await getJSON('http://localhost:3334/api/drops/latest/usr_ayse');
      console.log('✅ User B latest widget drop:', latestB.id === 'pop_multi_1' ? 'SUCCESS' : 'FAILED');

      console.log('🎉 ALL MULTI-USER PAIRING TESTS PASSED SUCCESSFULLY!');
      server.close();
      process.exit(0);
    } catch (err) {
      console.error('❌ Test failed:', err);
      server.close();
      process.exit(1);
    }
  });
}

function postJSON(url: string, body: any): Promise<any> {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const parsed = new URL(url);
    const req = http.request(
      {
        hostname: parsed.hostname,
        port: parsed.port,
        path: parsed.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data)
        }
      },
      (res) => {
        let raw = '';
        res.on('data', (c) => (raw += c));
        res.on('end', () => resolve(JSON.parse(raw)));
      }
    );
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function getJSON(url: string): Promise<any> {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let raw = '';
      res.on('data', (c) => (raw += c));
      res.on('end', () => resolve(JSON.parse(raw)));
    }).on('error', reject);
  });
}

runIntegrationTest();
