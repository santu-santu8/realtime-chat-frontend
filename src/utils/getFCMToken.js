import { getToken } from "firebase/messaging";
import { messaging } from "../firebase";

const getFCMToken = async () => {
  try {
    const token = await getToken(messaging, {
      vapidKey:
        "BDtEPGzxNqiHYoooe6SXI36p2_77-SYrJHEG4ExsSqUtYuLv6k39IQlnZHFusg448iWYDBZfxbztauIV6ar_6GY",
    });

    if (token) {
      console.log("✅ FCM Token:", token);
      return token;
    } else {
      console.log(
        "❌ No FCM token generated. Notification permission may not be granted."
      );
      return null;
    }
  } catch (error) {
    console.error("❌ FCM Error:", error);
    return null;
  }
};

export default getFCMToken;