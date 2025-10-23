// import axios from "axios";

// const httpAxios = axios.create({
//   baseURL: "http://127.0.0.1:8000/api/",
// });

// httpAxios.interceptors.response.use(
//   function (response) {
//     return response.data;
//   },
//   function (error) {
//     return Promise.reject(error);
//   }
// );

// export default httpAxios;

// httpAxios.js - Updated with JWT token handling
import axios from "axios";

const apiHost = window.location.hostname;
const apiPort = "8000";
const apiProtocol = window.location.protocol;
const httpAxios = axios.create({
  baseURL: `${apiProtocol}//${apiHost}:${apiPort}/api/`,
});

// Request interceptor to add token to requests
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
  }
);

// Response interceptor
httpAxios.interceptors.response.use(
  function (response) {
    return response.data;
  },
  function (error) {
    // Handle 401 errors (unauthorized)
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default httpAxios;
