import React, { useState } from "react";
import { useNavigate } from "react-router-dom";


const Login = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    employeeId: "",
    department: "",
    designation: "",
    mobileNo: "",
  });

  const [role, setRole] = useState("employee");
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  let response;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Clear previous errors
    const endpoint = isRegistering ? "register" : `login/${role}`;
    
    try {
      if(isRegistering){
        response = await fetch(`http://localhost:5000/api/auth/${endpoint}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(isRegistering ? formData : { email: formData.email, password: formData.password }),
      });
      } else {
        response = await fetch(`http://localhost:5000/api/auth/${endpoint}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: formData.email, password: formData.password }),
      });
      };

      const data = await response.json();
      if (!response.ok) return setError(data.msg || "Something went wrong");

      if (isRegistering) {
        alert("Registration successful! Please login.");
        setIsRegistering(false);
      } else {
        localStorage.setItem("token", data.token);
        localStorage.setItem("employeeId", data.employeeId);
        navigate(role === "employee" ? "/employee-dashboard" : "/admin-dashboard");
      }
    } catch (err) {
      setError("Server error. Please try again.");
    }
  };

  return (
    <>
    
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-500 to-purple-600 px-4">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md transform transition-all duration-300 hover:scale-105">
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
          {isRegistering ? "Register" : "Login"}
        </h2>

        {error && (
          <p className="text-red-500 text-center mb-4 bg-red-100 p-2 rounded-lg">
            {error}
          </p>
        )}

        {isRegistering && (
          <>
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              className="mb-4 p-3 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              type="text"
              name="employeeId"
              placeholder="Employee ID"
              value={formData.employeeId}
              onChange={handleChange}
              className="mb-4 p-3 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              type="text"
              name="department"
              placeholder="Department"
              value={formData.department}
              onChange={handleChange}
              className="mb-4 p-3 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              type="text"
              name="designation"
              placeholder="Designation"
              value={formData.designation}
              onChange={handleChange}
              className="mb-4 p-3 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              type="text"
              name="mobileNo"
              placeholder="Mobile No."
              value={formData.mobileNo}
              onChange={handleChange}
              className="mb-4 p-3 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </>
        )}

        {!isRegistering && (
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="mb-4 p-3 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="employee">Employee</option>
            <option value="admin">Admin</option>
          </select>
        )}

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          className="mb-4 p-3 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          className="mb-6 p-3 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-3 rounded-lg font-semibold hover:bg-blue-700 transition-all duration-300"
        >
          {isRegistering ? "Register" : "Login"}
        </button>

        <p className="text-center mt-4 text-sm text-gray-600">
          {isRegistering ? "Already have an account?" : "Don't have an account?"}{" "}
          <button
            type="button"
            onClick={() => setIsRegistering(!isRegistering)}
            className="text-blue-600 hover:text-blue-800 underline focus:outline-none"
          >
            {isRegistering ? "Login here" : "Register here"}
          </button>
        </p>

        {/* HOD Login Button */}
        <button
          type="button"
          onClick={() => navigate("/hod-login")}
          className="w-full mt-4 text-blue-600 hover:text-blue-800 underline focus:outline-none"
        >
          HOD Login
        </button>
      </form>
      
    </div>
    
    </>
   
  );
};

export default Login;
