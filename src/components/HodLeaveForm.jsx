import React, { useState } from "react";
import axios from "axios";

const HodLeaveForm = ({ onClose, hodId, leaveBalance }) => {
  const [leaveType, setLeaveType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [periods, setPeriods] = useState([]);
  const [message, setMessage] = useState("");
  const [isCheckingLeaves, setIsCheckingLeaves] = useState(false);

  const leaveTypes = [
    "Casual Leave",
    "Cost Casual Leave",
    "Medical Leave",
    "Earned Leave",
    "Special Leave"
  ];

  // Add a new period to the alternate schedule
  const addPeriod = () => {
    setPeriods([
      ...periods,
      { periodNumber: "", lecturerName: "", classAssigned: "" }
    ]);
  };

  // Remove a period from the alternate schedule
  const removePeriod = (index) => {
    setPeriods(periods.filter((_, i) => i !== index));
  };

  // Handle changes for period fields (number, lecturer, class)
  const handlePeriodChange = (index, field, value) => {
    const updatedPeriods = [...periods];
    updatedPeriods[index][field] = value;
    setPeriods(updatedPeriods);
  };

  // Ensure all 7 periods are accounted for (filling missing with default)
  const processAlternateSchedule = () => {
    const periodMap = new Map();
    periods.forEach(({ periodNumber, lecturerName, classAssigned }) => {
      if (periodNumber) {
        periodMap.set(Number(periodNumber), { lecturerName, classAssigned });
      }
    });

    for (let i = 1; i <= 7; i++) {
      if (!periodMap.has(i)) {
        periodMap.set(i, { lecturerName: "Leisure", classAssigned: "Not Assigned" });
      }
    }

    return Array.from(periodMap, ([periodNumber, details]) => ({
      periodNumber,
      lecturerName: details.lecturerName,
      classAssigned: details.classAssigned
    }));
  };

  // Submit leave request
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const alternateSchedule = processAlternateSchedule();
    const hodtoken = localStorage.getItem("hodtoken");
  
    if (!hodtoken) {
      setMessage("HOD is not logged in. Please log in and try again.");
      return;
    }
  
    try {
      // Submit the leave request
      const response = await axios.post(
        "http://localhost:5000/api/hod/apply-leave",
        { hodId, leaveType, startDate, endDate, reason, alternateSchedule },
        { headers: { "Content-Type": "application/json", Authorization: `Bearer ${hodtoken}` } }
      );
    
      setMessage("Leave request submitted successfully!");
      setStartDate("");
      setEndDate("");
      setReason("");
      setPeriods([]);
    
      // Check if a warning is present in the response and display it
      if (response.data.warning) {
        alert(response.data.warning);
      }
    
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      setMessage(error.response?.data?.msg || "Failed to submit leave request");
    }
    setIsCheckingLeaves(false);
  };
  

  return (
    <div className="max-w-2xl mx-auto bg-white shadow-lg rounded-lg p-6 mt-20">
      <h2 className="text-2xl font-semibold text-gray-700 text-center">Apply for Leave</h2>
      {message && <p className="text-center text-red-500 mt-2">{message}</p>}

      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
      <div
  className={`text-sm font-semibold ${
    leaveBalance <= 0
      ? "text-red-500"
      : leaveBalance < 4
      ? "text-yellow-500"
      : "text-green-500"
  }`}
>
  Available Leaves: <strong>{leaveBalance}</strong>
</div>


        {/* Leave Type */}
        <div>
          <label className="block text-gray-600 font-medium">Leave Type:</label>
          <select
            className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-400"
            value={leaveType}
            onChange={(e) => setLeaveType(e.target.value)}
            required
          >
            <option value="">Select Leave Type</option>
            {leaveTypes.map((type, index) => (
              <option key={index} value={type}>{type}</option>
            ))}
          </select>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-600 font-medium">Start Date:</label>
            <input
              type="date"
              className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-400"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-gray-600 font-medium">End Date:</label>
            <input
              type="date"
              className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-400"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Reason */}
        <div>
          <label className="block text-gray-600 font-medium">Reason:</label>
          <textarea
            className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-400"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
          />
        </div>

        {/* Periods Section */}
        <div className="bg-gray-100 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-700">Alternate Schedule</h3>
          {periods.map((period, index) => (
            <div key={index} className="mt-3 bg-white p-3 rounded-lg shadow">
              <label className="block text-gray-600 font-medium">Period Number:</label>
              <input
                type="number"
                min="1"
                max="7"
                className="w-full p-2 border rounded-lg"
                value={period.periodNumber}
                onChange={(e) => handlePeriodChange(index, "periodNumber", e.target.value)}
                required
              />

              <label className="block text-gray-600 font-medium mt-2">Lecturer Name:</label>
              <input
                type="text"
                className="w-full p-2 border rounded-lg"
                value={period.lecturerName}
                onChange={(e) => handlePeriodChange(index, "lecturerName", e.target.value)}
                required
              />

              <label className="block text-gray-600 font-medium mt-2">Class Assigned:</label>
              <input
                type="text"
                className="w-full p-2 border rounded-lg"
                value={period.classAssigned}
                onChange={(e) => handlePeriodChange(index, "classAssigned", e.target.value)}
                required
              />

              <button onClick={() => removePeriod(index)} className="mt-2 text-red-500">
                Remove
              </button>
            </div>
          ))}
          <button type="button" onClick={addPeriod} className="mt-4 bg-green-500 text-white py-2 px-4 rounded-lg">
            Add Period
          </button>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg"
          disabled={isCheckingLeaves}
        >
          {isCheckingLeaves ? "Checking..." : "Submit Leave Request"}
        </button>
      </form>
    </div>
  );
};

export default HodLeaveForm;
