import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });




 // in UserProvider
useEffect(() => {
  const token = localStorage.getItem("token");
  if (token) {
    axios
      .get(`${import.meta.env.VITE_API_URL}/users/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const u = res.data.user;
        setUser({ ...u, _id: u.id }); // add _id alias
      })
      .catch(() => localStorage.removeItem("token"));
  }
}, []);


  const logout = () => {
    setUser(null);
  };


  return <UserContext.Provider value={{ user, setUser,logout }}>{children}</UserContext.Provider>;
};

