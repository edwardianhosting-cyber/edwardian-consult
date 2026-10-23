(function () {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch((error) => {
        console.error('Service Worker registration failed:', error);
      });
    });
  }
})();

// Push notifications (Capacitor)
try {
  const { PushNotifications } = window.Capacitor?.Plugins || {};
  if (PushNotifications) {
    PushNotifications.requestPermissions().then((result) => {
      if (result.receive === 'granted') {
        PushNotifications.register();
      }
    });
    PushNotifications.addListener('registration', (token) => {
      console.log('Push Registration Token:', token.value);
    });
    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      console.log('Notification received:', notification);
    });
  }
} catch (e) {
  console.error('Push notifications init failed:', e);
}
