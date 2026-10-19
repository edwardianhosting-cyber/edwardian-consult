import admin, { cert } from 'firebase-admin';
import path from 'path';

let firebaseApp: admin.App | null = null;

export function getFirebaseApp() {
  if (firebaseApp) return firebaseApp;

  const serviceAccountPath = path.join(process.cwd(), 'firebase-service-account.json');
  let serviceAccount: any = null;

  try {
    serviceAccount = require(serviceAccountPath);
  } catch {
    try {
      serviceAccount = {
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      };
    } catch {
      console.warn('[firebase] Service account not found — FCM push disabled');
      return null;
    }
  }

  if (!serviceAccount) {
    console.warn('[firebase] No service account configured — FCM push disabled');
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
    require(path.join(process.cwd(), 'firebase-service-account.json'));
    return true;
  } catch {
    return Boolean(process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY);
  }
}
