import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import FeedbackService from "../../services/feedbackService";
import StaffService from "../../services/staffService";
import { toast } from "react-toastify";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// KPI card for feedback stats.
const SummaryCard = ({
  title,
  monthValue,
  allTimeValue,
  imageSrc,
  color = "text-gray-900",
  trend,
}) => (
  <div className="flex-1 bg-white rounded-lg p-4 shadow-sm border">
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <div className="text-base font-bold text-gray-500">{title}</div>
        <div className={`text-2xl font-bold ${color} mt-2`}>{monthValue}</div>
        <div className="mt-1 text-xs text-gray-500">
          Tất cả: <span className="font-semibold">{allTimeValue}</span>
        </div>
        {trend !== undefined && (
          <div className="mt-2 flex items-center gap-1">
            {trend >= 0 ? (
              <svg
                className="w-4 h-4 text-green-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg
                className="w-4 h-4 text-red-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            <span
              className={`text-xs font-semibold ${
                trend >= 0 ? "text-green-500" : "text-red-500"
              }`}
            >
              {Math.abs(trend)}%
            </span>
            <span className="text-xs text-gray-500">vs tháng trước</span>
          </div>
        )}
      </div>
      <div className="w-12 h-12 flex items-center justify-center">
        <img src={imageSrc} alt={title} className="w-12 h-12 object-contain" />
      </div>
    </div>
  </div>
);

// Staff feedback analytics page logic (fetch stats, chart data, helpers).
const StaffFeedbackDetail = () => {
  const { id } = useParams();
  const [staff, setStaff] = useState(null);
  const [loading, setLoading] = useState(true);

  const [pieMonth, setPieMonth] = useState(
    new Date().toISOString().slice(0, 7),
  );

  const [barMonth1, setBarMonth1] = useState(
    new Date().toISOString().slice(0, 7),
  );

  const [barMonth2, setBarMonth2] = useState(() => {
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    return lastMonth.toISOString().slice(0, 7);
  });

  const [pieData, setPieData] = useState([]);
  const [barData, setBarData] = useState([]);
  const [monthlyStats, setMonthlyStats] = useState({
    total: 0,
    very_satisfied: 0,
    satisfied: 0,
    neutral: 0,
    negative: 0,
    total_all_time: 0,
    very_satisfied_all_time: 0,
    satisfied_all_time: 0,
    neutral_all_time: 0,
    negative_all_time: 0,
    trends: {
      very_satisfied: 0,
      satisfied: 0,
      neutral: 0,
      negative: 0,
    },
  });

  // Load staff info on mount or id change.
  useEffect(() => {
    fetchStaffInfo();
  }, [id]);

  // Load pie chart data when id or month changes.
  useEffect(() => {
    if (id) {
      fetchPieData();
    }
  }, [id, pieMonth]);

  // Load bar chart data when id or compared months change.
  useEffect(() => {
    if (id) {
      fetchBarData();
    }
  }, [id, barMonth1, barMonth2]);

  // Fetch staff info from API.
  const fetchStaffInfo = async () => {
    setLoading(true);
    try {
      const staffRes = await StaffService.show(id);
      setStaff(staffRes.data?.staff || staffRes.staff);
    } catch (err) {
      toast.error("Lỗi khi tải thông tin nhân viên", { autoClose: 800 });
    } finally {
      setLoading(false);
    }
  };

  // Fetch monthly feedback stats for pie chart.
  const fetchPieData = async () => {
    try {
      const feedbackRes = await FeedbackService.getMonthlyStats(id, pieMonth);

      setMonthlyStats({
        total: feedbackRes.total || 0,
        very_satisfied: feedbackRes.very_satisfied || 0,
        satisfied: feedbackRes.satisfied || 0,
        neutral: feedbackRes.neutral || 0,
        negative: feedbackRes.negative || 0,
        total_all_time: feedbackRes.total_all_time || 0,
        very_satisfied_all_time: feedbackRes.very_satisfied_all_time || 0,
        satisfied_all_time: feedbackRes.satisfied_all_time || 0,
        neutral_all_time: feedbackRes.neutral_all_time || 0,
        negative_all_time: feedbackRes.negative_all_time || 0,
        trends: feedbackRes.trends || {
          very_satisfied: 0,
          satisfied: 0,
          neutral: 0,
          negative: 0,
        },
      });

      setPieData([
        {
          name: "Rất hài lòng",
          value: feedbackRes.very_satisfied || 0,
          color: "#3cb051",
        },
        {
          name: "Hài lòng",
          value: feedbackRes.satisfied || 0,
          color: "#8ec962",
        },
        {
          name: "Bình thường",
          value: feedbackRes.neutral || 0,
          color: "#faaf42",
        },
        {
          name: "Không hài lòng",
          value: feedbackRes.negative || 0,
          color: "#e1242a",
        },
      ]);
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch feedback stats for two months for bar chart.
  const fetchBarData = async () => {
    try {
      const [month1Data, month2Data] = await Promise.all([
        FeedbackService.getMonthlyStats(id, barMonth1),
        FeedbackService.getMonthlyStats(id, barMonth2),
      ]);

      setBarData([
        {
          category: formatMonthLabel(barMonth1),
          "Rất hài lòng": month1Data.very_satisfied || 0,
          "Hài lòng": month1Data.satisfied || 0,
          "Bình thường": month1Data.neutral || 0,
          "Không hài lòng": month1Data.negative || 0,
        },
        {
          category: formatMonthLabel(barMonth2),
          "Rất hài lòng": month2Data.very_satisfied || 0,
          "Hài lòng": month2Data.satisfied || 0,
          "Bình thường": month2Data.neutral || 0,
          "Không hài lòng": month2Data.negative || 0,
        },
      ]);
    } catch (err) {
      console.error(err);
    }
  };

  // Format YYYY-MM to 'Tháng MM/YYYY'.
  const formatMonthLabel = (monthStr) => {
    const [year, month] = monthStr.split("-");
    return `Tháng ${month}/${year}`;
  };

  // Custom Tooltips
  // Custom tooltip for bar chart.
  const CustomBarTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4">
          <p className="font-semibold text-gray-800 mb-2">{label}</p>
          <div className="space-y-1">
            {payload.map((entry, index) => (
              <div
                key={index}
                className="flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-sm text-gray-600">{entry.name}:</span>
                </div>
                <span className="text-sm font-semibold text-gray-800">
                  {entry.value} đánh giá
                </span>
              </div>
            ))}
          </div>
          <div className="mt-2 pt-2 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Tổng: </span>
              <span className="text-sm font-bold text-blue-600">
                {payload.reduce((sum, entry) => sum + entry.value, 0)} đánh giá
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom tooltip for pie chart.
  const CustomPieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const total = pieData.reduce((sum, item) => sum + item.value, 0);
      const percentage =
        total > 0 ? ((data.value / total) * 100).toFixed(1) : 0;

      return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: data.payload.color }}
            />
            <p className="font-semibold text-gray-800">{data.name}</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-gray-600">Số lượng:</span>
              <span className="text-sm font-semibold text-gray-800">
                {data.value} đánh giá
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-gray-600">Tỷ lệ:</span>
              <span className="text-sm font-semibold text-blue-600">
                {percentage}%
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Render percentage label for pie chart.
  const renderCustomLabel = (entry) => {
    const total = pieData.reduce((sum, item) => sum + item.value, 0);
    const percentage = total > 0 ? ((entry.value / total) * 100).toFixed(1) : 0;
    return `${percentage}%`;
  };

  if (loading) {
    return (
      <div className="w-full px-8 py-8">
        <div className="text-center py-12 text-gray-500">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p className="mt-4">Đang tải... </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-8 py-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900">
            Phân tích Đánh giá - {staff?.name}
          </h2>
          <nav className="flex items-center text-sm text-gray-500 mt-2">
            <Link to="/feedbacks" className="hover:text-gray-700">
              Phân tích Đánh giá
            </Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900">{staff?.name}</span>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/staffs"
            className="bg-[#00afb9] hover:bg-[#0081a7] text-white font-bold py-2 px-4 rounded flex items-center"
          >
            Quay lại
          </Link>
        </div>
      </div>

      {/* Summary Cards with Trends */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <SummaryCard
          title="Rất hài lòng"
          monthValue={monthlyStats.very_satisfied}
          allTimeValue={monthlyStats.very_satisfied_all_time}
          trend={monthlyStats.trends.very_satisfied}
          color="text-green-700"
          imageSrc="/assets/img/emotions/rathailong.png"
        />
        <SummaryCard
          title="Hài lòng"
          monthValue={monthlyStats.satisfied}
          allTimeValue={monthlyStats.satisfied_all_time}
          trend={monthlyStats.trends.satisfied}
          color="text-green-600"
          imageSrc="/assets/img/emotions/hailong.png"
        />
        <SummaryCard
          title="Bình thường"
          monthValue={monthlyStats.neutral}
          allTimeValue={monthlyStats.neutral_all_time}
          trend={monthlyStats.trends.neutral}
          color="text-yellow-500"
          imageSrc="/assets/img/emotions/binhthuong.png"
        />
        <SummaryCard
          title="Không hài lòng"
          monthValue={monthlyStats.negative}
          allTimeValue={monthlyStats.negative_all_time}
          trend={monthlyStats.trends.negative}
          color="text-red-500"
          imageSrc="/assets/img/emotions/khonghailong.png"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="bg-white rounded-lg overflow-hidden shadow">
          <div className="p-6 border-b">
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Phân bổ đánh giá theo tháng
            </h3>
            <input
              type="month"
              className="px-3 py-2 rounded border border-gray-200 bg-white text-gray-700"
              value={pieMonth}
              onChange={(e) => setPieMonth(e.target.value)}
            />
          </div>

          <div className="p-6">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomLabel}
                    outerRadius={100}
                    dataKey="value"
                    animationDuration={800}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip />} />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    iconType="circle"
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="bg-white rounded-lg overflow-hidden shadow">
          <div className="p-6 border-b">
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              So sánh giữa 2 tháng
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="month"
                className="px-3 py-2 rounded border border-gray-200 bg-white text-gray-700"
                value={barMonth1}
                onChange={(e) => setBarMonth1(e.target.value)}
              />
              <input
                type="month"
                className="px-3 py-2 rounded border border-gray-200 bg-white text-gray-700"
                value={barMonth2}
                onChange={(e) => setBarMonth2(e.target.value)}
              />
            </div>
          </div>

          <div className="p-6">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={barData}
                  margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
                >
                  <defs>
                    <linearGradient
                      id="colorVerySatisfied"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#3cb051" stopOpacity={1} />
                      <stop
                        offset="100%"
                        stopColor="#3cb051"
                        stopOpacity={0.7}
                      />
                    </linearGradient>
                    <linearGradient
                      id="colorSatisfied"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#8ec962" stopOpacity={1} />
                      <stop
                        offset="100%"
                        stopColor="#8ec962"
                        stopOpacity={0.7}
                      />
                    </linearGradient>
                    <linearGradient
                      id="colorNeutral"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#faaf42" stopOpacity={1} />
                      <stop
                        offset="100%"
                        stopColor="#faaf42"
                        stopOpacity={0.7}
                      />
                    </linearGradient>
                    <linearGradient
                      id="colorNegative"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#ef4444" stopOpacity={1} />
                      <stop
                        offset="100%"
                        stopColor="#ef4444"
                        stopOpacity={0.7}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#E5E7EB"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="category"
                    tick={{ fill: "#6B7280", fontSize: 12, fontWeight: 500 }}
                    axisLine={{ stroke: "#E5E7EB" }}
                    tickLine={{ stroke: "#E5E7EB" }}
                  />
                  <YAxis
                    tick={{ fill: "#6B7280", fontSize: 12, fontWeight: 500 }}
                    axisLine={{ stroke: "#E5E7EB" }}
                    tickLine={{ stroke: "#E5E7EB" }}
                  />
                  <Tooltip
                    content={<CustomBarTooltip />}
                    cursor={{ fill: "rgba(59, 130, 246, 0.05)" }}
                  />
                  <Legend />
                  <Bar
                    dataKey="Rất hài lòng"
                    fill="url(#colorVerySatisfied)"
                    radius={[8, 8, 0, 0]}
                    maxBarSize={60}
                  />
                  <Bar
                    dataKey="Hài lòng"
                    fill="url(#colorSatisfied)"
                    radius={[8, 8, 0, 0]}
                    maxBarSize={60}
                  />
                  <Bar
                    dataKey="Bình thường"
                    fill="url(#colorNeutral)"
                    radius={[8, 8, 0, 0]}
                    maxBarSize={60}
                  />
                  <Bar
                    dataKey="Không hài lòng"
                    fill="url(#colorNegative)"
                    radius={[8, 8, 0, 0]}
                    maxBarSize={60}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffFeedbackDetail;
