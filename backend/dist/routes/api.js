"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiRouter = void 0;
const express_1 = require("express");
const database_1 = require("../database");
const apns_1 = require("../services/apns");
const firestore_1 = require("../firestore");
const crypto_1 = __importDefault(require("crypto"));
exports.apiRouter = (0, express_1.Router)();
// MARK: - Fast Register / Sync Profile
exports.apiRouter.post('/auth/register', (req, res) => {
    let { id, email, username, name, emoji, pair_code } = req.body;
    if (!name)
        name = 'B!Pop Üyesi';
    if (!emoji)
        emoji = '';
    const cleanUsername = (username || `user_${Date.now().toString().slice(-4)}`)
        .toLowerCase()
        .replace('@', '')
        .trim();
    const userId = id || `usr_${crypto_1.default.randomBytes(8).toString('hex')}`;
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
    database_1.db.run(query, [userId, email || null, cleanUsername, name, emoji, pairCode], function (err) {
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
        (0, firestore_1.syncUserToFirestore)(userData);
        res.json({
            success: true,
            user: userData
        });
    });
});
// MARK: - Fast Login (by Email or Username)
exports.apiRouter.post('/auth/login', (req, res) => {
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
    database_1.db.get(query, [clean, clean, clean.toUpperCase()], (err, user) => {
        if (err)
            return res.status(500).json({ error: err.message });
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
exports.apiRouter.get('/users/search/:query', (req, res) => {
    const clean = req.params.query.toLowerCase().replace('@', '').trim();
    if (clean.length < 2)
        return res.json([]);
    const sql = `
    SELECT id, username, name, emoji, pair_code
    FROM users
    WHERE username LIKE ? OR name LIKE ?
    LIMIT 10
  `;
    database_1.db.all(sql, [`%${clean}%`, `%${clean}%`], (err, rows) => {
        if (err)
            return res.status(500).json({ error: err.message });
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
exports.apiRouter.post('/pair/request', (req, res) => {
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
    database_1.db.get(findQuery, [clean, cleanCode, clean], (err, targetUser) => {
        if (err)
            return res.status(500).json({ error: err.message });
        if (!targetUser) {
            return res.status(404).json({ error: 'Bu kullanıcı adına veya koda sahip biri bulunamadı.' });
        }
        if (targetUser.id === from_user_id) {
            return res.status(400).json({ error: 'Kendi kendinize eşleşme isteği gönderemezsiniz.' });
        }
        database_1.db.get('SELECT * FROM users WHERE id = ?', [from_user_id], (err2, sender) => {
            if (err2 || !sender)
                return res.status(404).json({ error: 'Gönderen kullanıcı bulunamadı.' });
            const requestId = `req_${Date.now()}_${crypto_1.default.randomBytes(3).toString('hex')}`;
            const insertQuery = `
        INSERT INTO pair_requests (id, from_user_id, from_username, from_user_name, from_user_emoji, to_user_id, status)
        VALUES (?, ?, ?, ?, ?, ?, 'pending')
      `;
            database_1.db.run(insertQuery, [requestId, sender.id, sender.username || '', sender.name, '', targetUser.id], (err3) => {
                if (err3)
                    return res.status(500).json({ error: err3.message });
                if (targetUser.apns_token) {
                    (0, apns_1.sendSilentPush)(targetUser.apns_token, {
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
exports.apiRouter.get('/pair/pending/:userId', (req, res) => {
    const { userId } = req.params;
    database_1.db.all(`SELECT * FROM pair_requests WHERE to_user_id = ? AND status = 'pending' ORDER BY created_at DESC`, [userId], (err, rows) => {
        if (err)
            return res.status(500).json({ error: err.message });
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
    });
});
// MARK: - Respond to Pair Request
exports.apiRouter.post('/pair/respond', (req, res) => {
    const { request_id, user_id, accept } = req.body;
    if (!request_id || !user_id || accept === undefined) {
        return res.status(400).json({ error: 'request_id, user_id ve accept parametresi gereklidir.' });
    }
    const newStatus = accept ? 'accepted' : 'rejected';
    database_1.db.get('SELECT * FROM pair_requests WHERE id = ? AND to_user_id = ?', [request_id, user_id], (err, request) => {
        if (err || !request)
            return res.status(404).json({ error: 'Eşleşme isteği bulunamadı.' });
        database_1.db.run('UPDATE pair_requests SET status = ? WHERE id = ?', [newStatus, request_id], (err2) => {
            if (err2)
                return res.status(500).json({ error: err2.message });
            if (accept) {
                const insertFriend1 = 'INSERT OR IGNORE INTO friendships (user_id, friend_id) VALUES (?, ?)';
                const insertFriend2 = 'INSERT OR IGNORE INTO friendships (user_id, friend_id) VALUES (?, ?)';
                database_1.db.run(insertFriend1, [request.from_user_id, request.to_user_id]);
                database_1.db.run(insertFriend2, [request.to_user_id, request.from_user_id], (err3) => {
                    if (err3)
                        return res.status(500).json({ error: err3.message });
                    // Sync friendship to Cloud Firestore
                    (0, firestore_1.syncFriendshipToFirestore)(request.from_user_id, request.to_user_id);
                    res.json({ success: true, status: 'accepted' });
                });
            }
            else {
                res.json({ success: true, status: 'rejected' });
            }
        });
    });
});
// MARK: - Get Friends List
exports.apiRouter.get('/friends/:userId', (req, res) => {
    const { userId } = req.params;
    const query = `
    SELECT u.id, u.username, u.name, u.emoji, u.pair_code, f.created_at as connected_at
    FROM friendships f
    JOIN users u ON u.id = f.friend_id
    WHERE f.user_id = ?
    ORDER BY f.created_at DESC
  `;
    database_1.db.all(query, [userId], (err, rows) => {
        if (err)
            return res.status(500).json({ error: err.message });
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
exports.apiRouter.delete('/friends/:userId/:friendId', (req, res) => {
    const { userId, friendId } = req.params;
    database_1.db.run('DELETE FROM friendships WHERE (user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)', [userId, friendId, friendId, userId], (err) => {
        if (err)
            return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});
// MARK: - Register APNs Device Token
exports.apiRouter.post('/users/apns-token', (req, res) => {
    const { user_id, token } = req.body;
    if (!user_id || !token) {
        return res.status(400).json({ error: 'user_id and token required' });
    }
    database_1.db.run('UPDATE users SET apns_token = ? WHERE id = ?', [token, user_id], (err) => {
        if (err)
            return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});
// MARK: - Send Pop Drop
exports.apiRouter.post('/drops/send', async (req, res) => {
    const { pop } = req.body;
    if (!pop || !pop.senderId) {
        return res.status(400).json({ error: 'Geçerli pop verisi gereklidir.' });
    }
    const recipientId = pop.recipientId || 'all';
    const query = `
    INSERT INTO drops (id, sender_id, sender_username, sender_name, sender_emoji, recipient_id, type, payload)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;
    database_1.db.run(query, [
        pop.id,
        pop.senderId,
        pop.senderUsername || '',
        pop.senderName,
        '',
        recipientId,
        pop.type,
        JSON.stringify(pop)
    ], function (err) {
        if (err) {
            console.error('Database write error:', err);
            return res.status(500).json({ error: err.message });
        }
        // Sync Drop to Cloud Firestore
        (0, firestore_1.syncDropToFirestore)(pop);
        const findTokensQuery = recipientId === 'all'
            ? `SELECT u.apns_token FROM friendships f JOIN users u ON u.id = f.friend_id WHERE f.user_id = ? AND u.apns_token IS NOT NULL`
            : `SELECT apns_token FROM users WHERE id = ? AND apns_token IS NOT NULL`;
        const params = recipientId === 'all' ? [pop.senderId] : [recipientId];
        database_1.db.all(findTokensQuery, params, async (_err2, rows) => {
            if (rows && rows.length > 0) {
                for (const row of rows) {
                    if (row.apns_token) {
                        await (0, apns_1.sendSilentPush)(row.apns_token, pop);
                    }
                }
            }
            console.log(`\x1b[32m[B!Pop Drop]\x1b[0m ${pop.senderName} (@${pop.senderUsername || 'user'}) sent a ${pop.type} to [${recipientId}]`);
        });
        res.json({ success: true, drop_id: pop.id });
    });
});
// MARK: - Get Latest Received Pop for User's Widget (ONLY from friends, NEVER self)
exports.apiRouter.get('/drops/latest/:userId', (req, res) => {
    const { userId } = req.params;
    const query = `
    SELECT d.payload FROM drops d
    WHERE ((d.recipient_id = 'all' OR d.recipient_id = ?) 
       AND d.sender_id IN (SELECT friend_id FROM friendships WHERE user_id = ?)
       AND d.sender_id != ?)
    ORDER BY d.created_at DESC
    LIMIT 1
  `;
    database_1.db.get(query, [userId, userId, userId], (err, row) => {
        if (err)
            return res.status(500).json({ error: err.message });
        if (row && row.payload) {
            try {
                const parsed = JSON.parse(row.payload);
                if (parsed.senderId !== userId) {
                    return res.json(parsed);
                }
            }
            catch { }
        }
        return res.status(404).json({ message: 'Henüz arkadaştan gelen B!Pop yok' });
    });
});
// MARK: - Get Feed / History for User
exports.apiRouter.get('/drops/feed/:userId', (req, res) => {
    const { userId } = req.params;
    const query = `
    SELECT d.payload FROM drops d
    WHERE (d.recipient_id = 'all' AND d.sender_id IN (SELECT friend_id FROM friendships WHERE user_id = ?))
       OR d.recipient_id = ?
       OR d.sender_id = ?
    ORDER BY d.created_at DESC
    LIMIT 50
  `;
    database_1.db.all(query, [userId, userId, userId], (err, rows) => {
        if (err)
            return res.status(500).json({ error: err.message });
        const drops = (rows || []).map((r) => {
            try {
                return JSON.parse(r.payload);
            }
            catch {
                return null;
            }
        }).filter(Boolean);
        res.json(drops);
    });
});
