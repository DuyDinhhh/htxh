import httpAxios from "./httpAxios";

const ActivityLogService = {
  index: async (page = 1, params = {}) => {
    return await httpAxios.get("activity-logs", {
      params: {
        page,
        ...params,
      },
    });
  },

  deployment: async (page = 1, params = {}) => {
    return await httpAxios.get("deployment-logs", {
      params: {
        page,
        ...params,
      },
    });
  },
};

export default ActivityLogService;
