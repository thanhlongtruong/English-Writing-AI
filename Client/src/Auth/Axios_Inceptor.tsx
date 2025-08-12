import axios from "axios";
import type { InternalAxiosRequestConfig } from "axios";
import { jwtDecode } from "jwt-decode";

const instance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  timeout: 1000 * 60 * 5,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

const EXCLUDED_ENDPOINTS = [
  "/account/login",
  "/account/register",
  "/account/logout",
  "/account/send-verification-code-email",
  "/story/get",
  "/comment/get",
];

instance.interceptors.request.use(
  function (config: InternalAxiosRequestConfig) {
    if (EXCLUDED_ENDPOINTS.some((endpoint) => config.url?.includes(endpoint))) {
      return config;
    }
    const token = localStorage.getItem("accessToken");

    if (!token) {
      window.location.href = "/";
      return Promise.reject(new Error("Phiên đăng nhập không tồn tại"));
    }

    try {
      const decodedToken = jwtDecode(token);
      if (decodedToken.exp && decodedToken.exp * 1000 < Date.now()) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        window.location.href = "/";
        return Promise.reject(new Error("Phiên đăng nhập đã hết hạn"));
      }
    } catch {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      return Promise.reject(new Error("Phiên đăng nhập không hợp lệ"));
    }
    config.headers["Cache-Control"] = "no-cache";
    config.headers.Authorization = `Bearer ${token}`;

    return config;
  },
  function (error) {
    console.log(error);
    return Promise.reject(error);
  }
);

instance.interceptors.response.use(
  function (response) {
    return response;
  },
  function (error) {
    return Promise.reject(error);
  }
);

export default instance;
