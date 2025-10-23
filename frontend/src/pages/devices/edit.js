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
  const [deviceName, setDeviceName] = useState(""); // <-- NEW

  useEffect(() => {
    const fetchDeviceAndServices = async () => {
      setLoading(true);
      try {
        const deviceRes = await DeviceService.show(id);
        setDevice(deviceRes.device || deviceRes);

        // Get all services for selection
        const serviceRes = await ServiceService.list();
        setServices(serviceRes.services || []);

        const assignedServices =
          deviceRes.device?.services || deviceRes.services || [];

        const initialSelected = {};
        assignedServices.forEach((srv) => {
          initialSelected[srv.id] = srv.pivot.priority_number || 1;
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
      // Toggle the checkbox
      if (prev[serviceId]) {
        const copy = { ...prev };
        delete copy[serviceId];
        return copy;
      } else {
        return { ...prev, [serviceId]: 1 }; // default priority 1
      }
    });
    setErrors({});
  };
  const handleDeviceNameChange = (e) => {
    setDeviceName(e.target.value);
  };

  const handlePriorityChange = (serviceId, value) => {
    setSelectedServices((prev) => ({
      ...prev,
      [serviceId]: Number(value),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (Object.keys(selectedServices).length === 0) {
      setErrors({ service: "Vui lòng chọn ít nhất một dịch vụ để gán." });
      return;
    }
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

  if (loading) {
    return (
      <div className="w-full px-8 py-10 flex items-center justify-center">
        <span className="text-gray-700 dark:text-gray-200 text-lg">
          Đang tải...
        </span>
      </div>
    );
  }

  if (!device) {
    return (
      <div className="w-full px-8 py-10 flex items-center justify-center">
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-10 text-center">
          <div className="text-gray-200 text-lg">Không tìm thấy thiết bị.</div>
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">
            Gán Dịch vụ cho Thiết bị
          </h2>
          <nav className="text-sm text-gray-400 mt-2">
            <Link
              to="/devices"
              className="text-blue-400 hover:text-blue-300 underline"
            >
              Thiết bị
            </Link>{" "}
            <span className="text-blue-300">{device.name}</span> &gt; Gán dịch
            vụ
          </nav>
        </div>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg border border-gray-700 p-6">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Tên thiết bị
            </label>
            <input
              type="text"
              value={deviceName}
              onChange={handleDeviceNameChange}
              className="w-full px-3 py-2 rounded bg-gray-900 border border-gray-700 text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500 mb-2"
              placeholder="Nhập tên thiết bị"
            />
            <div className="text-md font-semibold text-gray-200">
              ID: {device.id}
            </div>
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Chọn dịch vụ để gán
            </label>
            <div className="space-y-3">
              {services.map((service) => (
                <div key={service.id} className="flex items-center gap-4">
                  <input
                    type="checkbox"
                    id={`service-checkbox-${service.id}`}
                    checked={!!selectedServices[service.id]}
                    onChange={() => handleServiceCheck(service.id)}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label
                    htmlFor={`service-checkbox-${service.id}`}
                    className="text-gray-200"
                  >
                    {service.name}
                  </label>
                  {selectedServices[service.id] && (
                    <>
                      <span className="text-gray-200">Độ ưu tiên: </span>
                      <input
                        type="number"
                        min={1}
                        max={99}
                        value={selectedServices[service.id]}
                        onChange={(e) =>
                          handlePriorityChange(service.id, e.target.value)
                        }
                        className="ml-3 w-20 px-2 py-1 rounded bg-gray-900 border border-gray-700 text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="Priority"
                      />
                    </>
                  )}
                </div>
              ))}
            </div>
            {errors.service && (
              <span className="text-xs text-red-400 mt-1">
                {errors.service}
              </span>
            )}
          </div>
          {/* Errors */}
          {errors.general && (
            <div className="mb-3 text-red-400 text-sm">{errors.general}</div>
          )}
          {/* Buttons */}
          <div className="flex justify-end gap-2 border-t border-gray-700 pt-5">
            <button
              type="submit"
              disabled={saving}
              className="bg-green-500 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded-md shadow disabled:opacity-60"
            >
              {saving ? "Đang lưu..." : "Lưu"}
            </button>
            <Link
              to="/devices"
              className="bg-gray-600 hover:bg-gray-500 text-white font-semibold px-6 py-2 rounded-md shadow"
            >
              Quay lại
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
};

export default DeviceEdit;
