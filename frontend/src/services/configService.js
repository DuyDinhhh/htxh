import httpAxios from "./httpAxios";

const ConfigService = {
  index: async () => {
    return await httpAxios.get("config");
  },
  create: async (data) => {
    return await httpAxios.post("config", data);
  },

  edit: async (id, data) => {
    return await httpAxios.post(`config/${id}`, data);
  },
};

export default ConfigService;
