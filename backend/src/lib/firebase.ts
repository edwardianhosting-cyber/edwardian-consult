import admin, { cert } from 'firebase-admin';

let firebaseApp: admin.App | null = null;
let firebaseInitAttempted = false;

export function getFirebaseApp() {
  if (firebaseApp) return firebaseApp;
  if (firebaseInitAttempted) return null;

  firebaseInitAttempted = true;

  try {
    let serviceAccount: any = null;

    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    }

    if (!serviceAccount) {
      console.warn('[firebase] No FIREBASE_SERVICE_ACCOUNT configured — FCM push disabled');
      return null;
    }

    firebaseApp = admin.initializeApp({
      credential: cert(serviceAccount),
    });

    return firebaseApp;
  } catch (err: any) {
    console.warn('[firebase] Firebase initialization failed — FCM push disabled:', err?.message || err);
    return null;
  }
}

export function getFirebaseMessaging() {
  try {
    const app = getFirebaseApp();
    if (!app) return null;
    const { getMessaging } = require('firebase-admin/messaging');
    return getMessaging(app);
  } catch (err: any) {
    console.warn('[firebase] Failed to get messaging — FCM push disabled:', err?.message || err);
    return null;
  }
}

export function isFirebaseConfigured() {
  try {
    if (!process.env.FIREBASE_SERVICE_ACCOUNT) return false;
    JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    return true;
  } catch {
    return false;
  }
}
