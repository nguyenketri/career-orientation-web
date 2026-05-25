import { useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";

const PricingPage = () => {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [qrCode, setQrCode] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [transactionCode, setTransactionCode] = useState(null);

  const plans = [
    {
      name: "Gói Miễn Phí",
      price: 0,
      duration: "Vĩnh viễn",
      type: "FREE",
      features: [
        "Nhập điểm thi & gợi ý Tổ hợp môn",
        "Bộ lọc so sánh (Chỉ xem thông tin lẻ)",
        "Xem Học phí & Điểm chuẩn (Năm gần nhất)",
        "Trắc nghiệm MBTI & Holland (Bản rút gọn 15 câu)",
        "AI Mentor Tư vấn (5 câu hỏi/ngày)",
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
        "Gợi ý Tổ hợp + Ngành học",
        "So sánh tối đa 3 trường",
        "Xem lịch sử 3 năm",
        "Bản đầy đủ + Xem kết quả",
        "AI Mentor Tư vấn (50 câu hỏi/ngày)",
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
        "Gợi ý Tổ hợp + Ngành + Trường cụ thể",
        "So sánh không giới hạn",
        "Xem lịch sử + Dự đoán tỷ lệ đỗ",
        "Bản đầy đủ + AI phân tích sâu kết quả",
        "AI Mentor Tư vấn (Không giới hạn + Phản hồi nhanh)",
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
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:3000/api/payments/create",
        { planType: plan.type },
        { headers: { Authorization: `Bearer ${token}` } },
      );

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
      }
    } catch (error) {
      console.error("Payment error:", error);
      setPaymentStatus("error");
      alert("Lỗi: " + (error.response?.data?.message || error.message));
    } finally {
      setPaymentLoading(false);
    }
  };

  const checkPaymentStatus = async (paymentId) => {
    try {
      setPaymentLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:3000/api/payments/status/${paymentId}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (response.data.status === "success") {
        if (response.data.data.status === "SUCCESS") {
          setPaymentStatus("success");
          setTimeout(() => {
            alert("Nâng cấp thành công! Hãy reload trang để cập nhật.");
            window.location.reload();
          }, 2000);
        } else {
          alert(
            "Giao dịch đang được xử lý hoặc chưa nhận được tiền. Vui lòng đợi trong giây lát.",
          );
        }
      }
    } catch (error) {
      console.error("Check status error:", error);
      alert(
        "Lỗi khi kiểm tra trạng thái: " +
          (error.response?.data?.message || error.message),
      );
    } finally {
      setPaymentLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-900/20 to-black px-6 py-20">
      {/* Header */}
      <div className="mx-auto max-w-6xl mb-16 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent mb-4"
        >
          Bảng Giá caZup
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-xl text-gray-300"
        >
          Chọn gói phù hợp với nhu cầu hướng nghiệp của bạn
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
            className={`relative rounded-3xl backdrop-blur-xl transition-all ${
              plan.highlighted
                ? "bg-gradient-to-br from-purple-500/40 via-purple-400/20 to-pink-500/20 border border-purple-400/50 shadow-2xl shadow-purple-500/30 scale-105"
                : "bg-white/5 border border-white/10 hover:border-white/20"
            }`}
          >
            {plan.highlighted && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1 rounded-full text-sm font-bold">
                  ⭐ Được yêu thích
                </span>
              </div>
            )}

            <div className="p-8">
              {/* Plan Name */}
              <h3 className="text-2xl font-bold text-white mb-2">
                {plan.name}
              </h3>
              <p className="text-gray-400 mb-6">{plan.duration}</p>

              {/* Price */}
              <div className="mb-8">
                <div className="text-4xl font-bold text-white">
                  {plan.price.toLocaleString("vi-VN")}
                  <span className="text-lg text-gray-400">đ</span>
                </div>
                {plan.price > 0 && (
                  <p className="text-sm text-gray-400 mt-2">
                    {(
                      plan.price / (plan.duration === "30 ngày" ? 30 : 90)
                    ).toLocaleString("vi-VN", {
                      maximumFractionDigits: 0,
                    })}
                    /ngày
                  </p>
                )}
              </div>

              {/* CTA Button */}
              <button
                onClick={() => handlePlanClick(plan)}
                className={`w-full py-3 rounded-xl font-bold transition-all mb-8 ${
                  plan.highlighted
                    ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg hover:shadow-purple-500/50"
                    : "bg-white/10 text-white border border-white/20 hover:bg-white/20"
                }`}
              >
                {plan.cta}
              </button>

              {/* Features */}
              <div className="space-y-4">
                {plan.features.map((feature, fidx) => (
                  <div key={fidx} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <span className="text-gray-300 text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Payment Modal */}
      {selectedPlan && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => selectedPlan && setSelectedPlan(null)}
        >
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className="bg-gradient-to-br from-white/10 via-white/5 to-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-8 max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold text-white mb-2">Thanh toán</h2>
            <p className="text-gray-400 mb-6">
              {selectedPlan.name} - {selectedPlan.price.toLocaleString("vi-VN")}
              đ
            </p>

            {paymentStatus === "success" ? (
              <div className="text-center py-8">
                <div className="text-5xl mb-4">✅</div>
                <p className="text-green-400 font-bold">
                  Thanh toán thành công!
                </p>
                <p className="text-gray-300 text-sm mt-2">
                  Gói của bạn sẽ được kích hoạt ngay
                </p>
              </div>
            ) : paymentStatus === "error" ? (
              <div className="text-center py-8">
                <div className="text-5xl mb-4">❌</div>
                <p className="text-red-400 font-bold">Lỗi thanh toán</p>
                <p className="text-gray-300 text-sm mt-2">Vui lòng thử lại</p>
              </div>
            ) : qrCode ? (
              <>
                <div className="mb-6 text-center">
                  <p className="text-gray-300 mb-4 text-sm">
                    Quét mã QR bên dưới để chuyển khoản
                  </p>
                  <img
                    src={qrCode}
                    alt="Payment QR Code"
                    className="w-full rounded-2xl border border-white/20"
                  />
                </div>

                <div className="bg-white/5 rounded-xl p-4 mb-6 border border-white/10">
                  <p className="text-xs text-gray-400 mb-2">Mã giao dịch:</p>
                  <p className="text-white font-mono font-bold text-lg">
                    {transactionCode}
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    (Ghi mã này vào nội dung chuyển khoản)
                  </p>
                </div>

                <button
                  onClick={() => checkPaymentStatus(selectedPlan.paymentId)}
                  disabled={paymentLoading}
                  className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-all"
                >
                  {paymentLoading
                    ? "Đang kiểm tra..."
                    : "Kiểm tra trạng thái thanh toán"}
                </button>

                <p className="text-[10px] text-gray-500 mt-4 text-center italic">
                  Hệ thống sẽ tự động cập nhật sau 1-3 phút khi nhận được tiền
                  chuyển khoản.
                </p>

                <button
                  onClick={() => setSelectedPlan(null)}
                  className="w-full mt-3 bg-white/10 hover:bg-white/20 text-white font-bold py-2 rounded-xl transition-all"
                >
                  Hủy
                </button>
              </>
            ) : (
              <div className="text-center py-8">
                <div className="inline-block animate-spin">
                  <div className="w-8 h-8 border-4 border-white/20 border-t-purple-400 rounded-full"></div>
                </div>
                <p className="text-gray-300 mt-4">Đang tạo mã QR...</p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default PricingPage;
