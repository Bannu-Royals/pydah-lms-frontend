import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "font-awesome/css/font-awesome.min.css"; // Importing Font Awesome

const HodLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5000/api/hod/hod-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (response.ok) {
        localStorage.setItem("hodtoken", data.hodtoken);
        alert("Login Successful!");
        navigate("/hod-dashboard");
      } else {
        alert(data.msg);
      }
    } catch (error) {
      console.error("Login Error:", error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-maroon to-darkGold px-4 sm:px-6 lg:px-8">
    <div className="w-full max-w-md bg-secondary shadow-outerRaised rounded-neumorphic p-6 sm:p-8">
      {/* Professionally Styled Back Button with Font Awesome Icon */}
      <button
        onClick={() => navigate("/")}
        className="mb-4 text-textLight bg-primary hover:bg-darkGold border border-transparent rounded-neumorphic py-2 px-4 text-sm font-semibold transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-accent"
      >
        <i className="fa fa-arrow-left"></i> {/* Left arrow icon */}
      </button>
  
      <h2 className="text-3xl font-semibold mb-6 text-center text-primary font-heading">
        HOD Login
      </h2>
      
      <form onSubmit={handleLogin}>
        <div className="mb-4">
          <label className="block text-primary font-medium">Email</label>
          <input
            type="email"
            className="w-full p-3 border-none rounded-neumorphic bg-background shadow-innerInset focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
  
        <div className="mb-6">
          <label className="block text-primary font-medium">Password</label>
          <input
            type="password"
            className="w-full p-3 border-none rounded-neumorphic bg-background shadow-innerInset focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
  
        <button
          type="submit"
          className="w-full bg-primary hover:bg-darkGold text-textLight font-semibold p-3 rounded-neumorphic shadow-outerRaised transition-all duration-300"
        >
          Login
        </button>
      </form>
  
      <p className="text-center text-gray-600 mt-6 text-sm">
        New to the system?{" "}
        <span
          onClick={() => navigate("/hod-register")}
          className="text-accent cursor-pointer hover:underline"
        >
          Register here
        </span>
      </p>
    </div>
  </div>
  
  );
};

export default HodLogin;
