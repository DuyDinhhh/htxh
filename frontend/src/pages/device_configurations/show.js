import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";

// Dummy data for demonstration
const DUMMY_CONFIGS = [
  { id: 1, deviceid: 1, key: "brightness", value: "80" },
  { id: 2, deviceid: 2, key: "volume", value: "50" },
  { id: 3, deviceid: 1, key: "timezone", value: "UTC+7" },
];

const ShowDeviceConfiguration = () => {
  const { id } = useParams();
  const [config, setConfig] = useState({});
  const [error, setError] = useState("");

  useEffect(() => {
    const timeout = setTimeout(() => {
      const found = DUMMY_CONFIGS.find((c) => String(c.id) === String(id));
      if (found) {
        setConfig(found);
      } else {
        setError("Device configuration not found.");
      }
    }, 400);

    return () => clearTimeout(timeout);
  }, [id]);

  return (
    <div className="container px-6 mx-auto grid">
      <h2 className="my-6 text-2xl font-semibold text-gray-700 dark:text-gray-200">
        Configuration Information
      </h2>
      {error && (
        <div className="mb-8 px-4 py-3 bg-red-100 rounded-lg text-red-700 dark:bg-red-200 dark:text-red-800">
          {error}
        </div>
      )}
      {!error && (
        <>
          <div className="px-4 py-3 mb-8 bg-white rounded-lg text-white shadow-md dark:bg-gray-800">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <p>
                <strong>ID:</strong> {config.id}
              </p>
              <p>
                <strong>Device ID:</strong> {config.deviceid}
              </p>
              <p>
                <strong>Key:</strong> {config.key}
              </p>
              <p>
                <strong>Value:</strong> {config.value}
              </p>
            </div>
          </div>
        </>
      )}
      <div className="flex space-x-3">
        <Link
          to="/device_configurations"
          className="px-4 py-2 text-sm font-semibold text-white transition-colors duration-150 bg-blue-500 border border-transparent rounded-lg active:bg-blue-600 hover:bg-blue-700 focus:outline-none focus:shadow-outline-blue"
        >
          Go Back
        </Link>
      </div>
    </div>
  );
};

export default ShowDeviceConfiguration;
