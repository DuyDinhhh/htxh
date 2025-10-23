import httpAxios from "./httpAxios";

const ServiceService = {
  index: async (page = 1) => {
    return await httpAxios.get(`service?page=${page}`);
  },
  list: async () => {
    return await httpAxios.get("/service/list");
  },
  store: async (data) => {
    return await httpAxios.post("service/", data);
  },
  show: async (id) => {
    return await httpAxios.get(`service/${id}`);
  },
  update: async (id, data) => {
    return await httpAxios.put(`service/${id}`, data);
  },
  destroy: async (id) => {
    return await httpAxios.delete(`service/${id}`);
  },
};

export default ServiceService;
