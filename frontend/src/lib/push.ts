'use client';

import { useCallback, useEffect, useState } from 'react';
import api from './api';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function isPushSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
}

export async function isPushSubscribed(): Promise<boolean> {
  if (!isPushSupported()) return false;
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    return !!subscription;
  } catch {
    return false;
  }
}

export async function subscribeToPush(): Promise<void> {
  if (!isPushSupported()) {
    throw new Error('Push notifications are not supported in this browser.');
  }

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    throw new Error('Notification permission was not granted.');
  }

  const { data } = await api.getVapidPublicKey();
  if (!data?.publicKey) {
    throw new Error('Push notifications are not configured on the server yet.');
  }

  const registration = await navigator.serviceWorker.ready;
  let subscription = await registration.pushManager.getSubscription();
  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(data.publicKey) as unknown as BufferSource,
    });
  }

  await api.subscribePush(subscription.toJSON());
}

export async function unsubscribeFromPush(): Promise<void> {
  if (!isPushSupported()) return;
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();
  if (subscription) {
    await api.unsubscribePush(subscription.endpoint).catch(() => {});
    await subscription.unsubscribe();
  }
}

/**
 * Drives a single "Push Notifications" toggle: reflects whether this device
 * is currently subscribed, and handles the subscribe/unsubscribe flow (incl.
 * asking for browser permission) when the user flips it.
 */
export function usePushToggle() {
  const [supported, setSupported] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const supportedNow = isPushSupported();
      setSupported(supportedNow);
      if (supportedNow) {
        const subscribed = await isPushSubscribed();
        if (!cancelled) setEnabled(subscribed);
      }
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const toggle = useCallback(async (next: boolean) => {
    setError(null);
    setLoading(true);
    try {
      if (next) {
        await subscribeToPush();
        setEnabled(true);
      } else {
        await unsubscribeFromPush();
        setEnabled(false);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to update push notification settings.');
      setEnabled(await isPushSubscribed());
    } finally {
      setLoading(false);
    }
  }, []);

  return { supported, enabled, loading, error, toggle };
}
