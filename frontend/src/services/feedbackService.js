import httpAxios from "./httpAxios";
import axios from "axios";

const FeedbackService = {
  index: async (page = 1, params = {}) => {
    return await httpAxios.get(`feedback`, {
      params: {
        page,
        ...params,
      },
    });
  },

  export: async (params = {}) => {
    const token = localStorage.getItem("token");
    return await axios.get("http://127.0.0.1:8000/api/feedback/export", {
      params,
      responseType: "blob",
      headers: { Authorization: `Bearer ${token}` },
    });
  },
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
