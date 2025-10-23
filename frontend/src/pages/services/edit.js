import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import ServiceService from "../../services/serviceService";
import { toast } from "react-toastify";

const ServiceEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    name: "",
    color: "#8B4513", // Add color field with default brown
    queue_number: "",
  });

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await ServiceService.show(id);
        setService(data.service);

        setForm({
          name: data.service.name || "",
          color: data.service.color || "#8B4513",
          queue_number: data.service.queue_number,
        });
      } catch (err) {
        setService(null);
      }
      setLoading(false);
    })();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const v = {};
    if (!form.name?.trim()) v.name = "Tên dịch vụ không được để trống";
    // if (!form.location?.trim()) v.location = "Vị trí không được để trống";
    return v;
  };

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
      // Call your service API
      const res = await ServiceService.update(id, form);
      console.log(res);
      if (
        res &&
        (res.status === true ||
          String(res.status).toLowerCase() === "true" ||
          res.status === 200)
      ) {
        toast.success("Cập nhật dịch vụ thành công!", {
          autoClose: 700,
          onClose: () => navigate("/services"),
        });
      } else {
        setErrors({ general: "Không thể cập nhật dịch vụ." });
      }
    } catch (err) {
      const be = err?.response?.data;
      setErrors(
        be?.errors
          ? be.errors
          : { general: be?.message || "Lỗi khi cập nhật dịch vụ." }
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full px-8 py-10">
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-10 text-center text-gray-300">
          Đang tải...
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="w-full px-8 py-10">
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-10 text-center">
          <div className="text-gray-200 text-lg">Không tìm thấy dịch vụ.</div>
          <button
            onClick={() => navigate(-1)}
            className="mt-6 bg-gray-600 hover:bg-gray-500 text-white font-semibold px-4 py-2 rounded-md shadow"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-8 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Chỉnh sửa Dịch vụ</h2>
          <nav className="text-sm text-gray-400 mt-2">
            <Link
              to="/services"
              className="text-blue-400 hover:text-blue-300 underline"
            >
              Dịch vụ
            </Link>{" "}
            &gt; <span className="text-blue-300">{service.name}</span> &gt;
            Chỉnh sửa
          </nav>
        </div>
      </div>

      {/* Card */}
      <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg border border-gray-700">
        <form onSubmit={handleSubmit} className="p-6" autoComplete="off">
          <div className="grid grid-cols-1 gap-6">
            {/* Name */}
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-300">
                Tên dịch vụ
              </label>
              <input
                className="w-full rounded-md bg-gray-900 border border-gray-700 text-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-500"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Nhập tên dịch vụ"
              />
              {errors.name && (
                <div className="text-red-400 text-xs mt-1">{errors.name}</div>
              )}
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-300">
                Mã dịch vụ
              </label>
              <input
                className="w-full rounded-md bg-gray-900 border border-gray-700 text-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-500"
                name="queue_number"
                value={form.queue_number}
                onChange={handleChange}
                placeholder="Nhập mã dịch vụ"
              />
              {errors.queue_number && (
                <div className="text-red-400 text-xs mt-1">
                  {errors.queue_number}
                </div>
              )}
            </div>

            {/* Color Picker */}
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-300">
                Màu sắc dịch vụ
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  name="color"
                  value={form.color}
                  onChange={handleChange}
                  className="w-12 h-12 p-0 border-2 border-gray-700 rounded-md bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{ minWidth: "3rem", minHeight: "3rem" }}
                />
                <span className="text-gray-200 text-sm">{form.color}</span>
                <div
                  className="w-8 h-8 rounded-full border border-gray-600"
                  style={{ backgroundColor: form.color }}
                ></div>
              </div>
            </div>
          </div>

          {errors.general && (
            <div className="pt-4 text-red-400 text-sm">{errors.general}</div>
          )}

          <div className="flex justify-end gap-2 border-t border-gray-700 mt-8 pt-5">
            <button
              type="submit"
              disabled={saving}
              className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold px-4 py-2 rounded-md shadow disabled:opacity-60"
            >
              {saving ? "Đang lưu..." : "Lưu"}
            </button>
            <Link
              to="/services"
              className="bg-gray-600 hover:bg-gray-500 text-white font-semibold px-4 py-2 rounded-md shadow"
            >
              Hủy
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ServiceEdit;
