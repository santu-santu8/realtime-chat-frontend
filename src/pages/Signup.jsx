import { useState } from "react";
import API from "../services/api";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";

function Signup() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    try {
      const res = await API.post(
        "/auth/signup",
        formData
      );

      // Save token
      localStorage.setItem(
        "token",
        res.data.token
      );

      // Save user
      localStorage.setItem(
        "user",
        JSON.stringify(res.data.user)
      );

      alert("Signup Successful 🔥");

      // Redirect
      navigate("/login");

    } catch (error) {
      console.log(error);

      alert(
        error.response?.data?.message ||
        "Signup failed"
      );
    }
  };

  return (
    <div className="h-screen bg-black flex items-center justify-center text-white">

      <motion.form
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        onSubmit={handleSignup}
        className="bg-zinc-900 p-10 rounded-3xl w-[400px] space-y-5 shadow-2xl border border-zinc-800"
      >

        <h1 className="text-4xl font-bold text-center text-green-400">
          Create Account
        </h1>

        <input
          type="text"
          name="username"
          placeholder="Username"
          onChange={handleChange}
          required
          className="w-full p-4 rounded-xl bg-zinc-800 outline-none focus:ring-2 focus:ring-green-500"
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          onChange={handleChange}
          required
          className="w-full p-4 rounded-xl bg-zinc-800 outline-none focus:ring-2 focus:ring-green-500"
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          onChange={handleChange}
          required
          className="w-full p-4 rounded-xl bg-zinc-800 outline-none focus:ring-2 focus:ring-green-500"
        />

        <button className="w-full bg-green-500 hover:bg-green-400 transition-all duration-300 text-black p-4 rounded-xl font-bold">
          Sign Up
        </button>

        <p className="text-center text-gray-400">
          Already have an account?
          <Link
            to="/login"
            className="text-green-400 ml-2 hover:underline"
          >
            Login
          </Link>
        </p>

      </motion.form>

    </div>
  );
}

export default Signup;