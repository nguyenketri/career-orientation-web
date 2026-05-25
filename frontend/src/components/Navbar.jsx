import { Link } from "react-router-dom";
import { getUser, logoutUser } from "../utils/auth";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const user = getUser();

  const navigate = useNavigate();

  const handleLogout = () => {
    logoutUser();

    navigate("/login");
  };
  return (
    <nav className="fixed top-0 left-0 w-full border-b border-white/10 bg-black/50 backdrop-blur-xl z-50">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-8 py-5">
        {/* Logo */}
        <Link
          to="/"
          className="text-3xl font-extrabold tracking-tighter text-white hover:opacity-80 transition"
        >
          ca<span className="text-purple-500">Zup</span>
        </Link>

        {/* Menu */}
        <div className="hidden lg:flex items-center gap-10 text-base font-medium text-gray-300">
          <Link to="/dashboard" className="hover:text-white transition">
            Dashboard
          </Link>
          <Link to="/recommend" className="hover:text-white transition">
            Recommend
          </Link>
          <Link to="/compare" className="hover:text-white transition">
            Compare
          </Link>

          <Link to="/holland" className="hover:text-white transition">
            Holland Test
          </Link>

          <Link to="/mbti" className="hover:text-white transition">
            MBTI Test
          </Link>

          <Link
            to="/mentor"
            className="hover:text-white transition font-bold text-purple-400 hover:text-purple-300"
          >
            AI Mentor
          </Link>

          <Link
            to="/pricing"
            className="hover:text-white transition font-bold text-pink-400 hover:text-pink-300"
          >
            Nâng Cấp
          </Link>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-6">
          {user ? (
            <div className="flex items-center gap-6">
              <Link
                to="/profile"
                className="text-base font-semibold text-white hover:text-purple-400 transition"
              >
                {user.name}
              </Link>

              <button
                onClick={handleLogout}
                className="rounded-2xl border border-white/20 px-6 py-2.5 text-base font-medium text-white transition hover:bg-white hover:text-black"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="rounded-2xl bg-white px-6 py-2.5 text-base font-bold text-black transition hover:scale-105 active:scale-95"
            >
              Login
            </Link>
          )}

          <Link
            to="/register"
            className="hidden sm:block rounded-full bg-gradient-to-r from-purple-600 to-blue-600 px-7 py-2.5 text-base font-bold text-white transition hover:shadow-[0_0_20px_rgba(147,51,234,0.5)] hover:scale-105 active:scale-95"
          >
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
