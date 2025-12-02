import React, { useEffect, useState } from "react";
import TicketService from "../../services/ticketService";
import ServiceService from "../../services/serviceService";
import DeviceService from "../../services/deviceService";
import ConfigService from "../../services/configService";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

function StatusBadge({ status }) {
  const s = (status || "").toString().toLowerCase();
  const base =
    "inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold";
  if (s.includes("called")) {
    return <span className={`${base} bg-green-50 text-green-700`}>Đã gọi</span>;
  }
  if (s.includes("waiting")) {
    return (
      <span className={`${base} bg-yellow-50 text-yellow-700`}>Đang chờ</span>
    );
  }
  if (s.includes("processing")) {
    return (
      <span className={`${base} bg-blue-50 text-blue-700`}>Đang xử lí</span>
    );
  }
  if (s.includes("skipped")) {
    return <span className={`${base} bg-red-50 text-red-700`}>Bỏ qua</span>;
  }
  return <span className={`${base} bg-gray-50 text-gray-700`}>-</span>;
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

function formatDate(dt) {
  if (!dt) return "";
  const d = new Date(dt);
  return `${d.toLocaleTimeString("vi-VN")} ${d.getDate()}/${
    d.getMonth() + 1
  }/${d.getFullYear()}`;
}

const TicketManagement = () => {
  const [tickets, setTickets] = useState([]);
  const [services, setServices] = useState([]);
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");

  const [quickview, setQuickview] = useState({
    total: 0,
    totaltoday: 0,
    waiting: 0,
    waitingtoday: 0,
    called: 0,
    calledtoday: 0,
    skipped: 0,
    skippedtoday: 0,
  });

  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
    from: 0,
    to: 0,
  });

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

  const handleReset = async () => {
    if (!window.confirm("Bạn có chắc chắn muốn reset số?")) return;
    try {
      await ConfigService.reset();
      toast.success("Reset số thành công!", { autoClose: 800 });
      fetchServices(pagination.current_page);
    } catch (err) {
      toast.error("Lỗi khi reset số. Vui lòng thử lại.");
    }
  };

  const fetchTickets = async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        service_id: serviceId,
        device_id: deviceId,
        date_from: dateFrom,
        date_to: dateTo,
        sort,
        status,
      };

      const response = await TicketService.index(page, params);
      // console.log("Ticket: ", response);
      const data = response.ticket;
      const items = data?.data || data || [];

      setTickets(items);
      setPagination({
        current_page: data?.current_page || 1,
        last_page: data?.last_page || 1,
        per_page: data?.per_page || 10,
        total: data?.total || (Array.isArray(items) ? items.length : 0),
        from: data?.from || (items.length ? 1 : 0),
        to: data?.to || items.length || 0,
      });

      if (response.quickview) {
        const q = response.quickview;
        setQuickview({
          total: Number(q.total ?? 0),
          totaltoday: Number(q.totaltoday ?? 0),
          waiting: Number(q.waiting ?? 0),
          waitingtoday: Number(q.waitingtoday ?? 0),
          called: Number(q.called ?? 0),
          calledtoday: Number(q.calledtoday ?? 0),
          skipped: Number(q.skipped ?? 0),
          skippedtoday: Number(q.skippedtoday ?? 0),
        });
      }
    } catch (err) {
      setTickets([]);
      setPagination({
        current_page: 1,
        last_page: 1,
        per_page: 10,
        total: 0,
        from: 0,
        to: 0,
      });
      const errorMessage = err.response?.data?.message || "Lỗi khi tải ticket";
      toast.error(errorMessage, { autoClose: 500 });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchServices();
    fetchDevices();
    fetchTickets(1);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTickets(1);
    }, 200);

    return () => clearTimeout(timer);
  }, [serviceId, deviceId, dateFrom, dateTo, sort, status]);
  const handlePageChange = (newPage) => {
    if (
      newPage >= 1 &&
      newPage <= (pagination.last_page || 1) &&
      newPage !== pagination.current_page
    ) {
      fetchTickets(newPage);
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
        service_id: serviceId,
        device_id: deviceId,
        date_from: dateFrom,
        date_to: dateTo,
        sort,
        status,
      };
      const response = await TicketService.export(params);

      const blob = new Blob([response.data || response], {
        type: "application/vnd.ms-excel",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "ticket.xls");
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
            Quản lý Lấy số
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="bg-[#ca6702] hover:bg-[#ca6702] text-white font-bold py-2 px-4 rounded flex items-center"
          >
            <span className="ml-2">Reset số</span>
          </button>
          <button
            onClick={handleExport}
            className="bg-[#00afb9] hover:bg-[#0081a7] text-white font-bold py-2 px-4 rounded flex items-center"
          >
            <span className="ml-2">Xuất Excel</span>
          </button>
          <Link
            to="/ticket/create"
            onClick={(e) => {
              e.preventDefault();
              window.open("/ticket/create", "_blank");
            }}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded flex items-center"
          >
            <span className="ml-2">Lấy số</span>
          </Link>
          <Link
            to="/ticket/qr"
            onClick={(e) => {
              e.preventDefault();
              window.open("/ticket/qr", "_blank");
            }}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded flex items-center"
          >
            <span className="ml-2">Lấy số QR</span>
          </Link>
          <Link
            to="/ticket/queue_display"
            onClick={(e) => {
              e.preventDefault();
              window.open("/ticket/queue_display", "_blank");
            }}
            className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded flex items-center"
          >
            <span className="ml-2">Danh sách</span>
          </Link>
        </div>
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
          title="Đang chờ"
          value={quickview.waiting}
          today={quickview.waitingtoday}
          icon={
            <svg
              className="w-6 h-6 text-yellow-500"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path d="M12 8v4l3 3" />
            </svg>
          }
        />
        <SummaryCard
          title="Đã gọi"
          value={quickview.called}
          today={quickview.calledtoday}
          icon={
            <svg
              className="w-6 h-6 text-green-500"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path d="M21 12v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <path d="M7 10l5 5L21 7" />
            </svg>
          }
        />
        <SummaryCard
          title="Bỏ qua"
          value={quickview.skipped}
          today={quickview.skippedtoday}
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
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">-- Tất cả trạng thái --</option>
              <option value="waiting">Đang chờ</option>
              <option value="called">Đã gọi</option>
              <option value="processing">Đang xử lí</option>
              <option value="skipped">Bỏ qua</option>
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

            {/* <button
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
              onClick={() => fetchTickets(1)}
            >
              Lọc
            </button> */}
            <div className="flex-1" />
          </div>
        </div>

        <div className="p-6">
          <div className="overflow-x-auto w-full">
            <table className="min-w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left text-md font-semibold text-gray-500 pb-3 px-4">
                    Số thứ tự
                  </th>
                  <th className="text-center text-md font-semibold text-gray-500 pb-3 px-4">
                    Thiết bị
                  </th>
                  <th className="text-center text-md font-semibold text-gray-500 pb-3 px-4">
                    Dịch vụ
                  </th>
                  <th className="text-md text-center font-semibold text-gray-500 pb-3 px-4">
                    Trạng thái
                  </th>
                  <th className="text-center text-md font-semibold text-gray-500 pb-3 px-4">
                    Ngày tạo
                  </th>
                  <th className="text-center text-md font-semibold text-gray-500 pb-3 px-4">
                    Ngày cập nhật
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
                ) : !tickets.length ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-500">
                      Không tìm thấy số.
                    </td>
                  </tr>
                ) : (
                  tickets.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b last:border-b-0 hover:bg-red-50 transition-colors duration-150"
                    >
                      <td className="p-4 text-sm text-gray-600">
                        {item.ticket_number}
                      </td>
                      <td className="p-4 text-center text-sm font-semibold text-gray-600">
                        {item.device_with_trashed?.name || "-"}
                      </td>
                      <td className="p-4 text-center text-sm font-semibold text-gray-800 max-w-[420px]">
                        {item.service_with_trashed?.name || "-"}
                      </td>
                      <td className="p-4 text-center">
                        <StatusBadge status={item.status} />
                      </td>
                      <td className="p-4 text-sm text-gray-600 text-center">
                        {formatDate(item.created_at)}
                      </td>
                      <td className="p-4 text-sm text-gray-600 text-center">
                        {item.created_at == item.updated_at
                          ? "-"
                          : formatDate(item.updated_at)}
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
            {pagination.total} số
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

export default TicketManagement;
