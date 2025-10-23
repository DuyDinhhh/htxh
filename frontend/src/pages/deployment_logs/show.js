import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";

// Dummy deployment logs
const DUMMY_DEPLOYMENT_LOGS = [
  { id: 1, deviceid: 1, logs: "Deployed version 1.0.0\nNo errors found." },
  {
    id: 2,
    deviceid: 2,
    logs: "Deployed version 1.0.1\nRestarted successfully.",
  },
  {
    id: 3,
    deviceid: 1,
    logs: "Deployed version 1.0.2\nMinor warnings during update.",
  },
];

const ShowDeploymentLog = () => {
  const { id } = useParams();
  const [log, setLog] = useState({});
  const [error, setError] = useState("");

  useEffect(() => {
    const found = DUMMY_DEPLOYMENT_LOGS.find(
      (l) => String(l.id) === String(id)
    );
    if (found) {
      setLog(found);
    } else {
      setError("Deployment log not found.");
    }
  }, [id]);

  return (
    <div className="container px-6 mx-auto grid">
      <h2 className="my-6 text-2xl font-semibold text-gray-700 dark:text-gray-200">
        Deployment Log Details
      </h2>
      {error && (
        <div className="mb-8 px-4 py-3 bg-red-100 rounded-lg text-red-700 dark:bg-red-200 dark:text-red-800">
          {error}
        </div>
      )}
      {!error && (
        <div className="px-4 py-3 mb-8 bg-white  text-white rounded-lg shadow-md dark:bg-gray-800">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <p>
              <strong>Log ID:</strong> {log.id}
            </p>
            <p>
              <strong>Device ID:</strong> {log.deviceid}
            </p>
            <p className="md:col-span-2 whitespace-pre-line">
              <strong>Logs:</strong>
              <br />
              {log.logs}
            </p>
          </div>
        </div>
      )}
      <div className="flex space-x-3">
        <Link
          to="/deployment_logs"
          className="px-4 py-2 text-sm font-semibold text-white transition-colors duration-150 bg-blue-500 border border-transparent rounded-lg active:bg-blue-600 hover:bg-blue-700 focus:outline-none focus:shadow-outline-blue"
        >
          Go Back
        </Link>
      </div>
    </div>
  );
};

export default ShowDeploymentLog;
