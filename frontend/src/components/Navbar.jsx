import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getUser, logoutUser } from "../utils/auth";
import NotificationBell from "./NotificationBell";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(getUser());
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);

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

  // Đóng dropdown khi bấm ra ngoài
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(e.target)
      ) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    setIsProfileMenuOpen(false);
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
        <div className="hidden lg:flex items-center gap-6 xl:gap-8">
          {navLinks
            .filter((link) => {
              if (isAdminPage) {
                return link.path.startsWith("/admin");
              }
              return isAdminUser || !link.path.startsWith("/admin");
            })
            .map((link) => (
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
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Notifications */}
          {user && <NotificationBell />}

          {/* User Profile / Auth */}
          {user ? (
            <div className="relative" ref={profileMenuRef}>
              <button
                onClick={() => setIsProfileMenuOpen((v) => !v)}
                className="flex items-center gap-2 group"
              >
                <div className="h-8 w-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 group-hover:bg-slate-200 transition overflow-hidden">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
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
                  )}
                </div>
              </button>

              {/* Profile Dropdown */}
              {isProfileMenuOpen && (
                <div className="absolute right-0 top-[calc(100%+10px)] w-64 bg-white rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/60 overflow-hidden z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                  <div className="flex items-center gap-3 px-4 py-4 border-b border-slate-100">
                    <div className="h-11 w-11 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 overflow-hidden flex-shrink-0">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <svg
                          className="h-6 w-6"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-slate-900 text-sm truncate">
                        {user.name || "Người dùng"}
                      </div>
                      <div className="text-xs text-slate-400 truncate">
                        {user.email}
                      </div>
                    </div>
                  </div>

                  <div className="py-2">
                    <Link
                      to="/profile"
                      onClick={() => setIsProfileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition"
                    >
                      <svg
                        className="h-4 w-4 text-slate-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      Thông tin cá nhân
                    </Link>
                    <Link
                      to="/payment-history"
                      onClick={() => setIsProfileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition"
                    >
                      <svg
                        className="h-4 w-4 text-slate-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 14l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                        />
                      </svg>
                      Lịch sử Thanh Toán
                    </Link>
                  </div>

                  <div className="py-2 border-t border-slate-100">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 transition"
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
                      Đăng xuất
                    </button>
                  </div>
                </div>
              )}
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
            className="lg:hidden p-2 text-slate-600 hover:text-orange-500 transition"
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
                  d="M4 6h16M4 12h16m-7 6h7"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div className="lg:hidden absolute top-16 left-0 w-full bg-white border-b border-gray-100 shadow-lg animate-in slide-in-from-top duration-200">
          <div className="px-4 py-4 flex flex-col gap-4">
            {navLinks
              .filter((link) => {
                if (isAdminPage) {
                  return link.path.startsWith("/admin");
                }
                return isAdminUser || !link.path.startsWith("/admin");
              })
              .map((link) => (
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
            {!isAdminPage && !isAdminUser && (
              <Link
                to="/pricing"
                onClick={() => setIsMenuOpen(false)}
                className="bg-[#0f172a] text-white px-4 py-2 rounded-full text-center text-sm font-bold hover:bg-slate-800 transition shadow-sm"
              >
                Upgrade
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
