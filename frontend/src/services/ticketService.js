import httpAxios from "./httpAxios";
import axios from "axios";

// Service for ticket API calls
const TicketService = {
  // Get paginated ticket list
  index: async (page = 1, params = {}) => {
    return await httpAxios.get(`ticket`, {
      params: {
        page,
        ...params,
      },
    });
  },

  // Register a new ticket for a service
  register: async (id) => {
    return await httpAxios.post(`ticket/${id}`);
  },

  // Get current ticket queue display
  queue_display: async () => {
    return await httpAxios.get("ticket/queue_display");
  },

  // Export tickets as Excel file
  export: async (params = {}) => {
    const token = localStorage.getItem("token");
    return await axios.get("http://127.0.0.1:8000/api/ticket/export", {
      params,
      responseType: "blob",
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  // Generate a new QR code URL for ticket
  generateNewUrl: async () => {
    return await httpAxios.get("ticket/generate-new-qr");
  },

  // Validate a QR code token for ticket
  validateUrl: async (token) => {
    return await httpAxios.get(`/ticket/validate-qr?token=${token}`);
  },
};

export default TicketService;
