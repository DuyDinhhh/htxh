import httpAxios from "./httpAxios";

const UserService = {
  login: async (data) => {
    return await httpAxios.post("auth/login", data);
  },
  index: async () => {
    return await httpAxios.get("users");
  },
  store: async (data) => {
    return await httpAxios.post("users", data);
  },
  update: async (id, data) => {
    return await httpAxios.put(`users/${id}`, data);
  },
  delete: async (id) => {
    return await httpAxios.delete(`users/${id}`);
  },
  roles: async () => {
    return await httpAxios.get("roles");
  },
};

export default UserService;
