import httpAxios from "./httpAxios";

// Service for staff API calls
const StaffService = {
  // Get paginated staff list
  index: async (page = 1) => {
    return await httpAxios.get(`staff?page=${page}`);
  },
  // Get all staff (no pagination)
  list: async () => {
    return await httpAxios.get("/staff/list");
  },
  // Create a new staff
  store: async (data) => {
    return await httpAxios.post("staff/", data);
  },
  // Get staff by id
  show: async (id) => {
    return await httpAxios.get(`staff/${id}`);
  },
  // Update staff by id
  update: async (id, data) => {
    return await httpAxios.put(`staff/${id}`, data);
  },
  // Delete a staff
  destroy: async (id) => {
    return await httpAxios.delete(`staff/${id}`);
  },
};

export default StaffService;
