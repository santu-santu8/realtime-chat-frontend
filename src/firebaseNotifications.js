import { onMessage } from "firebase/messaging";
import { messaging } from "./firebase";

export const listenForMessages = () => {

  onMessage(messaging, (payload) => {

    console.log(
      "🔥 FOREGROUND MESSAGE RECEIVED:",
      payload
    );

    // User is actively viewing tab
    if (
      document.visibilityState === "visible"
    ) {

      console.log(
        "User is active. Skip popup."
      );

      return;
    }

    if (
      Notification.permission === "granted"
    ) {

      new Notification(
        payload.notification?.title ||
        "New Message",
        {
          body:
            payload.notification?.body ||
            "You received a new message",

          icon: "/vite.svg",

          requireInteraction: true,
        }
      );
    }

  });

};