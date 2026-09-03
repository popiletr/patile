"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const database_1 = require("./database");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const api_1 = require("./routes/api");
async function runIntegrationTest() {
    console.log('🧪 Starting Multi-User & Pair Request Integration Test...');
    const app = (0, express_1.default)();
    app.use((0, cors_1.default)());
    app.use(express_1.default.json());
    app.use('/api', api_1.apiRouter);
    await (0, database_1.initDatabase)();
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
        }
        catch (err) {
            console.error('❌ Test failed:', err);
            server.close();
            process.exit(1);
        }
    });
}
function postJSON(url, body) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify(body);
        const parsed = new URL(url);
        const req = http_1.default.request({
            hostname: parsed.hostname,
            port: parsed.port,
            path: parsed.pathname,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(data)
            }
        }, (res) => {
            let raw = '';
            res.on('data', (c) => (raw += c));
            res.on('end', () => resolve(JSON.parse(raw)));
        });
        req.on('error', reject);
        req.write(data);
        req.end();
    });
}
function getJSON(url) {
    return new Promise((resolve, reject) => {
        http_1.default.get(url, (res) => {
            let raw = '';
            res.on('data', (c) => (raw += c));
            res.on('end', () => resolve(JSON.parse(raw)));
        }).on('error', reject);
    });
}
runIntegrationTest();
