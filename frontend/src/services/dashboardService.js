import httpAxios from "./httpAxios";

const DashboardService = {
  getTicketsByMonth: async () => {
    return await httpAxios.get("columnChart");
  },

  circleChart: async () => {
    return await httpAxios.get("circleChart");
  },

  feedbackChart: async () => {
    return await httpAxios.get("feedbackChart");
  },
};

export default DashboardService;
