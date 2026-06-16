import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-slate-900 px-6 py-16 text-white">
      <div className="mx-auto grid max-w-7xl gap-12 md:grid-cols-2 lg:grid-cols-4">
        {/* Brand */}
        <div>
          <h2 className="mb-4 text-3xl font-black text-white">caZup</h2>
          <p className="leading-relaxed text-slate-400 font-medium">
            Nền tảng hướng nghiệp ứng dụng AI giúp học sinh khám phá đúng ngành
            học, trường đại học và con đường sự nghiệp tương lai.
          </p>
        </div>

        {/* Navigation */}
        <div>
          <h3 className="mb-4 text-lg font-bold text-white">Điều hướng</h3>
          <div className="flex flex-col gap-3 text-slate-400 font-medium">
            <Link to="/" className="hover:text-blue-400 transition">
              Trang chủ
            </Link>
            <Link to="/recommend" className="hover:text-blue-400 transition">
              Gợi ý nghề nghiệp
            </Link>
            <Link to="/tests" className="hover:text-blue-400 transition">
              Trắc nghiệm Holland
            </Link>
          </div>
        </div>

        {/* Account */}
        <div>
          <h3 className="mb-4 text-lg font-bold text-white">Tài khoản</h3>
          <div className="flex flex-col gap-3 text-slate-400 font-medium">
            <Link to="/login" className="hover:text-blue-400 transition">
              Đăng nhập
            </Link>
            <Link to="/register" className="hover:text-blue-400 transition">
              Đăng ký
            </Link>
          </div>
        </div>

        {/* Social */}
        <div>
          <h3 className="mb-4 text-lg font-bold text-white">Kết nối</h3>
          <div className="flex flex-col gap-3 text-slate-400 font-medium">
            <a
              href="https://www.facebook.com/giaiphapdinhhuongnganhhoccazup"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-400 transition"
            >
              Facebook
            </a>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="mx-auto mt-16 max-w-7xl border-t border-slate-800 pt-6 text-center text-sm text-slate-500 font-medium">
        © Contact caZUP by email: cazup.vn@gmail.com.
      </div>
    </footer>
  );
};

export default Footer;
