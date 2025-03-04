import React, { useState } from "react";

const LeaveForm = ({ onClose, employeeId }) => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [periods, setPeriods] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const addPeriod = () => {
    setPeriods([...periods, { periodNumber: "", lecturerName: "", classAssigned: "" }]);
  };

  const removePeriod = (index) => {
    setPeriods(periods.filter((_, i) => i !== index));
  };

  const handlePeriodChange = (index, field, value) => {
    const updatedPeriods = [...periods];
    updatedPeriods[index][field] = value;
    setPeriods(updatedPeriods);
  };

  const processAlternateSchedule = () => {
    const formattedPeriods = periods.map(({ periodNumber, lecturerName, classAssigned }) => ({
      periodNumber: Number(periodNumber),
      lecturerName,
      classAssigned,
    }));
    return formattedPeriods;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const token = localStorage.getItem("token");
    const alternateSchedule = processAlternateSchedule();

    try {
      const response = await fetch(`http://localhost:5000/api/employees/${employeeId}/leave-request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ startDate, endDate, reason, alternateSchedule }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage("Leave request submitted successfully!");
        setStartDate("");
        setEndDate("");
        setReason("");
        setPeriods([]);

        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        setMessage(data.message || "Failed to submit leave request");
      }
    } catch (error) {
      setMessage("Error submitting request. Please try again later.");
    }

    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto bg-white shadow-lg rounded-lg p-6 mt-10">
      <h2 className="text-2xl font-semibold text-gray-700 text-center">Apply for Leave</h2>
      {message && <p className="text-center text-red-500 mt-2">{message}</p>}
      
      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
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
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-400"
                value={period.periodNumber}
                onChange={(e) => handlePeriodChange(index, "periodNumber", e.target.value)}
                required
              />

              <label className="block text-gray-600 font-medium mt-2">Assigned Teacher:</label>
              <input
                type="text"
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-400"
                value={period.lecturerName}
                onChange={(e) => handlePeriodChange(index, "lecturerName", e.target.value)}
                required
              />

              <label className="block text-gray-600 font-medium mt-2">Assigned Class:</label>
              <input
                type="text"
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-400"
                value={period.classAssigned}
                onChange={(e) => handlePeriodChange(index, "classAssigned", e.target.value)}
                required
              />

              <button
                type="button"
                onClick={() => removePeriod(index)}
                className="mt-3 text-sm text-red-500 hover:underline"
              >
                Remove Period
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addPeriod}
            className="mt-4 bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition duration-200"
          >
            Add Period
          </button>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-200"
          disabled={loading}
        >
          {loading ? "Submitting..." : "Submit Leave Request"}
        </button>
      </form>
    </div>
  );
};

export default LeaveForm;