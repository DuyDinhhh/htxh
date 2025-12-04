import React, { useEffect, useState } from "react";
import DashboardService from "../services/dashboardService";

const FeedbackChart = () => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFeedbackData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await DashboardService.feedbackChart();
        setChartData(response);
      } catch (err) {
        setError("Error fetching feedback data.");
      } finally {
        setLoading(false);
      }
    };

    fetchFeedbackData();
  }, []);

  if (loading) return <div>Loading... </div>;
  if (error) return <div>{error}</div>;

  const currentPercentage = chartData?.current_month_percentage || 0;
  const percentageChange = chartData?.percentage_change || 0;
  const isPositive = percentageChange >= 0;

  const getColor = (percentage) => {
    if (percentage < 25) return "#EF4444";
    if (percentage < 50) return "#F59E0B";
    if (percentage < 75) return "#3B82F6";
    return "#10B981";
  };

  const radius = 80;
  const circumference = Math.PI * radius;
  const progress = (currentPercentage / 100) * circumference;
  const color = getColor(currentPercentage);

  return (
    <div className="bg-white rounded-lg shadow p-4 my-5">
      <h2 className="text-lg font-semibold mb-4">Đánh giá trung bình</h2>

      <div
        className="flex flex-col items-center justify-center"
        style={{ minHeight: "280px" }}
      >
        <div className="relative w-72 h-40 mb-6">
          <svg
            viewBox="0 0 200 120"
            className="w-full h-full"
            style={{ overflow: "visible" }}
          >
            <path
              d="M 20 100 A 80 80 0 0 1 180 100"
              fill="none"
              stroke="#E5E7EB"
              strokeWidth="20"
              strokeLinecap="round"
            />

            <path
              d="M 20 100 A 80 80 0 0 1 180 100"
              fill="none"
              stroke={color}
              strokeWidth="20"
              strokeLinecap="round"
              strokeDasharray={`${progress} ${circumference}`}
              style={{
                transition: "stroke-dasharray 1s ease-out, stroke 0.3s ease",
                transformOrigin: "center",
              }}
            />
          </svg>

          <div className="absolute inset-x-0 bottom-0 text-center">
            <div className="text-4xl font-bold" style={{ color }}>
              {currentPercentage.toFixed(1)}%
            </div>
          </div>
        </div>

        <div className="text-sm text-gray-500 mt-2">Tháng này</div>

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
            <span>
              {Math.abs(percentageChange).toFixed(1)}% So với tháng trước
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackChart;
