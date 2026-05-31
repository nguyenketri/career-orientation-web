import { useState } from "react";
import { Link } from "react-router-dom";
import { loginUser } from "../services/authService";
import { useNavigate } from "react-router-dom";

const LoginForm = () => {
  // form state
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // show password state
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  // handle input change
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      // call login API
      const response = await loginUser(formData);

      console.log(response);

      // save token
      localStorage.setItem("token", response.data.token);

      // save user
      localStorage.setItem("user", JSON.stringify(response.data.user));

      // redirect
      navigate("/");
    } catch (error) {
      setError(error.response?.data?.message || "Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md rounded-3xl border border-blue-100 bg-white p-8 shadow-xl">
      {/* Heading */}
      <div className="mb-8 text-center">
        <p className="mb-2 text-sm uppercase tracking-[0.3em] text-blue-600">
          Chào mừng trở lại
        </p>

        <h2 className="text-4xl font-bold text-slate-900">Đăng nhập</h2>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email */}
        <div>
          <label className="mb-2 block text-sm text-slate-600">Email</label>

          <input
            type="email"
            name="email"
            placeholder="Nhập email của bạn"
            value={formData.email}
            onChange={handleChange}
            className="w-full rounded-xl border border-blue-100 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500"
          />
        </div>

        {/* Password */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-sm text-slate-600">Mật khẩu</label>

            <button
              type="button"
              className="text-sm text-blue-600 hover:text-blue-500"
            >
              Quên mật khẩu?
            </button>
          </div>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Nhập mật khẩu của bạn"
              value={formData.password}
              onChange={handleChange}
              className="w-full rounded-xl border border-blue-100 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500"
            />

            {/* Toggle password */}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-400 hover:text-slate-600"
            >
              {showPassword ? "Ẩn" : "Hiện"}
            </button>
          </div>
        </div>
        {/* Error */}
        {error && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Login Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white transition hover:scale-[1.02] hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>
      </form>

      {/* Register */}
      <p className="mt-8 text-center text-sm text-slate-500">
        Bạn chưa có tài khoản?{" "}
        <Link
          to="/register"
          className="font-semibold text-blue-600 hover:text-blue-500"
        >
          Đăng ký
        </Link>
      </p>
    </div>
  );
};

export default LoginForm;
