// screens/RegisterPage.jsx

import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "../config/axios";
import { UserContext } from "../context/user.context";

const RegisterPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const { setUser } = useContext(UserContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setError("");

    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/users/register`, {
        email,
        password,
      });

      localStorage.setItem('token', res.data.token);
      setUser(res.data.user);
      navigate('/');

    } catch (err) {
      const errMsg = err.response?.data?.error || err.response?.data?.message || "Registration failed. Please try again.";
      setError(errMsg);
      console.log('Cannot able to Register..', err);
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.8, rotateX: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      rotateX: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };

  const titleVariants = {
    hidden: { opacity: 0, x: -30 },
    visible: { opacity: 1, x: 0, transition: { delay: 0.4, duration: 0.7 } },
  };

  const inputVariants = {
    initial: { backgroundColor: "#2D3748", borderColor: "#4A5568" },
    hover: { borderColor: "#81E6D9", transition: { duration: 0.3 } },
    focus: {
      borderColor: "#38B2AC",
      boxShadow: "0 0 0 3px rgba(56, 178, 172, 0.4)",
      backgroundColor: "#262F3C",
      transition: { duration: 0.2 },
    },
  };

  const buttonVariants = {
    initial: { scale: 1, backgroundColor: "#38B2AC" },
    hover: {
      scale: 1.03,
      backgroundColor: "#319795",
      boxShadow: "0 8px 20px rgba(56, 178, 172, 0.4)",
      transition: { duration: 0.3 },
    },
    tap: { scale: 0.97, backgroundColor: "#2C7A7B" },
  };

  return (
    <div className="min-h-screen bg-gradient-to-bl from-gray-900 to-gray-700 flex items-center justify-center p-6 font-sans">
      <motion.div
        className="bg-gray-800 p-10 rounded-xl shadow-2xl w-full max-w-md border border-gray-700 backdrop-blur-sm bg-opacity-70"
        variants={cardVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div
          className="text-center mb-10"
          variants={titleVariants}
          initial="hidden"
          animate="visible"
        >
          <h1 className="text-5xl font-extrabold text-white mb-2 leading-tight">
            Join Us!
          </h1>
          <p className="text-xl text-gray-300">Create your new account</p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-7">
          <div>
            <label htmlFor="email" className="block text-md font-medium text-gray-200 mb-2">Email Address</label>
            <motion.input
              type="email" id="email"
              className="w-full px-5 py-3 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-transparent transition duration-200"
              placeholder="Your email address"
              value={email} onChange={(e) => setEmail(e.target.value)}
              required variants={inputVariants} initial="initial" whileHover="hover" whileFocus="focus"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-md font-medium text-gray-200 mb-2">Password</label>
            <motion.input
              type="password" id="password"
              className="w-full px-5 py-3 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-transparent transition duration-200"
              placeholder="Create a strong password"
              value={password} onChange={(e) => setPassword(e.target.value)}
              required variants={inputVariants} initial="initial" whileHover="hover" whileFocus="focus"
            />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-md font-medium text-gray-200 mb-2">Confirm Password</label>
            <motion.input
              type="password" id="confirmPassword"
              className="w-full px-5 py-3 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-transparent transition duration-200"
              placeholder="Confirm your password"
              value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
              required variants={inputVariants} initial="initial" whileHover="hover" whileFocus="focus"
            />
          </div>
          {error && (
            <motion.p
              className="text-red-400 text-sm mt-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0, transition: { duration: 0.4 } }}
            >
              {error}
            </motion.p>
          )}
          <motion.button
            type="submit"
            className="w-full text-white font-bold py-3.5 px-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition duration-300 ease-in-out text-lg tracking-wide"
            variants={buttonVariants} initial="initial" whileHover="hover" whileTap="tap"
          >
            Register
          </motion.button>
        </form>
        <motion.div
          className="mt-10 text-center text-gray-400 text-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0, transition: { delay: 0.7, duration: 0.6 }, }}
        >
          Already have an account?{" "}
          <Link to="/login" className="text-teal-400 hover:text-teal-300 font-semibold transition duration-200 ease-in-out hover:underline">
            Login Here
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default RegisterPage;