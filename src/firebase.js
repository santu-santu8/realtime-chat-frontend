import { initializeApp } from "firebase/app";

import { getMessaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyA6Gm1Xg01EobSEDZO_RYFv4AtbRrpf-eI",

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
};

const app =
  initializeApp(firebaseConfig);

export const messaging =
  getMessaging(app);

export default app;