import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";

// Dummy device list for dropdown (replace with API data)
const DEVICES = [
  { id: 1, name: "Device A" },
  { id: 2, name: "Device B" },
  { id: 3, name: "Device C" },
];

// Dummy configs
const DUMMY_CONFIGS = [
  { id: 1, deviceid: 1, key: "brightness", value: "80" },
  { id: 2, deviceid: 2, key: "volume", value: "50" },
  { id: 3, deviceid: 1, key: "timezone", value: "UTC+7" },
];

const EditDeviceConfiguration = () => {
  const { id } = useParams();
  const [config, setConfig] = useState({
    deviceid: "",
    key: "",
    value: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const found = DUMMY_CONFIGS.find((c) => String(c.id) === String(id));
    if (found) {
      setConfig({
        deviceid: found.deviceid,
        key: found.key,
        value: found.value,
      });
    }
    setLoading(false);
  }, [id]);

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
      alert("Device configuration updated: " + JSON.stringify(config, null, 2));
      navigate("/device_configurations");
    }
  };

  if (loading) {
    return (
      <div className="container px-6 mx-auto grid">
        <div className="flex justify-center items-center h-64">
          <span className="text-gray-700 dark:text-gray-200 text-lg">
            Loading...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="container px-6 mx-auto grid">
      <h2 className="my-6 text-2xl font-semibold text-gray-700 dark:text-gray-200 text-center">
        Edit Device Configuration
      </h2>
      <h4 className="mb-4 text-lg font-semibold text-gray-600 dark:text-gray-300">
        Update Device Configuration Information
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
              {DEVICES.map((d) => (
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
              Save Changes
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

export default EditDeviceConfiguration;
