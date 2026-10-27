import admin, { cert } from 'firebase-admin';

let firebaseApp: admin.App | null = null;

export function getFirebaseApp() {
  if (firebaseApp) return firebaseApp;

  let serviceAccount: any = null;

  try {
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    }
  } catch {
    console.warn('[firebase] Failed to parse FIREBASE_SERVICE_ACCOUNT env var — FCM push disabled');
    return null;
  }

  if (!serviceAccount) {
    console.warn('[firebase] No FIREBASE_SERVICE_ACCOUNT configured — FCM push disabled');
    return null;
  }

  firebaseApp = admin.initializeApp({
    credential: cert(serviceAccount),
  });

  return firebaseApp;
}

export function getFirebaseMessaging() {
  const app = getFirebaseApp();
  if (!app) return null;
  const { getMessaging } = require('firebase-admin/messaging');
  return getMessaging(app);
}

export function isFirebaseConfigured() {
  try {
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}
