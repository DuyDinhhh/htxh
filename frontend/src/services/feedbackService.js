import httpAxios from "./httpAxios";
import axios from "axios";

// Service for feedback API calls
const FeedbackService = {
  // Get paginated feedback list
  index: async (page = 1, params = {}) => {
    return await httpAxios.get(`feedback`, {
      params: {
        page,
        ...params,
      },
    });
  },

  // Export feedbacks as Excel file
  export: async (params = {}) => {
    return await httpAxios.get("feedback/export", {
      params,
      responseType: "blob",
    });
  },
  // Get monthly feedback stats for a staff
  getMonthlyStats: async (staffId, month) => {
    return await httpAxios.get(`feedback/monthly-stats`, {
      params: {
        staff_id: staffId,
        month: month,
      },
    });
  },
};

export default FeedbackService;
