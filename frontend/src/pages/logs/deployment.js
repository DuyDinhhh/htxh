import React, { useEffect, useMemo, useState } from "react";
import ActivityLogService from "../../services/activityLogService.js";
import { toast } from "react-toastify";

function formatDate(dt) {
  if (!dt) return "-";
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
  const base =
    "px-3 py-1 text-sm font-medium rounded-md transition inline-flex items-center justify-center";
  if (disabled)
    return (
      <button
        disabled
        className={`${base} bg-white border text-gray-300 cursor-not-allowed`}
      >
        {label}
      </button>
    );
  if (active)
    return (
      <button className={`${base} bg-red-600 text-white border`}>
        {label}
      </button>
    );
  return (
    <button
      className={`${base} bg-white border hover:bg-gray-50`}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

const Badge = ({ children, color = "gray" }) => (
  <span
    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-${color}-50 text-${color}-700`}
  >
    {children}
  </span>
);

const RowJSON = ({ json }) => {
  const [open, setOpen] = useState(false);
  const pretty = useMemo(() => {
    try {
      if (typeof json === "string")
        return JSON.stringify(JSON.parse(json), null, 2);
      return JSON.stringify(json ?? {}, null, 2);
    } catch {
      return typeof json === "string" ? json : JSON.stringify(json ?? {});
    }
  }, [json]);

  return (
    <div className="text-left">
      <button
        className="text-xs text-blue-600 hover:underline"
        onClick={() => setOpen(!open)}
      >
        {open ? "Ẩn chi tiết" : "Xem chi tiết"}
      </button>
      {open && (
        <pre className="mt-2 max-h-72 overflow-auto bg-gray-50 p-3 rounded border text-xs">
          {pretty}
        </pre>
      )}
    </div>
  );
};

const DeploymentLog = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // filters
  const [logName, setLogName] = useState("");
  const [event, setEvent] = useState("");

  const [causerType, setCauserType] = useState("");
  const [causerId, setCauserId] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("desc");

  // pagination
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0,
    from: 0,
    to: 0,
  });

  const buildParams = () => ({
    log_name: logName || undefined,
    event: event || undefined,

    causer_type: causerType || undefined,
    causer_id: causerId || undefined,
    date_from: dateFrom || undefined,
    date_to: dateTo || undefined,
    q: q || undefined,
    sort,

    per_page: pagination.per_page,
  });

  const fetchLogs = async (page = 1) => {
    setLoading(true);
    try {
      const res = await ActivityLogService.deployment(page, buildParams());
      const payload = res?.data ?? res;
      const items = payload?.data ?? [];
      setLogs(items);
      setPagination({
        current_page: payload?.current_page ?? 1,
        last_page: payload?.last_page ?? 1,
        per_page: payload?.per_page ?? 15,
        total: payload?.total ?? (Array.isArray(items) ? items.length : 0),
        from: payload?.from ?? (items.length ? 1 : 0),
        to: payload?.to ?? items.length ?? 0,
      });
    } catch (e) {
      setLogs([]);
      setPagination((p) => ({
        ...p,
        current_page: 1,
        last_page: 1,
        total: 0,
        from: 0,
        to: 0,
      }));
      console.log(e);
      const msg = e?.response?.data?.message || "Lỗi khi tải Deployment Logs";
      toast.error(msg, { autoClose: 800 });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLogs(1);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => fetchLogs(1), 250);
    return () => clearTimeout(t);
  }, [logName, event, causerType, causerId, dateFrom, dateTo, q, sort]);

  const getPageNumbers = () => {
    const { current_page, last_page } = pagination;
    const max = 5;
    let start = Math.max(1, current_page - Math.floor(max / 2));
    let end = start + max - 1;
    if (end > last_page) {
      end = last_page;
      start = Math.max(1, end - max + 1);
    }
    const arr = [];
    for (let i = start; i <= end; i++) arr.push(i);
    return arr;
  };

  const handlePageChange = (p) => {
    if (
      p >= 1 &&
      p <= (pagination.last_page || 1) &&
      p !== pagination.current_page
    ) {
      fetchLogs(p);
    }
  };

  return (
    <div className="w-full px-8 py-8">
      <div className="flex items-start justify-between mb-6">
        <h2 className="text-3xl font-extrabold text-gray-900">Activity Logs</h2>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow border mb-6">
        <div className="p-4 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
          <input
            className="px-3 py-2 rounded border"
            placeholder="log_name (vd: device, service)"
            value={logName}
            onChange={(e) => setLogName(e.target.value)}
          />
          <select
            className="px-3 py-2 rounded border"
            value={event}
            onChange={(e) => setEvent(e.target.value)}
          >
            <option value="">-- event --</option>
            <option value="receive">receive</option>
            <option value="connect">connect</option>
            <option value="response">response</option>
          </select>

          {/* <input
            className="px-3 py-2 rounded border"
            placeholder="causer_type (FQN)"
            value={causerType}
            onChange={(e) => setCauserType(e.target.value)}
          /> */}
          {/* <input
            className="px-3 py-2 rounded border"
            placeholder="causer_id"
            value={causerId}
            onChange={(e) => setCauserId(e.target.value)}
          /> */}

          <input
            type="date"
            className="px-3 py-2 rounded border"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
          <input
            type="date"
            className="px-3 py-2 rounded border"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />

          <input
            className="px-3 py-2 rounded border md:col-span-2"
            placeholder="Tìm mô tả / properties (q)"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />

          <select
            className="px-3 py-2 rounded border"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="desc">Mới nhất</option>
            <option value="asc">Cũ nhất</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg overflow-hidden shadow">
        <div className="p-6">
          <div className="overflow-x-auto w-full">
            <table className="min-w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left text-sm font-semibold text-gray-500 pb-3 px-4">
                    #
                  </th>
                  <th className="text-left text-sm font-semibold text-gray-500 pb-3 px-4">
                    Topic
                  </th>
                  <th className="text-left text-sm font-semibold text-gray-500 pb-3 px-4">
                    Log name
                  </th>
                  <th className="text-left text-sm font-semibold text-gray-500 pb-3 px-4">
                    Event
                  </th>

                  {/* <th className="text-left text-sm font-semibold text-gray-500 pb-3 px-4">
                    Causer
                  </th> */}
                  <th className="text-left text-sm font-semibold text-gray-500 pb-3 px-4">
                    Thời gian
                  </th>
                  <th className="text-left text-sm font-semibold text-gray-500 pb-3 px-4">
                    Chi tiết
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-gray-500">
                      Đang tải...
                    </td>
                  </tr>
                ) : !logs.length ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-gray-500">
                      Không có log.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr
                      key={log.id}
                      className="border-b last:border-b-0 hover:bg-red-50 transition-colors duration-150"
                    >
                      <td className="p-4 text-sm text-gray-600">{log.id}</td>
                      <td className="p-4 text-sm text-gray-800">
                        {log.description || "-"}
                      </td>
                      <td className="p-4 text-sm text-gray-600">
                        <Badge color="gray">{log.log_name || "default"}</Badge>
                      </td>
                      <td className="p-4 text-sm text-gray-600">
                        {log.event ? (
                          <Badge color="blue">{log.event}</Badge>
                        ) : (
                          <Badge>-</Badge>
                        )}
                      </td>

                      <td className="p-4 text-xs text-gray-600">
                        {formatDate(log.created_at)}
                      </td>
                      <td className="p-4">
                        <RowJSON json={log.properties} />
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
            thị {pagination.from}-{pagination.to} / {pagination.total} log
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

export default DeploymentLog;
