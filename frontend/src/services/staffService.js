import httpAxios from "./httpAxios";

const StaffService = {
  index: async (page = 1) => {
    return await httpAxios.get(`staff?page=${page}`);
  },
  list: async () => {
    return await httpAxios.get("/staff/list");
  },
  store: async (data) => {
    return await httpAxios.post("staff/", data);
  },
  show: async (id) => {
    return await httpAxios.get(`staff/${id}`);
  },
  update: async (id, data) => {
    return await httpAxios.put(`staff/${id}`, data);
  },
  destroy: async (id) => {
    return await httpAxios.delete(`staff/${id}`);
  },
};

export default StaffService;
