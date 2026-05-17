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
    <nav className="fixed top-0 left-0 w-full border-b border-white/10 bg-black/30 backdrop-blur-lg z-50">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold text-white">
          caZup
        </Link>

        {/* Menu */}
        <div className="hidden md:flex items-center gap-8 text-sm text-gray-300">
          <Link to="/" className="hover:text-white transition">
            Home
          </Link>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/recommend" className="hover:text-white transition">
            Recommend
          </Link>

          <Link to="/holland" className="hover:text-white transition">
            Holland Test
          </Link>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-white">{user.name}</span>

              <button
                onClick={handleLogout}
                className="rounded-xl border border-white/10 px-5 py-2 text-sm text-white transition hover:bg-white hover:text-black"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="rounded-xl bg-white px-5 py-2 text-sm font-semibold text-black transition hover:scale-105"
            >
              Login
            </Link>
          )}

          <Link
            to="/register"
            className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-black transition hover:scale-105"
          >
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
