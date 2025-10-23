import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";

// Dummy logs
const DUMMY_LOGS = [
  {
    log_id: 1,
    device_id: 1,
    created_at: "2025-06-20 08:15:00",
    status: "OK",
  },
  {
    log_id: 2,
    device_id: 2,
    created_at: "2025-06-20 09:00:00",
    status: "Warning",
  },
  {
    log_id: 3,
    device_id: 1,
    created_at: "2025-06-21 02:45:00",
    status: "Error",
  },
];

const ShowLog = () => {
  const { id } = useParams();
  const [log, setLog] = useState({});
  const [error, setError] = useState("");

  useEffect(() => {
    const found = DUMMY_LOGS.find((l) => String(l.log_id) === String(id));
    if (found) {
      setLog(found);
    } else {
      setError("Log not found.");
    }
  }, [id]);

  return (
    <div className="container px-6 mx-auto grid">
      <h2 className="my-6 text-2xl font-semibold text-gray-700 dark:text-gray-200">
        Log Details
      </h2>
      {error && (
        <div className="mb-8 px-4 py-3 bg-red-100 rounded-lg text-red-700 dark:bg-red-200 dark:text-red-800">
          {error}
        </div>
      )}
      {!error && (
        <div className="px-4 py-3 mb-8 bg-white text-white rounded-lg shadow-md dark:bg-gray-800">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <p>
              <strong>Log ID:</strong> {log.log_id}
            </p>
            <p>
              <strong>Device ID:</strong> {log.device_id}
            </p>
            <p>
              <strong>Created At:</strong> {log.created_at}
            </p>
            <p>
              <strong>Status:</strong>{" "}
              <span
                className={`px-2 py-1 font-semibold leading-tight rounded-full text-xs ${
                  log.status === "OK"
                    ? "text-green-700 bg-green-100 dark:bg-green-700 dark:text-green-100"
                    : log.status === "Warning"
                    ? "text-yellow-700 bg-yellow-100 dark:bg-yellow-700 dark:text-yellow-100"
                    : "text-red-700 bg-red-100 dark:bg-red-700 dark:text-red-100"
                }`}
              >
                {log.status}
              </span>
            </p>
          </div>
        </div>
      )}
      <div className="flex space-x-3">
        <Link
          to="/logs"
          className="px-4 py-2 text-sm font-semibold text-white transition-colors duration-150 bg-blue-500 border border-transparent rounded-lg active:bg-blue-600 hover:bg-blue-700 focus:outline-none focus:shadow-outline-blue"
        >
          Go Back
        </Link>
      </div>
    </div>
  );
};

export default ShowLog;
