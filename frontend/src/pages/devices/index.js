import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DeviceService from "../../services/deviceService";
import { toast } from "react-toastify";

function EditIcon({ className = "w-4 h-4" }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
    </svg>
  );
}
function TrashIcon({ className = "w-4 h-4" }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="3 6 5 6 21 6"></polyline>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    </svg>
  );
}

function IconButton({ children, variant = "outline", to, onClick, title }) {
  const base =
    "inline-flex items-center justify-center p-2 rounded-md transition";
  const classes =
    variant === "danger"
      ? `${base} bg-red-600 hover:bg-red-700 text-white`
      : `${base} border border-gray-200 bg-white hover:bg-gray-50 text-gray-700`;

  if (to) {
    return (
      <Link to={to} className={classes} title={title}>
        {children}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={classes} title={title} type="button">
      {children}
    </button>
  );
}

function PaginationButton({
  label,
  active = false,
  disabled = false,
  onClick,
}) {
  const baseClasses =
    "px-3 py-1 text-sm font-medium rounded-md transition inline-flex items-center justify-center";
  if (disabled) {
    return (
      <button
        disabled
        className={`${baseClasses} bg-white border text-gray-300 cursor-not-allowed`}
      >
        {label}
      </button>
    );
  }
  if (active) {
    return (
      <button className={`${baseClasses} bg-red-600 text-white border`}>
        {label}
      </button>
    );
  }
  return (
    <button
      className={`${baseClasses} bg-white border hover:bg-gray-50`}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

const SummaryCard = ({ title, value, icon, bg = "bg-white" }) => {
  return (
    <div className={`flex-1 ${bg} rounded-lg p-4 shadow-sm border`}>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-gray-500">{title}</div>
          <div className="text-2xl font-bold text-gray-900 mt-2">{value}</div>
        </div>
        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
          {icon}
        </div>
      </div>
    </div>
  );
};

const DeviceManagement = () => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination states
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
    from: 0,
    to: 0,
  });

  const fetchDevices = async (page = 1) => {
    setLoading(true);
    try {
      const response = await DeviceService.index(page);
      const data = response.devices;
      setDevices(data?.data || []);
      setPagination({
        current_page: data?.current_page || 1,
        last_page: data?.last_page || 1,
        per_page: data?.per_page || 10,
        total: data?.total || 0,
        from: data?.from || 0,
        to: data?.to || 0,
      });
    } catch (err) {
      setDevices([]);
      const errorMessage =
        err.response?.data?.message || "Lỗi khi tải thiết bị";
      toast.error(errorMessage, { autoClose: 500 });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDevices(pagination.current_page);
  }, []);

  const handlePageChange = (newPage) => {
    if (
      newPage >= 1 &&
      newPage <= (pagination.last_page || 1) &&
      newPage !== pagination.current_page
    ) {
      fetchDevices(newPage);
    }
  };

  const getPageNumbers = () => {
    const { current_page, last_page } = pagination;
    const maxPagesToShow = 5;
    let start = Math.max(1, current_page - Math.floor(maxPagesToShow / 2));
    let end = start + maxPagesToShow - 1;
    if (end > last_page) {
      end = last_page;
      start = Math.max(1, end - maxPagesToShow + 1);
    }
    const pageNumbers = [];
    for (let i = start; i <= end; i++) {
      pageNumbers.push(i);
    }
    return pageNumbers;
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa thiết bị này?")) return;
    try {
      await DeviceService.destroy(id);
      toast.success("Đã xóa thiết bị thành công!", { autoClose: 800 });
      fetchDevices(pagination.current_page);
    } catch (err) {
      toast.error("Lỗi khi xóa thiết bị. Vui lòng thử lại.");
    }
  };

  const totalDevices = pagination.total || devices.length;
  const activeCount = devices.filter((d) =>
    (d.status || "").toString().toLowerCase().includes("active")
  ).length;

  const inactiveCount = devices.filter((d) =>
    (d.status || "").toString().toLowerCase().includes("inactive")
  ).length;

  return (
    <div className="w-full px-8 py-8">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900">
            Quản lý Thiết bị
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <SummaryCard
          title="Total Devices"
          value={totalDevices}
          icon={
            <svg
              className="w-6 h-6 text-red-500"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <rect x="3" y="4" width="18" height="14" rx="2" ry="2"></rect>
            </svg>
          }
        />
        <SummaryCard
          title="Active"
          value={activeCount}
          icon={
            <svg
              className="w-6 h-6 text-green-500"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path d="M21 12v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <path d="M7 10l5 5L21 7"></path>
            </svg>
          }
        />

        <SummaryCard
          title="Inactive"
          value={inactiveCount}
          icon={
            <svg
              className="w-6 h-6 text-gray-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <rect x="3" y="4" width="18" height="14" rx="2" ry="2"></rect>
            </svg>
          }
        />
      </div>

      <div className="bg-white rounded-lg overflow-hidden shadow">
        <div className="p-6">
          <div className="overflow-x-auto w-full">
            <table className="min-w-full">
              <thead className="">
                <tr className="border-b">
                  <th className="text-left text-md font-semibold text-gray-500 pb-3 px-4">
                    ID
                  </th>
                  <th className="text-left text-md font-semibold text-gray-500 pb-3 px-4">
                    Tên thiết bị
                  </th>
                  <th className="text-left text-md font-semibold text-gray-500 pb-3 px-4">
                    Dịch vụ
                  </th>
                  <th className="text-left text-md font-semibold text-gray-500 pb-3 px-4">
                    Trạng thái
                  </th>
                  <th className="text-right text-md font-semibold text-gray-500 pb-3 px-4">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-500">
                      Đang tải...
                    </td>
                  </tr>
                ) : !devices.length ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-500">
                      Không tìm thấy thiết bị.
                    </td>
                  </tr>
                ) : (
                  devices.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b last:border-b-0 hover:bg-red-50 transition-colors duration-150"
                    >
                      <td className="p-4 text-sm text-gray-600">{item.id}</td>
                      <td className="p-4 text-sm font-semibold text-gray-800">
                        {item.name}
                      </td>
                      <td className="p-4 text-sm text-gray-600 max-w-[420px]">
                        {Array.isArray(item.services) &&
                        item.services.length > 0
                          ? item.services.map((s) => s.name).join(", ")
                          : "-"}
                      </td>
                      <td className="p-4 text-xs font-semibold text-gray-800">
                        {item.status === "online" && (
                          <span className="bg-green-50 text-green-700 px-2 py-1 rounded">
                            Online
                          </span>
                        )}
                        {item.status === "offline" && (
                          <span className="bg-red-50 text-red-700 px-2 py-1 rounded">
                            Offline
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <IconButton
                            variant="outline"
                            to={`/device/edit/${item.id}`}
                            title="Sửa"
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            variant="danger"
                            onClick={() => handleDelete(item.id)}
                            title="Xóa"
                          >
                            <TrashIcon className="w-4 h-4 text-white" />
                          </IconButton>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination footer */}
        <div className="px-6 py-4 bg-gray-50 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Trang {pagination.current_page} trên {pagination.last_page} | Hiển
            thị {pagination.from}-{pagination.to} trong tổng số{" "}
            {pagination.total} thiết bị
          </div>
          <div className="flex items-center gap-2">
            <PaginationButton
              label="Trước"
              disabled={pagination.current_page <= 1}
              onClick={() => handlePageChange(pagination.current_page - 1)}
            />
            {getPageNumbers().map((num) => (
              <PaginationButton
                key={num}
                label={String(num)}
                active={pagination.current_page === num}
                onClick={() => handlePageChange(num)}
              />
            ))}
            <PaginationButton
              label="Tiếp"
              disabled={pagination.current_page >= pagination.last_page}
              onClick={() => handlePageChange(pagination.current_page + 1)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeviceManagement;
