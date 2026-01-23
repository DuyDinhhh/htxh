import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import DashboardService from "../services/dashboardService";

const TicketTrendChart = () => {
  const [ticketData, setTicketData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeBar, setActiveBar] = useState(null);

  //call api get data for trending ticket
  useEffect(() => {
    const fetchTicketData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await DashboardService.getTicketsByMonth();
        const data = response;

        const formattedData = data.map((monthData) => {
          const monthObj = { month: monthData.month };

          monthData.tickets.forEach((ticket) => {
            monthObj[ticket.service?.name] = ticket?.ticket_count || 0;
          });
          return monthObj;
        });

        // Extract unique services with their colors
        const servicesMap = new Map();
        data.forEach((monthData) => {
          monthData.tickets.forEach((ticket) => {
            if (ticket.service?.name && !servicesMap.has(ticket.service.name)) {
              servicesMap.set(ticket.service.name, ticket.service.color);
            }
          });
        });

        setTicketData({
          data: formattedData,
          services: Array.from(servicesMap.entries()).map(([name, color]) => ({
            name,
            color,
          })),
        });
      } catch (err) {
        console.log(err);
        setError("Error fetching ticket data.");
      } finally {
        setLoading(false);
      }
    };

    fetchTicketData();
  }, []);

  // Custom Tooltip
  const CustomTooltip = ({ active, payload, label }) => {
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
                  {entry.value} vé
                </span>
              </div>
            ))}
          </div>
          <div className="mt-2 pt-2 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Tổng:</span>
              <span className="text-sm font-bold text-blue-600">
                {payload.reduce((sum, entry) => sum + entry.value, 0)} vé
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom Legend
  const CustomLegend = ({ payload }) => {
    return (
      <div className="flex flex-wrap justify-center gap-4 mt-4">
        {payload.map((entry, index) => (
          <div
            key={`legend-${index}`}
            className="flex items-center gap-2 px-3 py-1. 5 rounded-full bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
            onMouseEnter={() => setActiveBar(entry.value)}
            onMouseLeave={() => setActiveBar(null)}
          >
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm font-medium text-gray-700">
              {entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  };

  // Loading Skeleton
  const LoadingSkeleton = () => (
    <div className="h-80 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-600 mb-4"></div>
        <p className="text-gray-500 font-medium">Đang tải dữ liệu...</p>
      </div>
    </div>
  );

  const isDataAvailable =
    ticketData?.data &&
    Array.isArray(ticketData.data) &&
    ticketData.data.length > 0;

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg p-6 my-5 border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <svg
              className="w-6 h-6 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            Xu hướng số lượng vé theo tháng
          </h2>
        </div>

        {isDataAvailable && (
          <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg">
            <svg
              className="w-5 h-5 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
              />
            </svg>
            <span className="text-sm font-semibold text-blue-700">
              {ticketData.data.length} tháng
            </span>
          </div>
        )}
      </div>

      {loading ? (
        <LoadingSkeleton />
      ) : error ? (
        <div className="h-80 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <p className="text-red-600 font-medium">{error}</p>
          </div>
        </div>
      ) : isDataAvailable ? (
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={ticketData.data}
              margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
              barGap={8}
              barCategoryGap="20%"
            >
              <defs>
                {ticketData.services.map((service, index) => (
                  <linearGradient
                    key={`gradient-${index}`}
                    id={`colorGradient${index}`}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor={service.color}
                      stopOpacity={1}
                    />
                    <stop
                      offset="100%"
                      stopColor={service.color}
                      stopOpacity={0.7}
                    />
                  </linearGradient>
                ))}
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#E5E7EB"
                vertical={false}
              />

              <XAxis
                dataKey="month"
                tick={{ fill: "#6B7280", fontSize: 12, fontWeight: 500 }}
                axisLine={{ stroke: "#E5E7EB" }}
                tickLine={{ stroke: "#E5E7EB" }}
              />

              <YAxis
                tick={{ fill: "#6B7280", fontSize: 12, fontWeight: 500 }}
                axisLine={{ stroke: "#E5E7EB" }}
                tickLine={{ stroke: "#E5E7EB" }}
                label={{
                  value: "Số lượng vé",
                  angle: -90,
                  position: "insideLeft",
                  style: { fill: "#6B7280", fontSize: 12, fontWeight: 600 },
                }}
              />

              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: "rgba(59, 130, 246, 0.05)" }}
              />

              <Legend content={<CustomLegend />} />

              {ticketData.services.map((service, index) => (
                <Bar
                  key={index}
                  dataKey={service.name}
                  fill={`url(#colorGradient${index})`}
                  radius={[8, 8, 0, 0]}
                  maxBarSize={60}
                  animationDuration={800}
                  animationBegin={index * 100}
                  opacity={
                    activeBar === null || activeBar === service.name ? 1 : 0.3
                  }
                >
                  {ticketData.data.map((entry, idx) => (
                    <Cell
                      key={`cell-${idx}`}
                      className="hover:opacity-80 transition-opacity cursor-pointer"
                    />
                  ))}
                </Bar>
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-80 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2. 586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-. 707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006. 586 13H4"
                />
              </svg>
            </div>
            <p className="text-gray-500 font-medium">Không có dữ liệu</p>
            <p className="text-gray-400 text-sm mt-1">
              Không có dữ liệu cho tháng đã chọn
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketTrendChart;
