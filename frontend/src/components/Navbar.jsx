import { Link, useLocation, useNavigate } from "react-router-dom";
import { getUser, logoutUser } from "../utils/auth";

const Navbar = () => {
  const user = getUser();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logoutUser();
    navigate("/login");
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const navLinks = [
    { name: "Trang Chủ", path: "/" },
    { name: "Lịch sử", path: "/history" },
    { name: "Gợi ý ngành học", path: "/recommend" },
    { name: "So sánh ngành học", path: "/compare" },
    { name: "Trắc nghiệm Holland", path: "/holland" },
    { name: "Trắc nghiệm MBTI", path: "/mbti" },
    { name: "Cố vấn AI", path: "/mentor" },
  ];

  return (
    <nav className="sticky top-0 w-full z-50 flex flex-col shadow-md">
      {/* Upper Bar: White background */}
      <div className="bg-white w-full border-b border-gray-200">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-8 py-6">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 text-4xl font-extrabold tracking-tighter text-blue-600 hover:opacity-80 transition"
          >
            ca<span className="text-purple-600">Zup</span>
          </Link>

          {/* Top Actions */}
          <div className="flex items-center gap-4">
            <Link
              to="/pricing"
              className="rounded-full border border-blue-500 px-6 py-2 text-sm font-medium text-blue-600 transition hover:bg-blue-50"
            >
              Nâng Cấp
            </Link>

            {user ? (
              <div className="flex items-center gap-4 ml-4 pl-4 border-l border-gray-300">
                <Link
                  to="/profile"
                  className="text-sm font-bold text-gray-700 hover:text-blue-600 transition"
                >
                  {user.name}
                </Link>
                <button
                  onClick={handleLogout}
                  className="rounded-full bg-gray-100 px-6 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-200"
                >
                  Đăng xuất
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4 ml-4 pl-4 border-l border-gray-300">
                <Link
                  to="/login"
                  className="text-sm font-bold text-gray-700 hover:text-blue-600 transition"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="rounded-full bg-blue-600 px-6 py-2 text-sm font-bold text-white transition hover:bg-blue-700 hover:shadow-md"
                >
                  Bắt đầu
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lower Bar: Blue background */}
      <div className="bg-[#2563eb] w-full">
        <div className="mx-auto flex max-w-7xl items-center px-8 h-16 overflow-x-auto hide-scrollbar">
          <div className="flex items-center gap-10 text-[16px] font-semibold text-white/90 whitespace-nowrap h-full">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`transition h-full flex items-center border-b-4 px-2 ${
                  isActive(link.path)
                    ? "border-white text-white font-bold"
                    : "border-transparent hover:text-white hover:border-white/50"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
