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
      // token sai / hết hạn: dọn sạch cả token lẫn user để tránh Navbar
      // tưởng nhầm là còn đăng nhập (gây gọi lại API cần auth -> 401 lặp lại)
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.dispatchEvent(new Event("userUpdate"));

      // Only redirect to login if the request was not to a "silent" or optional endpoint
      // We check if the request URL contains certain keywords that should not trigger a redirect
      const url = error.config?.url || "";
      const isSilentRequest =
        url.includes("/mbti/history") ||
        url.includes("/holland-results/me") ||
        url.includes("/quota");

      const isAuthPage =
        window.location.pathname === "/login" ||
        window.location.pathname === "/register";

      // Đã ở /login hoặc /register rồi thì không cần điều hướng cứng nữa —
      // window.location.href gán lại chính URL hiện tại vẫn ép trình duyệt
      // reload toàn trang, gây vòng lặp reload liên tục trước khi user kịp đăng nhập.
      if (!isSilentRequest && !isAuthPage) {
        // Đây là điều hướng cứng (reload trang) nên React Router state sẽ mất —
        // giữ lại đường dẫn hiện tại qua query param để sau khi đăng nhập lại
        // có thể quay về đúng chỗ (vd giữa luồng xác nhận thanh toán payOS).
        const current = window.location.pathname + window.location.search;
        window.location.href = `/login?redirect=${encodeURIComponent(current)}`;
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
