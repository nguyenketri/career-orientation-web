import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axiosClient from "../../api/axios";
import { getUser } from "../../utils/auth";

const PricingPage = () => {
  const [user, setUser] = useState(getUser());
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [qrCode, setQrCode] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [transactionCode, setTransactionCode] = useState(null);
  const [pollingInterval, setPollingInterval] = useState(null);

  const plans = [
    {
      name: "Gói CƠ BẢN",
      price: 0,
      type: "FREE",
      features: [
        { text: "So sánh tối đa 2 trường cùng lúc", checked: true },
        { text: "Xem thông tin cơ bản (Tên, Ngành, Học phí)", checked: true },
        { text: "Trắc nghiệm Holland/MBTI rút gọn", checked: true },
        { text: "AI Mentor tư vấn (5 câu/ngày)", checked: true },
        { text: "Không lưu lịch sử so sánh", checked: false },
      ],
      cta: "Bắt đầu miễn phí",
    },
    {
      name: "Gói TIÊU CHUẨN",
      price: 79000,
      type: "PAID",
      features: [
        { text: "Gợi ý tổ hợp & ngành học chuyên sâu", checked: true },
        { text: "So sánh chi tiết 4 trường đại học", checked: true },
        { text: "Báo cáo kết quả trắc nghiệm đầy đủ", checked: true },
        { text: "AI Mentor tư vấn (50 câu/ngày)", checked: true },
        { text: "Lưu lịch sử tìm kiếm & so sánh", checked: true },
      ],
      highlighted: true,
      cta: "Nâng cấp ngay",
    },
    {
      name: "Gói CAO CẤP",
      price: 129000,
      type: "PREMIUM",
      features: [
        { text: "So sánh không giới hạn trường & ngành", checked: true },
        { text: "AI Mentor tư vấn (Không giới hạn + Ưu tiên)", checked: true },
        { text: "Kết nối Mentor chuyên gia (1-on-1)", checked: true },
        { text: "Hỗ trợ 24/7 từ đội ngũ kỹ thuật", checked: true },
        { text: "Độc quyền xem trước tính năng mới", checked: true },
      ],
      cta: "Mua Premium",
    },
  ];

  const isButtonDisabled = (plan) => {
    if (user?.subscriptionPlan === plan.type) return true;
    if (user?.subscriptionPlan === "PREMIUM") return true;
    if (user?.subscriptionPlan === "PAID" && plan.type === "FREE") return true;
    return false;
  };

  const handlePlanClick = async (plan) => {
    if (isButtonDisabled(plan)) return;
    setSelectedPlan(plan);
    setPaymentStatus(null);
    setQrCode(null);

    try {
      setPaymentLoading(true);
      const response = await axiosClient.post("/payments/create", {
        planType: plan.type,
      });
      const {
        qrCodeUrl,
        transactionCode: code,
        paymentId,
      } = response.data.data;
      setQrCode(qrCodeUrl);
      setTransactionCode(code);
      setSelectedPlan({ ...plan, paymentId });
      setPaymentStatus("pending");
      const interval = setInterval(
        () => checkPaymentStatus(paymentId, true),
        5000,
      );
      setPollingInterval(interval);
    } catch (error) {
      alert("Lỗi: " + (error.response?.data?.message || error.message));
    } finally {
      setPaymentLoading(false);
    }
  };

  const checkPaymentStatus = async (paymentId) => {
    try {
      const response = await axiosClient.get(`/payments/status/${paymentId}`);
      if (response.data.data.status === "SUCCESS") {
        if (pollingInterval) clearInterval(pollingInterval);
        setPaymentStatus("success");
        const profileRes = await axiosClient.get("/users/me");
        localStorage.setItem("user", JSON.stringify(profileRes.data.data));
        window.dispatchEvent(new Event("userUpdate"));
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-16 px-6">
      {/* Header Section */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h1 className="text-4xl font-black text-slate-900 mb-4">
          Chọn gói dịch vụ phù hợp cho tương lai của bạn
        </h1>
        <p className="text-slate-500 text-lg">
          EduPath AI đồng hành cùng học sinh Việt Nam với công cụ AI thông minh
          nhất để định hướng học tập và sự nghiệp bền vững.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8 mb-24">
        {plans.map((plan) => (
          <div
            key={plan.type}
            className={`relative bg-white p-8 rounded-3xl border-2 transition-all hover:shadow-xl ${plan.highlighted ? "border-orange-500 shadow-lg scale-105 z-10" : "border-slate-100 shadow-sm"}`}
          >
            {plan.highlighted && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Phổ biến nhất
              </div>
            )}
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              {plan.name}
            </h3>
            <div className="flex items-baseline gap-1 mb-8">
              <span className="text-4xl font-black text-slate-900">
                {plan.price === 0 ? "0đ" : `${(plan.price / 1000).toFixed(0)}k`}
              </span>
              <span className="text-slate-400 text-sm">/tháng</span>
            </div>

            <ul className="space-y-4 mb-8">
              {plan.features.map((f, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 text-sm text-slate-600"
                >
                  <span
                    className={`mt-1 ${f.checked ? "text-orange-500" : "text-slate-300"}`}
                  >
                    {f.checked ? "✓" : "✕"}
                  </span>
                  {f.text}
                </li>
              ))}
            </ul>

            <button
              onClick={() => handlePlanClick(plan)}
              disabled={isButtonDisabled(plan)}
              className={`w-full py-4 rounded-full font-bold transition-all ${
                isButtonDisabled(plan)
                  ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                  : plan.highlighted
                    ? "bg-orange-500 text-white hover:bg-orange-600 shadow-lg shadow-orange-200"
                    : "border-2 border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white"
              }`}
            >
              {user?.subscriptionPlan === plan.type ? "Đang sử dụng" : plan.cta}
            </button>
          </div>
        ))}
      </div>

      {/* Comparison Table */}
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-black text-center text-slate-900 mb-12">
          So sánh chi tiết các tính năng
        </h2>
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white">
                <th className="p-5 font-bold">Tính năng</th>
                <th className="p-5 font-bold">Cơ Bản</th>
                <th className="p-5 font-bold">Tiêu Chuẩn</th>
                <th className="p-5 font-bold">Cao Cấp</th>
              </tr>
            </thead>
            <tbody className="text-slate-600">
              <tr className="border-b border-slate-100">
                <td className="p-5 font-medium">Số lượng so sánh</td>
                <td className="p-5">2 trường</td>
                <td className="p-5">4 trường</td>
                <td className="p-5">Không giới hạn</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="p-5 font-medium">AI Mentor (Chat)</td>
                <td className="p-5">5 câu/ngày</td>
                <td className="p-5">50 câu/ngày</td>
                <td className="p-5">Không giới hạn</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="p-5 font-medium">Trắc nghiệm định hướng</td>
                <td className="p-5">Bản rút gọn</td>
                <td className="p-5">Bản đầy đủ</td>
                <td className="p-5">Bản chuyên sâu</td>
              </tr>
              <tr>
                <td className="p-5 font-medium">Hỗ trợ khách hàng</td>
                <td className="p-5">Email</td>
                <td className="p-5">Email & Hotline</td>
                <td className="p-5">24/7 Ưu tiên</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Modal */}
      <AnimatePresence>
        {selectedPlan && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedPlan(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {paymentStatus === "success" ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-4xl">✅</span>
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 mb-2">
                    Thanh toán thành công!
                  </h2>
                  <p className="text-slate-500 mb-8">
                    Gói của bạn đã được kích hoạt.
                  </p>
                  <button
                    onClick={() => window.location.reload()}
                    className="bg-slate-900 text-white px-8 py-3 rounded-full font-bold hover:bg-slate-800 transition-all"
                  >
                    Đóng
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h2 className="text-2xl font-black text-slate-900">
                        Thanh toán
                      </h2>
                      <p className="text-slate-500 font-bold">
                        {selectedPlan.name} •{" "}
                        {selectedPlan.price.toLocaleString()}đ
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedPlan(null)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="text-center mb-8">
                    <p className="text-slate-600 text-sm mb-4">
                      Quét mã QR bên dưới bằng ứng dụng Ngân hàng để thanh toán
                    </p>
                    <div className="relative inline-block p-4 bg-slate-50 rounded-3xl border-2 border-slate-100">
                      <img
                        src={qrCode}
                        alt="QR"
                        className="w-64 h-64 rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="bg-orange-50 rounded-2xl p-4 border border-orange-100 mb-6">
                    <p className="text-xs text-orange-600 font-black uppercase tracking-widest mb-1">
                      Nội dung chuyển khoản:
                    </p>
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-xl font-black text-orange-900 font-mono">
                        {transactionCode}
                      </p>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(transactionCode);
                          alert("Đã sao chép mã!");
                        }}
                        className="text-orange-600 text-sm font-bold hover:underline"
                      >
                        Sao chép
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => checkPaymentStatus(selectedPlan.paymentId)}
                    disabled={paymentLoading}
                    className="w-full bg-orange-500 text-white py-4 rounded-full font-black hover:bg-orange-600 transition-all shadow-lg shadow-orange-200 disabled:opacity-50"
                  >
                    {paymentLoading
                      ? "Đang xác thực..."
                      : "Tôi đã chuyển khoản xong"}
                  </button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PricingPage;
