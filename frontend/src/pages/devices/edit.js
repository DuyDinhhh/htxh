import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import DeviceService from "../../services/deviceService";
import ServiceService from "../../services/serviceService";
import { toast } from "react-toastify";

const DeviceEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [device, setDevice] = useState(null);
  const [services, setServices] = useState([]);
  const [selectedServices, setSelectedServices] = useState({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [deviceName, setDeviceName] = useState("");

  useEffect(() => {
    const fetchDeviceAndServices = async () => {
      setLoading(true);
      try {
        const deviceRes = await DeviceService.show(id);
        setDevice(deviceRes.device || deviceRes);

        const serviceRes = await ServiceService.list();
        const validServices = (serviceRes.services || []).filter(
          (service) => !service.deleted_at
        );
        setServices(validServices || []);

        const assignedServices =
          deviceRes.device?.services || deviceRes.services || [];

        const initialSelected = {};
        assignedServices.forEach((srv) => {
          initialSelected[srv.id] = srv.pivot?.priority_number || 1;
        });
        setSelectedServices(initialSelected);
        setDeviceName(deviceRes.device?.name || deviceRes.name || "");
      } catch (err) {
        toast.error("Lỗi khi tải thông tin thiết bị hoặc dịch vụ.", {
          autoClose: 800,
        });
      }
      setLoading(false);
    };
    fetchDeviceAndServices();
  }, [id]);

  const handleServiceCheck = (serviceId) => {
    setSelectedServices((prev) => {
      if (prev[serviceId]) {
        const copy = { ...prev };
        delete copy[serviceId];
        return copy;
      }
      return { ...prev, [serviceId]: 1 };
    });
    setErrors({});
  };

  const handleDeviceNameChange = (e) => setDeviceName(e.target.value);

  const handlePriorityChange = (serviceId, value) => {
    setSelectedServices((prev) => ({
      ...prev,
      [serviceId]: Number(value),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // if (Object.keys(selectedServices).length === 0) {
    //   setErrors({ service: "Vui lòng chọn ít nhất một dịch vụ để gán." });
    //   return;
    // }
    setSaving(true);
    try {
      const assignData = Object.entries(selectedServices).map(
        ([service_id, priority_number]) => ({
          service_id,
          priority_number,
        })
      );
      const payload = {
        name: deviceName,
        service_assignments: assignData,
      };
      const res = await DeviceService.assignService(id, payload);
      if (
        res &&
        (res.status === "success" || res.status === true || res.status === 200)
      ) {
        toast.success("Chỉnh sửa thiết bị thành công!", {
          autoClose: 700,
          onClose: () => navigate("/devices"),
        });
      } else {
        setErrors({ general: "Không chỉnh sửa thiết bị." });
      }
    } catch (err) {
      setErrors({ general: "Lỗi khi chỉnh sửa thiết bị." });
    } finally {
      setSaving(false);
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

  if (!device) {
    return (
      <div className="w-full px-8 py-8">
        <div className="bg-white border rounded-lg shadow p-10 text-center">
          <div className="text-gray-800 text-lg mb-4">
            Không tìm thấy thiết bị.
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
      {/* Header + Breadcrumb */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900">
            Gán Dịch vụ cho Thiết bị
          </h2>
          <nav className="text-sm text-gray-500 mt-2">
            <Link
              to="/devices"
              className="text-red-600 hover:underline hover:text-red-700"
            >
              Thiết bị
            </Link>{" "}
            <span className="mx-1">/</span>
            <span className="text-gray-700 font-medium">{device.name}</span>
            <span className="mx-1">/</span>
            <span className="text-gray-700">Gán dịch vụ</span>
          </nav>
        </div>
      </div>

      {/* Card */}
      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-lg overflow-hidden shadow w-11/12 ">
          <div className="p-6 space-y-8">
            {/* Device Info */}
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Thông tin thiết bị
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label
                    htmlFor="deviceName"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Tên thiết bị
                  </label>
                  <input
                    id="deviceName"
                    type="text"
                    value={deviceName}
                    onChange={handleDeviceNameChange}
                    placeholder="Nhập tên thiết bị"
                    className="w-full px-3 py-2 rounded-md border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-1">
                    Mã thiết bị
                  </div>
                  <div className="h-[38px] flex items-center px-3 border rounded-md bg-gray-50 text-gray-700">
                    ID: {device.id}
                  </div>
                </div>
              </div>
            </section>

            {/* Services Selection */}
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Chọn dịch vụ để gán
              </h3>

              <div className="space-y-3">
                {services.map((service) => {
                  const checked = !!selectedServices[service.id];
                  return (
                    <div
                      key={service.id}
                      className={`border rounded-lg p-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3 transition-colors ${
                        checked
                          ? "bg-red-50 border-red-200"
                          : "bg-white hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id={`srv-${service.id}`}
                          checked={checked}
                          onChange={() => handleServiceCheck(service.id)}
                          className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                        />
                        <label
                          htmlFor={`srv-${service.id}`}
                          className="text-sm md:text-base font-medium text-gray-800"
                        >
                          {service.name}
                        </label>
                      </div>

                      {checked && (
                        <div className="flex items-center gap-2 md:gap-3">
                          <span className="text-sm text-gray-600">
                            Độ ưu tiên
                          </span>
                          <input
                            type="number"
                            min={1}
                            max={99}
                            value={selectedServices[service.id]}
                            onChange={(e) =>
                              handlePriorityChange(service.id, e.target.value)
                            }
                            className="w-24 px-2 py-2 rounded-md border border-red-200 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                            placeholder="1-99"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {errors.service && (
                <p className="text-sm text-red-600 mt-2">{errors.service}</p>
              )}
            </section>

            {/* General error */}
            {errors.general && (
              <div className="text-sm text-red-600">{errors.general}</div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="px-6 py-4 bg-gray-50 border-t flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => navigate("/devices")}
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-md border bg-white text-gray-700 hover:bg-gray-50 transition"
            >
              Quay lại
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center px-6 py-2.5 rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-60 transition"
            >
              {saving ? "Đang lưu..." : "Lưu"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default DeviceEdit;
