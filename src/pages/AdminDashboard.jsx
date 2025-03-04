import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaComments, FaFilter } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

import * as XLSX from "xlsx-js-style";





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
    const [refreshTrigger, setRefreshTrigger] = useState(false); // State to trigger re-fetch

    const navigate = useNavigate();
  
    useEffect(() => {
      const today = new Date().toISOString().split("T")[0];
    
      axios.get("http://localhost:5000/api/admin/leave-requests")
        .then((response) => {
          const formattedRequests = response.data.leaveRequests.map(request => ({
            ...request,
            leaveRequest: {
              ...request.leaveRequest,
              startDate: request.leaveRequest?.startDate ? request.leaveRequest.startDate.split("T")[0] : "",
              endDate: request.leaveRequest?.endDate ? request.leaveRequest.endDate.split("T")[0] : "",
            }
          }));
    
          setLeaveRequests(formattedRequests);
          console.log(formattedRequests);
    
          setFilteredRequests(formattedRequests.filter(request => 
            request.leaveRequest?.startDate && request.leaveRequest.startDate >= today
          ));
          setLoading(false);
        })
        .catch((error) => console.error("Error fetching leave requests", error));
    
      axios.get("http://localhost:5000/api/admin/hod-leave-requests")
        .then((response) => {
          const formattedHodRequests = response.data.leaveRequests.map(request => ({
            ...request,
            leaveRequest: {
              ...request.leaveRequest,
              startDate: request.leaveRequest?.startDate ? request.leaveRequest.startDate.split("T")[0] : "",
              endDate: request.leaveRequest?.endDate ? request.leaveRequest.endDate.split("T")[0] : "",
            }
          }));
    
          setHodLeaveRequests(formattedHodRequests);
          console.log(formattedHodRequests);
    
          setFilteredHodRequests(formattedHodRequests.filter(request => 
            request.leaveRequest?.startDate && request.leaveRequest.startDate >= today
          ));
    
          setLoading(false);
        })
        .catch((error) => console.error("Error fetching HOD leave requests", error));
    }, [refreshTrigger]);
    
  
    const handleOpenPopup = (employeeId, leaveRequestId, status, isHodRequest = false) => {
      setSelectedRequest({ employeeId, leaveRequestId, status, isHodRequest });
      setRemarks("");
      setShowPopup(true);
    };
  
    const handleConfirmUpdate = async () => {
      setLoading(true);
      if (!selectedRequest) return;
    
      const { employeeId, leaveRequestId, status, isHodRequest } = selectedRequest;
    
      // Set default remarks if none provided
      const finalRemarks = remarks.trim() || (status === "Approved" ? "Approved by admin" : "Rejected by admin");
    
      // API URL based on whether it's an HOD request or Faculty request
      const url = isHodRequest
        ? "http://localhost:5000/api/admin/hod-update-leave-request"
        : "http://localhost:5000/api/admin/update-leave-request";

        console.log(employeeId,leaveRequestId,status,);
    
      try {
        const response = await axios.put(url, {
          employeeId,
          leaveRequestId,
          status,
          remarks: finalRemarks,
        });
    
        if (response.status === 200) {
          alert("Leave request updated successfully!");
          setRefreshTrigger(prev => !prev); 
          setLoading(false);
    
          // Update frontend state based on request type (HOD or Faculty)
          if (isHodRequest) {
            setHodLeaveRequests((prev) =>
              prev.map((req) =>
                req.leaveRequest._id === leaveRequestId
                  ? { ...req, leaveRequest: { ...req.leaveRequest, status, remarks: finalRemarks } }
                  : req
              )
            );
          } else {
            setLeaveRequests((prev) =>
              prev.map((req) =>
                req.leaveRequest._id === leaveRequestId
                  ? { ...req, leaveRequest: { ...req.leaveRequest, status, remarks: finalRemarks } }
                  : req
              )
            );
          }
          
          setShowPopup(false); // Close the remarks popup after updating
        } else {
          alert("Error updating leave request!");
          setLoading(false);
        }
      } catch (error) {
        console.error("Error updating leave request:", error);
        alert("Error updating leave request!");
        setLoading(false);
      }
    };
    


    const applyFilters = () => {
      let filteredFaculty = leaveRequests; // Faculty leave requests
      let filteredHod = hodLeaveRequests; // HOD leave requests
    
      // Filter by Status
      if (filterStatus) {
        filteredFaculty = filteredFaculty.filter(
          (req) => req.leaveRequest?.status === filterStatus
        );
        filteredHod = filteredHod.filter(
          (req) => req.leaveRequest?.status === filterStatus
        );
      }
    
      // Filter by Start & End Date (Only Year-Month-Day)
      if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
    
        filteredFaculty = filteredFaculty.filter((req) => {
          const leaveStartDate = req.leaveRequest ? req.leaveRequest.startDate : null;
          return leaveStartDate && leaveStartDate >= start &&
                 leaveStartDate <= end;
        });
    
        filteredHod = filteredHod.filter((req) => {
          const leaveStartDate = req.leaveRequest ? new Date(req.leaveRequest.startDate) : null;
          return leaveStartDate && leaveStartDate >= start &&
                 leaveStartDate <= end;
        });
      }
    
      // Update the state with filtered data
      setFilteredRequests(filteredFaculty);
      setFilteredHodRequests(filteredHod);
      setShowFilter(false);
    };
    


    const exportToExcel = () => {
      let allFilteredLeaves = [...filteredRequests, ...filteredHodRequests];
    
      // Filter to only include approved requests
      let approvedRequests = allFilteredLeaves.filter(
        (req) => req.leaveRequest && req.leaveRequest.status === "Approved"
      );
    
      // Sorting by Department and Name
      approvedRequests.sort((a, b) => {
        if (a.department < b.department) return -1;
        if (a.department > b.department) return 1;
    
        const nameA = a.hodName || a.name;
        const nameB = b.hodName || b.name;
        return nameA.localeCompare(nameB);
      });
    
      // Prepare the data for Excel export
      const excelData = approvedRequests.map((req, index) => {
        const startDate = new Date(req.leaveRequest.startDate);
        const endDate = new Date(req.leaveRequest.endDate);
        const diffTime = endDate - startDate;
        const diffDays = Math.ceil(diffTime / (1000 * 3600 * 24));
    
        return [
          { v: index + 1, t: "n", s: { alignment: { horizontal: "center" } } }, // Serial No
          { v: req.hodName || req.name, s: { alignment: { horizontal: "left" } } }, // Name
          { v: req.department, s: { alignment: { horizontal: "left" } } }, // Department
          { v: req.hodId || req.employeeId, s: { alignment: { horizontal: "center" } } }, // Employee ID
          { v: req.leaveRequest.leaveType, s: { alignment: { horizontal: "center" } } }, // Leave Type
          { v: `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`, s: { alignment: { horizontal: "center" } } }, // On Leave Period
          { v: diffDays + 1, t: "n", s: { alignment: { horizontal: "center" } } }, // No. of Days
          { v: req.leaveRequest.reason, s: { alignment: { horizontal: "left" } } }, // Reason
          { v: req.leaveRequest.remarks || "No remarks", s: { alignment: { horizontal: "left" } } }, // Remarks
        ];
      });
    
      // Column Headers with Styling
      const headers = [
        [
          { v: "Serial No", s: { font: { bold: true }, fill: { fgColor: { rgb: "FFFF00" } }, alignment: { horizontal: "center" } } },
          { v: "Name of the Faculty", s: { font: { bold: true }, fill: { fgColor: { rgb: "FFFF00" } } } },
          { v: "Department", s: { font: { bold: true }, fill: { fgColor: { rgb: "FFFF00" } } } },
          { v: "Employee ID", s: { font: { bold: true }, fill: { fgColor: { rgb: "FFFF00" } }, alignment: { horizontal: "center" } } },
          { v: "Leave Type", s: { font: { bold: true }, fill: { fgColor: { rgb: "FFFF00" } }, alignment: { horizontal: "center" } } },
          { v: "On Leave Period", s: { font: { bold: true }, fill: { fgColor: { rgb: "FFFF00" } }, alignment: { horizontal: "center" } } },
          { v: "No. of Days", s: { font: { bold: true }, fill: { fgColor: { rgb: "FFFF00" } }, alignment: { horizontal: "center" } } },
          { v: "Reason", s: { font: { bold: true }, fill: { fgColor: { rgb: "FFFF00" } } } },
          { v: "Remarks", s: { font: { bold: true }, fill: { fgColor: { rgb: "FFFF00" } } } },
        ],
      ];
    
      // Create worksheet and add headers + data
      const ws = XLSX.utils.aoa_to_sheet([...headers, ...excelData]);
    
      // **Set Column Widths Dynamically**
      ws["!cols"] = [
        { wch: 10 },  // Serial No
        { wch: 25 },  // Name of the Faculty
        { wch: 20 },  // Department
        { wch: 15 },  // Employee ID
        { wch: 15 },  // Leave Type
        { wch: 25 },  // On Leave Period
        { wch: 10 },  // No. of Days
        { wch: 30 },  // Reason
        { wch: 20 },  // Remarks
      ];
    
      // Create a new workbook and append worksheet
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Approved Leave Requests");
    
      // Generate Excel file and create a downloadable URL
      const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      const fileBlob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const fileURL = URL.createObjectURL(fileBlob);
    
      if (excelFile) {
        URL.revokeObjectURL(excelFile); // Revoke old file URL to release memory
      }
    
      setExcelFile(fileURL); // Store file URL in state
    };
    
    

  
    const handleLogout = () => {
      localStorage.removeItem("token");
      navigate("/login");
    };

  // ✅ Improved Loader UI for Better User Experience
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="flex flex-col items-center">
          {/* Animated Loader */}
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-2xl animate-spin"></div>
          
          <p className="mt-4 text-lg font-semibold text-gray-700">Processing Your Request, please wait...</p>
        </div>
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
            <span className="font-medium">Leave Type:</span> {request.leaveRequest.leaveType}
          </p>

          <p className="text-gray-600 text-sm mb-2">
            <span className="font-medium">Leave:</span>{" "}
            { request.leaveRequest.startDate} - {" "}
            {request.leaveRequest.endDate}
          </p>
          <p
            className={`font-semibold text-sm mb-2 ${
              request.leaveRequest.status === "Approved"
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            <span className="font-medium">Status:</span> {request.leaveRequest.status}
            
          </p>
          <p className="text-gray-600 text-sm mb-4">
            <span className="font-medium">Remarks:</span>{" "}
            {request.remarks || "No remarks"}
          </p>
          {(request.leaveRequest.status === "Pending" || request.leaveRequest.status === "Forwarded by HOD" ) && (
            <div className="flex gap-3 mt-4">
              <button
                className="bg-green-500 text-white px-5 py-2 rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-300 w-full sm:w-auto"
                onClick={() =>
                  handleOpenPopup(
                    request.hodId,
                    request.leaveRequest._id,
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
                    request.leaveRequest._id,
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
          <div className="bg-white p-6 rounded-lg shadow-lg w-auto h-auto">
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
