import { initializeApp } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

let db: any = null;

try {
  initializeApp({
    projectId: 'bipop-c79ca'
  });
  db = getFirestore();
  console.log('[\x1b[33mFirebase Firestore\x1b[0m] Connected to Cloud Firestore project: bipop-c79ca');
} catch (e: any) {
  console.warn('Firebase Admin initialization notice:', e.message);
}

export const firestore = db;

export async function syncUserToFirestore(user: any) {
  if (!firestore) return;
  try {
    await firestore.collection('users').doc(user.id).set({
      ...user,
      updatedAt: FieldValue.serverTimestamp()
    }, { merge: true });
  } catch (err: any) {
    console.error('Firestore user sync error:', err.message);
  }
}

export async function syncDropToFirestore(drop: any) {
  if (!firestore) return;
  try {
    await firestore.collection('drops').doc(drop.id).set({
      ...drop,
      createdAt: FieldValue.serverTimestamp()
    });
    console.log(`[\x1b[32mFirestore Cloud Sync\x1b[0m] Drop ${drop.id} synced to Cloud Firestore.`);
  } catch (err: any) {
    console.error('Firestore drop sync error:', err.message);
  }
}

export async function syncFriendshipToFirestore(userId: string, friendId: string) {
  if (!firestore) return;
  try {
    const docId = [userId, friendId].sort().join('_');
    await firestore.collection('friendships').doc(docId).set({
      userA: userId,
      userB: friendId,
      createdAt: FieldValue.serverTimestamp()
    }, { merge: true });
  } catch (err: any) {
    console.error('Firestore friendship sync error:', err.message);
  }
}
