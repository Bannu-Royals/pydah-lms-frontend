import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaComments, FaFilter } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";



  const AdminDashboard = () => {
    const [leaveRequests, setLeaveRequests] = useState([]);
    const [hodLeaveRequests, setHodLeaveRequests] = useState([]);
    const [filteredRequests, setFilteredRequests] = useState([]);
    const [filteredHodRequests, setFilteredHodRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showPopup, setShowPopup] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [remarks, setRemarks] = useState("");
    const [showFilter, setShowFilter] = useState(false);
    const [filterStatus, setFilterStatus] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [showHodRequests, setShowHodRequests] = useState(false);
    const [excelFile, setExcelFile] = useState(null);
    // const [allFilteredLeaves, setAllFilteredLeaves] = useState([]);
    const navigate = useNavigate();
  
    useEffect(() => {
      const today = new Date().toISOString().split("T")[0];
  
      axios.get("http://localhost:5000/api/admin/leave-requests")
        .then((response) => {
          setLeaveRequests(response.data.leaveRequests);
          setFilteredRequests(response.data.leaveRequests.filter(request => 
            request.leaveRequest && new Date(request.leaveRequest.startDate).toISOString().split("T")[0] >= today
          ));
        })
        .catch((error) => console.error("Error fetching leave requests", error));
  
      axios.get("http://localhost:5000/api/admin/hod-leave-requests")
        .then((response) => {
          setHodLeaveRequests(response.data.leaveRequests);
          setFilteredHodRequests(response.data.leaveRequests.filter(request => 
            request.startDate && new Date(request.startDate).toISOString().split("T")[0] >= today
          ));
          
          setLoading(false);
        })
        .catch((error) => console.error("Error fetching HOD leave requests", error));
    }, []);
  
    const handleOpenPopup = (employeeId, leaveRequestId, status, isHodRequest = false) => {
      setSelectedRequest({ employeeId, leaveRequestId, status, isHodRequest });
      setRemarks("");
      setShowPopup(true);
    };
  
    const handleConfirmUpdate = () => {
      if (!selectedRequest) return;
      const { employeeId, leaveRequestId, status, isHodRequest } = selectedRequest;
      const finalRemarks = remarks.trim() || (status === "Approved" ? "Approved by admin" : "Rejected by admin");
  
      const url = isHodRequest
        ? "http://localhost:5000/api/admin/hod-update-leave-request"
        : "http://localhost:5000/api/admin/update-leave-request";
      console.log(employeeId, leaveRequestId, status, remarks );
      axios.put(url, { employeeId, leaveRequestId, status, remarks: finalRemarks })
        .then(() => {
          alert("Leave request updated successfully!");
          if (isHodRequest) {
            setHodLeaveRequests((prev) => prev.map((req) =>
              req.employeeId === employeeId && req._id === leaveRequestId
                ? { ...req, status, remarks: finalRemarks }
                : req
            ));
          } else {
            setLeaveRequests((prev) => prev.map((req) =>
              req.employeeId === employeeId && req.leaveRequest._id === leaveRequestId
                ? { ...req, leaveRequest: { ...req.leaveRequest, status, remarks: finalRemarks } }
                : req
            ));
          }
          setShowPopup(false);
        })
        .catch(() => alert("Error updating leave request!"));
    };
  
    

    const applyFilters = () => {
      let filtered = leaveRequests;
      let hodfiltered = hodLeaveRequests;
    
      if (filterStatus) {
        filtered = filtered.filter(
          (req) => req.leaveRequest.status === filterStatus
        );
        hodfiltered = hodfiltered.filter(
          (req) => req.status === filterStatus
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
        hodfiltered = hodfiltered.filter((req) => {
          const leaveStartDate = new Date(req.startDate);
          return leaveStartDate >= new Date(startDate) && leaveStartDate <= new Date(endDate);
        });
      }
    
      setFilteredRequests(filtered);
      setFilteredHodRequests(hodfiltered);
      setShowFilter(false);
    };
    
    const exportToExcel = () => {
      let allFilteredLeaves = [
        ...filteredRequests, 
        ...filteredHodRequests
      ];
    
      // Filter to only include approved requests
      let approvedRequests = allFilteredLeaves.filter(
        (req) => req.leaveRequest ? req.leaveRequest.status === "Approved" : req.status === "Approved"
      );
    
      // Sorting by Department and Name
      approvedRequests.sort((a, b) => {
        if (a.department < b.department) return -1;
        if (a.department > b.department) return 1;
    
        // Add checks to ensure 'name' is not undefined
        if (a.name && b.name) {
          return a.name.localeCompare(b.name);
        }
    
        // If name is undefined, place it at the end
        return a.name ? -1 : 1;
      });
    
      // Prepare the data for Excel export
      const excelData = approvedRequests.map((req, index) => {
        // Convert to date objects and strip off the time part (set time to midnight)
        const startDate = new Date(req.leaveRequest ? req.leaveRequest.startDate : req.startDate);
        const endDate = new Date(req.leaveRequest ? req.leaveRequest.endDate : req.endDate);
        
        // Remove the time part by setting both dates to midnight
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(0, 0, 0, 0);
        
        // Calculate the difference in time between the two dates
        const diffTime = endDate - startDate;
        const diffDays = Math.ceil(diffTime / (1000 * 3600 * 24)); // Convert to days
    
        return {
          "Serial No": index + 1,
          "Name of the Faculty": req.name || req.hodName,
          Department: req.department,
          "Employee ID": req.employeeId || req.hodId,
          "On Leave Period": `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`,
          "No. of Days": diffDays + 1,
          Reason: req.leaveRequest ? req.leaveRequest.reason : req.reason,
          Remarks: req.leaveRequest ? req.leaveRequest.remarks || "No remarks" : req.remarks || "No remarks",
        };
      });
    
      // Create Excel file
      const ws = XLSX.utils.json_to_sheet(excelData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Approved Leave Requests");
    
      // Generate Excel file and create a downloadable URL
      const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      const fileBlob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const fileURL = URL.createObjectURL(fileBlob);
    
      if (excelFile) {
        URL.revokeObjectURL(excelFile); // Revoke the old file URL to release memory
      }
    
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

  
    const handleLogout = () => {
      localStorage.removeItem("token");
      navigate("/login");
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

          {/* HOD Leave Requests Section */}
          <div className="mb-6">
          <button
            className="bg-gray-700 text-white px-4 py-2 rounded mb-4"
            onClick={() => setShowHodRequests(!showHodRequests)}
          >
            {showHodRequests ? "Hide" : "Show"} HOD Leave Requests
          </button>

          {showHodRequests && (
  <section>
    <h2 className="text-xl font-semibold text-gray-800 mb-4">
      HOD Leave Requests
    </h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {filteredHodRequests.map((request) => (
        <div
          key={request._id}
          className="bg-white p-6 rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300"
        >
          {/* Leave Request Content */}
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            {request.hodName}
          </h2>
          <p className="text-gray-600 text-sm mb-2">
            <span className="font-medium">HOD-ID:</span> {request.hodId}
          </p>
          <p className="text-gray-600 text-sm mb-2">
            <span className="font-medium">Department:</span> {request.department}
          </p>
          <p className="text-gray-600 text-sm mb-2">
            <span className="font-medium">Leave:</span>{" "}
            {new Date(request.startDate).toLocaleDateString()} -{" "}
            {new Date(request.endDate).toLocaleDateString()}
          </p>
          <p
            className={`font-semibold text-sm mb-2 ${
              request.status === "Approved"
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            {request.status}
          </p>
          <p className="text-gray-600 text-sm mb-4">
            <span className="font-medium">Remarks:</span>{" "}
            {request.remarks || "No remarks"}
          </p>
          {request.status === "Pending" && (
            <div className="flex gap-3 mt-4">
              <button
                className="bg-green-500 text-white px-5 py-2 rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-300 w-full sm:w-auto"
                onClick={() =>
                  handleOpenPopup(
                    request.hodId,
                    request._id,
                    "Approved",
                    true
                  )
                }
              >
                Approve
              </button>
              <button
                className="bg-red-500 text-white px-5 py-2 rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 transition duration-300 w-full sm:w-auto"
                onClick={() =>
                  handleOpenPopup(
                    request.hodId,
                    request._id,
                    "Rejected",
                    true
                  )
                }
              >
                Reject
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  </section>
)}

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
                          "Approved",
                        
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
                          "Rejected",
                   
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
