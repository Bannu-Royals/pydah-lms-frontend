import { useState, useEffect } from "react";
import axios from "axios";
import HodLeaveForm from "../components/HodLeaveForm";

const HODDashboard = () => {
  const [hod, setHod] = useState(null);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [remarks, setRemarks] = useState("");
  const [hodLeaveRequests,setHodLeaveRequests] = useState([]);
  const [showLeaveForm,setShowLeaveForm] = useState(false);
;
  useEffect(() => {
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
      } catch (err) {
        console.error("Error fetching leave requests:", err);
      }
    };

    fetchHodData();
    fetchLeaveRequests();
  }, []);

  const handleAction = async (status) => {
    try {
      if (!selectedLeave) return;

      const hodtoken = localStorage.getItem("hodtoken");
      await axios.put(
        "http://localhost:5000/api/hod/update-leave",
        { employeeId: selectedLeave.employeeId, leaveId: selectedLeave._id, status, remarks },
        { headers: { Authorization: `Bearer ${hodtoken}` } }
      );

      setLeaveRequests((prev) =>
        prev.map((leave) =>
          leave._id === selectedLeave._id ? { ...leave, status, remarks } : leave
        )
      );

      setSelectedLeave(null);
      setRemarks("");
    } catch (err) {
      console.error("Error updating leave:", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("hodtoken");
    window.location.href = "/login";
  };

  const groupedLeaveRequests = {
    Pending: leaveRequests.filter((leave) => leave.status === "Pending"),
    Forwarded: leaveRequests.filter((leave) => leave.status === "Forwarded by HOD"),
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

  return (
    <div className="max-w-7xl mx-auto p-8">
      {/* HOD Info Section */}
      {hod && (
        <div className="bg-gradient-to-r from-blue-500 to-blue-700 text-white p-6 rounded-lg shadow-md flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">HOD Dashboard</h1>
            <p className="mt-2 text-lg"><strong>Name:</strong> {hod.name}</p>
            <p><strong>Email:</strong> {hod.email}</p>
            <p><strong>Department:</strong> {hod.department}</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-md shadow-md transition-all"
          >
            Logout
          </button>
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
          <HodLeaveForm onClose={() => setShowLeaveForm(false)} hodId = {hod?._id} />
            
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
          ${leave.status === "Pending" ? "border-l-8 border-yellow-500 bg-yellow-100" : 
            leave.status === "Approved" ? "border-l-8 border-green-500 bg-green-100" : 
            "border-l-8 border-red-500 bg-red-100"}`}
        onClick={() => setSelectedLeave(leave)}
      >
        <p className="font-semibold text-lg">{leave.employeeName}</p>
        <p className="text-gray-700"><strong>Start:</strong> {new Date(leave.startDate).toDateString()}</p>
        <p className="text-gray-700"><strong>End:</strong> {new Date(leave.endDate).toDateString()}</p>
        <p className="text-gray-700"><strong>Reason:</strong> {leave.reason}</p>
        <p className={`mt-2 text-sm font-semibold ${
            leave.status === "Pending" ? "text-yellow-600" :
            leave.status === "Approved" ? "text-green-600" : 
            "text-red-600"
          } uppercase`}>
          {leave.status}
        </p>
      </div>
    ))}
  </div>
) : (
  <p>No leave requests available.</p>
)}

{/* Leave Requests Section */}
<h2 className="text-xl font-semibold mt-8 mb-4">Faculty Leave Requests</h2>


      {/* Pending Requests */}
      {groupedLeaveRequests.Pending.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4 text-yellow-600">Pending Requests</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groupedLeaveRequests.Pending.map((leave) => (
              <div
                key={leave._id}
                className="p-5 rounded-lg shadow-lg cursor-pointer transition-all duration-300 transform hover:scale-105 border-l-8 border-yellow-500 bg-yellow-100"
                onClick={() => setSelectedLeave(leave)}
              >
                <p className="font-semibold text-lg">{leave.employeeName}</p>
                <p className="text-gray-700"><strong>Start:</strong> {new Date(leave.startDate).toDateString()}</p>
                <p className="text-gray-700"><strong>End:</strong> {new Date(leave.endDate).toDateString()}</p>
                <p className="text-gray-700"><strong>Reason:</strong> {leave.reason}</p>
                <p className="mt-2 text-sm font-semibold text-yellow-600 uppercase">{leave.status}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Forwarded Requests */}
      {groupedLeaveRequests.Forwarded.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4 text-blue-600">Forwarded Requests</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groupedLeaveRequests.Forwarded.map((leave) => (
              <div
                key={leave._id}
                className="p-5 rounded-lg shadow-lg cursor-pointer transition-all duration-300 transform hover:scale-105 border-l-8 border-blue-500 bg-blue-100"
                onClick={() => setSelectedLeave(leave)}
              >
                <p className="font-semibold text-lg">{leave.employeeName}</p>
                <p className="text-gray-700"><strong>Start:</strong> {new Date(leave.startDate).toDateString()}</p>
                <p className="text-gray-700"><strong>End:</strong> {new Date(leave.endDate).toDateString()}</p>
                <p className="text-gray-700"><strong>Reason:</strong> {leave.reason}</p>
                <p className="mt-2 text-sm font-semibold text-blue-600 uppercase">{leave.status}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Approved Requests */}
      {groupedLeaveRequests.Approved.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4 text-green-600">Approved Requests</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groupedLeaveRequests.Approved.map((leave) => (
              <div
                key={leave._id}
                className="p-5 rounded-lg shadow-lg cursor-pointer transition-all duration-300 transform hover:scale-105 border-l-8 border-green-500 bg-green-100"
                onClick={() => setSelectedLeave(leave)}
              >
                <p className="font-semibold text-lg">{leave.employeeName}</p>
                <p className="text-gray-700"><strong>Start:</strong> {new Date(leave.startDate).toDateString()}</p>
                <p className="text-gray-700"><strong>End:</strong> {new Date(leave.endDate).toDateString()}</p>
                <p className="text-gray-700"><strong>Reason:</strong> {leave.reason}</p>
                <p className="mt-2 text-sm font-semibold text-green-600 uppercase">{leave.status}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rejected Requests */}
      {groupedLeaveRequests.Rejected.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4 text-red-600">Rejected Requests</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groupedLeaveRequests.Rejected.map((leave) => (
              <div
                key={leave._id}
                className="p-5 rounded-lg shadow-lg cursor-pointer transition-all duration-300 transform hover:scale-105 border-l-8 border-red-500 bg-red-100"
                onClick={() => setSelectedLeave(leave)}
              >
                <p className="font-semibold text-lg">{leave.employeeName}</p>
                <p className="text-gray-700"><strong>Start:</strong> {new Date(leave.startDate).toDateString()}</p>
                <p className="text-gray-700"><strong>End:</strong> {new Date(leave.endDate).toDateString()}</p>
                <p className="text-gray-700"><strong>Reason:</strong> {leave.reason}</p>
                <p className="mt-2 text-sm font-semibold text-red-600 uppercase">{leave.status}</p>
              </div>
            ))}
          </div>
        </div>
      )}
{selectedLeave && ( 
  <div className="fixed inset-0 flex items-center justify-center  bg-black bg-opacity-50">
    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-4xl mx-4 transition-all transform duration-300 ease-in-out scale-95 hover:scale-100 max-h-[90vh] sm:max-h-[50vh] overflow-auto">
      <h2 className="text-lg font-semibold mb-4 text-gray-900 text-center">Update Leave Request</h2>
      
      {/* Leave Request Details Section */}
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1">
          <p><strong>Faculty:</strong> {selectedLeave.employeeName}</p>
          <p><strong>Department:</strong> {hod.department}</p>
          <p><strong>Designation:</strong> {selectedLeave.employeeDesignation}</p>
          <p><strong>Employee ID:</strong> {selectedLeave.employeeId}</p>
          <p><strong>Start Date:</strong> {new Date(selectedLeave.startDate).toDateString()}</p>
          <p><strong>End Date:</strong> {new Date(selectedLeave.endDate).toDateString()}</p>
          <p><strong>Reason:</strong> {selectedLeave.reason}</p>
          <p><strong>Remarks:</strong> {selectedLeave.remarks || "No remarks provided"}</p>
        </div>

        {/* Alternate Schedule Section */}
        {selectedLeave.alternateSchedule && (
          <div className="flex-1 mt-4 lg:mt-0 p-3 border rounded bg-gray-100">
            <h3 className="text-md font-semibold mb-2 text-center">Alternate Schedule</h3>
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border border-gray-300 px-3 py-2 text-left">Period</th>
                  <th className="border border-gray-300 px-3 py-2 text-left">Lecturer Name</th>
                  <th className="border border-gray-300 px-3 py-2 text-left">Class Assigned</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(selectedLeave.alternateSchedule).map(([period, details]) => (
                  <tr key={period} className="bg-white">
                    <td className="border border-gray-300 px-3 py-2">{period.toUpperCase()}</td>
                    <td className="border border-gray-300 px-3 py-2">{details.lecturerName}</td>
                    <td className="border border-gray-300 px-3 py-2">{details.classAssigned}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Remarks Textarea */}
      <textarea
        className="w-full p-3 border rounded mt-6 focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Add remarks"
        value={remarks}
        onChange={(e) => setRemarks(e.target.value)}
      />

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-between mt-6 gap-3">
        <button
          className="w-full sm:w-auto bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-green-500"
          onClick={() => handleAction("Forwarded by HOD")}
        >
          Forward to Principal
        </button>
        <button
          className="w-full sm:w-auto bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-red-500"
          onClick={() => handleAction("Rejected")}
        >
          Reject
        </button>
        <button
          className="w-full sm:w-auto bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-gray-500"
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
