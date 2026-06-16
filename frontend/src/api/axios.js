import axios from "axios";

// create axios instance
const axiosClient = axios.create({
  baseURL: "/api",
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

      // Only redirect to login if the request was not to a "silent" or optional endpoint
      // We check if the request URL contains certain keywords that should not trigger a redirect
      const url = error.config?.url || "";
      const isSilentRequest =
        url.includes("/mbti/history") ||
        url.includes("/holland-results/me") ||
        url.includes("/quota");

      if (!isSilentRequest) {
        window.location.href = "/login";
      }
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
