import { useNavigate } from "react-router-dom";

const UpgradePrompt = ({
  feature,
  requiredPlan,
  currentPlan,
  backPath,
  onBack,
}) => {
  const navigate = useNavigate();

  const planLabels = {
    FREE: "Miễn Phí",
    PAID: "Trả Phí",
    PREMIUM: "Cao Cấp",
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 sm:px-6">
      <div className="max-w-lg w-full text-center">
        <div className="rounded-3xl border border-purple-500/20 bg-purple-500/5 p-6 sm:p-12">
          <div className="text-6xl mb-6">🔒</div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            Tính năng yêu cầu nâng cấp
          </h2>
          <p className="text-gray-400 mb-2 text-lg">
            <span className="text-purple-400 font-semibold">{feature}</span> chỉ
            dành cho gói{" "}
            <span className="text-yellow-400 font-semibold">
              {requiredPlan.map((p) => planLabels[p] || p).join(" / ")}
            </span>
          </p>
          <p className="text-gray-500 mb-8">
            Gói hiện tại của bạn:{" "}
            <span className="text-white font-medium">
              {planLabels[currentPlan] || currentPlan}
            </span>
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate("/pricing")}
              className="px-8 py-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold hover:shadow-lg hover:shadow-purple-500/30 transition"
            >
              Nâng cấp ngay
            </button>
            <button
              onClick={() => {
                if (onBack) {
                  onBack();
                } else if (backPath) {
                  navigate(backPath);
                } else {
                  navigate(-1);
                }
              }}
              className="px-8 py-3 rounded-full bg-white/10 text-white font-medium hover:bg-white/20 transition"
            >
              Quay lại
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpgradePrompt;
