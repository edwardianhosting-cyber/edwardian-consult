import webpush from 'web-push';
import { prisma } from '../lib/prisma';
import {
  sendFcmToUser,
  sendFcmToUsers,
  saveDeviceToken,
  removeDeviceToken,
  getDeviceTokensForUser,
} from './fcm.service';

const vapidPublicKey = process.env.VAPID_PUBLIC_KEY || '';
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || '';
const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:registrar@edwardianeducationalconsult.com.ng';

const pushConfigured = Boolean(vapidPublicKey && vapidPrivateKey);

if (pushConfigured) {
  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
} else {
  console.warn('[push] VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY not set — browser push is disabled.');
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
    if (error?.statusCode === 404 || error?.statusCode === 410) {
      await prisma.pushSubscription.delete({ where: { id: subscription.id } }).catch(() => {});
    } else {
      console.error('[push] delivery failed:', error?.body || error?.message || error);
    }
  }
}

// --- Existing browser (web-push) send functions ---

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

// --- Mobile (FCM) device token functions ---

export { saveDeviceToken, removeDeviceToken, getDeviceTokensForUser };

export async function sendMobilePushToUser(userId: string, payload: PushPayload) {
  return sendFcmToUser(userId, {
    title: payload.title,
    body: payload.message,
    link: payload.link,
    type: payload.type,
  });
}

export async function sendMobilePushToUsers(userIds: string[], payload: PushPayload) {
  return sendFcmToUsers(userIds, {
    title: payload.title,
    body: payload.message,
    link: payload.link,
    type: payload.type,
  });
}

export async function sendPushToUserAllChannels(userId: string, payload: PushPayload) {
  // Send to browser subscriptions (web-push)
  await sendPushToUser(userId, payload);
  // Send to mobile device tokens (FCM)
  await sendMobilePushToUser(userId, payload);
}

export async function sendPushToUsersAllChannels(userIds: string[], payload: PushPayload) {
  await sendPushToUsers(userIds, payload);
  await sendMobilePushToUsers(userIds, payload);
}

