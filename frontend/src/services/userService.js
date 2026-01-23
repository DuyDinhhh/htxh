import httpAxios from "./httpAxios";

// Service for user authentication and profile actions
const UserService = {
  // Log in user
  login: async (data) => {
    return await httpAxios.post("/login", data);
  },
  // Change user password
  changePassword: async (id, data) => {
    return await httpAxios.put(`/changePassword/${id}`, data);
  },
};

export default UserService;
