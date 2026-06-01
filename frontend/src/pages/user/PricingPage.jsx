import { useState } from "react";
import { motion } from "framer-motion";
import axiosClient from "../../api/axios";

const PricingPage = () => {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [qrCode, setQrCode] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [transactionCode, setTransactionCode] = useState(null);
  const [pollingInterval, setPollingInterval] = useState(null);

  const plans = [
    {
      name: "Gói Miễn Phí",
      price: 0,
      duration: "Khám phá cơ bản",
      type: "FREE",
      features: [
        "So sánh tối đa 3 trường cùng lúc",
        "Xem thông tin cơ bản: Tên trường, Ngành, Học phí, Điểm chuẩn năm gần nhất, Vị trí",
        "So sánh 1 ngành duy nhất mỗi lần tra cứu",
        "Không lưu lịch sử so sánh",
        "Trắc nghiệm Holland/MBTI rút gọn",
        "AI Mentor tư vấn (5 câu/ngày)",
      ],
      highlighted: false,
      cta: "Sử dụng ngay",
    },
    {
      name: "Gói Trả Phí",
      price: 79000,
      duration: "30 ngày",
      type: "PAID",
      features: [
        "Gợi ý tổ hợp & ngành học chuyên sâu",
        "So sánh chi tiết 3 trường đại học",
        "Xem lịch sử điểm chuẩn 3 năm",
        "Báo cáo kết quả trắc nghiệm đầy đủ",
        "AI Mentor tư vấn (50 câu/ngày)",
      ],
      highlighted: true,
      cta: "Mua ngay",
    },
    {
      name: "Gói Cao Cấp",
      price: 129000,
      duration: "90 ngày",
      type: "PREMIUM",
      features: [
        "Lộ trình định hướng cá nhân hóa (AI)",
        "So sánh không giới hạn trường & ngành",
        "Dự đoán tỷ lệ đỗ dựa trên điểm thi",
        "Phân tích tâm lý học đường chuyên sâu",
        "AI Mentor tư vấn (Không giới hạn + Ưu tiên)",
      ],
      highlighted: false,
      cta: "Nâng cấp ngay",
    },
  ];

  const handlePlanClick = async (plan) => {
    if (plan.type === "FREE") {
      alert("Bạn đã có quyền sử dụng Gói Miễn Phí!");
      return;
    }

    setSelectedPlan(plan);
    setPaymentStatus(null);
    setQrCode(null);

    // Request payment creation
    try {
      setPaymentLoading(true);
      const response = await axiosClient.post("/payments/create", {
        planType: plan.type,
      });

      if (response.data.status === "success") {
        const {
          qrCodeUrl,
          transactionCode: code,
          paymentId,
        } = response.data.data;
        setQrCode(qrCodeUrl);
        setTransactionCode(code);
        setSelectedPlan({ ...plan, paymentId }); // Store paymentId in selectedPlan
        setPaymentStatus("pending");
        startPolling(paymentId);
      }
    } catch (error) {
      console.error("Payment error:", error);
      setPaymentStatus("error");
      alert("Lỗi: " + (error.response?.data?.message || error.message));
    } finally {
      setPaymentLoading(false);
    }
  };

  // Auto-polling for payment status
  const startPolling = (paymentId) => {
    if (pollingInterval) clearInterval(pollingInterval);

    const interval = setInterval(() => {
      checkPaymentStatus(paymentId, true);
    }, 5000); // Check every 5 seconds

    setPollingInterval(interval);
  };

  const stopPolling = () => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
  };

  const checkPaymentStatus = async (paymentId, isAuto = false) => {
    try {
      if (!isAuto) setPaymentLoading(true);
      const response = await axiosClient.get(`/payments/status/${paymentId}`);

      if (response.data.status === "success") {
        if (response.data.data.status === "SUCCESS") {
          setPaymentStatus("success");
          stopPolling();

          // Sync localStorage with the new subscription plan
          try {
            const profileRes = await axiosClient.get("/users/me");
            if (profileRes.data && profileRes.data.data) {
              localStorage.setItem(
                "user",
                JSON.stringify(profileRes.data.data),
              );
              window.dispatchEvent(new Event("userUpdate"));
            }
          } catch (e) {
            console.error(
              "Failed to sync profile after successful payment:",
              e,
            );
          }

          setTimeout(() => {
            alert("Nâng cấp thành công! Hãy reload trang để cập nhật.");
            window.location.reload();
          }, 2000);
        } else if (!isAuto) {
          alert(
            "Giao dịch đang được xử lý hoặc chưa nhận được tiền. Vui lòng đợi trong giây lát.",
          );
        }
      }
    } catch (error) {
      console.error("Check status error:", error);
      if (!isAuto) {
        alert(
          "Lỗi khi kiểm tra trạng thái: " +
            (error.response?.data?.message || error.message),
        );
      }
    } finally {
      if (!isAuto) setPaymentLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-6 pt-32 pb-20 text-slate-900">
      {/* Header */}
      <div className="mx-auto max-w-7xl mb-16 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl font-black text-slate-900 mb-6"
        >
          Bảng Giá caZup
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-xl text-slate-600 max-w-2xl mx-auto"
        >
          Chọn gói phù hợp với nhu cầu hướng nghiệp của bạn để mở khóa toàn bộ
          sức mạnh của AI.
        </motion.p>
      </div>

      {/* Pricing Cards */}
      <div className="mx-auto max-w-7xl grid md:grid-cols-3 gap-8 mb-16">
        {plans.map((plan, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`relative rounded-[40px] p-8 transition-all flex flex-col
              ${
                plan.highlighted
                  ? "bg-white border-2 border-blue-500 shadow-2xl shadow-blue-200 scale-105 z-10"
                  : "bg-white border border-slate-100 shadow-xl shadow-slate-100 hover:border-blue-200"
              }`}
          >
            {plan.highlighted && (
              <div className="absolute -top-5 left-1/2 transform -translate-x-1/2">
                <span className="bg-blue-600 text-white px-6 py-2 rounded-full text-sm font-black uppercase tracking-widest shadow-lg">
                  ⭐ Phổ biến nhất
                </span>
              </div>
            )}

            <div className="flex-grow">
              {/* Plan Name */}
              <h3 className="text-2xl font-black text-slate-900 mb-2">
                {plan.name}
              </h3>
              <p className="text-slate-500 font-bold mb-8 uppercase tracking-wider text-sm">
                {plan.duration}
              </p>

              {/* Price */}
              <div className="mb-10">
                <div className="text-5xl font-black text-slate-900">
                  {plan.price.toLocaleString("vi-VN")}
                  <span className="text-2xl text-slate-400 ml-1">đ</span>
                </div>
                {plan.price > 0 && (
                  <p className="text-sm text-slate-400 mt-3 font-bold">
                    {(
                      plan.price / (plan.duration === "30 ngày" ? 30 : 90)
                    ).toLocaleString("vi-VN", {
                      maximumFractionDigits: 0,
                    })}
                    đ / ngày
                  </p>
                )}
              </div>

              {/* Features */}
              <div className="space-y-5 mb-10">
                {plan.features.map((feature, fidx) => (
                  <div key={fidx} className="flex items-start gap-4">
                    <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg
                        className="w-4 h-4 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <span className="text-slate-600 font-medium leading-tight">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA Button */}
            <button
              onClick={() => handlePlanClick(plan)}
              className={`w-full py-5 rounded-full font-black text-lg transition-all shadow-xl
                ${
                  plan.highlighted
                    ? "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200 hover:scale-105"
                    : "bg-slate-50 text-slate-900 hover:bg-slate-100 shadow-slate-100"
                }`}
            >
              {plan.cta}
            </button>
          </motion.div>
        ))}
      </div>

      {/* Payment Modal */}
      {selectedPlan && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-6"
          onClick={() => selectedPlan && setSelectedPlan(null)}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            className="bg-white rounded-[40px] p-8 lg:p-12 max-w-xl w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="text-3xl font-black text-slate-900 mb-2">
                  Thanh toán
                </h2>
                <p className="text-slate-500 font-bold">
                  {selectedPlan.name} •{" "}
                  {selectedPlan.price.toLocaleString("vi-VN")}đ
                </p>
              </div>
              <button
                onClick={() => setSelectedPlan(null)}
                className="p-2 hover:bg-slate-100 rounded-full transition"
              >
                <svg
                  className="w-6 h-6 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {paymentStatus === "success" ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg
                    className="w-12 h-12 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <p className="text-2xl font-black text-slate-900 mb-2">
                  Thanh toán thành công!
                </p>
                <p className="text-slate-500 font-medium">
                  Gói của bạn sẽ được kích hoạt ngay lập tức.
                </p>
              </div>
            ) : paymentStatus === "error" ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg
                    className="w-12 h-12 text-red-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </div>
                <p className="text-2xl font-black text-slate-900 mb-2">
                  Lỗi thanh toán
                </p>
                <p className="text-slate-500 font-medium">
                  Vui lòng thử lại hoặc liên hệ hỗ trợ.
                </p>
              </div>
            ) : qrCode ? (
              <div className="space-y-8">
                <div className="text-center">
                  <p className="text-slate-600 font-medium mb-6">
                    Quét mã QR bên dưới bằng ứng dụng Ngân hàng hoặc Ví điện tử
                    để chuyển khoản
                  </p>
                  <div className="relative inline-block p-4 bg-slate-50 rounded-3xl border-2 border-slate-100">
                    <img
                      src={qrCode}
                      alt="Payment QR Code"
                      className="w-64 h-64 rounded-xl"
                    />
                  </div>
                </div>

                <div className="bg-blue-50 rounded-3xl p-6 border border-blue-100">
                  <p className="text-xs text-blue-600 font-black uppercase tracking-widest mb-2">
                    Nội dung chuyển khoản:
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="text-2xl font-black text-blue-900 font-mono">
                      {transactionCode}
                    </p>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(transactionCode);
                        alert("Đã sao chép mã giao dịch!");
                      }}
                      className="text-blue-600 font-bold text-sm hover:underline"
                    >
                      Sao chép
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => checkPaymentStatus(selectedPlan.paymentId)}
                  disabled={paymentLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-black py-5 rounded-full transition-all shadow-xl shadow-blue-200 text-lg"
                >
                  {paymentLoading
                    ? "Đang xác thực giao dịch..."
                    : "Tôi đã chuyển khoản xong"}
                </button>

                <div className="flex items-center justify-center gap-3 text-sm text-blue-600 font-bold animate-pulse">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <span>Đang tự động kiểm tra giao dịch mỗi 5 giây...</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="inline-block animate-spin mb-6">
                  <div className="w-12 h-12 border-4 border-slate-100 border-t-blue-600 rounded-full"></div>
                </div>
                <p className="text-slate-500 font-bold">
                  Đang tạo mã QR thanh toán...
                </p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default PricingPage;
