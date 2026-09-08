import webpush from 'web-push';
import { prisma } from '../lib/prisma';

const vapidPublicKey = process.env.VAPID_PUBLIC_KEY || '';
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || '';
const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:registrar@edwardianeducationalconsult.com.ng';

const pushConfigured = Boolean(vapidPublicKey && vapidPrivateKey);

if (pushConfigured) {
  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
} else {
  // Not fatal — the rest of the app (dashboard/email/SMS notifications) keeps working.
  // Run `node scripts/generate-vapid-keys.js` and add the output to .env to enable push.
  console.warn('[push] VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY not set — push notifications are disabled.');
}

export function isPushConfigured() {
  return pushConfigured;
}

export function getVapidPublicKey() {
  return vapidPublicKey;
}

interface WebPushSubscriptionInput {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}

export async function saveSubscription(
  userId: string,
  subscription: WebPushSubscriptionInput,
  userAgent?: string | null
) {
  if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
    throw new Error('Invalid push subscription payload');
  }

  return prisma.pushSubscription.upsert({
    where: { endpoint: subscription.endpoint },
    update: {
      userId,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
      userAgent: userAgent || undefined,
    },
    create: {
      userId,
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
      userAgent: userAgent || undefined,
    },
  });
}

export async function removeSubscription(userId: string, endpoint: string) {
  if (!endpoint) return;
  await prisma.pushSubscription.deleteMany({ where: { userId, endpoint } });
}

export interface PushPayload {
  title: string;
  message: string;
  link?: string;
  type?: string;
}

function buildPushBody(payload: PushPayload) {
  return JSON.stringify({
    title: payload.title,
    body: payload.message,
    link: payload.link || '/',
    type: payload.type,
  });
}

async function deliverToSubscription(
  subscription: { id: string; endpoint: string; p256dh: string; auth: string },
  body: string
) {
  try {
    await webpush.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: { p256dh: subscription.p256dh, auth: subscription.auth },
      },
      body
    );
  } catch (error: any) {
    // 404/410 means the browser/device revoked or expired the subscription
    // (uninstalled app, cleared data, permission revoked) — safe to delete.
    if (error?.statusCode === 404 || error?.statusCode === 410) {
      await prisma.pushSubscription.delete({ where: { id: subscription.id } }).catch(() => {});
    } else {
      console.error('[push] delivery failed:', error?.body || error?.message || error);
    }
  }
}

export async function sendPushToUser(userId: string, payload: PushPayload) {
  if (!pushConfigured) return;

  const subscriptions = await prisma.pushSubscription.findMany({ where: { userId } });
  if (subscriptions.length === 0) return;

  const body = buildPushBody(payload);
  await Promise.all(subscriptions.map((sub) => deliverToSubscription(sub, body)));
}

export async function sendPushToUsers(userIds: string[], payload: PushPayload) {
  if (!pushConfigured || userIds.length === 0) return;

  const subscriptions = await prisma.pushSubscription.findMany({
    where: { userId: { in: userIds } },
  });
  if (subscriptions.length === 0) return;

  const body = buildPushBody(payload);
  await Promise.all(subscriptions.map((sub) => deliverToSubscription(sub, body)));
}
