import { useEffect, useState } from "react";
import axiosClient from "../../api/axios";

const PLAN_LABEL = { FREE: "Cơ bản", PAID: "Tiêu chuẩn", PREMIUM: "Cao cấp" };

const DashboardPage = () => {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axiosClient.get("/users/me");
        setUserData(res.data.data);
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
    };
    fetchProfile();
  }, []);

  if (!userData) return <div className="pt-32 text-center">Đang tải...</div>;

  const { careerPath, subscriptionPlan } = userData;

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-20 px-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-black text-slate-900 mb-8">
          Lộ trình của bạn
        </h1>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Kết quả trắc nghiệm */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <h2 className="text-xl font-bold mb-6">Kết quả trắc nghiệm</h2>
            <div className="space-y-4">
              <div className="flex justify-between p-4 bg-blue-50 rounded-xl">
                <span className="font-bold text-blue-900">Holland:</span>
                <span className="text-blue-600 font-black">
                  {careerPath?.hollandType || "Chưa thực hiện"}
                </span>
              </div>
              <div className="flex justify-between p-4 bg-purple-50 rounded-xl">
                <span className="font-bold text-purple-900">MBTI:</span>
                <span className="text-purple-600 font-black">
                  {careerPath?.mbtiType || "Chưa thực hiện"}
                </span>
              </div>
            </div>
          </div>

          {/* Gói dịch vụ */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <h2 className="text-xl font-bold mb-6">Gói dịch vụ hiện tại</h2>
            <div className="text-center py-4">
              <div className="text-3xl font-black text-blue-600 mb-2">
                {PLAN_LABEL[subscriptionPlan] || subscriptionPlan}
              </div>
              <p className="text-slate-500">
                Bạn đang sử dụng gói {PLAN_LABEL[subscriptionPlan] || subscriptionPlan}. Nâng cấp để mở khóa lộ
                trình chuyên sâu.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
