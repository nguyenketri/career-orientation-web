import axios from "axios";

// create axios instance
const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

//  interceptor : để găn token cho mỗi request trước khi gửi api xuống BE
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

//  RESPONSE interceptor (handle lỗi) : token hết hạn, user bị logout,401 từ server
axiosClient.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      // token sai / hết hạn
      localStorage.removeItem("token");

      // redirect về login
      window.location.href = "/login";
    }

    if (
      error.response?.status === 403 &&
      error.response.data?.code === "QUOTA_EXCEEDED"
    ) {
      window.location.href =
        "/upgrade-prompt?feature=Tính năng này&requiredPlan=PAID,PREMIUM";
    }

    return Promise.reject(error);
  },
);

export default axiosClient;
