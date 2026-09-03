import { Router, Request, Response } from 'express';
import { db } from '../database';
import { sendSilentPush } from '../services/apns';
import { syncUserToFirestore, syncDropToFirestore, syncFriendshipToFirestore } from '../firestore';
import crypto from 'crypto';

export const apiRouter = Router();

// MARK: - Fast Register / Sync Profile
apiRouter.post('/auth/register', (req: Request, res: Response) => {
  let { id, email, username, name, emoji, pair_code } = req.body;

  if (!name) name = 'B!Pop Üyesi';
  if (!emoji) emoji = '';

  const cleanUsername = (username || `user_${Date.now().toString().slice(-4)}`)
    .toLowerCase()
    .replace('@', '')
    .trim();

  const userId = id || `usr_${crypto.randomBytes(8).toString('hex')}`;
  const pairCode = (pair_code || cleanUsername.toUpperCase().slice(0, 6)).toUpperCase();

  const query = `
    INSERT INTO users (id, email, username, name, emoji, pair_code)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      email=COALESCE(excluded.email, users.email),
      username=COALESCE(excluded.username, users.username),
      name=excluded.name,
      emoji=excluded.emoji,
      pair_code=excluded.pair_code
  `;

  db.run(query, [userId, email || null, cleanUsername, name, emoji, pairCode], function (err) {
    if (err) {
      if (err.message.includes('UNIQUE constraint failed: users.username')) {
        return res.status(400).json({ error: 'Bu kullanıcı adı zaten kullanılıyor.' });
      }
      return res.status(500).json({ error: err.message });
    }

    const userData = {
      id: userId,
      email: email || '',
      username: cleanUsername,
      name,
      emoji: '',
      pairCode
    };

    // Sync to Cloud Firestore
    syncUserToFirestore(userData);

    res.json({
      success: true,
      user: userData
    });
  });
});

// MARK: - Fast Login (by Email or Username)
apiRouter.post('/auth/login', (req: Request, res: Response) => {
  const { identifier } = req.body;
  if (!identifier) {
    return res.status(400).json({ error: 'Kullanıcı adı veya e-posta girilmelidir.' });
  }

  const clean = identifier.toLowerCase().replace('@', '').trim();

  const query = `
    SELECT id, email, username, name, emoji, pair_code
    FROM users
    WHERE username = ? OR email = ? OR pair_code = ?
    LIMIT 1
  `;

  db.get(query, [clean, clean, clean.toUpperCase()], (err, user: any) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı.' });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email || '',
        username: user.username || '',
        name: user.name,
        emoji: '',
        pairCode: user.pair_code
      }
    });
  });
});

// MARK: - Search Users by @username
apiRouter.get('/users/search/:query', (req: Request, res: Response) => {
  const clean = req.params.query.toLowerCase().replace('@', '').trim();
  if (clean.length < 2) return res.json([]);

  const sql = `
    SELECT id, username, name, emoji, pair_code
    FROM users
    WHERE username LIKE ? OR name LIKE ?
    LIMIT 10
  `;

  db.all(sql, [`%${clean}%`, `%${clean}%`], (err, rows: any[]) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows.map(r => ({
      id: r.id,
      username: r.username,
      name: r.name,
      emoji: '',
      pairCode: r.pair_code
    })));
  });
});

