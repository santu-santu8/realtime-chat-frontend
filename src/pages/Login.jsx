import { useState } from "react";
import API from "../services/api";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import getFCMToken from "../utils/getFCMToken";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await API.post(
        "/auth/login",
        formData
      );

      // Save JWT Token
      localStorage.setItem(
        "token",
        res.data.token
      );

      // Save User
      localStorage.setItem(
        "user",
        JSON.stringify(res.data.user)
      );

      // ======================
      // GET FCM TOKEN
      // ======================

      try {
        const fcmToken =
          await getFCMToken();

        if (fcmToken) {
          await API.post(
            "/auth/save-token",
            {
              user_id:
                res.data.user.id,
              token: fcmToken,
            }
          );

          console.log(
            "✅ FCM Token Saved"
          );
        }
      } catch (err) {
        console.log(
          "FCM Save Error:",
          err
        );
      }

      alert("Login Successful 🔥");

      navigate("/chat");

    } catch (error) {
      console.log(error);

      alert(
        error.response?.data?.message ||
        "Login failed"
      );
    }
  };

  return (
    <div className="h-screen bg-black flex items-center justify-center text-white">

      <motion.form
        initial={{
          opacity: 0,
          y: 40,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.5,
        }}
        onSubmit={handleLogin}
        className="
          bg-zinc-900
          p-10
          rounded-3xl
          w-[400px]
          space-y-5
          shadow-2xl
          border
          border-zinc-800
        "
      >

        <h1 className="text-4xl font-bold text-center text-green-400">
          Welcome Back
        </h1>

        <input
          type="email"
          name="email"
          placeholder="Email"
          onChange={handleChange}
          required
          className="
            w-full
            p-4
            rounded-xl
            bg-zinc-800
            outline-none
            focus:ring-2
            focus:ring-green-500
          "
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          onChange={handleChange}
          required
          className="
            w-full
            p-4
            rounded-xl
            bg-zinc-800
            outline-none
            focus:ring-2
            focus:ring-green-500
          "
        />

        <button
          type="submit"
          className="
            w-full
            bg-green-500
            hover:bg-green-400
            transition-all
            duration-300
            text-black
            p-4
            rounded-xl
            font-bold
          "
        >
          Login
        </button>

        <p className="text-center text-gray-400">
          Don't have an account?

          <Link
            to="/signup"
            className="
              text-green-400
              ml-2
              hover:underline
            "
          >
            Signup
          </Link>
        </p>

      </motion.form>

    </div>
  );
}

export default Login;
