"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.firestore = void 0;
exports.syncUserToFirestore = syncUserToFirestore;
exports.syncDropToFirestore = syncDropToFirestore;
exports.syncFriendshipToFirestore = syncFriendshipToFirestore;
const app_1 = require("firebase-admin/app");
const firestore_1 = require("firebase-admin/firestore");
let db = null;
try {
    (0, app_1.initializeApp)({
        projectId: 'bipop-c79ca'
    });
    db = (0, firestore_1.getFirestore)();
    console.log('[\x1b[33mFirebase Firestore\x1b[0m] Connected to Cloud Firestore project: bipop-c79ca');
}
catch (e) {
    console.warn('Firebase Admin initialization notice:', e.message);
}
exports.firestore = db;
async function syncUserToFirestore(user) {
    if (!exports.firestore)
        return;
    try {
        await exports.firestore.collection('users').doc(user.id).set({
            ...user,
            updatedAt: firestore_1.FieldValue.serverTimestamp()
        }, { merge: true });
    }
    catch (err) {
        console.error('Firestore user sync error:', err.message);
    }
}
async function syncDropToFirestore(drop) {
    if (!exports.firestore)
        return;
    try {
        await exports.firestore.collection('drops').doc(drop.id).set({
            ...drop,
            createdAt: firestore_1.FieldValue.serverTimestamp()
        });
        console.log(`[\x1b[32mFirestore Cloud Sync\x1b[0m] Drop ${drop.id} synced to Cloud Firestore.`);
    }
    catch (err) {
        console.error('Firestore drop sync error:', err.message);
    }
}
async function syncFriendshipToFirestore(userId, friendId) {
    if (!exports.firestore)
        return;
    try {
        const docId = [userId, friendId].sort().join('_');
        await exports.firestore.collection('friendships').doc(docId).set({
            userA: userId,
            userB: friendId,
            createdAt: firestore_1.FieldValue.serverTimestamp()
        }, { merge: true });
    }
    catch (err) {
        console.error('Firestore friendship sync error:', err.message);
    }
}
