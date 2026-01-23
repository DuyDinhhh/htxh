import httpAxios from "./httpAxios";

// Service for dashboard chart data
const DashboardService = {
  // Get ticket data by month for column chart
  getTicketsByMonth: async () => {
    return await httpAxios.get("columnChart");
  },

  // Get ticket distribution for circle chart
  circleChart: async () => {
    return await httpAxios.get("circleChart");
  },

  // Get feedback data for feedback chart
  feedbackChart: async () => {
    return await httpAxios.get("feedbackChart");
  },
};

export default DashboardService;
