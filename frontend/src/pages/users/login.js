import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import UserService from "../../services/userService";
import { toast } from "react-toastify";
import { useUser } from "../../context/UserContext";
import { User, Lock } from "lucide-react";

const Login = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { setUser } = useUser();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await UserService.login({
        username: formData.username,
        password: formData.password,
      });

      if (response.token) {
        localStorage.setItem("token", response.token);
        localStorage.setItem("user", JSON.stringify(response.user));
        setUser(response.user);

        toast.success("Đăng nhập thành công!", {
          autoClose: 700,
          onClose: () => navigate("/dashboards"),
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      setError(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Login failed. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-red-600 mb-2">Nam Trung</h1>
        </div>

        <div className="bg-white rounded-lg border-0 shadow-lg">
          <div className="p-6 space-y-1">
            <h2 className="text-2xl font-semibold text-neutral-900">
              Đăng nhập
            </h2>
          </div>

          <div className="px-6 pb-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-700 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Tên người dùng
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  placeholder="Nhập tên người dùng"
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-md focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-700 flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Mật khẩu
                </label>
                <input
                  type="password"
                  name="password"
                  placeholder="Nhập mật khẩu"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-md focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                  required
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-medium h-10 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Logging in...
                  </span>
                ) : (
                  "Login"
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Design Credit */}
        <p className="text-center text-xs text-neutral-500 mt-6">
          © 2025 Nam Trung Corporation
        </p>
      </div>
    </div>
  );
};

export default Login;
