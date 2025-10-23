import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

// Dummy device list for dropdown (replace with real API data)
const devices = [
  { id: 1, name: "Device A" },
  { id: 2, name: "Device B" },
  { id: 3, name: "Device C" },
];

const CreateDeviceConfiguration = () => {
  const [config, setConfig] = useState({
    deviceid: "",
    key: "",
    value: "",
  });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleChange = (e) => {
    setConfig({ ...config, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!config.deviceid) newErrors.deviceid = "Device is required";
    if (!config.key) newErrors.key = "Key cannot be empty";
    if (!config.value) newErrors.value = "Value cannot be empty";
    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      alert("Device configuration created: " + JSON.stringify(config, null, 2));
      navigate("/device_configurations");
    }
  };

  return (
    <div className="container px-6 mx-auto grid">
      <h2 className="my-6 text-2xl font-semibold text-gray-700 dark:text-gray-200 text-center">
        Add Device Configuration
      </h2>
      <h4 className="mb-4 text-lg font-semibold text-gray-600 dark:text-gray-300">
        Enter Device Configuration Information
      </h4>
      <form onSubmit={handleSubmit}>
        <div className="px-4 py-3 mb-8 bg-white rounded-lg shadow-md dark:bg-gray-800">
          {/* Device Dropdown */}
          <label className="block text-sm">
            <span className="text-gray-700 dark:text-gray-400">Device</span>
            <select
              name="deviceid"
              value={config.deviceid}
              onChange={handleChange}
              className={`block w-full mt-1 text-sm dark:border-gray-600 dark:bg-gray-700 focus:border-purple-400 focus:outline-none focus:shadow-outline-purple dark:text-gray-300 dark:focus:shadow-outline-gray form-select ${
                errors.deviceid ? "border-red-600 focus:border-red-400" : ""
              }`}
            >
              <option value="">Select device</option>
              {devices.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
            {errors.deviceid && (
              <span className="text-xs text-red-600 dark:text-red-400">
                {errors.deviceid}
              </span>
            )}
          </label>
          {/* Key */}
          <label className="block mt-4 text-sm">
            <span className="text-gray-700 dark:text-gray-400">Key</span>
            <input
              className={`block w-full mt-1 text-sm dark:border-gray-600 dark:bg-gray-700 focus:border-purple-400 focus:outline-none focus:shadow-outline-purple dark:text-gray-300 dark:focus:shadow-outline-gray form-input ${
                errors.key ? "border-red-600 focus:border-red-400" : ""
              }`}
              placeholder="Enter configuration key"
              name="key"
              value={config.key}
              onChange={handleChange}
            />
            {errors.key && (
              <span className="text-xs text-red-600 dark:text-red-400">
                {errors.key}
              </span>
            )}
          </label>
          {/* Value */}
          <label className="block mt-4 text-sm">
            <span className="text-gray-700 dark:text-gray-400">Value</span>
            <input
              className={`block w-full mt-1 text-sm dark:border-gray-600 dark:bg-gray-700 focus:border-purple-400 focus:outline-none focus:shadow-outline-purple dark:text-gray-300 dark:focus:shadow-outline-gray form-input ${
                errors.value ? "border-red-600 focus:border-red-400" : ""
              }`}
              placeholder="Enter configuration value"
              name="value"
              value={config.value}
              onChange={handleChange}
            />
            {errors.value && (
              <span className="text-xs text-red-600 dark:text-red-400">
                {errors.value}
              </span>
            )}
          </label>
          <div className="flex mt-6 space-x-3">
            <button
              type="submit"
              className="px-6 py-2 text-sm font-semibold text-white transition-colors duration-150 bg-green-500 border border-transparent rounded-lg active:bg-green-600 hover:bg-green-700 focus:outline-none focus:shadow-outline-green"
            >
              Add Configuration
            </button>
            <Link
              to="/device_configurations"
              className="px-6 py-2 text-sm font-semibold text-white transition-colors duration-150 bg-blue-500 border border-transparent rounded-lg active:bg-blue-600 hover:bg-blue-700 focus:outline-none focus:shadow-outline-blue"
            >
              Go Back
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateDeviceConfiguration;
