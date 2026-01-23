import axios from "axios";

// Axios instance with base API URL and interceptors for auth and error handling
const apiHost = window.location.host;
const apiProtocol = window.location.protocol;
 
let baseURL = `${apiProtocol}//${apiHost}/api/`;
 
 
const httpAxios = axios.create({
  baseURL: baseURL,
});

// Attach auth token to every request if present
httpAxios.interceptors.request.use(
  function (config) {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  function (error) {
    return Promise.reject(error);
  },
);

// Handle 401 errors globally and redirect to login if needed
httpAxios.interceptors.response.use(
  function (response) {
    return response.data;
  },
  function (error) {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      if (
        window.location.pathname !== "/login" &&
        window.location.pathname !== "/ticket/create" &&
        window.location.pathname !== "/ticket/queue_display" &&
        window.location.pathname !== "/ticket/qr" &&
        window.location.pathname !== "/ticket/create-qr"
      ) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

export default httpAxios;

// Helper to get full image URL for config photos
export const getImageUrl = (photo) => {
  const apiProtocol = window.location.protocol;
  const apiHost = window.location.host;

  if (photo) {
    return `${apiProtocol}//${apiHost}/images/config/${photo}`;
  }
  return null;
};
