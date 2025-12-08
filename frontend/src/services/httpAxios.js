import axios from "axios";

const appEnv = process.env.REACT_APP_ENV || "local";
const apiHost = window.location.hostname;
const apiPort = "8000";
const apiProtocol = window.location.protocol;
 
let baseURL;
if (appEnv === "local") {
  baseURL = `${apiProtocol}//${apiHost}:${apiPort}/api/`;
} else {
  baseURL = `${apiProtocol}//${apiHost}/api/`;
}
 
const httpAxios = axios.create({
  baseURL: baseURL,
});

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
  }
);

export default httpAxios;

export const getImageUrl = (photo) => {
  const apiProtocol = window.location.protocol;
  const apiHost = window.location.hostname;

  if (photo) {
    if (appEnv === "local") {
      return `${apiProtocol}//${apiHost}:8000/images/config/${photo}`;
    } else {
      return `${apiProtocol}//${apiHost}/images/config/${photo}`;
    }
  }
  return null;
};
