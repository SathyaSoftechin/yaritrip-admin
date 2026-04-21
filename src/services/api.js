import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8082/api",
  timeout: 50000, // ⏱️ 10 sec timeout
});

// 🔐 REQUEST INTERCEPTOR
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// 🚨 RESPONSE INTERCEPTOR
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;

    if (status === 401) {
      console.warn("Unauthorized - Redirecting to login");

      localStorage.removeItem("token");

      // redirect
      window.location.href = "/login";
    }

    if (status === 403) {
      console.error("Forbidden - Admin access required");
    }

    return Promise.reject(error);
  },
);

export default api;
