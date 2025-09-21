import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// attach token on every request
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // always fetch latest
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;
