import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import StaffService from "../../services/staffService";

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

const SummaryCard = ({ title, value, icon, bg = "bg-white" }) => (
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

const StaffManagement = () => {
  const perPage = 8;
  const [staffs, setStaffs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: perPage,
    total: 0,
    from: 0,
    to: 0,
  });

  const [search, setSearch] = useState("");
  // const [sort, setSort] = useState("desc");
  const [sort] = useState("desc");

  const fetchStaffs = async (page = 1) => {
    setLoading(true);
    try {
      const res = await StaffService.index(page);
      const payload = res?.data ?? res;
      const data = payload?.staff ?? payload?.staffs ?? payload;
      const list = data?.data ?? [];
      setStaffs(list);

      setPagination({
        current_page: data?.current_page || 1,
        last_page: data?.last_page || 1,
        per_page: data?.per_page || perPage,
        total: data?.total || 0,
        from: data?.from || 0,
        to: data?.to || 0,
      });
    } catch (err) {
      setStaffs([]);
      setPagination({
        current_page: 1,
        last_page: 1,
        per_page: perPage,
        total: 0,
        from: 0,
        to: 0,
      });

      const msg = err?.response?.data?.message || "Lỗi khi tải nhân viên";
      toast.error(msg, { autoClose: 800 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffs(1);
  }, []);

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
    for (let i = start; i <= end; i++) pageNumbers.push(i);
    return pageNumbers;
  };

  const handlePageChange = (newPage) => {
    if (
      newPage >= 1 &&
      newPage <= (pagination.last_page || 1) &&
      newPage !== pagination.current_page
    ) {
      fetchStaffs(newPage);
    }
  };

  const filteredStaffs = useMemo(() => {
    let list = [...staffs];

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((s) => {
        const name = (s.name || "").toLowerCase();
        const username = (s.username || "").toLowerCase();
        return name.includes(q) || username.includes(q);
      });
    }

    if (sort === "desc") {
      list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } else {
      list.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    }

    return list;
  }, [staffs, search, sort]);

  const handleDelete = async (staff) => {
    const ok = window.confirm(
      `Xoá nhân viên "${staff?.name || staff?.username || ""}"?`,
    );
    if (!ok) return;

    try {
      await StaffService.destroy(staff.id);
      toast.success("Đã xoá nhân viên", { autoClose: 800 });
      fetchStaffs(pagination.current_page || 1);
    } catch (err) {
      const msg = err?.response?.data?.message || "Lỗi khi xoá nhân viên";
      toast.error(msg, { autoClose: 1000 });
    }
  };

  return (
    <div className="w-full px-8 py-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900">
            Quản lý Nhân viên
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/staff/create"
            className="bg-[#00afb9] hover:bg-[#0081a7] text-white font-bold py-2 px-4 rounded flex items-center"
          >
            Thêm nhân viên
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <SummaryCard
          title="Tổng nhân viên"
          value={pagination.total}
          icon={
            <svg
              className="w-6 h-6 text-red-500"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          }
        />
      </div>

      <div className="bg-white rounded-lg overflow-hidden shadow">
        <div className="p-6 border-b">
          <div className="flex flex-wrap gap-3 items-center">
            <input
              className="px-3 py-2 rounded border border-gray-200 bg-white text-gray-700 min-w-[280px]"
              placeholder="Tìm theo tên hoặc tên đăng nhập..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Table */}
        <div className="p-6">
          <div className="overflow-x-auto w-full">
            <table className="min-w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left text-md font-semibold text-gray-500 pb-3 px-4">
                    Tên nhân viên
                  </th>
                  <th className="text-left text-md font-semibold text-gray-500 pb-3 px-4">
                    Tên đăng nhập
                  </th>
                  <th className="text-center text-md font-semibold text-gray-500 pb-3 px-4">
                    Trạng thái
                  </th>
                  <th className="text-center text-md font-semibold text-gray-500 pb-3 px-4">
                    Ngày cập nhật
                  </th>
                  <th className="text-center text-md font-semibold text-gray-500 pb-3 px-4">
                    Thao tác
                  </th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-gray-500">
                      Đang tải...
                    </td>
                  </tr>
                ) : !filteredStaffs.length ? (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-gray-500">
                      Không tìm thấy nhân viên.
                    </td>
                  </tr>
                ) : (
                  filteredStaffs.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b last:border-b-0 hover:bg-red-50 transition-colors duration-150"
                    >
                      <td className="p-4 text-sm text-gray-600">
                        {item.name || "-"}
                        {item.deleted_at ? (
                          <span className="ml-2 text-xs text-red-600">
                            (Đã xoá)
                          </span>
                        ) : null}
                      </td>
                      <td className="p-4 text-sm text-gray-600">
                        {item.username || "-"}
                      </td>

                      <td className="p-4 text-center text-xs font-semibold text-gray-800">
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
                      <td className="p-4 text-sm text-gray-600 text-center">
                        {formatDate(item.updated_at)}
                      </td>
                      <td className="p-4 text-sm text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Link
                            to={`/staff/edit/${item.id}`}
                            className="px-3 py-1 rounded border bg-white hover:bg-blue-50 text-blue-600 border-blue-200"
                          >
                            Sửa
                          </Link>
                          <Link
                            to={`/staff/show/${item.id}`}
                            className="px-3 py-1 rounded border bg-white hover:bg-yellow-50 text-yellow-600 border-yellow-200"
                          >
                            Chi tiết
                          </Link>
                          <button
                            onClick={() => handleDelete(item)}
                            className="px-3 py-1 rounded border bg-white hover:bg-red-50 text-red-600 border-red-200"
                          >
                            Xoá
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 bg-gray-50 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Trang {pagination.current_page} trên {pagination.last_page} | Hiển
            thị {pagination.from}-{pagination.to} trong tổng số{" "}
            {pagination.total} nhân viên
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

export default StaffManagement;
