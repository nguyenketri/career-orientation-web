import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t border-slate-100 bg-white px-6 py-16 text-slate-900">
      <div className="mx-auto grid max-w-7xl gap-12 md:grid-cols-2 lg:grid-cols-4">
        {/* Brand */}
        <div>
          <h2 className="mb-4 text-3xl font-black text-blue-600">caZup</h2>

          <p className="leading-relaxed text-slate-600 font-medium">
            Nền tảng hướng nghiệp ứng dụng AI giúp học sinh khám phá đúng ngành
            học, trường đại học và con đường sự nghiệp tương lai.
          </p>
        </div>

        {/* Navigation */}
        <div>
          <h3 className="mb-4 text-lg font-bold text-slate-900">Điều hướng</h3>

          <div className="flex flex-col gap-3 text-slate-600 font-medium">
            <Link to="/" className="hover:text-blue-600 transition">
              Trang chủ
            </Link>

            <Link to="/recommend" className="hover:text-blue-600 transition">
              Gợi ý nghề nghiệp
            </Link>

            <Link to="/holland" className="hover:text-blue-600 transition">
              Trắc nghiệm Holland
            </Link>
          </div>
        </div>

        {/* Account */}
        <div>
          <h3 className="mb-4 text-lg font-bold text-slate-900">Tài khoản</h3>

          <div className="flex flex-col gap-3 text-slate-600 font-medium">
            <Link to="/login" className="hover:text-blue-600 transition">
              Đăng nhập
            </Link>

            <Link to="/register" className="hover:text-blue-600 transition">
              Đăng ký
            </Link>
          </div>
        </div>

        {/* Social */}
        <div>
          <h3 className="mb-4 text-lg font-bold text-slate-900">Kết nối</h3>

          <div className="flex flex-col gap-3 text-slate-600 font-medium">
            <a href="#" className="hover:text-blue-600 transition">
              Facebook
            </a>

            <a href="#" className="hover:text-blue-600 transition">
              LinkedIn
            </a>

            <a href="#" className="hover:text-blue-600 transition">
              GitHub
            </a>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="mx-auto mt-16 max-w-7xl border-t border-slate-100 pt-6 text-center text-sm text-slate-400 font-medium">
        © 2026 caZup. Bản quyền đã được bảo lưu.
      </div>
    </footer>
  );
};

export default Footer;
