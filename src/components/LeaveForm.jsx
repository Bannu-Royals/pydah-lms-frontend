import React, { useState } from "react";

const LeaveForm = ({ onClose, employeeId }) => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // State for alternate schedule (7 periods)
  const [alternateSchedule, setAlternateSchedule] = useState(
    Array(7).fill({ lecturerName: "", classAssigned: "" })
  );

  const handlePeriodChange = (index, field, value) => {
    setAlternateSchedule((prev) => {
      const updatedSchedule = [...prev];
      updatedSchedule[index] = { ...updatedSchedule[index], [field]: value };
      return updatedSchedule;
    });
  };

  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
  
  
    const token = localStorage.getItem("token");
   // Convert alternateSchedule array to an object
   const alternateScheduleObject = {};
   alternateSchedule.forEach((item, index) => {
     alternateScheduleObject[`period${index + 1}`] = item;
   });
    try {
      const response = await fetch(
        `http://localhost:5000/api/employee/${employeeId}/leave-request`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            startDate,
            endDate,
            reason,
            alternateSchedule:alternateScheduleObject,
          }),
        }
      );
  
      const data = await response.json();
  
      if (response.ok) {
        setMessage("Leave request submitted successfully!");
        setStartDate("");
        setEndDate("");
        setReason("");
        setAlternateSchedule(Array(7).fill({ lecturerName: "", classAssigned: "" }));
  
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        setMessage(data.msg || "Failed to submit leave request");
      }
    } catch (error) {
      setMessage("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-3xl bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-center mb-6">Apply for Leave</h2>

        {message && (
          <p
            className={`text-sm text-center mb-4 ${
              message.includes("successfully") ? "text-green-600" : "text-red-600"
            }`}
          >
            {message}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Reason, Start Date, and End Date */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Reason for Leave</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                required
              ></textarea>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-1">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  required
                />
              </div>
            </div>
          </div>

          {/* Periods Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Period 1</label>
              <input
                type="text"
                placeholder="Lecturer's Name"
                value={alternateSchedule[0].lecturerName}
                onChange={(e) => handlePeriodChange(0, "lecturerName", e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
              <input
                type="text"
                placeholder="Class Assigned"
                value={alternateSchedule[0].classAssigned}
                onChange={(e) => handlePeriodChange(0, "classAssigned", e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Period 7</label>
              <input
                type="text"
                placeholder="Lecturer's Name"
                value={alternateSchedule[6].lecturerName}
                onChange={(e) => handlePeriodChange(6, "lecturerName", e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
              <input
                type="text"
                placeholder="Class Assigned"
                value={alternateSchedule[6].classAssigned}
                onChange={(e) => handlePeriodChange(6, "classAssigned", e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Period 2</label>
              <input
                type="text"
                placeholder="Lecturer's Name"
                value={alternateSchedule[1].lecturerName}
                onChange={(e) => handlePeriodChange(1, "lecturerName", e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
              <input
                type="text"
                placeholder="Class Assigned"
                value={alternateSchedule[1].classAssigned}
                onChange={(e) => handlePeriodChange(1, "classAssigned", e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Period 6</label>
              <input
                type="text"
                placeholder="Lecturer's Name"
                value={alternateSchedule[5].lecturerName}
                onChange={(e) => handlePeriodChange(5, "lecturerName", e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
              <input
                type="text"
                placeholder="Class Assigned"
                value={alternateSchedule[5].classAssigned}
                onChange={(e) => handlePeriodChange(5, "classAssigned", e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Period 3</label>
              <input
                type="text"
                placeholder="Lecturer's Name"
                value={alternateSchedule[2].lecturerName}
                onChange={(e) => handlePeriodChange(2, "lecturerName", e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
              <input
                type="text"
                placeholder="Class Assigned"
                value={alternateSchedule[2].classAssigned}
                onChange={(e) => handlePeriodChange(2, "classAssigned", e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Period 5</label>
              <input
                type="text"
                placeholder="Lecturer's Name"
                value={alternateSchedule[4].lecturerName}
                onChange={(e) => handlePeriodChange(4, "lecturerName", e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
              <input
                type="text"
                placeholder="Class Assigned"
                value={alternateSchedule[4].classAssigned}
                onChange={(e) => handlePeriodChange(4, "classAssigned", e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Period 4</label>
              <input
                type="text"
                placeholder="Lecturer's Name"
                value={alternateSchedule[3].lecturerName}
                onChange={(e) => handlePeriodChange(3, "lecturerName", e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
              <input
                type="text"
                placeholder="Class Assigned"
                value={alternateSchedule[3].classAssigned}
                onChange={(e) => handlePeriodChange(3, "classAssigned", e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>
          </div>

          {/* Submit and Cancel Buttons */}
          <div className="flex justify-between items-center mt-6">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-500 text-white px-6 py-3 rounded-md hover:bg-gray-600 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`bg-blue-500 text-white px-6 py-3 rounded-md hover:bg-blue-600 transition ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LeaveForm;