// MARK: - Send Pair Request (by @username OR pair_code)
apiRouter.post('/pair/request', (req: Request, res: Response) => {
  const { from_user_id, partner_identifier } = req.body;
  if (!from_user_id || !partner_identifier) {
    return res.status(400).json({ error: 'Gönderen ve partner bilgisi gereklidir.' });
  }

  const clean = partner_identifier.trim().toLowerCase().replace('@', '');
  const cleanCode = partner_identifier.trim().toUpperCase();

  const findQuery = `
    SELECT * FROM users
    WHERE username = ? OR pair_code = ? OR email = ?
    LIMIT 1
  `;

  db.get(findQuery, [clean, cleanCode, clean], (err, targetUser: any) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!targetUser) {
      return res.status(404).json({ error: 'Bu kullanıcı adına veya koda sahip biri bulunamadı.' });
    }

    if (targetUser.id === from_user_id) {
      return res.status(400).json({ error: 'Kendi kendinize eşleşme isteği gönderemezsiniz.' });
    }

    db.get('SELECT * FROM users WHERE id = ?', [from_user_id], (err2, sender: any) => {
      if (err2 || !sender) return res.status(404).json({ error: 'Gönderen kullanıcı bulunamadı.' });

      const requestId = `req_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
      const insertQuery = `
        INSERT INTO pair_requests (id, from_user_id, from_username, from_user_name, from_user_emoji, to_user_id, status)
        VALUES (?, ?, ?, ?, ?, ?, 'pending')
      `;

      db.run(insertQuery, [requestId, sender.id, sender.username || '', sender.name, '', targetUser.id], (err3) => {
        if (err3) return res.status(500).json({ error: err3.message });

        if (targetUser.apns_token) {
          sendSilentPush(targetUser.apns_token, {
            type: 'pair_request',
            senderName: sender.name,
            senderUsername: sender.username
          });
        }

        res.json({
          success: true,
          request_id: requestId,
          target_user: {
            id: targetUser.id,
            username: targetUser.username,
            name: targetUser.name,
            emoji: ''
          }
        });
      });
    });
  });
});

// MARK: - Get Pending Pair Requests
apiRouter.get('/pair/pending/:userId', (req: Request, res: Response) => {
  const { userId } = req.params;
  db.all(
    `SELECT * FROM pair_requests WHERE to_user_id = ? AND status = 'pending' ORDER BY created_at DESC`,
    [userId],
    (err, rows: any[]) => {
      if (err) return res.status(500).json({ error: err.message });
      const formatted = (rows || []).map((r) => ({
        id: r.id,
        fromUserId: r.from_user_id,
        fromUsername: r.from_username || '',
        fromUserName: r.from_user_name,
        fromUserEmoji: '',
        toUserId: r.to_user_id,
        status: r.status,
        createdAt: new Date(r.created_at || Date.now()).toISOString()
      }));
      res.json(formatted);
    }
  );
});

// MARK: - Respond to Pair Request
apiRouter.post('/pair/respond', (req: Request, res: Response) => {
  const { request_id, user_id, accept } = req.body;
  if (!request_id || !user_id || accept === undefined) {
    return res.status(400).json({ error: 'request_id, user_id ve accept parametresi gereklidir.' });
  }

  const newStatus = accept ? 'accepted' : 'rejected';

  db.get('SELECT * FROM pair_requests WHERE id = ? AND to_user_id = ?', [request_id, user_id], (err, request: any) => {
    if (err || !request) return res.status(404).json({ error: 'Eşleşme isteği bulunamadı.' });

    db.run('UPDATE pair_requests SET status = ? WHERE id = ?', [newStatus, request_id], (err2) => {
      if (err2) return res.status(500).json({ error: err2.message });

      if (accept) {
        const insertFriend1 = 'INSERT OR IGNORE INTO friendships (user_id, friend_id) VALUES (?, ?)';
        const insertFriend2 = 'INSERT OR IGNORE INTO friendships (user_id, friend_id) VALUES (?, ?)';

        db.run(insertFriend1, [request.from_user_id, request.to_user_id]);
        db.run(insertFriend2, [request.to_user_id, request.from_user_id], (err3) => {
          if (err3) return res.status(500).json({ error: err3.message });

          // Sync friendship to Cloud Firestore
          syncFriendshipToFirestore(request.from_user_id, request.to_user_id);

          res.json({ success: true, status: 'accepted' });
        });
      } else {
        res.json({ success: true, status: 'rejected' });
      }
    });
  });
});

// MARK: - Get Friends List
apiRouter.get('/friends/:userId', (req: Request, res: Response) => {
  const { userId } = req.params;
  const query = `
    SELECT u.id, u.username, u.name, u.emoji, u.pair_code, f.created_at as connected_at
    FROM friendships f
    JOIN users u ON u.id = f.friend_id
    WHERE f.user_id = ?
    ORDER BY f.created_at DESC
  `;

  db.all(query, [userId], (err, rows: any[]) => {
    if (err) return res.status(500).json({ error: err.message });
    const friends = (rows || []).map((r) => ({
      id: r.id,
      username: r.username || '',
      name: r.name,
      emoji: '',
      pairCode: r.pair_code,
      connectedAt: new Date(r.connected_at || Date.now()).toISOString()
    }));
    res.json(friends);
  });
});

// MARK: - Remove Friend
apiRouter.delete('/friends/:userId/:friendId', (req: Request, res: Response) => {
  const { userId, friendId } = req.params;
  db.run('DELETE FROM friendships WHERE (user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)',
    [userId, friendId, friendId, userId],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    }
  );
});

// MARK: - Register APNs Device Token
apiRouter.post('/users/apns-token', (req: Request, res: Response) => {
  const { user_id, token } = req.body;
  if (!user_id || !token) {
    return res.status(400).json({ error: 'user_id and token required' });
  }

  db.run('UPDATE users SET apns_token = ? WHERE id = ?', [token, user_id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// MARK: - Send Pop Drop
apiRouter.post('/drops/send', async (req: Request, res: Response) => {
  const { pop } = req.body;
  if (!pop || !pop.senderId) {
    return res.status(400).json({ error: 'Geçerli pop verisi gereklidir.' });
  }

  const recipientId = pop.recipientId || 'all';

  const query = `
    INSERT INTO drops (id, sender_id, sender_username, sender_name, sender_emoji, recipient_id, type, payload)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.run(
    query,
    [
      pop.id,
      pop.senderId,
      pop.senderUsername || '',
      pop.senderName,
      '',
      recipientId,
      pop.type,
      JSON.stringify(pop)
    ],
    function (err) {
      if (err) {
        console.error('Database write error:', err);
        return res.status(500).json({ error: err.message });
      }

      // Sync Drop to Cloud Firestore
      syncDropToFirestore(pop);

      const findTokensQuery = recipientId === 'all'
        ? `SELECT u.apns_token FROM friendships f JOIN users u ON u.id = f.friend_id WHERE f.user_id = ? AND u.apns_token IS NOT NULL`
        : `SELECT apns_token FROM users WHERE id = ? AND apns_token IS NOT NULL`;

      const params = recipientId === 'all' ? [pop.senderId] : [recipientId];

      db.all(findTokensQuery, params, async (_err2, rows: any[]) => {
        if (rows && rows.length > 0) {
          for (const row of rows) {
            if (row.apns_token) {
              await sendSilentPush(row.apns_token, pop);
            }
          }
        }
        console.log(`\x1b[32m[B!Pop Drop]\x1b[0m ${pop.senderName} (@${pop.senderUsername || 'user'}) sent a ${pop.type} to [${recipientId}]`);
      });

      res.json({ success: true, drop_id: pop.id });
    }
  );
});

// MARK: - Get Latest Received Pop for User's Widget (ONLY from friends, NEVER self)
apiRouter.get('/drops/latest/:userId', (req: Request, res: Response) => {
  const { userId } = req.params;

  const query = `
    SELECT d.payload FROM drops d
    WHERE ((d.recipient_id = 'all' OR d.recipient_id = ?) 
       AND d.sender_id IN (SELECT friend_id FROM friendships WHERE user_id = ?)
       AND d.sender_id != ?)
    ORDER BY d.created_at DESC
    LIMIT 1
  `;

  db.get(query, [userId, userId, userId], (err, row: any) => {
    if (err) return res.status(500).json({ error: err.message });
    if (row && row.payload) {
      try {
        const parsed = JSON.parse(row.payload);
        if (parsed.senderId !== userId) {
          return res.json(parsed);
        }
      } catch {}
    }

    return res.status(404).json({ message: 'Henüz arkadaştan gelen B!Pop yok' });
  });
});

// MARK: - Get Feed / History for User
apiRouter.get('/drops/feed/:userId', (req: Request, res: Response) => {
  const { userId } = req.params;
  const query = `
    SELECT d.payload FROM drops d
    WHERE (d.recipient_id = 'all' AND d.sender_id IN (SELECT friend_id FROM friendships WHERE user_id = ?))
       OR d.recipient_id = ?
       OR d.sender_id = ?
    ORDER BY d.created_at DESC
    LIMIT 50
  `;

  db.all(query, [userId, userId, userId], (err, rows: any[]) => {
    if (err) return res.status(500).json({ error: err.message });
    const drops = (rows || []).map((r) => {
      try {
        return JSON.parse(r.payload);
      } catch {
        return null;
      }
    }).filter(Boolean);
    res.json(drops);
  });
});
