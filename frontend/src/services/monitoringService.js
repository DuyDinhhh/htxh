import httpAxios from "./httpAxios";

// Service for monitoring API calls
const MonitoringService = {
  // Get status of a kiosk by id
  getKioskStatus: async (id) => {
    return await httpAxios.get(`kiosks/${id}/status`);
  },
  // Get monitoring logs
  getLogs: async () => {
    return await httpAxios.get("logs");
  },
  // Get monitoring reports
  getReports: async () => {
    return await httpAxios.get("reports");
  },
};

export default MonitoringService;
