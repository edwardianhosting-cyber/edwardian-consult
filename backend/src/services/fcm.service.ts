import { prisma } from '../lib/prisma';
import { getFirebaseMessaging, isFirebaseConfigured } from '../lib/firebase';

export interface FcmPayload {
  title: string;
  body: string;
  link?: string;
  type?: string;
  data?: Record<string, string>;
}

function buildFcmData(payload: FcmPayload): Record<string, string> {
  return {
    title: payload.title,
    body: payload.body,
    link: payload.link || '/',
    type: payload.type || 'NOTIFICATION',
    click_action: 'FLUTTER_NOTIFICATION_CLICK',
    ...payload.data,
  };
}

export async function sendFcmToToken(token: string, payload: FcmPayload): Promise<boolean> {
  if (!isFirebaseConfigured()) return false;

  const messaging = getFirebaseMessaging();
  if (!messaging) return false;

  try {
    const message = {
      token,
      notification: {
        title: payload.title,
        body: payload.body,
      },
      data: buildFcmData(payload),
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
          channelId: 'edwardian_notifications',
        },
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
          },
        },
      },
    };

    await messaging.send(message);
    return true;
  } catch (error: any) {
    const code = error?.code || '';
    if (
      code === 'messaging/registration-token-not-registered' ||
      code === 'messaging/invalid-registration-token' ||
      code === 'messaging/registration-token-mismatch'
    ) {
      await prisma.deviceToken.deleteMany({ where: { token } }).catch(() => {});
    }
    console.error('[fcm] send failed:', error?.message || error);
    return false;
  }
}

export async function sendFcmToUser(userId: string, payload: FcmPayload): Promise<number> {
  const tokens = await prisma.deviceToken.findMany({
    where: { userId },
    select: { token: true },
  });

  if (tokens.length === 0) return 0;

  let sent = 0;
  await Promise.all(
    tokens.map(async ({ token }) => {
      const ok = await sendFcmToToken(token, payload);
      if (ok) sent++;
    })
  );

  return sent;
}

export async function sendFcmToUsers(userIds: string[], payload: FcmPayload): Promise<number> {
  const tokens = await prisma.deviceToken.findMany({
    where: { userId: { in: userIds } },
    select: { token: true },
  });

  if (tokens.length === 0) return 0;

  let sent = 0;
  await Promise.all(
    tokens.map(async ({ token }) => {
      const ok = await sendFcmToToken(token, payload);
      if (ok) sent++;
    })
  );

  return sent;
}

export async function saveDeviceToken(
  userId: string,
  token: string,
  platform: string,
  deviceId?: string,
  appVersion?: string
) {
  return prisma.deviceToken.upsert({
    where: { token },
    update: {
      userId,
      platform,
      deviceId: deviceId || undefined,
      appVersion: appVersion || undefined,
      updatedAt: new Date(),
    },
    create: {
      userId,
      token,
      platform,
      deviceId: deviceId || undefined,
      appVersion: appVersion || undefined,
    },
  });
}

export async function removeDeviceToken(userId: string, token: string) {
  await prisma.deviceToken.deleteMany({ where: { userId, token } });
}

export async function getDeviceTokensForUser(userId: string) {
  return prisma.deviceToken.findMany({ where: { userId } });
}
