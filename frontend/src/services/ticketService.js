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
    return await httpAxios.get("ticket/export", {
      params,
      responseType: "blob",
    });
  },
};

export default TicketService;
