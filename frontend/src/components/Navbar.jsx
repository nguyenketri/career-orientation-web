import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getUser, logoutUser } from "../utils/auth";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(getUser());
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleUserUpdate = () => {
      setUser(getUser());
    };
    window.addEventListener("userUpdate", handleUserUpdate);
    // Also check on storage change (e.g. login in another tab)
    window.addEventListener("storage", handleUserUpdate);
    return () => {
      window.removeEventListener("userUpdate", handleUserUpdate);
      window.removeEventListener("storage", handleUserUpdate);
    };
  }, []);

  const handleLogout = () => {
    logoutUser();
    navigate("/login");
    window.dispatchEvent(new Event("userUpdate"));
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const isAdminPage = location.pathname.startsWith("/admin");
  const isAdminUser = user?.role === "admin";

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Compare", path: "/comparison" },
    { name: "Recommend", path: "/recommend" },
    { name: "Tests", path: "/tests" },
    { name: "AI Mentor", path: "/mentor" },
    { name: "History", path: "/history" },
  ];

  const filteredLinks = navLinks.filter((link) => {
    if (isAdminPage) {
      return link.path.startsWith("/admin");
    }
    return isAdminUser || !link.path.startsWith("/admin");
  });

  if (isAdminUser) {
    navLinks.push({ name: "Admin Panel", path: "/admin/dashboard" });
  }

  return (
    <nav className="sticky top-0 w-full z-50 bg-white border-b border-gray-100">
      <div className="mx-auto max-w-7xl px-4 md:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center hover:opacity-80 transition">
          <img
            src="/logoCazup.png"
            alt="caZup Logo"
            className="h-8 w-auto object-contain"
          />
        </Link>

        {/* Center Navigation - Desktop */}
        <div className="hidden md:flex items-center gap-8">
          {filteredLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`text-sm font-medium transition-colors ${
                isActive(link.path)
                  ? "text-orange-500 font-bold"
                  : "text-slate-600 hover:text-orange-500"
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Notification Icon - Hidden on admin pages or for admin users */}
          {!isAdminPage && !isAdminUser && (
            <button className="p-2 text-slate-400 hover:text-slate-600 transition">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
            </button>
          )}

          {/* User Profile / Auth */}
          {user ? (
            <div className="flex items-center gap-3">
              <Link to="/profile" className="flex items-center gap-2 group">
                <div className="h-8 w-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 group-hover:bg-slate-200 transition">
                  <svg
                    className="h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </Link>
              <button
                onClick={handleLogout}
                className="hidden sm:block text-xs font-medium text-slate-500 hover:text-red-500 transition"
              >
                Đăng xuất
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="text-sm font-medium text-slate-600 hover:text-orange-500 transition"
              >
                Đăng nhập
              </Link>
            </div>
          )}

          {/* Upgrade Button - Hidden on admin pages or for admin users */}
          {!isAdminPage && !isAdminUser && (
            <Link
              to="/pricing"
              className="hidden sm:block bg-[#0f172a] text-white px-4 py-2 rounded-full text-xs font-bold hover:bg-slate-800 transition shadow-sm"
            >
              Upgrade
            </Link>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-slate-600 hover:text-orange-500 transition"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 w-full bg-white border-b border-gray-100 shadow-lg animate-in slide-in-from-top duration-200">
            <div className="flex flex-col p-4 gap-4">
              {filteredLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`text-base font-medium transition-colors ${
                    isActive(link.path)
                      ? "text-orange-500 font-bold"
                      : "text-slate-600 hover:text-orange-500"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              <hr className="border-gray-100" />
              {/* Mobile Upgrade Button */}
              {!isAdminPage && !isAdminUser && (
                <Link
                  to="/pricing"
                  onClick={() => setIsMenuOpen(false)}
                  className="bg-[#0f172a] text-white px-4 py-3 rounded-xl text-center text-sm font-bold hover:bg-slate-800 transition"
                >
                  Upgrade
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
