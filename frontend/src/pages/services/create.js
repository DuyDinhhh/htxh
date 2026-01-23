import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import ServiceService from "../../services/serviceService";

// Service create page logic (form, validate, submit).
const ServiceCreate = () => {
  const navigate = useNavigate();

  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    name: "",
    location: "",
    queue_number: "",
    color: "#8B4513",
  });

  // Update form input.
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Validate form fields.
  const validate = () => {
    const v = {};
    if (!form.name?.trim()) v.name = "Tên dịch vụ không được để trống";
    return v;
  };

  // Submit new service to API.
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    const v = validate();
    if (Object.keys(v).length) {
      setErrors(v);
      return;
    }
    try {
      setSaving(true);
      const res = await ServiceService.store(form);

      if (
        res &&
        (res.status === true ||
          String(res.status).toLowerCase() === "true" ||
          res.status === 201)
      ) {
        toast.success("Tạo dịch vụ thành công!", {
          autoClose: 700,
          onClose: () => navigate("/services"),
        });
      } else {
        setErrors({ general: "Không thể tạo dịch vụ." });
      }
    } catch (err) {
      const be = err?.response?.data;
      setErrors(
        be?.errors
          ? be.errors
          : { general: be?.message || "Lỗi khi tạo dịch vụ." },
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full px-8 py-8">
      {/* Header + Breadcrumb */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900">Tạo Dịch vụ</h2>
          <nav className="text-sm text-gray-500 mt-2">
            <Link
              to="/services"
              className="text-red-600 hover:text-red-700 hover:underline"
            >
              Dịch vụ
            </Link>
            <span className="mx-1">/</span>
            <span className="text-gray-700">Tạo mới</span>
          </nav>
        </div>
      </div>

      <div className="bg-white rounded-lg overflow-hidden shadow">
        <form onSubmit={handleSubmit} className="p-6" autoComplete="off">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Tên dịch vụ
              </label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Nhập tên dịch vụ"
                className="w-full rounded-md border border-gray-300 bg-white text-gray-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
              {errors.name && (
                <div className="text-red-600 text-sm mt-1">{errors.name}</div>
              )}
            </div>

            {/* Code */}
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Mã dịch vụ
              </label>
              <input
                name="queue_number"
                value={form.queue_number}
                onChange={handleChange}
                placeholder="Nhập mã dịch vụ"
                className="w-full rounded-md border border-gray-300 bg-white text-gray-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
              {errors.queue_number && (
                <div className="text-red-600 text-sm mt-1">
                  {errors.queue_number}
                </div>
              )}
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Màu sắc dịch vụ
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  name="color"
                  value={form.color}
                  onChange={handleChange}
                  className="w-12 h-12 p-0 border-2 border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  style={{ minWidth: "3rem", minHeight: "3rem" }}
                />
                <span className="text-gray-700 text-sm">{form.color}</span>
                <span
                  className="inline-block w-8 h-8 rounded-full border border-gray-300"
                  style={{ backgroundColor: form.color }}
                />
              </div>
            </div>
          </div>

          {/* General error */}
          {errors.general && (
            <div className="pt-4 text-red-600 text-sm">{errors.general}</div>
          )}

          {/* Footer */}
          <div className="px-0 mt-8 pt-5 border-t border-gray-200 flex items-center justify-end gap-2">
            <Link
              to="/services"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-md border bg-white text-gray-700 hover:bg-gray-50 transition"
            >
              Hủy
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center px-6 py-2.5 rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-60 transition"
            >
              {saving ? "Đang lưu..." : "Lưu"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ServiceCreate;
