import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getUser } from "../../utils/auth";
import { createPayment } from "../../services/paymentService";

const PricingPage = () => {
  const [user] = useState(getUser());
  const [paymentLoading, setPaymentLoading] = useState(false);

  const plans = [
    {
      name: "Gói CƠ BẢN",
      price: 0,
      type: "FREE",
      features: [
        { text: "So sánh tối đa 2 trường cùng lúc", checked: true },
        { text: "Gợi ý ngành/trường (3 lượt/ngày)", checked: true },
        { text: "AI Mentor tư vấn (5 câu/ngày)", checked: true },
        { text: "Trắc nghiệm Holland/MBTI rút gọn", checked: true },
        { text: "Không lưu lịch sử so sánh", checked: false },
      ],
      cta: "Bắt đầu miễn phí",
    },
    {
      name: "Gói TIÊU CHUẨN",
      price: 99000,
      type: "PAID",
      features: [
        { text: "So sánh chi tiết 5 trường đại học", checked: true },
        { text: "Gợi ý ngành/trường (20 lượt/ngày)", checked: true },
        { text: "AI Mentor tư vấn (50 câu/ngày)", checked: true },
        { text: "Báo cáo kết quả trắc nghiệm đầy đủ", checked: true },
        { text: "Lưu lịch sử test Holland/MBTI/Recommand", checked: true },
      ],
      highlighted: true,
      cta: "Nâng cấp ngay",
    },
    {
      name: "Gói CAO CẤP",
      price: 199000,
      type: "PREMIUM",
      features: [
        { text: "So sánh không giới hạn trường & ngành", checked: true },
        { text: "Gợi ý ngành/trường (Không giới hạn)", checked: true },
        { text: "AI Mentor tư vấn (Không giới hạn + Ưu tiên)", checked: true },
        {
          text: "Xuất File PDF test Holland/MBTI có AI phân tích kết quả",
          checked: true,
        },
        { text: "Hỗ trợ 24/7 từ đội ngũ kỹ thuật", checked: true },
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

    try {
      setPaymentLoading(true);
      const data = await createPayment(plan.type);
      const { checkoutUrl, paymentId } = data.data;

      if (checkoutUrl) {
        // Lưu paymentId để trang success dùng polling kiểm tra trạng thái
        localStorage.setItem("pending_payment_id", paymentId);
        window.location.href = checkoutUrl;
      } else {
        throw new Error("Không nhận được link thanh toán từ hệ thống.");
      }
    } catch (error) {
      alert("Lỗi: " + (error.response?.data?.message || error.message));
    } finally {
      setPaymentLoading(false);
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
                <td className="p-5">5 trường</td>
                <td className="p-5">Không giới hạn</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="p-5 font-medium">Gợi ý ngành/trường</td>
                <td className="p-5">3 lượt/ngày</td>
                <td className="p-5">20 lượt/ngày</td>
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

      {/* Payment Loading Modal */}
      <AnimatePresence>
        {paymentLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl text-center"
            >
              <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
              <h2 className="text-2xl font-black text-slate-900 mb-2">
                Đang khởi tạo thanh toán...
              </h2>
              <p className="text-slate-500">
                Vui lòng chờ trong giây lát, chúng tôi đang chuyển bạn đến cổng
                thanh toán payOS.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PricingPage;
