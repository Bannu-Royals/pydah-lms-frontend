import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaFilter } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";

const AdminDashboard = () => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [remarks, setRemarks] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [filterStatus, setFilterStatus] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [excelFile, setExcelFile] = useState(null); // State to store the Excel file
  const navigate = useNavigate();

  // Logout function
  const handleLogout = () => {
    // Remove token or user data from localStorage
    localStorage.removeItem("token"); // Or sessionStorage depending on where the token is stored
    // Navigate to login page after logout
    navigate("/login"); // Adjust this to your login route
  };

  useEffect(() => {
    // Get today's date for default filtering
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format

    axios
      .get("http://localhost:5000/api/admin/leave-requests")
      .then((response) => {
        const requests = response.data.leaveRequests;

        // Filter requests where both startDate is greater than or equal to today's date
        // and endDate is greater than or equal to today's date
        const filteredRequests = requests.filter((request) => {
          const requestStartDate = new Date(request.leaveRequest.startDate)
            .toISOString()
            .split("T")[0];
          const requestEndDate = new Date(request.leaveRequest.endDate)
            .toISOString()
            .split("T")[0];
          return requestStartDate >= today && requestEndDate >= today;
        });

        setLeaveRequests(requests);
        setFilteredRequests(filteredRequests);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching leave requests", error);
        setLoading(false);
      });
  }, []);

  const handleOpenPopup = (employeeId, leaveRequestId, status) => {
    setSelectedRequest({ employeeId, leaveRequestId, status });
    setRemarks("");
    setShowPopup(true);
  };

  const handleConfirmUpdate = () => {
    if (!selectedRequest) return;
    const { employeeId, leaveRequestId, status } = selectedRequest;

    const finalRemarks =
      remarks.trim() ||
      (status === "Approved" ? "Approved by admin" : "Rejected by admin");

    axios
      .put("http://localhost:5000/api/admin/update-leave-request", {
        employeeId,
        leaveRequestId,
        status,
        remarks: finalRemarks,
      })
      .then(() => {
        alert("Leave request updated successfully!");
        setLeaveRequests((prevRequests) =>
          prevRequests.map((req) =>
            req.employeeId === employeeId &&
            req.leaveRequest._id === leaveRequestId
              ? {
                  ...req,
                  leaveRequest: {
                    ...req.leaveRequest,
                    status,
                    remarks: finalRemarks,
                  },
                }
              : req
          )
        );
        applyFilters(); // Reapply filters after update
        setShowPopup(false);
      })
      .catch((error) => {
        console.error("Error updating leave request:", error);
        alert("Error updating leave request!");
      });
  };

  const applyFilters = () => {
    let filtered = leaveRequests;

    if (filterStatus) {
      filtered = filtered.filter(
        (req) => req.leaveRequest.status === filterStatus
      );
    }

    if (startDate && endDate) {
      filtered = filtered.filter((req) => {
        const leaveStartDate = new Date(req.leaveRequest.startDate);
        return (
          leaveStartDate >= new Date(startDate) &&
          leaveStartDate <= new Date(endDate)
        );
      });
    }

    setFilteredRequests(filtered);
    setShowFilter(false);
  };

  const exportToExcel = () => {
    let approvedRequests = filteredRequests.filter(
      (req) => req.leaveRequest.status === "Approved"
    );

    approvedRequests.sort((a, b) => {
      if (a.department < b.department) return -1;
      if (a.department > b.department) return 1;
      return a.name.localeCompare(b.name);
    });

    const excelData = approvedRequests.map((req, index) => ({
      "Serial No": index + 1,
      "Name of the Faculty": req.name,
      Department: req.department,
      "Employee ID": req.employeeId,
      "On Leave Period": `${new Date(
        req.leaveRequest.startDate
      ).toLocaleDateString()} - ${new Date(
        req.leaveRequest.endDate
      ).toLocaleDateString()}`,
      "No. of Days": req.leaveRequest.days,
      Reason: req.leaveRequest.reason,
      Remarks: req.leaveRequest.remarks || "No remarks",
    }));

    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Approved Leave Requests");

    // Generate Excel file and create a downloadable URL
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const fileBlob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const fileURL = URL.createObjectURL(fileBlob);

    setExcelFile(fileURL); // Store file URL in state
  };

  // Loader display while data is being fetched
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-xl font-semibold">
        Loading...
      </div>
    );
  }

  // Function to categorize leave requests by status
  const categorizeRequestsByStatus = () => {
    return {
      forwardedByHod: filteredRequests.filter(
        (req) => req.leaveRequest.status === "Forwarded by HOD"
      ),
      approved: filteredRequests.filter(
        (req) => req.leaveRequest.status === "Approved"
      ),
      rejected: filteredRequests.filter(
        (req) => req.leaveRequest.status === "Rejected"
      ),
    };
  };

  const { forwardedByHod, approved, rejected } = categorizeRequestsByStatus();

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold text-gray-800">
              Admin Dashboard
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <button
              className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800 transition flex items-center gap-2"
              onClick={() => setShowFilter(true)}
            >
              <FaFilter /> Filters
            </button>
            {/* Logout Button */}
            <button
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
          <div className="flex items-center gap-4">
            <button
              className="bg-green-600 text-white mx-2 px-4 py-2 rounded hover:bg-green-700 transition"
              onClick={exportToExcel}
            >
              Export to Excel
            </button>
            {excelFile && (
              <a
                href={excelFile}
                download="Approved_Leave_Requests.xlsx"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
              >
                Download Excel
              </a>
            )}
          </div>
        </div>

        {/* Forwarded by HOD Section */}
        {forwardedByHod.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Forwarded by HOD
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {forwardedByHod.map((request) => (
                <div
                  key={request.leaveRequest._id}
                  className="bg-white p-6 rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300"
                >
                  {/* Leave Request Content */}
                  <h2 className="text-xl font-semibold text-gray-800 mb-2">
                    {request.name}
                  </h2>
                  <p className="text-gray-600 text-sm mb-2">
                    <span className="font-medium">Employee ID:</span>{" "}
                    {request.employeeId}
                  </p>
                  <p className="text-gray-600 text-sm mb-2">
                    <span className="font-medium">Department:</span>{" "}
                    {request.department}
                  </p>
                  <p className="text-gray-600 text-sm mb-2">
                    <span className="font-medium">Leave:</span>{" "}
                    {new Date(
                      request.leaveRequest.startDate
                    ).toLocaleDateString()}{" "}
                    -{" "}
                    {new Date(
                      request.leaveRequest.endDate
                    ).toLocaleDateString()}
                  </p>
                  <p
                    className={`font-semibold text-sm mb-2 ${
                      request.leaveRequest.status === "Approved"
                        ? "text-green-600"
                        : request.leaveRequest.status === "Rejected"
                        ? "text-red-600"
                        : "text-blue-600"
                    }`}
                  >
                    {request.leaveRequest.status}
                  </p>
                  <p className="text-gray-600 text-sm mb-4">
                    <span className="font-medium">Remarks:</span>{" "}
                    {request.leaveRequest.remarks || "No remarks"}
                  </p>
                  <div className="flex gap-3 mt-4">
                    <button
                      className="bg-green-500 text-white px-5 py-2 rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-300 w-full sm:w-auto"
                      onClick={() =>
                        handleOpenPopup(
                          request.employeeId,
                          request.leaveRequest._id,
                          "Approved"
                        )
                      }
                    >
                      Approve
                    </button>
                    <button
                      className="bg-red-500 text-white px-5 py-2 rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 transition duration-300 w-full sm:w-auto"
                      onClick={() =>
                        handleOpenPopup(
                          request.employeeId,
                          request.leaveRequest._id,
                          "Rejected"
                        )
                      }
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Approved Section */}
        {approved.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Approved
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {approved.map((request) => (
                <div
                  key={request.leaveRequest._id}
                  className="bg-white p-6 rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300"
                >
                  {/* Leave Request Content */}
                  <h2 className="text-xl font-semibold text-gray-800 mb-2">
                    {request.name}
                  </h2>
                  <p className="text-gray-600 text-sm mb-2">
                    <span className="font-medium">Employee ID:</span>{" "}
                    {request.employeeId}
                  </p>
                  <p className="text-gray-600 text-sm mb-2">
                    <span className="font-medium">Department:</span>{" "}
                    {request.department}
                  </p>
                  <p className="text-gray-600 text-sm mb-2">
                    <span className="font-medium">Leave:</span>{" "}
                    {new Date(
                      request.leaveRequest.startDate
                    ).toLocaleDateString()}{" "}
                    -{" "}
                    {new Date(
                      request.leaveRequest.endDate
                    ).toLocaleDateString()}
                  </p>
                  <p
                    className={`font-semibold text-sm mb-2 ${
                      request.leaveRequest.status === "Approved"
                        ? "text-green-600"
                        : request.leaveRequest.status === "Rejected"
                        ? "text-red-600"
                        : "text-blue-600"
                    }`}
                  >
                    {request.leaveRequest.status}
                  </p>
                  <p className="text-gray-600 text-sm mb-4">
                    <span className="font-medium">Remarks:</span>{" "}
                    {request.leaveRequest.remarks || "No remarks"}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Rejected Section */}
        {rejected.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Rejected
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {rejected.map((request) => (
                <div
                  key={request.leaveRequest._id}
                  className="bg-white p-6 rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300"
                >
                  {/* Leave Request Content */}
                  <h2 className="text-xl font-semibold text-gray-800 mb-2">
                    {request.name}
                  </h2>
                  <p className="text-gray-600 text-sm mb-2">
                    <span className="font-medium">Employee ID:</span>{" "}
                    {request.employeeId}
                  </p>
                  <p className="text-gray-600 text-sm mb-2">
                    <span className="font-medium">Department:</span>{" "}
                    {request.department}
                  </p>
                  <p className="text-gray-600 text-sm mb-2">
                    <span className="font-medium">Leave:</span>{" "}
                    {new Date(
                      request.leaveRequest.startDate
                    ).toLocaleDateString()}{" "}
                    -{" "}
                    {new Date(
                      request.leaveRequest.endDate
                    ).toLocaleDateString()}
                  </p>
                  <p
                    className={`font-semibold text-sm mb-2 ${
                      request.leaveRequest.status === "Approved"
                        ? "text-green-600"
                        : request.leaveRequest.status === "Rejected"
                        ? "text-red-600"
                        : "text-blue-600"
                    }`}
                  >
                    {request.leaveRequest.status}
                  </p>
                  <p className="text-gray-600 text-sm mb-4">
                    <span className="font-medium">Remarks:</span>{" "}
                    {request.leaveRequest.remarks || "No remarks"}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Popup for Remarks */}
      {showPopup && (
        <div className="fixed inset-0 flex justify-center items-center bg-gray-900 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-lg font-semibold mb-4">Enter Remarks</h2>
            <textarea
              className="w-full border rounded p-2 mb-4"
              placeholder="Enter remarks (optional)"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <button
                className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 transition"
                onClick={() => setShowPopup(false)}
              >
                Cancel
              </button>
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                onClick={handleConfirmUpdate}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filter Popup */}
      {showFilter && (
        <div className="fixed inset-0 flex justify-center items-center bg-gray-900 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-lg font-semibold mb-4">Apply Filters</h2>
            <label className="block mb-2">Status:</label>
            <select
              className="w-full border rounded p-2 mb-4"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">All</option>
              <option value="Forwarded by HOD">Forwarded by HOD</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
            <label className="block mb-2">Start Date:</label>
            <input
              type="date"
              className="w-full border rounded p-2 mb-4"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <label className="block mb-2">End Date:</label>
            <input
              type="date"
              className="w-full border rounded p-2 mb-4"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
            <div className="flex justify-between gap-2">
              <button
                className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 transition"
                onClick={() => setShowFilter(false)}
              >
                Cancel
              </button>
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                onClick={applyFilters}
              >
                Apply Filters
              </button>
              <button
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
                onClick={() => {
                  setFilterStatus("");
                  setStartDate("");
                  setEndDate("");
                  applyFilters(); // Reapply default filters
                }}
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
