import React, { useEffect, useState } from "react";
import DashboardService from "../services/dashboardService";

const TicketComparisonChart = () => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTicketData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await DashboardService.circleChart();
        setChartData(response);
      } catch (err) {
        setError("Error fetching ticket data.");
      } finally {
        setLoading(false);
      }
    };

    fetchTicketData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  const today = chartData?.today || 0;
  const percentageChange = chartData?.percentage_change || 0;
  const isPositive = percentageChange >= 0;

  return (
    <div className="bg-white shadow rounded-lg p-4 my-5">
      <h2 className="text-lg font-semibold mb-4">Số lượng vé</h2>
      <div
        className="flex flex-col items-center justify-center"
        style={{ minHeight: "280px" }}
      >
        <div className="relative">
          <div className="w-48 h-48 rounded-full bg-gradient-to-br bg-red-500 flex items-center justify-center">
            <div className="text-center">
              <div className="text-5xl font-bold text-white">{today}</div>
              <div className="text-sm text-white/90 mt-1">Hôm nay</div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center mt-4">
          <div
            className={`flex items-center gap-1 text-sm font-medium ${
              isPositive ? "text-green-600" : "text-red-600"
            }`}
          >
            {isPositive ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m4.5 15.75 7.5-7.5 7.5 7.5"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3. org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m19.5 8.25-7.5 7.5-7.5-7.5"
                />
              </svg>
            )}
            <span>{Math.abs(percentageChange)}% Hôm qua</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketComparisonChart;
