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
    if (process.env.REACT_APP_ENV === "local") {
      return await axios.get("http://127.0.0.1:8000/api/feedback/export", {
        params,
        responseType: "blob",
        headers: { Authorization: `Bearer ${token}` },
      });
    } else {
      return await httpAxios.get("feedback/export", {
        params,
        responseType: "blob",
      });
    }
  },
};

export default FeedbackService;
