import httpAxios from "./httpAxios";

// Service for fetching activity and deployment logs
const ActivityLogService = {
  // Get paginated activity logs
  index: async (page = 1, params = {}) => {
    return await httpAxios.get("activity-logs", {
      params: {
        page,
        ...params,
      },
    });
  },

  // Get paginated deployment logs
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
