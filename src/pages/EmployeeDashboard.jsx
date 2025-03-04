import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import LeaveForm from "../components/LeaveForm";


const EmployeeDashboard = () => {
  const [employee, setEmployee] = useState(null);
   const [loading, setLoading] = useState(true);
  const [showLeaveForm, setShowLeaveForm] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEmployee = async () => {
      const token = localStorage.getItem("token");
      const employeeId = localStorage.getItem("employeeId");

      if (!token || !employeeId) return navigate("/login");

      try {
        const response = await fetch(`http://localhost:5000/api/employee/${employeeId}`, {
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error("Failed to fetch employee details");

        const data = await response.json();

        // Sort leave requests in the correct order
        if (data.leaveRequests) {
          const order = ["Pending", "Forwarded by HOD", "Approved", "Rejected"];
          data.leaveRequests.sort((a, b) => order.indexOf(a.status) - order.indexOf(b.status));
        }

        setEmployee(data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchEmployee();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("employeeId");
  
    // Show a confirmation message before navigating
    if (window.confirm("Are you sure you want to log out?")) {
      navigate("/login");
    }
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date)
      ? new Intl.DateTimeFormat("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }).format(date)
      : "Invalid Date";
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Employee Dashboard</h1>
        <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded">
          Logout
        </button>
      </div>

      {/* Employee Details */}
      {employee && (
        <div className="bg-white p-6 rounded shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">Employee Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Object.entries(employee)
              .filter(([key]) => key !== "leaveRequests")
              .map(([key, value]) => (
                <div key={key} className="border-b pb-2">
                  <strong className="capitalize">{key.replace(/_/g, " ")}</strong>: {value}
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Apply Leave Button */}
      <button
        onClick={() => setShowLeaveForm(true)}
        className="bg-blue-500 text-white px-4 py-2 rounded mb-6"
      >
        Apply Leave
      </button>

      {/* Leave Form (displayed as part of the page, not a popup) */}
      {showLeaveForm && (
        <div className="bg-white p-6 rounded shadow-md mb-6">
          <LeaveForm onClose={() => setShowLeaveForm(false)} employeeId={employee.employeeId}  leaveBalance={employee.leaveBalance} />
        </div>
      )}

      {/* Leave Requests - Displayed as Cards */}
      {employee?.leaveRequests && Array.isArray(employee.leaveRequests) && (
        <div className="bg-white p-6 rounded shadow-md">
          <h2 className="text-xl font-semibold mb-4">Leave Requests</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {employee.leaveRequests.map((leave, index) => {
              const formattedDate = formatDate(leave.startDate);

              return (
                <div
                  key={index}
                  className="bg-gray-50 p-4 rounded-lg shadow-md border-l-4"
                  style={{
                    borderLeftColor:
                      leave.status === "Pending"
                        ? "#FACC15"
                        : leave.status === "Forwarded by HOD"
                        ? "#3B82F6"
                        : leave.status === "Approved"
                        ? "#22C55E"
                        : "#EF4444",
                  }}
                >
                  <p className="text-sm text-gray-600">
                    <strong>Date:</strong> {formattedDate}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Reason:</strong> {leave.reason}
                  </p>
                  <span
                    className={`inline-block px-3 py-1 mt-2 text-xs font-semibold rounded ${
                      leave.status === "Pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : leave.status === "Forwarded by HOD"
                        ? "bg-blue-100 text-blue-700"
                        : leave.status === "Approved"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {leave.status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeDashboard;
