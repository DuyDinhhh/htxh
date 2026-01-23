import httpAxios from "./httpAxios";

// Service for config API calls (load, save, reset, button config)
const ConfigService = {
  // Get main config
  index: async () => {
    return await httpAxios.get("config");
  },
  // Create new config
  create: async (data) => {
    return await httpAxios.post("config", data);
  },

  // Edit config by id
  edit: async (id, data) => {
    return await httpAxios.post(`config/${id}`, data);
  },

  // Get button layout config
  getButton: async () => {
    return await httpAxios.get("config/buttons");
  },

  // Save button layout config
  saveButton: async (data) => {
    return await httpAxios.post("config/buttons", data);
  },

  // Reset config to default
  reset: async () => {
    return await httpAxios.get("config/reset");
  },
};

export default ConfigService;
