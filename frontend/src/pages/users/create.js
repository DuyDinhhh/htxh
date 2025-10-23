import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const CreateUser = () => {
  const [user, setUser] = useState({
    name: "",
    email: "",
    role: "Staff",
    status: "active",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!user.name) newErrors.name = "Name cannot be empty";
    if (!user.email) newErrors.email = "Email cannot be empty";
    if (!user.password) newErrors.password = "Password cannot be empty";
    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      alert("User created: " + JSON.stringify(user, null, 2));
      navigate("/users");
    }
  };

  return (
    <div className="container px-6 mx-auto grid">
      <h2 className="my-6 text-2xl font-semibold text-gray-700 dark:text-gray-200 text-center">
        Add User
      </h2>
      <h4 className="mb-4 text-lg font-semibold text-gray-600 dark:text-gray-300">
        Enter User Information
      </h4>
      <form onSubmit={handleSubmit}>
        <div className="px-4 py-3 mb-8 bg-white rounded-lg shadow-md dark:bg-gray-800">
          {/* Name */}
          <label className="block text-sm">
            <span className="text-gray-700 dark:text-gray-400">Name</span>
            <input
              className={`block w-full mt-1 text-sm dark:border-gray-600 dark:bg-gray-700 focus:border-purple-400 focus:outline-none focus:shadow-outline-purple dark:text-gray-300 dark:focus:shadow-outline-gray form-input ${
                errors.name ? "border-red-600 focus:border-red-400" : ""
              }`}
              placeholder="Enter user's name"
              name="name"
              value={user.name}
              onChange={handleChange}
            />
            {errors.name && (
              <span className="text-xs text-red-600 dark:text-red-400">
                {errors.name}
              </span>
            )}
          </label>
          {/* Email */}
          <label className="block mt-4 text-sm">
            <span className="text-gray-700 dark:text-gray-400">Email</span>
            <input
              type="email"
              className={`block w-full mt-1 text-sm dark:border-gray-600 dark:bg-gray-700 focus:border-purple-400 focus:outline-none focus:shadow-outline-purple dark:text-gray-300 dark:focus:shadow-outline-gray form-input ${
                errors.email ? "border-red-600 focus:border-red-400" : ""
              }`}
              placeholder="Enter user's email"
              name="email"
              value={user.email}
              onChange={handleChange}
            />
            {errors.email && (
              <span className="text-xs text-red-600 dark:text-red-400">
                {errors.email}
              </span>
            )}
          </label>
          {/* Role */}
          <label className="block mt-4 text-sm">
            <span className="text-gray-700 dark:text-gray-400">Role</span>
            <select
              className="block w-full mt-1 text-sm dark:text-gray-300 dark:border-gray-600 dark:bg-gray-700 form-select focus:border-purple-400 focus:outline-none focus:shadow-outline-purple dark:focus:shadow-outline-gray"
              name="role"
              value={user.role}
              onChange={handleChange}
            >
              <option value="Admin">Admin</option>
              <option value="Manager">Manager</option>
              <option value="Staff">Staff</option>
            </select>
          </label>
          {/* Status */}
          <label className="block mt-4 text-sm">
            <span className="text-gray-700 dark:text-gray-400">Status</span>
            <select
              className="block w-full mt-1 text-sm dark:text-gray-300 dark:border-gray-600 dark:bg-gray-700 form-select focus:border-purple-400 focus:outline-none focus:shadow-outline-purple dark:focus:shadow-outline-gray"
              name="status"
              value={user.status}
              onChange={handleChange}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </label>
          {/* Password */}
          <label className="block mt-4 text-sm">
            <span className="text-gray-700 dark:text-gray-400">Password</span>
            <input
              type="password"
              className={`block w-full mt-1 text-sm dark:border-gray-600 dark:bg-gray-700 focus:border-purple-400 focus:outline-none focus:shadow-outline-purple dark:text-gray-300 dark:focus:shadow-outline-gray form-input ${
                errors.password ? "border-red-600 focus:border-red-400" : ""
              }`}
              placeholder="Enter user's password"
              name="password"
              value={user.password}
              onChange={handleChange}
            />
            {errors.password && (
              <span className="text-xs text-red-600 dark:text-red-400">
                {errors.password}
              </span>
            )}
          </label>
          <div className="flex mt-6 space-x-3">
            <button
              type="submit"
              className="px-6 py-2 text-sm font-semibold text-white transition-colors duration-150 bg-green-500 border border-transparent rounded-lg active:bg-green-600 hover:bg-green-700 focus:outline-none focus:shadow-outline-green"
            >
              Add User
            </button>
            <Link
              to="/users"
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

export default CreateUser;
