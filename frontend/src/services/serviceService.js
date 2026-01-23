import httpAxios from "./httpAxios";

// Service for service API calls
const ServiceService = {
  // Get paginated service list
  index: async (page = 1) => {
    return await httpAxios.get(`service?page=${page}`);
  },
  // Get all services (no pagination)
  list: async () => {
    return await httpAxios.get("/service/list");
  },
  // Create a new service
  store: async (data) => {
    return await httpAxios.post("service/", data);
  },
  // Get service by id
  show: async (id) => {
    return await httpAxios.get(`service/${id}`);
  },
  // Update service by id
  update: async (id, data) => {
    return await httpAxios.put(`service/${id}`, data);
  },
  // Delete a service
  destroy: async (id) => {
    return await httpAxios.delete(`service/${id}`);
  },
};

export default ServiceService;
