import { useState, useEffect } from "react";
import axios from "axios";
import HodLeaveForm from "../components/HodLeaveForm";
import { useNavigate } from "react-router-dom";

const HODDashboard = () => {
   const [loading, setLoading] = useState(true);
  const [hod, setHod] = useState(null);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [remarks, setRemarks] = useState("");
  const [hodLeaveRequests, setHodLeaveRequests] = useState([]);
  const [showLeaveForm, setShowLeaveForm] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(false); // State to trigger re-fetch
  const navigate = useNavigate();
  useEffect(() => {
    setLoading(true);
    const fetchHodData = async () => {
      try {
        const hodtoken = localStorage.getItem("hodtoken");
        const res = await axios.get("http://localhost:5000/api/hod/me", {
          headers: { Authorization: `Bearer ${hodtoken}` },

        });
        setHod(res.data);
        console.log(res.data);
        // Assuming the response contains a `hodLeaveRequests` field
        if (Array.isArray(res.data.hodLeaveRequests)) {
          setHodLeaveRequests(res.data.hodLeaveRequests);
        } else {
          setHodLeaveRequests([]); // Ensure it's always an array
        }
      } catch (err) {
        console.error("Error fetching HOD data:", err);
      }
    };

    const fetchLeaveRequests = async () => {
      try {
        const hodtoken = localStorage.getItem("hodtoken");
        const res = await axios.get("http://localhost:5000/api/hod/leaves", {
          headers: { Authorization: `Bearer ${hodtoken}` },
        });

        // Define the desired order of statuses
        const statusOrder = {
          Pending: 1,
          "Forwarded by HOD": 2,
          Approved: 3,
          Rejected: 4,
        };

        // Sort leave requests based on the defined order
        const sortedRequests = res.data.sort((a, b) => {
          return statusOrder[a.status] - statusOrder[b.status];
        });

        setLeaveRequests(sortedRequests);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching leave requests:", err);
      }
    };

    fetchHodData();
    fetchLeaveRequests();
  }, [refreshTrigger]);

  const handleAction = async (status) => {
    try {
      setLoading(true);
      if (!selectedLeave) return;
  
      const hodtoken = localStorage.getItem("hodtoken");
  
      // Determine the correct API endpoint based on whether it's a faculty or HOD leave request
      const isHodLeave = hodLeaveRequests.some((leave) => leave._id === selectedLeave._id);
      const apiEndpoint = isHodLeave
        ? "http://localhost:5000/api/hod/update-hod-leave"
        : "http://localhost:5000/api/hod/update-leave";
  
      await axios.put(
        apiEndpoint,
        {
          hodId:isHodLeave? hod._id : selectedLeave.employeeId ,
          leaveId: selectedLeave._id,
          status,
          remarks,
        },
        { headers: { Authorization: `Bearer ${hodtoken}` } }
      );
  
      if (isHodLeave) {
        setHodLeaveRequests((prev) =>
          prev.map((leave) =>
            leave._id === selectedLeave._id ? { ...leave, status, remarks } : leave
          )
        );
      } else {
        setLeaveRequests((prev) =>
          prev.map((leave) =>
            leave._id === selectedLeave._id ? { ...leave, status, remarks } : leave
          )
        );
      }
  
      setSelectedLeave(null);
      setRemarks("");
      setRefreshTrigger(prev => !prev);
    } catch (err) {
      console.error("Error updating leave:", err);
      setLoading(false);
    }
  };
  

  const handleLogout = () => {
    localStorage.removeItem("hodtoken");
  
    // Show a confirmation message before navigating
    if (window.confirm("Are you sure you want to log out?")) {
      navigate("/login");
    }
  };

  const groupedLeaveRequests = {
    Pending: leaveRequests.filter((leave) => leave.status === "Pending"),
    Forwarded: leaveRequests.filter(
      (leave) => leave.status === "Forwarded by HOD"
    ),
    Approved: leaveRequests.filter((leave) => leave.status === "Approved"),
    Rejected: leaveRequests.filter((leave) => leave.status === "Rejected"),
  };
  // Sort leave requests based on their status order
  const sortedHodLeaveRequests = hodLeaveRequests.sort((a, b) => {
    const statusOrder = {
      Pending: 1,
      Approved: 2,
      Rejected: 3,
    };
    return statusOrder[a.status] - statusOrder[b.status];
  });

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

  return (
    <div className="max-w-7xl mx-auto p-8">
      {/* HOD Info Section */}
      {hod && (
        
         <div className="w-full bg-white inset-shadow-black rounded-2xl p-6">
           {/* Top Section: Logout Button & Title */}
           <div className="flex justify-between items-center">
             <h1 className="text-xl md:text-2xl font-bold text-gray-800">
               {hod.department} HOD Dashboard
             </h1>
             <button
               onClick={handleLogout}
               className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-lg shadow-md transition-all"
             >
               Logout
             </button>
           </div>
   
           {/* HOD Details Section */}
           <div className="mt-6 bg-white p-6 rounded-lg shadow-md border border-gray-200">
             <h2 className="text-lg md:text-xl font-semibold text-gray-700 mb-4">
               HOD Details
             </h2>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-600">
               <p>
                 <strong className="text-gray-800">Name:</strong> {hod.name}
               </p>
               <p>
                 <strong className="text-gray-800">ID:</strong> {hod.HODId}
               </p>
               <p>
                 <strong className="text-gray-800">Email:</strong> {hod.email}
               </p>
               <p>
                 <strong className="text-gray-800">Department:</strong> {hod.department}
               </p>
               <p>
                 <strong className="text-gray-800">Leave Account:</strong> 12 days/year
               </p>
               <p>
                 <strong className="text-gray-800">Approved Leaves:</strong> {12 - hod.leaveBalance} days
               </p>
               <p>
                 <strong className="text-gray-800">Leave Balance:</strong> {hod.leaveBalance} days
               </p>
             </div>
           </div>
         </div>
    
      )}

      {/* Apply Leave Button */}
      <button
        onClick={() => setShowLeaveForm(true)}
        className="bg-blue-500 m-4 text-white px-4 py-2 rounded mb-6"
      >
        Apply Leave
      </button>

      {/* Leave Form (displayed as part of the page, not a popup) */}
      {showLeaveForm && (
  <div className="bg-white p-6 rounded shadow-md mb-6">
    <HodLeaveForm
      onClose={() => setShowLeaveForm(false)}
      hodId={hod?._id}
      leaveBalance={hod?.leaveBalance} // Pass leave balance from HOD state
    />
  </div>
)}

      {/* HOD's Leave Requests Section */}
      <h2 className="text-xl font-semibold mt-8 mb-4">Your Leave Requests</h2>

      {/* Leave Requests */}
      {sortedHodLeaveRequests.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedHodLeaveRequests.map((leave) => (
            <div
              key={leave._id}
              className={`p-5 rounded-lg shadow-lg cursor-pointer transition-all duration-300 transform hover:scale-105 
          ${
            leave.status === "Pending"
              ? "border-l-8 border-yellow-500 bg-yellow-100"
              : leave.status === "Approved"
              ? "border-l-8 border-green-500 bg-green-100"
              : "border-l-8 border-red-500 bg-red-100"
          }`}
              onClick={() => setSelectedLeave(leave)}
            >
              <p className="font-semibold text-lg">{leave.employeeName}</p>
              <p className="text-gray-700">
                <strong>Start:</strong>{" "}
                {new Date(leave.startDate).toDateString()}
              </p>
              <p className="text-gray-700">
                <strong>End:</strong> {new Date(leave.endDate).toDateString()}
              </p>
              <p className="text-gray-700">
                <strong>Reason:</strong> {leave.reason}
              </p>
              <p
                className={`mt-2 text-sm font-semibold ${
                  leave.status === "Pending"
                    ? "text-yellow-600"
                    : leave.status === "Approved"
                    ? "text-green-600"
                    : "text-red-600"
                } uppercase`}
              >
                {leave.status}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p>No leave requests available.</p>
      )}

      {/* Leave Requests Section */}
      <h2 className="text-xl font-semibold mt-8 mb-4">
        Faculty Leave Requests
      </h2>

      {/* Pending Requests */}
      {groupedLeaveRequests.Pending.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4 text-yellow-600">
            Pending Requests
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groupedLeaveRequests.Pending.map((leave) => (
              <div
                key={leave._id}
                className="p-5 rounded-lg shadow-lg cursor-pointer transition-all duration-300 transform hover:scale-105 border-l-8 border-yellow-500 bg-yellow-100"
                onClick={() => setSelectedLeave(leave)}
              >
                <p className="font-semibold text-lg">{leave.employeeName}</p>
                <p className="text-gray-700">
                  <strong>Start:</strong>{" "}
                  {new Date(leave.startDate).toDateString()}
                </p>
                <p className="text-gray-700">
                  <strong>End:</strong> {new Date(leave.endDate).toDateString()}
                </p>
                <p className="text-gray-700">
                  <strong>Reason:</strong> {leave.reason}
                </p>
                <p className="mt-2 text-sm font-semibold text-yellow-600 uppercase">
                  {leave.status}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Forwarded Requests */}
      {groupedLeaveRequests.Forwarded.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4 text-blue-600">
            Forwarded Requests
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groupedLeaveRequests.Forwarded.map((leave) => (
              <div
                key={leave._id}
                className="p-5 rounded-lg shadow-lg cursor-pointer transition-all duration-300 transform hover:scale-105 border-l-8 border-blue-500 bg-blue-100"
                onClick={() => setSelectedLeave(leave)}
              >
                <p className="font-semibold text-lg">{leave.employeeName}</p>
                <p className="text-gray-700">
                  <strong>Start:</strong>{" "}
                  {new Date(leave.startDate).toDateString()}
                </p>
                <p className="text-gray-700">
                  <strong>End:</strong> {new Date(leave.endDate).toDateString()}
                </p>
                <p className="text-gray-700">
                  <strong>Reason:</strong> {leave.reason}
                </p>
                <p className="mt-2 text-sm font-semibold text-blue-600 uppercase">
                  {leave.status}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Approved Requests */}
      {groupedLeaveRequests.Approved.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4 text-green-600">
            Approved Requests
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groupedLeaveRequests.Approved.map((leave) => (
              <div
                key={leave._id}
                className="p-5 rounded-lg shadow-lg cursor-pointer transition-all duration-300 transform hover:scale-105 border-l-8 border-green-500 bg-green-100"
                onClick={() => setSelectedLeave(leave)}
              >
                <p className="font-semibold text-lg">{leave.employeeName}</p>
                <p className="text-gray-700">
                  <strong>Start:</strong>{" "}
                  {new Date(leave.startDate).toDateString()}
                </p>
                <p className="text-gray-700">
                  <strong>End:</strong> {new Date(leave.endDate).toDateString()}
                </p>
                <p className="text-gray-700">
                  <strong>Reason:</strong> {leave.reason}
                </p>
                <p className="mt-2 text-sm font-semibold text-green-600 uppercase">
                  {leave.status}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rejected Requests */}
      {groupedLeaveRequests.Rejected.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4 text-red-600">
            Rejected Requests
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groupedLeaveRequests.Rejected.map((leave) => (
              <div
                key={leave._id}
                className="p-5 rounded-lg shadow-lg cursor-pointer transition-all duration-300 transform hover:scale-105 border-l-8 border-red-500 bg-red-100"
                onClick={() => setSelectedLeave(leave)}
              >
                <p className="font-semibold text-lg">{leave.employeeName}</p>
                <p className="text-gray-700">
                  <strong>Start:</strong>{" "}
                  {new Date(leave.startDate).toDateString()}
                </p>
                <p className="text-gray-700">
                  <strong>End:</strong> {new Date(leave.endDate).toDateString()}
                </p>
                <p className="text-gray-700">
                  <strong>Reason:</strong> {leave.reason}
                </p>
                <p className="mt-2 text-sm font-semibold text-red-600 uppercase">
                  {leave.status}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    {(selectedLeave  && selectedLeave.status !== "Approved" ) && (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-2 sm:p-4">
    <div className="bg-white my-4 p-4 sm:p-6 rounded-lg shadow-xl w-full max-w-md sm:max-w-lg md:max-w-3xl lg:max-w-4xl h-screen max-h-[90vh] overflow-y-auto transition-transform transform scale-80">
      <h2 className="text-lg sm:text-xl font-semibold mb-4 text-center text-gray-900">
        Update Leave Request
      </h2>

      {/* Leave Request Details Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-2 text-sm sm:text-base">
          <p><strong>Faculty:</strong> {selectedLeave.employeeName || hod.name}</p>
          <p><strong>Department:</strong> {hod.department}</p>
          <p><strong>Designation:</strong> {selectedLeave.employeeDesignation || "HOD"}</p>
          <p><strong>Employee ID:</strong> {selectedLeave.employeeemployeeId || hod.HODId}</p>
          <p><strong>Start Date:</strong> {new Date(selectedLeave.startDate).toDateString()}</p>
          <p><strong>End Date:</strong> {new Date(selectedLeave.endDate).toDateString()}</p>
          <p><strong>ReaAAAAson:</strong> {selectedLeave.reason}</p>
          <p><strong>Remarks:</strong> {selectedLeave.remarks || "No remarks provided"}</p>
        </div>

        {/* Alternate Schedule Section */}
        {(selectedLeave.alternateSchedule) && (
          <div className="p-3 border rounded-lg bg-blue-50 shadow-md">
            <h3 className="text-md font-semibold mb-2 text-center text-blue-900">
              Alternate Schedule
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full border border-gray-300 text-xs sm:text-sm">
                <thead>
                  <tr className="bg-blue-100 text-blue-900">
                    <th className="border p-1 sm:p-2">Period</th>
                    <th className="border p-1 sm:p-2">Lecturer</th>
                    <th className="border p-1 sm:p-2">Class</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedLeave.alternateSchedule
                    .slice()
                    .sort((a, b) => a.periodNumber - b.periodNumber)
                    .map((schedule, index) => {
                      const isAssigned =
                        schedule.lecturerName &&
                        schedule.lecturerName.toLowerCase() !== "leisure" &&
                        schedule.classAssigned;
                      return (
                        <tr
                          key={index}
                          className={`text-center ${
                            isAssigned
                              ? "bg-green-200 text-green-800 font-semibold"
                              : "bg-black-200 text-red-700 font-semibold"
                          }`}
                        >
                          <td className="border p-1 sm:p-2">Period {schedule.periodNumber}</td>
                          <td className="border p-1 sm:p-2">{schedule.lecturerName || "Not Assigned"}</td>
                          <td className="border p-1 sm:p-2">{schedule.classAssigned || "N/A"}</td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Remarks Input */}
      <textarea
        className="w-full p-3 border rounded mt-6 focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Add remarks"
        value={remarks}
        onChange={(e) => setRemarks(e.target.value)}
      />

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-between mt-6 gap-3">
        <button
          className="w-full sm:w-auto bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-green-500"
          onClick={() => handleAction("Forwarded by HOD")}
        >
          Forward to Principal
        </button>
        <button
          className="w-full sm:w-auto bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-red-500"
          onClick={() => handleAction("Rejected")}
        >
          Reject
        </button>
        <button
          className="w-full sm:w-auto bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-gray-500"
          onClick={() => setSelectedLeave(null)}
        >
          Close
        </button>
      </div>
    </div>
  </div>
)}

    </div>
  );
};

export default HODDashboard;
