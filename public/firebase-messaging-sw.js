importScripts(
  "https://www.gstatic.com/firebasejs/10.13.0/firebase-app-compat.js"
);

importScripts(
  "https://www.gstatic.com/firebasejs/10.13.0/firebase-messaging-compat.js"
);

firebase.initializeApp({
  apiKey:
    "AIzaSyA6Gm1Xg01EobSEDZO_RYFv4AtbRrpf-eI",

  authDomain:
    "realtimechatapp-89ecf.firebaseapp.com",

  projectId:
    "realtimechatapp-89ecf",

  storageBucket:
    "realtimechatapp-89ecf.firebasestorage.app",

  messagingSenderId:
    "92965268743",

  appId:
    "1:92965268743:web:accc8cc864c2bc49a569a2",
});

const messaging =
  firebase.messaging();

messaging.onBackgroundMessage(
  (payload) => {

    console.log(
      "Background Message:",
      payload
    );

    self.registration.showNotification(
      payload.notification.title,
      {
        body:
          payload.notification.body,

        icon:
          "/vite.svg",
      }
    );

  }
);