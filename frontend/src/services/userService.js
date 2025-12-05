import httpAxios from "./httpAxios";

const UserService = {
  login: async (data) => {
    return await httpAxios.post("/login", data);
  },
  changePassword: async (id, data) => {
    return await httpAxios.put(`/changePassword/${id}`, data);
  },
};

export default UserService;
