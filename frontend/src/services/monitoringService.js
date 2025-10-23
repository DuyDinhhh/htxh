import httpAxios from "./httpAxios";

const MonitoringService = {
  getKioskStatus: async (id) => {
    return await httpAxios.get(`kiosks/${id}/status`);
  },
  getLogs: async () => {
    return await httpAxios.get("logs");
  },
  getReports: async () => {
    return await httpAxios.get("reports");
  },
};

export default MonitoringService;
