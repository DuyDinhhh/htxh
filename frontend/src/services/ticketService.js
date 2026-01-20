import httpAxios from "./httpAxios";

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

  generateNewUrl: async () => {
    return await httpAxios.get("ticket/generate-new-qr");
  },

  validateUrl: async (token) => {
    return await httpAxios.get(`/ticket/validate-qr?token=${token}`);
  },
};

export default TicketService;
