import httpAxios from "./httpAxios";

// Service for device API calls
const DeviceService = {
  // Get paginated device list
  index: async (page = 1) => {
    return await httpAxios.get(`device?page=${page}`);
  },
  // Get device by id
  show: async (id) => {
    return await httpAxios.get(`device/${id}`);
  },
  // Get all devices (no pagination)
  list: async () => {
    return await httpAxios.get("device/list");
  },
  // Assign services to a device
  assignService: async (id, data) => {
    return await httpAxios.put(`device/${id}/assignService`, data);
  },
  // Delete a device
  destroy: async (id) => {
    return await httpAxios.delete(`device/${id}`);
  },
};

export default DeviceService;
