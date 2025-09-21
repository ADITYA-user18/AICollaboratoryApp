import React, { useState, useContext } from "react";
import { UserContext } from "../context/user.context";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";

// --- A simple SVG icon component for the form fields ---
const MailIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M1.5 8.67v8.58a3 3 0 0 0 3 3h15a3 3 0 0 0 3-3V8.67l-8.928 5.493a3 3 0 0 1-3.144 0L1.5 8.67Z" />
    <path d="M22.5 6.908V6.75a3 3 0 0 0-3-3h-15a3 3 0 0 0-3 3v.158l9.714 5.978a1.5 1.5 0 0 0 1.572 0L22.5 6.908Z" />
  </svg>
);

const LockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 0 0-5.25 5.25v3a3 3 0 0 0-3 3v6.75a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3v-6.75a3 3 0 0 0-3-3v-3A5.25 5.25 0 0 0 12 1.5Zm-3.75 5.25v3a3.75 3.75 0 1 0 7.5 0v-3a3.75 3.75 0 1 0-7.5 0Z" clipRule="evenodd" />
  </svg>
);

const LoginPage = () => {
  // --- ALL YOUR EXISTING LOGIC REMAINS UNCHANGED ---
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const { setUser } = useContext(UserContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/users/login`,
        { email, password }
      );
      setUser(res.data.user);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      navigate("/");
    } catch (error) {
      const errMsg = error.response?.data?.message || "Login failed. Try again.";
      setError(errMsg);
    }
  };

  // --- ANIMATION VARIANTS ARE REFINED BUT CONCEPTUALLY THE SAME ---
  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15, delay: 0.1 } },
  };

  const titleVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0, transition: { delay: 0.3, duration: 0.5 } },
  };

  const buttonVariants = {
    hover: { scale: 1.05, transition: { type: "spring", stiffness: 300 } },
    tap: { scale: 0.95 },
  };

  return (
    // ✅ Main container with a darker, more subtle gradient and an aurora effect
    <div className="min-h-screen bg-gray-900 text-gray-200 flex items-center justify-center p-4 font-sans relative overflow-hidden">
      {/* Aurora background effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60rem] h-[60rem] bg-gradient-to-tr from-violet-600 via-blue-500 to-green-500 rounded-full opacity-10 blur-[150px]"></div>

      {/* ✅ Refined "glassmorphism" card with improved styling */}
      <motion.div
        className="bg-gray-800/60 p-8 sm:p-10 rounded-2xl shadow-2xl w-full max-w-md border border-gray-700 backdrop-blur-lg z-10"
        variants={cardVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div
          className="text-center mb-8"
          variants={titleVariants}
          initial="hidden"
          animate="visible"
        >
          {/* ✅ App Icon */}
          <div className="inline-block bg-blue-500/20 p-3 rounded-full mb-4">
             <svg className="w-10 h-10 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.477 2 12C2 17.523 6.477 22 12 22C17.523 22 22 17.523 22 12C22 6.477 17.523 2 12 2ZM12 20C7.582 20 4 16.418 4 12C4 7.582 7.582 4 12 4C16.418 4 20 7.582 20 12C20 16.418 16.418 20 12 20ZM12 10.586L9.172 7.757L7.757 9.172L10.586 12L7.757 14.828L9.172 16.243L12 13.414L14.828 16.243L16.243 14.828L13.414 12L16.243 9.172L14.828 7.757L12 10.586Z"></path></svg>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">
            Welcome Back
          </h1>
          <p className="text-lg text-gray-400">Login to access Chat@AI</p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ✅ Email Input with Icon */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <MailIcon />
            </div>
            <input
              type="email"
              className="w-full pl-12 pr-4 py-3 rounded-lg text-gray-100 placeholder-gray-500 bg-gray-700/50 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
              placeholder="your.email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              name="email"
            />
          </div>

          {/* ✅ Password Input with Icon */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <LockIcon />
            </div>
            <input
              type="password"
              className="w-full pl-12 pr-4 py-3 rounded-lg text-gray-100 placeholder-gray-500 bg-gray-700/50 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
              placeholder="Your secure password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              name="password"
            />
          </div>

          {/* ✅ Improved Error Message Display */}
          {error && (
            <motion.div
              className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg p-3 flex items-center gap-3"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 flex-shrink-0"><path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm-1.72 6.97a.75.75 0 1 0-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 1 0 1.06 1.06L12 13.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L13.06 12l1.72-1.72a.75.75 0 1 0-1.06-1.06L12 10.94l-1.72-1.72Z" clipRule="evenodd" /></svg>
              <span>{error}</span>
            </motion.div>
          )}

          {/* ✅ Polished Gradient Button */}
          <motion.button
            type="submit"
            className="w-full text-white font-bold py-3 px-6 rounded-lg bg-gradient-to-r from-blue-500 to-violet-600 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-300 ease-in-out text-lg"
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
          >
            Log In
          </motion.button>
        </form>

        <motion.div
          className="mt-8 text-center text-gray-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { delay: 0.5, duration: 0.5 } }}
        >
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-blue-400 hover:text-violet-400 font-semibold transition duration-200 hover:underline"
          >
            Register Here
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LoginPage;