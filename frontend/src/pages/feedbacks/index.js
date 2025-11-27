import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import FeedbackService from "../../services/feedbackService";
import ServiceService from "../../services/serviceService";
import { toast } from "react-toastify";
import DeviceService from "../../services/deviceService";

function formatDate(dt) {
  if (!dt) return "";
  const d = new Date(dt);
  return `${d.toLocaleTimeString("vi-VN")} ${d.getDate()}/${
    d.getMonth() + 1
  }/${d.getFullYear()}`;
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

const SummaryCard = ({ title, value, today, icon, bg = "bg-white" }) => (
  <div className={`flex-1 ${bg} rounded-lg p-4 shadow-sm border`}>
    <div className="flex items-center justify-between">
      <div>
        <div className="text-sm text-gray-500">{title}</div>
        {typeof today === "number" && (
          <div className="text-2xl font-bold text-gray-900 mt-2">{today}</div>
        )}
        <div className="mt-1 text-xs text-gray-500">
          Tất cả: <span className="font-semibold">{value}</span>
        </div>
      </div>
      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
        {icon}
      </div>
    </div>
  </div>
);

const FeedbackManagement = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [devices, setDevices] = useState([]);
  const [value, setValue] = useState([]);
  const [quickview, setQuickview] = useState({
    total: 0,
    totaltoday: 0,
    positive: 0,
    positivetoday: 0,
    negative: 0,
    negativetoday: 0,
    neutral: 0,
    neutraltoday: 0,
  });
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
    from: 0,
    to: 0,
  });

  // filters
  const [serviceId, setServiceId] = useState("");
  const [deviceId, setDeviceId] = useState("");

  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sort, setSort] = useState("desc");

  const fetchServices = async () => {
    try {
      const res = await ServiceService.list();
      setServices(res.services || []);
    } catch (err) {
      setServices([]);
      toast.error("Lỗi khi tải danh sách dịch vụ", { autoClose: 500 });
    }
  };

  const fetchDevices = async () => {
    try {
      const res = await DeviceService.list();
      setDevices(res.devices || []);
    } catch (err) {
      setDevices([]);
      toast.error("Lỗi khi tải danh sách thiết bị", { autoClose: 500 });
    }
  };
  const fetchFeedbacks = async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        device_id: deviceId,
        service_id: serviceId,
        date_from: dateFrom,
        date_to: dateTo,
        sort,
        value,
      };
      const response = await FeedbackService.index(page, params);
      // console.log("feedback: ", response);
      const data = response.feedback;
      setFeedbacks(data?.data || []);
      setPagination({
        current_page: data?.current_page || 1,
        last_page: data?.last_page || 1,
        per_page: data?.per_page || 10,
        total: data?.total || 0,
        from: data?.from || 0,
        to: data?.to || 0,
      });

      if (response.quickview) {
        setQuickview({
          total: Number(response.quickview.total ?? 0),
          totaltoday: Number(response.quickview.totaltoday ?? 0),
          positive: Number(response.quickview.positive ?? 0),
          positivetoday: Number(response.quickview.positivetoday ?? 0),
          negative: Number(response.quickview.negative ?? 0),
          negativetoday: Number(response.quickview.negativetoday ?? 0),
          neutral: Number(response.quickview.neutral ?? 0),
          neutraltoday: Number(response.quickview.neutraltoday ?? 0),
        });
      }
    } catch (err) {
      setFeedbacks([]);
      setPagination({
        current_page: 1,
        last_page: 1,
        per_page: 10,
        total: 0,
        from: 0,
        to: 0,
      });
      const errorMessage =
        err.response?.data?.message || "Lỗi khi tải feedback";
      toast.error(errorMessage, { autoClose: 500 });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchServices();
    fetchDevices();

    fetchFeedbacks(1);
  }, []);

  useEffect(() => {
    fetchFeedbacks(1);
  }, [deviceId, serviceId, dateFrom, dateTo, sort, value]);

  const handlePageChange = (newPage) => {
    if (
      newPage >= 1 &&
      newPage <= (pagination.last_page || 1) &&
      newPage !== pagination.current_page
    ) {
      fetchFeedbacks(newPage);
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

  const handleExport = async () => {
    try {
      const params = {
        device_id: deviceId,
        service_id: serviceId,
        date_from: dateFrom,
        date_to: dateTo,
        sort,
        value,
      };
      const response = await FeedbackService.export(params);

      // If the service returns a blob (axios), create download
      const blob = new Blob([response.data || response], {
        type: "application/vnd.ms-excel",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "feedbacks.xls");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      toast.error("Lỗi khi xuất Excel", { autoClose: 500 });
    }
  };

  return (
    <div className="w-full px-8 py-8">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900">
            Quản lý Đánh giá
          </h2>
        </div>

        <button
          onClick={handleExport}
          className="bg-[#00afb9] hover:bg-[#0081a7] text-white font-bold py-2 px-4 rounded flex items-center"
        >
          <span className="ml-2">Xuất Excel</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <SummaryCard
          title="Tổng hợp"
          value={quickview.total}
          today={quickview.totaltoday}
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
          title="Rất hài lòng - hài lòng"
          value={quickview.positive}
          today={quickview.positivetoday}
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
          title="Bình thường"
          value={quickview.neutral}
          today={quickview.neutraltoday}
          icon={
            <svg
              className="w-6 h-6 text-blue-500"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <circle cx="12" cy="12" r="9"></circle>
            </svg>
          }
        />
        <SummaryCard
          title="Không hài lòng"
          value={quickview.negative}
          today={quickview.negativetoday}
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
        <div className="p-6 border-b">
          <div className="flex flex-wrap gap-3 items-center">
            <select
              className="px-3 py-2 rounded border border-gray-200 bg-white text-gray-700 min-w-[180px]"
              value={serviceId}
              onChange={(e) => setServiceId(e.target.value)}
            >
              <option value="">-- Tất cả dịch vụ --</option>
              {services.map((svc) => (
                <option key={svc.id} value={svc.id}>
                  {/* {svc.name} */}
                  {svc.name} {svc.deleted_at ? "(Đã xoá)" : ""}
                </option>
              ))}
            </select>

            <select
              className="px-3 py-2 rounded border border-gray-200 bg-white text-gray-700 min-w-[180px]"
              value={deviceId}
              onChange={(e) => setDeviceId(e.target.value)}
            >
              <option value="">-- Tất cả thiết bị --</option>
              {devices.map((svc) => (
                <option key={svc.id} value={svc.id}>
                  {/* {svc.name} */}
                  {svc.name} {svc.deleted_at ? "(Đã xoá)" : ""}
                </option>
              ))}
            </select>

            <select
              className="px-3 py-2 rounded border border-gray-200 bg-white text-gray-700 min-w-[180px]"
              value={value}
              onChange={(e) => setValue(e.target.value)}
            >
              <option value="">-- Tất cả đánh giá --</option>
              <option value={4}>Rất hài lòng</option>
              <option value={3}>Hài lòng</option>
              <option value={2}>Bình thường</option>
              <option value={1}>Không hài lòng</option>
            </select>

            <input
              type="date"
              className="px-3 py-2 rounded border border-gray-200 bg-white text-gray-700"
              placeholder="Từ ngày"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
            <input
              type="date"
              className="px-3 py-2 rounded border border-gray-200 bg-white text-gray-700"
              placeholder="Đến ngày"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
            <select
              className="px-3 py-2 rounded border border-gray-200 bg-white text-gray-700"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="desc">Mới nhất</option>
              <option value="oldest">Cũ nhất</option>
            </select>
            {/* 
            <button
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
              onClick={() => fetchFeedbacks(1)}
            >
              Lọc
            </button>
            <div className="flex-1" /> */}
          </div>
        </div>

        {/* Table */}
        <div className="p-6">
          <div className="overflow-x-auto w-full">
            <table className="min-w-full">
              <thead className="">
                <tr className="border-b">
                  <th className="text-left text-md font-semibold text-gray-500 pb-3 px-4">
                    Thiết bị
                  </th>
                  <th className="text-left text-md font-semibold text-gray-500 pb-3 px-4">
                    Dịch vụ
                  </th>
                  <th className="text-center text-md font-semibold text-gray-500 pb-3 px-4">
                    Đánh giá
                  </th>
                  <th className="text-center text-md font-semibold text-gray-500 pb-3 px-4">
                    Số thứ tự
                  </th>
                  <th className="text-center text-md font-semibold text-gray-500 pb-3 px-4">
                    Ngày gửi
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-500">
                      Đang tải...
                    </td>
                  </tr>
                ) : !feedbacks.length ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-500">
                      Không tìm thấy feedback.
                    </td>
                  </tr>
                ) : (
                  feedbacks.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b last:border-b-0 hover:bg-red-50 transition-colors duration-150"
                    >
                      <td className="p-4 text-sm text-gray-600">
                        {item.ticket?.device_with_trashed?.name || "-"}
                      </td>
                      <td className="p-4 text-sm text-gray-600">
                        {item.ticket?.service_with_trashed?.name || "-"}
                      </td>
                      <td className="p-4 text-center text-sm font-semibold text-gray-800">
                        {item.value === 1 && (
                          <span className="bg-red-100 text-red-700 px-2 py-1 rounded">
                            Không hài lòng
                          </span>
                        )}
                        {item.value === 2 && (
                          <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
                            Bình thường
                          </span>
                        )}
                        {item.value === 3 && (
                          <span className="bg-green-100 text-green-700 px-2 py-1 rounded">
                            Hài lòng
                          </span>
                        )}
                        {item.value === 4 && (
                          <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded">
                            Rất hài lòng
                          </span>
                        )}
                        {!item.value && "-"}
                      </td>
                      <td className="p-4 text-sm text-center text-gray-600">
                        {item.ticket?.ticket_number || "-"}
                      </td>
                      <td className="p-4 text-sm text-gray-600 text-center">
                        {formatDate(item.created_at)}
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
            {pagination.total} feedback
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

export default FeedbackManagement;
