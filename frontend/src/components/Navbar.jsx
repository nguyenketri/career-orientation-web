import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getUser, logoutUser } from "../utils/auth";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(getUser());

  useEffect(() => {
    setUser(getUser());
  }, [location]);

  useEffect(() => {
    const handleUserUpdate = () => {
      setUser(getUser());
    };
    window.addEventListener("userUpdate", handleUserUpdate);
    return () => window.removeEventListener("userUpdate", handleUserUpdate);
  }, []);

  const handleLogout = () => {
    logoutUser();
    navigate("/login");
    window.dispatchEvent(new Event("userUpdate"));
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
      <div className="bg-white w-full border-b border-gray-200 overflow-x-auto hide-scrollbar">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 md:px-8 py-4 md:py-6 min-w-max md:min-w-0">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center hover:opacity-80 transition mr-4"
          >
            <img
              src="/logoCazup.jpg"
              alt="caZup Logo"
              className="h-10 md:h-14 w-auto object-contain rounded-lg"
            />
          </Link>

          {/* Top Actions */}
          <div className="flex items-center gap-2 md:gap-4 ml-auto">
            <Link
              to="/pricing"
              className="hidden sm:block rounded-full border border-blue-500 px-4 md:px-6 py-2 text-xs md:text-sm font-medium text-blue-600 transition hover:bg-blue-50"
            >
              Nâng Cấp
            </Link>

            {user ? (
              <div className="flex items-center gap-3 md:gap-4 ml-2 border-l border-gray-300 pl-3 md:pl-6">
                <Link
                  to="/profile"
                  className="flex items-center gap-2 group transition"
                >
                  {/* Avatar Icon */}
                  <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-500 shadow-sm group-hover:bg-gray-200 transition">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 md:h-6 md:w-6"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>

                  {/* User Info */}
                  <div className="flex flex-col">
                    <span className="text-xs md:text-sm font-bold text-gray-800 group-hover:text-blue-600 transition leading-tight">
                      {user.name}
                    </span>
                    <span
                      className={`text-[8px] md:text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter mt-0.5 border w-fit ${
                        user.subscriptionPlan === "PREMIUM"
                          ? "bg-purple-100 text-purple-700 border-purple-200"
                          : user.subscriptionPlan === "PAID"
                            ? "bg-blue-100 text-blue-700 border-blue-200"
                            : "bg-gray-100 text-gray-600 border-gray-200"
                      }`}
                    >
                      {user.subscriptionPlan === "PREMIUM"
                        ? "⚡ Cao Cấp"
                        : user.subscriptionPlan === "PAID"
                          ? "✔️ Trả Phí"
                          : "Miễn Phí"}
                    </span>
                  </div>
                </Link>

                <button
                  onClick={handleLogout}
                  className="rounded-full bg-gray-50 p-2 md:px-4 md:py-2 text-gray-500 hover:text-red-600 hover:bg-red-50 transition flex items-center gap-1"
                  title="Đăng xuất"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 md:h-5 md:w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  <span className="hidden md:inline text-xs font-medium">
                    Đăng xuất
                  </span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 md:gap-4 ml-2 border-l border-gray-300 pl-2 md:pl-4">
                <Link
                  to="/login"
                  className="text-xs md:text-sm font-bold text-gray-700 hover:text-blue-600 transition"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="rounded-full bg-blue-600 px-4 md:px-6 py-2 text-xs md:text-sm font-bold text-white transition hover:bg-blue-700 hover:shadow-md"
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
        <div className="mx-auto flex max-w-7xl items-center px-4 md:px-8 h-16 overflow-x-auto hide-scrollbar">
          <div className="flex items-center gap-6 md:gap-10 text-sm md:text-[16px] font-semibold text-white/90 whitespace-nowrap h-full">
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
