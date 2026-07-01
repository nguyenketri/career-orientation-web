import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getUser } from "../../utils/auth";
import { createPayment } from "../../services/paymentService";
import { getProfile } from "../../services/userService";

const PLAN_CYCLE_DAYS = { PAID: 30, PREMIUM: 90 };

const PricingPage = () => {
  const [user, setUser] = useState(getUser());
  const [paymentLoading, setPaymentLoading] = useState(false);

  // Lấy lại thông tin gói mới nhất từ server (localStorage có thể đã cũ),
  // đảm bảo số ngày còn lại hiển thị chính xác mỗi khi vào trang.
  useEffect(() => {
    getProfile()
      .then((res) => {
        if (res.data) {
          setUser(res.data);
          localStorage.setItem("user", JSON.stringify(res.data));
          window.dispatchEvent(new Event("userUpdate"));
        }
      })
      .catch((err) => {
        console.error("Không thể lấy thông tin gói mới nhất:", err);
      });
  }, []);

  const hasActivePlan =
    user?.subscriptionPlan === "PAID" || user?.subscriptionPlan === "PREMIUM";
  const daysRemaining =
    typeof user?.subscriptionDaysRemaining === "number"
      ? user.subscriptionDaysRemaining
      : user?.subscriptionExpiry
        ? Math.max(
            0,
            Math.ceil(
              (new Date(user.subscriptionExpiry) - new Date()) / 86400000,
            ),
          )
        : null;
  const cycleDays =
    user?.subscriptionCycleDays ||
    PLAN_CYCLE_DAYS[user?.subscriptionPlan] ||
    null;
  // Ngày bắt đầu chu kỳ hiện tại = ngày hết hạn - độ dài chu kỳ (30/90 ngày)
  const periodStart =
    user?.subscriptionExpiry && cycleDays
      ? new Date(
          new Date(user.subscriptionExpiry).getTime() - cycleDays * 86400000,
        )
      : null;
  const remainingPercent =
    cycleDays && daysRemaining !== null
      ? Math.min(100, Math.max(0, (daysRemaining / cycleDays) * 100))
      : 0;
  const elapsedPercent = 100 - remainingPercent;
  const isExpiringSoon = daysRemaining !== null && daysRemaining <= 3;
  // Hiện banner khi đang có gói trả phí, kể cả trường hợp thiếu dữ liệu ngày hết hạn
  // (dữ liệu cũ/nhập tay) — lúc đó chỉ ẩn phần đếm ngày thay vì ẩn cả banner.
  const showSubscriptionBanner = hasActivePlan;

  const formatShortDate = (d) =>
    new Date(d).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

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
      {/* Subscription Status Banner */}
      {showSubscriptionBanner && (
        <div className="max-w-3xl mx-auto mb-12">
          <div
            className={`rounded-2xl border p-5 shadow-sm ${
              isExpiringSoon
                ? "bg-amber-50 border-amber-200"
                : user.subscriptionPlan === "PREMIUM"
                  ? "bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200"
                  : "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200"
            }`}
          >
            <div className="flex items-center gap-4 mb-4">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 ${
                  isExpiringSoon
                    ? "bg-amber-100"
                    : user.subscriptionPlan === "PREMIUM"
                      ? "bg-purple-100"
                      : "bg-blue-100"
                }`}
              >
                {user.subscriptionPlan === "PREMIUM" ? "⭐" : "✔️"}
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm font-black ${
                    isExpiringSoon
                      ? "text-amber-700"
                      : user.subscriptionPlan === "PREMIUM"
                        ? "text-purple-700"
                        : "text-blue-700"
                  }`}
                >
                  Gói{" "}
                  {user.subscriptionPlan === "PREMIUM"
                    ? "CAO CẤP"
                    : "TIÊU CHUẨN"}{" "}
                  đang hoạt động
                </p>
                {isExpiringSoon && (
                  <p className="text-xs text-amber-600 font-semibold">
                    Gia hạn sớm để không bị gián đoạn trải nghiệm
                  </p>
                )}
              </div>
              {daysRemaining !== null && (
                <span
                  className={`text-xs font-black px-3 py-1.5 rounded-full shrink-0 ${
                    isExpiringSoon
                      ? "bg-amber-100 text-amber-700"
                      : user.subscriptionPlan === "PREMIUM"
                        ? "bg-purple-100 text-purple-700"
                        : "bg-blue-100 text-blue-700"
                  }`}
                >
                  Còn {daysRemaining} ngày
                </span>
              )}
            </div>

            {/* Date range timeline */}
            {periodStart && user?.subscriptionExpiry ? (
              <div>
                <div className="h-2 bg-white/70 rounded-full overflow-hidden relative">
                  <div
                    style={{ width: `${elapsedPercent}%` }}
                    className={`h-full rounded-full transition-all duration-500 ${
                      isExpiringSoon
                        ? "bg-amber-400"
                        : user.subscriptionPlan === "PREMIUM"
                          ? "bg-purple-400"
                          : "bg-blue-400"
                    }`}
                  />
                  <div
                    style={{ left: `${elapsedPercent}%` }}
                    className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full border-2 border-white shadow ${
                      isExpiringSoon
                        ? "bg-amber-500"
                        : user.subscriptionPlan === "PREMIUM"
                          ? "bg-purple-500"
                          : "bg-blue-500"
                    }`}
                  />
                </div>
                <div className="flex items-center justify-between mt-1.5">
                  <span className="text-[11px] font-bold text-slate-400">
                    Bắt đầu: {formatShortDate(periodStart)}
                  </span>
                  <span className="text-[11px] font-bold text-slate-400">
                    Hết hạn: {formatShortDate(user.subscriptionExpiry)}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500">
                Đang cập nhật ngày bắt đầu/kết thúc...
              </p>
            )}
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h1 className="text-4xl font-black text-slate-900 mb-4">
          Chọn gói dịch vụ phù hợp cho tương lai của bạn
        </h1>
        <p className="text-slate-500 text-lg">
          caZup AI đồng hành cùng học sinh Việt Nam với công cụ AI thông minh
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
            {user?.subscriptionPlan === plan.type &&
              plan.type !== "FREE" &&
              daysRemaining !== null && (
                <p
                  className={`text-center text-xs font-bold mt-3 ${
                    isExpiringSoon ? "text-amber-600" : "text-slate-400"
                  }`}
                >
                  Còn {daysRemaining} ngày sử dụng
                </p>
              )}
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
