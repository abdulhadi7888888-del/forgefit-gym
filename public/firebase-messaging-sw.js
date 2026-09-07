importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js')

// These values are safe to expose in a service worker (same as the web
// config used elsewhere) — replace with your own if the project changes.
firebase.initializeApp({
  apiKey: 'AIzaSyBPVvKy69Ek2GD_V4_mwjSY4thNkv5Z_Ho',
  authDomain: 'forgefit-gym.firebaseapp.com',
  projectId: 'forgefit-gym',
  storageBucket: 'forgefit-gym.firebasestorage.app',
  messagingSenderId: '604418018647',
  appId: '1:604418018647:web:5ac4bdf4c495fd44e18212'
})

const messaging = firebase.messaging()

messaging.onBackgroundMessage((payload) => {
  const { title, body } = payload.notification || {}
  self.registration.showNotification(title || 'ForgeFit Gym', {
    body: body || '',
    icon: '/icon-192.png'
  })
})
