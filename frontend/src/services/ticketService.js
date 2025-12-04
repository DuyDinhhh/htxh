import httpAxios from "./httpAxios";
import axios from "axios";

const TicketService = {
  index: async (page = 1, params = {}) => {
    return await httpAxios.get(`ticket`, {
      params: {
        page,
        ...params,
      },
    });
  },
  register: async (id) => {
    return await httpAxios.post(`ticket/${id}`);
  },

  queue_display: async () => {
    return await httpAxios.get("ticket/queue_display");
  },

  export: async (params = {}) => {
    const token = localStorage.getItem("token");
    if (process.env.REACT_APP_ENV === "local") {
      return await axios.get("http://127.0.0.1:8000/api/ticket/export", {
        params,
        responseType: "blob",
        headers: { Authorization: `Bearer ${token}` },
      });
    } else {
      return await httpAxios.get("ticket/export", {
        params,
        responseType: "blob",
      });
    }
  },

  generateNewUrl: async () => {
    return await httpAxios.get("ticket/generate-new-qr");
  },

  validateUrl: async (id) => {
    return await httpAxios.get(`/ticket/validate-qr?id=${id}`);
  },
};

export default TicketService;
