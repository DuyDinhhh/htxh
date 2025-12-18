import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import ServiceService from "../../services/serviceService";
import { toast } from "react-toastify";
const isValidHex = (val = "") =>
  /^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/.test((val || "").trim());
const normalizeHex = (val = "") => {
  const v = (val || "").trim();
  if (/^#([0-9A-Fa-f]{6})$/.test(v)) return v.toLowerCase();
  if (/^#([0-9A-Fa-f]{3})$/.test(v)) {
    const short = v.slice(1).split("");
    return ("#" + short.map((c) => c + c).join("")).toLowerCase();
  }
  return v;
};
const ServiceEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    name: "",
    color: "#8B4513",
    queue_number: "",
  });

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await ServiceService.show(id);
        setService(data.service);
        setForm({
          name: data.service?.name || "",
          color: data.service?.color || "#8B4513",
          queue_number: data.service?.queue_number || "",
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
      const res = await ServiceService.update(id, form);
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
  const handleColorTextChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (isValidHex(value)) {
      const normalized = normalizeHex(value);
      setForm((p) => ({ ...p, [name]: normalized }));
      setErrors((p) => {
        const c = { ...p };
        delete c[name];
        return c;
      });
    } else {
      setErrors((p) => ({
        ...p,
        [name]: "Mã màu không hợp lệ. Vui lòng dùng #rrggbb.",
      }));
    }
  };
  /* ---------- UI ---------- */

  if (loading) {
    return (
      <div className="w-full px-8 py-8">
        <div className="bg-white border rounded-lg shadow p-8 text-center">
          <div className="text-gray-600">Đang tải...</div>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="w-full px-8 py-8">
        <div className="bg-white border rounded-lg shadow p-10 text-center">
          <div className="text-gray-800 text-lg mb-4">
            Không tìm thấy dịch vụ.
          </div>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-md border bg-white text-gray-700 hover:bg-gray-50 transition"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-8 py-8">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900">
            Chỉnh sửa Dịch vụ
          </h2>
          <nav className="text-sm text-gray-500 mt-2">
            <Link
              to="/services"
              className="text-red-600 hover:text-red-700 hover:underline"
            >
              Dịch vụ
            </Link>
            <span className="mx-1">/</span>
            <span className="text-gray-700 font-medium">{service?.name}</span>
            <span className="mx-1">/</span>
            <span className="text-gray-700">Chỉnh sửa</span>
          </nav>
        </div>
      </div>

      {/* Card */}
      <div className="bg-white rounded-lg overflow-hidden shadow border">
        <form onSubmit={handleSubmit} className="p-6" autoComplete="off">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
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
                disabled
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

            {/* Color Picker */}
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
                <input
                  type="text"
                  name="color"
                  value={form.color}
                  onChange={handleColorTextChange}
                  placeholder="#rrggbb hoặc #rgb"
                  className="w-40 rounded-md border border-gray-300 bg-white text-gray-900 px-2 py-1 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
                />
                <span className="text-gray-700 text-sm">{form.color}</span>
                <span
                  className="inline-block w-8 h-8 rounded-full border border-gray-300"
                  style={{ backgroundColor: form.color }}
                />
              </div>
            </div>
          </div>

          {errors.general && (
            <div className="pt-4 text-red-600 text-sm">{errors.general}</div>
          )}

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

export default ServiceEdit;
