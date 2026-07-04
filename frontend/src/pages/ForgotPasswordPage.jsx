import { useState } from "react";
import { Link } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout";
import { forgotPassword } from "../services/authService";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      await forgotPassword(email);
      setMessage(
        "Một đường link đặt lại mật khẩu đã được gửi đến email của bạn.",
      );
    } catch (err) {
      setError(
        err.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại sau.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="mb-8 text-center">
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.3em] text-blue-600">
          Khôi phục tài khoản
        </p>
        <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
          Quên mật khẩu?
        </h2>
        <p className="mt-4 text-slate-500 text-sm leading-relaxed">
          Nhập email của bạn, chúng tôi sẽ gửi một đường link để bạn đặt lại
          mật khẩu mới.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="mb-2 block text-sm text-slate-600">Email</label>
          <input
            type="email"
            placeholder="Nhập email của bạn"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-xl border border-blue-100 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500"
          />
        </div>

        {message && (
          <div className="rounded-xl border border-green-500/20 bg-green-500/10 p-3 text-sm text-green-600">
            {message}
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-orange-500 py-3 font-semibold text-white transition hover:scale-[1.02] hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? "Đang gửi..." : "Gửi link khôi phục"}
        </button>
      </form>

      <div className="mt-8 text-center">
        <Link
          to="/login"
          className="text-sm font-medium text-slate-500 hover:text-blue-600 transition"
        >
          ← Quay lại Đăng nhập
        </Link>
      </div>
    </AuthLayout>
  );
};

export default ForgotPasswordPage;
