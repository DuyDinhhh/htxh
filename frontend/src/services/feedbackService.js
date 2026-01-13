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
    return await httpAxios.get("feedback/export", {
        params,
        responseType: "blob",
      });
  },
};

export default FeedbackService;
