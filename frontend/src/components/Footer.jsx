import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t border-white/10 bg-black px-6 py-16 text-white">
      <div className="mx-auto grid max-w-7xl gap-12 md:grid-cols-2 lg:grid-cols-4">
        {/* Brand */}
        <div>
          <h2 className="mb-4 text-3xl font-bold">caZup</h2>

          <p className="leading-relaxed text-gray-400">
            AI-powered career guidance platform helping students discover the
            right majors, universities, and future career paths.
          </p>
        </div>

        {/* Navigation */}
        <div>
          <h3 className="mb-4 text-lg font-semibold">Navigation</h3>

          <div className="flex flex-col gap-3 text-gray-400">
            <Link to="/" className="hover:text-white transition">
              Home
            </Link>

            <Link to="/recommend" className="hover:text-white transition">
              Recommend
            </Link>

            <Link to="/holland" className="hover:text-white transition">
              Holland Test
            </Link>
          </div>
        </div>

        {/* Account */}
        <div>
          <h3 className="mb-4 text-lg font-semibold">Account</h3>

          <div className="flex flex-col gap-3 text-gray-400">
            <Link to="/login" className="hover:text-white transition">
              Login
            </Link>

            <Link to="/register" className="hover:text-white transition">
              Register
            </Link>
          </div>
        </div>

        {/* Social */}
        <div>
          <h3 className="mb-4 text-lg font-semibold">Connect</h3>

          <div className="flex flex-col gap-3 text-gray-400">
            <a href="#" className="hover:text-white transition">
              Facebook
            </a>

            <a href="#" className="hover:text-white transition">
              LinkedIn
            </a>

            <a href="#" className="hover:text-white transition">
              GitHub
            </a>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="mx-auto mt-16 max-w-7xl border-t border-white/10 pt-6 text-center text-sm text-gray-500">
        © 2026 caZup. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
