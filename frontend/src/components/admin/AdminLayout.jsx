import { Link, useLocation, useNavigate } from "react-router-dom";
import { logoutUser } from "../../utils/auth";

const AdminLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { name: "Dashboard", path: "/admin/dashboard", icon: "📊" },
    { name: "Quản lý User", path: "/admin/users", icon: "👥" },
    { name: "Quản lý Ngành/Trường", path: "/admin/majors", icon: "🎓" },
    { name: "Quản lý Câu hỏi", path: "/admin/questions", icon: "❓" },
    { name: "Quản lý Thanh toán", path: "/admin/payments", icon: "💳" },
  ];

  const handleLogout = () => {
    logoutUser();
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0f172a] text-white flex flex-col">
        <div className="p-6 border-b border-slate-700">
          <h1 className="text-lg font-bold">Admin Panel</h1>
          <p className="text-xs text-slate-400">System Controller</p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                location.pathname === item.path
                  ? "bg-[#1e293b] text-white"
                  : "text-slate-400 hover:bg-[#1e293b] hover:text-white"
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.name}</span>
            </Link>
          ))}
        </nav>

        <div className="p-6 border-t border-slate-700">
          <button className="w-full bg-orange-500 py-2 rounded-lg font-bold text-sm mb-4 hover:bg-orange-600 transition">
            Generate Report
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-slate-400 hover:text-white text-sm transition"
          >
            <span>🚪</span> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  );
};

export default AdminLayout;
