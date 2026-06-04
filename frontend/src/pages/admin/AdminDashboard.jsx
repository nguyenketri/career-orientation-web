import { useEffect, useState } from "react";
import axiosClient from "../../api/axios";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axiosClient.get("/admin/stats");
        setStats(res.data.data);
      } catch (err) {
        console.error("Error fetching stats:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading)
    return (
      <div className="flex items-center justify-center h-full">Đang tải...</div>
    );

  const statCards = [
    {
      name: "Tổng người dùng",
      value: stats?.totalUsers,
      icon: "👥",
      color: "bg-blue-500",
    },
    {
      name: "Tổng giao dịch",
      value: stats?.totalPayments,
      icon: "💳",
      color: "bg-purple-500",
    },
    {
      name: "Giao dịch thành công",
      value: stats?.successfulPayments,
      icon: "✅",
      color: "bg-green-500",
    },
    {
      name: "Tổng doanh thu",
      value: `${stats?.totalRevenue?.toLocaleString()}đ`,
      icon: "💰",
      color: "bg-amber-500",
    },
  ];

  return (
    <div>
      <h2 className="text-3xl font-black text-slate-900 mb-8">
        Tổng quan hệ thống
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => (
          <div
            key={card.name}
            className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100"
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className={`w-12 h-12 ${card.color} rounded-2xl flex items-center justify-center text-2xl text-white shadow-lg`}
              >
                {card.icon}
              </div>
            </div>
            <p className="text-slate-500 font-medium">{card.name}</p>
            <h3 className="text-2xl font-black text-slate-900">{card.value}</h3>
          </div>
        ))}
      </div>

      <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <h3 className="text-xl font-bold mb-6">Hoạt động gần đây</h3>
          <p className="text-slate-500 italic">
            Tính năng đang được phát triển...
          </p>
        </div>
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <h3 className="text-xl font-bold mb-6">Phân bổ người dùng</h3>
          <p className="text-slate-500 italic">
            Tính năng đang được phát triển...
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
