import { useEffect } from "react";

import {
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Chat from "./pages/Chat";

import ProtectedRoute from "./components/ProtectedRoute";

import getFCMToken from "./utils/getFCMToken";
import { listenForMessages } from "./firebaseNotifications";

function App() {

  useEffect(() => {

    const setupNotifications = async () => {

      try {

        if ("Notification" in window) {

          const permission =
            await Notification.requestPermission();

          console.log(
            "Notification Permission:",
            permission
          );

          if (
            permission === "granted"
          ) {

            const token =
              await getFCMToken();

            console.log(
              "FCM Token:",
              token
            );

            // Start Firebase listener
            listenForMessages();

          }

        }

      } catch (error) {

        console.log(
          "Notification Setup Error:",
          error
        );

      }

    };

    setupNotifications();

  }, []);

  return (

    <Routes>

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/signup"
        element={<Signup />}
      />

      <Route
        path="/chat"
        element={
          <ProtectedRoute>
            <Chat />
          </ProtectedRoute>
        }
      />

      <Route
        path="*"
        element={
          <Navigate to="/login" />
        }
      />

    </Routes>

  );

}

export default App;