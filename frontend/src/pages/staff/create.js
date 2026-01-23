import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import StaffService from "../../services/staffService";

// Staff create page logic (form, validate, submit).
const AddStaff = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    username: "",
    password: "",
    password_confirmation: "",
  });
  const [saving, setSaving] = useState(false);

  // Submit new staff to API.
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.password_confirmation) {
      toast.error("Mật khẩu không khớp", { autoClose: 1200 });
      return;
    }

    setSaving(true);
    try {
      await StaffService.store(form);
      toast.success("Tạo nhân viên thành công", { autoClose: 800 });
      navigate("/staffs");
    } catch (err) {
      const data = err?.response?.data;
      let message = "Lỗi khi tạo nhân viên";
      if (data?.errors) {
        const firstKey = Object.keys(data.errors)[0];
        message = data.errors[firstKey]?.[0] || message;
      } else if (data?.message) {
        message = data.message;
      }
      toast.error(message, { autoClose: 1200 });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen  flex justify-center py-12 px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Thêm nhân viên</h2>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tên nhân viên <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus: ring-[#00afb9] focus:border-transparent outline-none"
                value={form.name}
                onChange={(e) =>
                  setForm((p) => ({ ...p, name: e.target.value }))
                }
                required
                disabled={saving}
              />
            </div>

            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tên đăng nhập <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00afb9] focus:border-transparent outline-none"
                value={form.username}
                onChange={(e) =>
                  setForm((p) => ({ ...p, username: e.target.value }))
                }
                required
                disabled={saving}
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mật khẩu <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00afb9] focus:border-transparent outline-none"
                value={form.password}
                onChange={(e) =>
                  setForm((p) => ({ ...p, password: e.target.value }))
                }
                required
                disabled={saving}
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nhập lại mật khẩu <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus: ring-2 focus:ring-[#00afb9] focus:border-transparent outline-none"
                value={form.password_confirmation}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    password_confirmation: e.target.value,
                  }))
                }
                required
                disabled={saving}
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <Link
                to="/staffs"
                className="flex-1 px-4 py-2 text-center border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 font-medium"
              >
                Huỷ
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 px-4 py-2 bg-[#00afb9] hover:bg-[#0081a7] text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? "Đang tạo..." : "Tạo mới"}
              </button>
            </div>
          </form>
        </div>

        <div className="text-center mt-4">
          <Link
            to="/staffs"
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            ← Quay lại
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AddStaff;
