import httpAxios from "./httpAxios";

const DeviceService = {
  index: async (page = 1) => {
    return await httpAxios.get(`device?page=${page}`);
  },
  show: async (id) => {
    return await httpAxios.get(`device/${id}`);
  },
  list: async () => {
    return await httpAxios.get("device/list");
  },
  assignService: async (id, data) => {
    return await httpAxios.put(`device/${id}/assignService`, data);
  },
  destroy: async (id) => {
    return await httpAxios.delete(`device/${id}`);
  },
};

export default DeviceService;
