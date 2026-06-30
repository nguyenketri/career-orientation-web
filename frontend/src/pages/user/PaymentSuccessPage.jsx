import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getPaymentStatus } from "../../services/paymentService";
import { getProfile } from "../../services/userService";

const POLL_INTERVAL_MS = 3000;
const TIMEOUT_MS = 5 * 60 * 1000; // 5 phút

const PaymentSuccessPage = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState("checking"); // checking | success | failed | timeout
  const [planType, setPlanType] = useState("");
  const intervalRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    const paymentId = localStorage.getItem("pending_payment_id");

    if (!paymentId) {
      // Không có paymentId — có thể user vào trực tiếp URL
      navigate("/pricing");
      return;
    }

    const checkStatus = async () => {
      try {
        const res = await getPaymentStatus(paymentId);
        const { status: payStatus, planType: plan } = res.data;

        if (payStatus === "SUCCESS") {
          clearInterval(intervalRef.current);
          clearTimeout(timeoutRef.current);
          localStorage.removeItem("pending_payment_id");

          // Refresh user data từ server để cập nhật gói mới
          try {
            const profileRes = await getProfile();
            const updatedUser = profileRes.data;
            localStorage.setItem("user", JSON.stringify(updatedUser));
            window.dispatchEvent(new Event("userUpdate"));
          } catch {
            // Nếu refresh thất bại, xoá cache cũ để buộc fetch lại
            localStorage.removeItem("user");
          }

          setPlanType(plan);
          setStatus("success");

          // Tự động chuyển về trang chủ sau 3 giây
          setTimeout(() => navigate("/"), 3000);
        } else if (payStatus === "FAILED") {
          clearInterval(intervalRef.current);
          clearTimeout(timeoutRef.current);
          localStorage.removeItem("pending_payment_id");
          setStatus("failed");
        }
        // Nếu PENDING: tiếp tục polling
      } catch {
        // Lỗi mạng — tiếp tục thử
      }
    };

    // Kiểm tra ngay lần đầu
    checkStatus();

    // Polling mỗi 3 giây
    intervalRef.current = setInterval(checkStatus, POLL_INTERVAL_MS);

    // Timeout 5 phút
    timeoutRef.current = setTimeout(() => {
      clearInterval(intervalRef.current);
      localStorage.removeItem("pending_payment_id");
      setStatus("timeout");
    }, TIMEOUT_MS);

    return () => {
      clearInterval(intervalRef.current);
      clearTimeout(timeoutRef.current);
    };
  }, [navigate]);

  const planLabel = {
    PAID: "Tiêu Chuẩn",
    PREMIUM: "Cao Cấp",
  }[planType] || planType;

  if (status === "success") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-xl p-10 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-black text-slate-900 mb-2">Thanh toán thành công!</h1>
          <p className="text-slate-500 mb-4">
            Bạn đã nâng cấp lên gói <span className="font-bold text-orange-500">{planLabel}</span> thành công.
          </p>
          <p className="text-sm text-slate-400">Đang chuyển về trang chủ...</p>
          <div className="mt-6 w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-xl p-10 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-3xl font-black text-slate-900 mb-2">Thanh toán thất bại</h1>
          <p className="text-slate-500 mb-6">Giao dịch không thành công. Vui lòng thử lại.</p>
          <button
            onClick={() => navigate("/pricing")}
            className="bg-orange-500 text-white font-bold px-8 py-3 rounded-full hover:bg-orange-600 transition"
          >
            Quay lại trang gói dịch vụ
          </button>
        </div>
      </div>
    );
  }

  if (status === "timeout") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-xl p-10 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-black text-slate-900 mb-2">Hết thời gian chờ</h1>
          <p className="text-slate-500 mb-2">
            Chúng tôi chưa nhận được xác nhận thanh toán sau 5 phút.
          </p>
          <p className="text-sm text-slate-400 mb-6">
            Nếu bạn đã thanh toán, gói dịch vụ sẽ được cập nhật tự động trong vài phút. Hãy kiểm tra lại trang cá nhân.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => navigate("/")}
              className="border-2 border-slate-900 text-slate-900 font-bold px-6 py-3 rounded-full hover:bg-slate-900 hover:text-white transition"
            >
              Về trang chủ
            </button>
            <button
              onClick={() => navigate("/pricing")}
              className="bg-orange-500 text-white font-bold px-6 py-3 rounded-full hover:bg-orange-600 transition"
            >
              Thử lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  // status === "checking" (đang polling)
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-xl p-10 max-w-md w-full text-center">
        <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
        <h1 className="text-2xl font-black text-slate-900 mb-2">Đang xác nhận thanh toán...</h1>
        <p className="text-slate-500">
          Vui lòng chờ trong giây lát. Trang sẽ tự động cập nhật khi thanh toán được xác nhận.
        </p>
        <p className="text-xs text-slate-400 mt-4">Thời gian chờ tối đa: 5 phút</p>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
