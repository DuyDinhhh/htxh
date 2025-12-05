import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { toast } from "react-toastify";
import { Lock, LogOut, ChevronDown, Eye, EyeOff, X } from "lucide-react";
import UserService from "../services/userService";

function MenuIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
      aria-hidden="true"
    >
      <line x1="4" y1="7" x2="20" y2="7" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="17" x2="20" y2="17" />
    </svg>
  );
}

const Header = ({ onMenuClick }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    current_password: "",
    password: "",
    password_confirmation: "",
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const { user, setUser } = useUser();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
        setShowChangePassword(false);
        resetPasswordForm();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const resetPasswordForm = () => {
    setPasswordData({
      current_password: "",
      password: "",
      password_confirmation: "",
    });
    setErrors("");
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    toast.success("Đăng xuất thành công!", {
      autoClose: 700,
      onClose: () => navigate("/login"),
    });
  };

  const handleChangePasswordClick = () => {
    setShowChangePassword(true);
  };

  const handleBackToMenu = () => {
    setShowChangePassword(false);
    resetPasswordForm();
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    });
    if (errors) setErrors("");
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors("");

    try {
      await UserService.changePassword(user?.id, {
        current_password: passwordData.current_password,
        password: passwordData.password,
        password_confirmation: passwordData.password_confirmation,
      });

      toast.success("Thay đổi mật khẩu thành công!", {
        autoClose: 1000,
      });

      setIsDropdownOpen(false);
      setShowChangePassword(false);
      resetPasswordForm();
    } catch (error) {
      console.error("Change password error:", error);
      setErrors(
        error.response?.data?.errors ||
          "Failed to change password.  Please check your current password."
      );
    } finally {
      setLoading(false);
    }
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
    if (!isDropdownOpen) {
      setShowChangePassword(false);
      resetPasswordForm();
    }
  };

  return (
    <header className="bg-white border-b py-3 px-4 md:px-6 flex items-center justify-between">
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Mở menu"
          className="md:hidden p-2 rounded-lg hover:bg-[#ffded6] text-[#d40724] shrink-0"
        >
          <MenuIcon />
        </button>
        <span className="md:hidden text-lg font-bold text-[#d40724] shrink-0">
          Nam Trung
        </span>
      </div>

      <div className="relative" ref={dropdownRef}>
        <button
          onClick={toggleDropdown}
          className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-neutral-100 transition-colors"
          aria-label="Menu người dùng"
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white font-semibold text-sm shadow-md">
              {user?.name?.charAt(0).toUpperCase() || "A"}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-neutral-900">
                {user?.username || "Admin"}
              </p>
            </div>
          </div>
          <ChevronDown
            className={`w-4 h-4 text-neutral-600 transition-transform ${
              isDropdownOpen ? "rotate-180" : ""
            }`}
          />
        </button>
        {isDropdownOpen && (
          <div className="absolute right-0 mt-2 bg-white rounded-lg shadow-lg border border-neutral-200 z-50 max-h-[600px] overflow-y-auto">
            {!showChangePassword ? (
              <>
                <div className="py-1  w-40">
                  <button
                    onClick={handleChangePasswordClick}
                    className="w-full px-4 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-100 flex items-center gap-3 transition-colors"
                  >
                    <Lock className="w-4 h-4" />
                    Đổi mật khẩu
                  </button>

                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Đăng xuất
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="px-4  w-80 py-3 border-b border-neutral-200 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-neutral-900">
                    Đổi mật khẩu
                  </h3>
                  <button
                    onClick={handleBackToMenu}
                    className="text-neutral-400 hover:text-neutral-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handlePasswordSubmit} className="p-4 space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-neutral-700">
                      Mật khẩu hiện tại
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        name="current_password"
                        value={passwordData.current_password}
                        onChange={handlePasswordChange}
                        placeholder="Nhập mật khẩu hiện tại"
                        className="w-full px-3 py-2 pr-10 text-sm bg-neutral-50 border border-neutral-200 rounded-md focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                        disabled={loading}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowCurrentPassword(!showCurrentPassword)
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                      >
                        {showCurrentPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    {errors.current_password && (
                      <div className="text-red-500 text-xs">
                        {errors.current_password}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-medium text-neutral-700">
                      Mật khẩu mới
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        name="password"
                        value={passwordData.password}
                        onChange={handlePasswordChange}
                        placeholder="Nhập mật khẩu mới"
                        className="w-full px-3 py-2 pr-10 text-sm bg-neutral-50 border border-neutral-200 rounded-md focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                        disabled={loading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                      >
                        {showNewPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <div className="text-red-500 text-xs">
                        {errors.password}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-medium text-neutral-700">
                      Xác nhận mật khẩu mới
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="password_confirmation"
                        value={passwordData.password_confirmation}
                        onChange={handlePasswordChange}
                        placeholder="Nhập lại mật khẩu mới"
                        className="w-full px-3 py-2 pr-10 text-sm bg-neutral-50 border border-neutral-200 rounded-md focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                        disabled={loading}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    {errors.password_confirmation && (
                      <div className="text-red-500 text-xs">
                        {errors.password_confirmation}
                      </div>
                    )}
                  </div>

                  {errors.general && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md text-xs">
                      {errors.general}
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={handleBackToMenu}
                      className="flex-1 px-4 py-2 text-sm font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-md transition-colors"
                      disabled={loading}
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 px-4 py-2 text-sm font-medium bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? "Đang cập nhật..." : "Cập nhật"}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
