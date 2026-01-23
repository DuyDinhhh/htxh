// Auth service: handles login state and user info

// Check if user is authenticated
export const isAuthenticated = () => {
  return localStorage.getItem("token") !== null;
};

// Get current user object from localStorage
export const getUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

// Log out user and redirect to login page
export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "/login";
};
