import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const HodRegister = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [department, setDepartment] = useState("");
  const [emailValid, setEmailValid] = useState(false);
  const [customDepartment, setCustomDepartment] = useState("");
  const [passwordConditions, setPasswordConditions] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    specialChar: false,
  });
  const [confirmPasswordValid, setConfirmPasswordValid] = useState(false);
  const navigate = useNavigate();

  // Handle Input Change
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "email") {
      setEmail(value);
      setEmailValid(/^[^\s@]{5,}@[^\s@]{2,}\.[^\s@]{2,}$/.test(value));
    }

    if (name === "password") {
      setPassword(value);
      setPasswordConditions({
        length: value.length >= 8,
        uppercase: /[A-Z]/.test(value),
        lowercase: /[a-z]/.test(value),
        number: /[0-9]/.test(value),
        specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(value),
      });
    }

    if (name === "confirmPassword") {
      setConfirmPassword(value);
      setConfirmPasswordValid(value === password);
    }

    if (name === "department") {
      setDepartment(value);
    }
  };

  const handleDepartmentChange = (e) => {
    setDepartment(e.target.value);
    if (e.target.value !== "Others") {
      setCustomDepartment(""); //Reset custom input if not "Others"
    }
  };
  const isPasswordValid = Object.values(passwordConditions).every(Boolean);

  const handleRegister = async (e) => {
    e.preventDefault();
    const finalDepartment = department === "Others" ? customDepartment : department;
    try {
      const response = await fetch("http://localhost:5000/api/hod/hod-register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, department: finalDepartment }),
      });

      const data = await response.json();
      if (response.ok) {
        alert("Registration Successful! Please login.");
        navigate("/hod-login");
      } else {
        alert(data.msg);
      }
    } catch (error) {
      console.error("Registration Error:", error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-500 to-indigo-600 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md bg-white shadow-xl rounded-lg p-6 sm:p-8">
        <h2 className="text-3xl font-semibold mb-6 text-center text-gray-800">
          HOD Registration
        </h2>
        <form onSubmit={handleRegister}>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium">Name</label>
            <input
              type="text"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 font-medium">Email</label>
            <input
              type="email"
              name="email"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter email"
              value={email}
              onChange={handleChange}
              required
            />
            {!emailValid && email && (
              <p className="text-red-500 text-sm mt-1">❌ Invalid email format</p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 font-medium">Password</label>
            <input
              type="password"
              name="password"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter password"
              value={password}
              onChange={handleChange}
              required
            />
          </div>

          {/* Password Conditions */}
          {!isPasswordValid && password && (
            <ul className="text-sm mt-2 space-y-1">
              {Object.entries(passwordConditions).map(([key, value]) => (
                <li key={key} className={`ml-4 ${value ? "text-green-600" : "text-red-500"}`}>
                  ✅ {key.replace(/([A-Z])/g, " $1").trim()}
                </li>
              ))}
            </ul>
          )}

          {/* Confirm Password (Appears after password is valid) */}
          {isPasswordValid && (
            <div className="mb-4">
              <label className="block text-gray-700 font-medium">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={handleChange}
                required
              />
              {!confirmPasswordValid && confirmPassword && (
                <p className="text-red-500 text-sm mt-1">❌ Passwords do not match</p>
              )}
            </div>
          )}

<div className="mb-4">
      <label className="block text-gray-700 font-medium">Department</label>
      <select
        name="department"
        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={department}
        onChange={handleDepartmentChange}
        required
      >
        <option value="" disabled>Select Department</option>
        <option value="CSE">CSE</option>
        <option value="Agriculture">Agriculture</option>
        <option value="ECE">ECE</option>
        <option value="Mech">Mech</option>
        <option value="Civil">Civil</option>
        <option value="Non-Technical">Non-Technical</option>
        <option value="Others">Others</option>
      </select>

      {department === "Others" && (
        <input
          type="text"
          name="customDepartment"
          className="w-full p-3 mt-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Please specify department"
          value={customDepartment}
          onChange={(e) => setCustomDepartment(e.target.value)}
          required
        />
      )}
    </div>

          <button
            type="submit"
            className={`w-full text-white p-3 rounded-lg font-semibold transition-all duration-300 ${
              emailValid && isPasswordValid && confirmPasswordValid
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-gray-400 cursor-not-allowed"
            }`}
            disabled={!emailValid || !isPasswordValid || !confirmPasswordValid}
          >
            Register
          </button>
        </form>

        <p className="text-center text-gray-600 mt-6 text-sm">
          Already have an account?{" "}
          <span
            onClick={() => navigate("/hod-login")}
            className="text-blue-500 cursor-pointer hover:underline"
          >
            Login here
          </span>
        </p>
      </div>
    </div>
  );
};

export default HodRegister;
