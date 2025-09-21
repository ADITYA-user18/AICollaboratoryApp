import React, { useContext,useState } from "react";
import { UserContext } from "../context/user.context";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const Userauth = ({ children }) => {
  const { user } = useContext(UserContext);
  const [loading, setLoading] = React.useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

 

  

  useEffect(() => {

     if (user) {
    setLoading(false);
  }
    if (!token) {
      navigate("/login");
    }
    if (!user) {
      navigate("/login");
    }
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return <>{children}</>;
};

export default Userauth;
