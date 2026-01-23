import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import StaffService from "../../services/staffService";

// Staff edit page logic (load, form, validate, submit).
const EditStaff = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    username: "",
    password: "",
    password_confirmation: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load staff data for editing.
  useEffect(() => {
    if (!id) {
      toast.error("ID nhân viên không hợp lệ", { autoClose: 1200 });
      navigate("/staffs");
      return;
    }

    setLoading(true);
    StaffService.show(id)
      .then((res) => {
        console.log(res);
        const staff = res.staff ?? res.data;
        setForm({
          name: staff?.name || "",
          username: staff?.username || "",
          password: "",
          password_confirmation: "",
        });
      })
      .catch((err) => {
        const msg = err?.response?.data?.message || "Không tìm thấy nhân viên";
        toast.error(msg, { autoClose: 1200 });
        navigate("/staffs");
      })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  // Submit updated staff to API.
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password || form.password_confirmation) {
      if (form.password !== form.password_confirmation) {
        toast.error("Mật khẩu không khớp", { autoClose: 1200 });
        return;
      }
    }

    const payload = {
      name: form.name,
      username: form.username,
    };

    if (form.password) {
      payload.password = form.password;
      payload.password_confirmation = form.password_confirmation;
    }

    setSaving(true);
    try {
      await StaffService.update(id, payload);
      toast.success("Cập nhật nhân viên thành công", { autoClose: 800 });
      navigate("/staffs");
    } catch (err) {
      const data = err?.response?.data;
      let message = "Lỗi khi cập nhật nhân viên";
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

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center py-12 px-4">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#00afb9]"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex justify-center py-12 px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Sửa nhân viên</h2>
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00afb9] focus:border-transparent outline-none"
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

            {/* Divider */}
            <div className="border-t pt-4">
              <p className="text-sm text-gray-600 mb-3">
                Đổi mật khẩu (để trống nếu không muốn đổi)
              </p>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mật khẩu mới
              </label>
              <input
                type="password"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00afb9] focus:border-transparent outline-none"
                value={form.password}
                onChange={(e) =>
                  setForm((p) => ({ ...p, password: e.target.value }))
                }
                disabled={saving}
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nhập lại mật khẩu mới
              </label>
              <input
                type="password"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00afb9] focus:border-transparent outline-none"
                value={form.password_confirmation}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    password_confirmation: e.target.value,
                  }))
                }
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
                {saving ? "Đang lưu..." : "Lưu thay đổi"}
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

export default EditStaff;
