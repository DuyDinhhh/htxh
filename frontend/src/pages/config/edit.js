import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import ConfigService from "../../services/configService";
import { getImageUrl } from "../../services/httpAxios";

const isAbsoluteUrl = (url = "") => /^https?:\/\//i.test(url);
const isValidHex = (val = "") =>
  /^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/.test(val.trim());
const normalizeHex = (val = "") => {
  const v = val.trim();
  if (/^#([0-9A-Fa-f]{6})$/.test(v)) return v.toLowerCase();
  if (/^#([0-9A-Fa-f]{3})$/.test(v)) {
    const short = v.slice(1).split("");
    return ("#" + short.map((c) => c + c).join("")).toLowerCase();
  }
  return v;
};

const ConfigEdit = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [config, setConfig] = useState(null);
  const [configId, setConfigId] = useState(null);

  const [form, setForm] = useState({
    photo: null,

    text_top: "",
    text_top_color: "#b10730",
    bg_top_color: "#B3AAAA",

    text_bottom: "",
    text_bottom_color: "#b10730",
    bg_bottom_color: "#B3AAAA",

    bg_middle_color: "#ffffff",

    table_header_color: "#B3AAAA",
    table_row_odd_color: "#ffffff",
    table_row_even_color: "#FFF2F4",

    table_text_color: "#000000",
    table_text_active_color: "#ff0000",
  });

  const [photoPreview, setPhotoPreview] = useState(null);
  const [existingPhotoUrl, setExistingPhotoUrl] = useState(null);

  /* -------- fetch (luôn từ index) -------- */
  useEffect(() => {
    const fetchConfig = async () => {
      setLoading(true);
      try {
        const res = await ConfigService.index();
        const cfg = res?.config || res || null;
        if (cfg?.photo) {
          cfg.photo = getImageUrl(cfg.photo);
        }

        if (!cfg || !cfg.id) {
          setConfig(null);
          setConfigId(null);
          toast.error("Không tìm thấy cấu hình.", { autoClose: 800 });
        } else {
          setConfig(cfg);
          setConfigId(cfg.id);

          setForm((p) => ({
            ...p,
            text_top: cfg?.text_top || "",
            text_top_color: cfg?.text_top_color || "#000000",
            bg_top_color: cfg?.bg_top_color || "#000000",

            text_bottom: cfg?.text_bottom || "",
            text_bottom_color: cfg?.text_bottom_color || "#000000",
            bg_bottom_color: cfg?.bg_bottom_color || "#000000",

            bg_middle_color: cfg?.bg_middle_color || "#ffffff",

            table_header_color: cfg?.table_header_color || "#f3f4f6",
            table_row_odd_color: cfg?.table_row_odd_color || "#ffffff",
            table_row_even_color: cfg?.table_row_even_color || "#f9fafb",

            table_text_color: cfg?.table_text_color || "#000000",
            table_text_active_color: cfg?.table_text_active_color || "#ff0000",

            photo: null,
          }));

          setExistingPhotoUrl(
            cfg?.photo
              ? isAbsoluteUrl(cfg.photo)
                ? cfg.photo
                : `/images/config/${cfg.photo}`
              : null
          );
        }
      } catch (err) {
        setConfig(null);
        setConfigId(null);
        toast.error("Lỗi khi tải cấu hình.", { autoClose: 800 });
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, []);

  /* -------- handlers -------- */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    setErrors((p) => {
      const c = { ...p };
      delete c[name];
      return c;
    });
  };

  const handleColorPickerChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    setErrors((p) => {
      const c = { ...p };
      delete c[name];
      return c;
    });
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

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    setForm((p) => ({ ...p, photo: file }));
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setPhotoPreview(ev.target.result);
      reader.readAsDataURL(file);
    } else {
      setPhotoPreview(null);
    }
    setErrors((p) => {
      const c = { ...p };
      delete c.photo;
      return c;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    // validate color fields
    const colorFields = [
      "text_top_color",
      "bg_top_color",
      "text_bottom_color",
      "bg_bottom_color",
      "bg_middle_color",
      "table_header_color",
      "table_row_odd_color",
      "table_row_even_color",
      "table_text_color",
      "table_text_active_color",
    ];
    const newErrors = {};
    for (const key of colorFields) {
      if (!isValidHex(form[key] || "")) {
        newErrors[key] = "Mã màu không hợp lệ.";
      }
    }
    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }

    const fd = new FormData();
    fd.append("text_top", form.text_top || "");
    fd.append("text_top_color", normalizeHex(form.text_top_color));
    fd.append("bg_top_color", normalizeHex(form.bg_top_color));

    fd.append("text_bottom", form.text_bottom || "");
    fd.append("text_bottom_color", normalizeHex(form.text_bottom_color));
    fd.append("bg_bottom_color", normalizeHex(form.bg_bottom_color));

    fd.append("bg_middle_color", normalizeHex(form.bg_middle_color));

    fd.append("table_header_color", normalizeHex(form.table_header_color));
    fd.append("table_row_odd_color", normalizeHex(form.table_row_odd_color));
    fd.append("table_row_even_color", normalizeHex(form.table_row_even_color));

    fd.append("table_text_color", normalizeHex(form.table_text_color));
    fd.append(
      "table_text_active_color",
      normalizeHex(form.table_text_active_color)
    );

    if (form.photo) fd.append("photo", form.photo);

    setSaving(true);
    try {
      let res;
      if (!configId) {
        res = await ConfigService.create(fd);
      } else {
        fd.append("_method", "POST");
        res = await ConfigService.edit(configId, fd);
      }

      const ok =
        res &&
        (res.status === true ||
          String(res.status).toLowerCase() === "true" ||
          res.status === 200 ||
          res.status === "success");

      if (ok) {
        toast.success("Cập nhật cấu hình thành công!", {
          autoClose: 700,
          onClose: () => navigate("/config"),
        });
      } else {
        setErrors({ general: res?.message || "Không thể cập nhật cấu hình." });
      }
    } catch (err) {
      const be = err?.response?.data;
      setErrors(
        be?.errors
          ? be.errors
          : { general: be?.message || "Lỗi khi cập nhật cấu hình." }
      );
    } finally {
      setSaving(false);
    }
  };

  /* -------- UI -------- */
  if (loading) {
    return (
      <div className="w-full px-8 py-8">
        <div className="bg-white border rounded-lg shadow p-8 text-center">
          <div className="text-gray-600">Đang tải...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-8 py-8">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900">
            Chỉnh sửa Cấu hình
          </h2>
          <nav className="text-sm text-gray-500 mt-2">
            <Link
              to="/config"
              className="text-red-600 hover:text-red-700 hover:underline"
            >
              Cấu hình
            </Link>
            <span className="mx-1">/</span>
            <span className="text-gray-700">Chỉnh sửa</span>
          </nav>
        </div>
      </div>

      <div className="bg-white rounded-lg overflow-hidden shadow w-11/12">
        <form onSubmit={handleSubmit} className="p-6" autoComplete="off">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Top */}
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Chữ trên
              </label>
              <input
                name="text_top"
                value={form.text_top}
                onChange={handleChange}
                placeholder="Nhập text top"
                className="w-full rounded-md border border-gray-300 bg-white text-gray-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
              {errors.text_top && (
                <div className="text-red-500 text-xs">{errors.text_top}</div>
              )}
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Màu nền (Trên) / Màu chữ (Trên)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  name="bg_top_color"
                  value={form.bg_top_color}
                  onChange={handleColorPickerChange}
                  className="w-12 h-12 p-0 border-2 border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <input
                  type="text"
                  name="bg_top_color"
                  value={form.bg_top_color}
                  onChange={handleColorTextChange}
                  placeholder="#rrggbb hoặc #rgb"
                  className="w-32 rounded-md border border-gray-300 bg-white text-gray-900 px-2 py-1 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
                />
                <span className="text-gray-700 text-sm">
                  {form.bg_top_color}
                </span>
              </div>
              <div className="mt-2 flex items-center gap-3">
                <input
                  type="color"
                  name="text_top_color"
                  value={form.text_top_color}
                  onChange={handleColorPickerChange}
                  className="w-12 h-12 p-0 border-2 border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <input
                  type="text"
                  name="text_top_color"
                  value={form.text_top_color}
                  onChange={handleColorTextChange}
                  placeholder="#rrggbb hoặc #rgb"
                  className="w-32 rounded-md border border-gray-300 bg-white text-gray-900 px-2 py-1 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
                />
                <span className="text-gray-700 text-sm">
                  {form.text_top_color}
                </span>
              </div>
              {errors.bg_top_color && (
                <div className="text-red-500 text-xs">
                  {errors.bg_top_color}
                </div>
              )}
              {errors.text_top_color && (
                <div className="text-red-500 text-xs">
                  {errors.text_top_color}
                </div>
              )}
            </div>

            {/* Bottom */}
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Chữ dưới
              </label>
              <input
                name="text_bottom"
                value={form.text_bottom}
                onChange={handleChange}
                placeholder="Nhập text bottom"
                className="w-full rounded-md border border-gray-300 bg-white text-gray-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
              {errors.text_bottom && (
                <div className="text-red-500 text-xs">{errors.text_bottom}</div>
              )}
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Màu nền (Dưới) / Màu chữ (Dưới)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  name="bg_bottom_color"
                  value={form.bg_bottom_color}
                  onChange={handleColorPickerChange}
                  className="w-12 h-12 p-0 border-2 border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <input
                  type="text"
                  name="bg_bottom_color"
                  value={form.bg_bottom_color}
                  onChange={handleColorTextChange}
                  placeholder="#rrggbb hoặc #rgb"
                  className="w-32 rounded-md border border-gray-300 bg-white text-gray-900 px-2 py-1 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
                />
                <span className="text-gray-700 text-sm">
                  {form.bg_bottom_color}
                </span>
              </div>
              <div className="mt-2 flex items-center gap-3">
                <input
                  type="color"
                  name="text_bottom_color"
                  value={form.text_bottom_color}
                  onChange={handleColorPickerChange}
                  className="w-12 h-12 p-0 border-2 border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <input
                  type="text"
                  name="text_bottom_color"
                  value={form.text_bottom_color}
                  onChange={handleColorTextChange}
                  placeholder="#rrggbb hoặc #rgb"
                  className="w-32 rounded-md border border-gray-300 bg-white text-gray-900 px-2 py-1 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
                />
                <span className="text-gray-700 text-sm">
                  {form.text_bottom_color}
                </span>
              </div>
              {errors.bg_bottom_color && (
                <div className="text-red-500 text-xs">
                  {errors.bg_bottom_color}
                </div>
              )}
              {errors.text_bottom_color && (
                <div className="text-red-500 text-xs">
                  {errors.text_bottom_color}
                </div>
              )}
            </div>

            {/* Middle background */}
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Màu nền giữa
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  name="bg_middle_color"
                  value={form.bg_middle_color}
                  onChange={handleColorPickerChange}
                  className="w-12 h-12 p-0 border-2 border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <input
                  type="text"
                  name="bg_middle_color"
                  value={form.bg_middle_color}
                  onChange={handleColorTextChange}
                  placeholder="#rrggbb hoặc #rgb"
                  className="w-40 rounded-md border border-gray-300 bg-white text-gray-900 px-2 py-1 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
                />
                <span className="text-gray-700 text-sm">
                  {form.bg_middle_color}
                </span>
              </div>
              {errors.bg_middle_color && (
                <div className="text-red-500 text-xs">
                  {errors.bg_middle_color}
                </div>
              )}
            </div>

            {/* Table colors */}
            <div className="md:col-span-2">
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Màu bảng
              </label>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Header</div>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      name="table_header_color"
                      value={form.table_header_color}
                      onChange={handleColorPickerChange}
                      className="w-10 h-10 p-0 border-2 border-gray-300 rounded-md bg-white"
                    />
                    <input
                      type="text"
                      name="table_header_color"
                      value={form.table_header_color}
                      onChange={handleColorTextChange}
                      className="w-36 rounded-md border border-gray-300 bg-white text-gray-900 px-2 py-1 text-sm"
                    />
                  </div>
                  {errors.table_header_color && (
                    <div className="text-red-500 text-xs">
                      {errors.table_header_color}
                    </div>
                  )}
                </div>

                <div>
                  <div className="text-sm text-gray-600 mb-1">Row (odd)</div>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      name="table_row_odd_color"
                      value={form.table_row_odd_color}
                      onChange={handleColorPickerChange}
                      className="w-10 h-10 p-0 border-2 border-gray-300 rounded-md bg-white"
                    />
                    <input
                      type="text"
                      name="table_row_odd_color"
                      value={form.table_row_odd_color}
                      onChange={handleColorTextChange}
                      className="w-36 rounded-md border border-gray-300 bg-white text-gray-900 px-2 py-1 text-sm"
                    />
                  </div>
                  {errors.table_row_odd_color && (
                    <div className="text-red-500 text-xs">
                      {errors.table_row_odd_color}
                    </div>
                  )}
                </div>

                <div>
                  <div className="text-sm text-gray-600 mb-1">Row (even)</div>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      name="table_row_even_color"
                      value={form.table_row_even_color}
                      onChange={handleColorPickerChange}
                      className="w-10 h-10 p-0 border-2 border-gray-300 rounded-md bg-white"
                    />
                    <input
                      type="text"
                      name="table_row_even_color"
                      value={form.table_row_even_color}
                      onChange={handleColorTextChange}
                      className="w-36 rounded-md border border-gray-300 bg-white text-gray-900 px-2 py-1 text-sm"
                    />
                  </div>
                  {errors.table_row_even_color && (
                    <div className="text-red-500 text-xs">
                      {errors.table_row_even_color}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Table text</div>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      name="table_text_color"
                      value={form.table_text_color}
                      onChange={handleColorPickerChange}
                      className="w-10 h-10 p-0 border-2 border-gray-300 rounded-md bg-white"
                    />
                    <input
                      type="text"
                      name="table_text_color"
                      value={form.table_text_color}
                      onChange={handleColorTextChange}
                      className="w-36 rounded-md border border-gray-300 bg-white text-gray-900 px-2 py-1 text-sm"
                    />
                  </div>
                  {errors.table_text_color && (
                    <div className="text-red-500 text-xs">
                      {errors.table_text_color}
                    </div>
                  )}
                </div>

                <div>
                  <div className="text-sm text-gray-600 mb-1">
                    Table text (active)
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      name="table_text_active_color"
                      value={form.table_text_active_color}
                      onChange={handleColorPickerChange}
                      className="w-10 h-10 p-0 border-2 border-gray-300 rounded-md bg-white"
                    />
                    <input
                      type="text"
                      name="table_text_active_color"
                      value={form.table_text_active_color}
                      onChange={handleColorTextChange}
                      className="w-36 rounded-md border border-gray-300 bg-white text-gray-900 px-2 py-1 text-sm"
                    />
                  </div>
                  {errors.table_text_active_color && (
                    <div className="text-red-500 text-xs">
                      {errors.table_text_active_color}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Photo */}
            <div className="md:col-span-2">
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Ảnh logo
              </label>
              <input
                type="file"
                accept=".png,.jpg,.jpeg,.svg"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-900 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border file:border-gray-300 file:text-sm file:font-semibold file:bg-white file:text-gray-700 hover:file:bg-gray-50"
              />
              {errors.photo && (
                <div className="text-red-500 text-xs">{errors.photo}</div>
              )}
              <div className="mt-4 flex flex-wrap gap-6">
                {existingPhotoUrl && !photoPreview && (
                  <div>
                    <div className="text-sm text-gray-600 mb-2">
                      Ảnh hiện tại
                    </div>
                    <img
                      src={existingPhotoUrl}
                      alt="current"
                      className="max-h-32 object-contain border rounded-md"
                    />
                  </div>
                )}
                {photoPreview && (
                  <div>
                    <div className="text-sm text-gray-600 mb-2">
                      Ảnh mới được chọn
                    </div>
                    <img
                      src={photoPreview}
                      alt="preview"
                      className="max-h-32 object-contain border rounded-md"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {errors.general && (
            <div className="mt-4 text-red-500 text-sm">{errors.general}</div>
          )}

          <div className="mt-8 pt-5 border-t border-gray-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-md border bg-white text-gray-700 hover:bg-gray-50 transition"
            >
              Hủy
            </button>
            <Link
              to="/config/button_config"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-md border bg-yellow-600 text-white hover:bg-yellow-200 hover:text-black transition"
            >
              Điều chỉnh dịch vụ
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

export default ConfigEdit;
