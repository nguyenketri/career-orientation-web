import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../services/authService";

const RegisterForm = () => {
  // form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // loading & error
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // show password
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  // handle input
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    // reset error
    setError("");
    // Validate data input
    if (!formData.name.trim()) {
      return setError("Vui lòng nhập họ tên");
    }

    if (!formData.email.trim()) {
      return setError("Vui lòng nhập email");
    }

    if (!formData.password.trim()) {
      return setError("Vui lòng nhập mật khẩu");
    }

    if (formData.password.length < 6) {
      return setError("Mật khẩu phải có ít nhất 6 ký tự");
    }
    // validate confirm password
    if (formData.password !== formData.confirmPassword) {
      return setError("Mật khẩu không khớp");
    }

    try {
      setLoading(true);

      // prepare data
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      };

      // call register API
      await registerUser(payload);

      // redirect login
      navigate("/login");
    } catch (error) {
      setError(error.response?.data?.message || "Đăng ký thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md rounded-3xl border border-blue-100 bg-white p-8 shadow-xl">
      {/* Heading */}
      <div className="mb-8 text-center">
        <p className="mb-2 text-sm uppercase tracking-[0.3em] text-blue-600">
          Tạo tài khoản
        </p>

        <h2 className="text-4xl font-bold text-slate-900">Đăng ký</h2>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name */}
        <div>
          <label className="mb-2 block text-sm text-slate-600">Họ và tên</label>

          <input
            type="text"
            name="name"
            placeholder="Nhập họ và tên của bạn"
            value={formData.name}
            onChange={handleChange}
            className="w-full rounded-xl border border-blue-100 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500"
          />
        </div>

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
          <label className="mb-2 block text-sm text-slate-600">Mật khẩu</label>

          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Nhập mật khẩu"
            value={formData.password}
            onChange={handleChange}
            className="w-full rounded-xl border border-blue-100 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500"
          />
        </div>

        {/* Confirm Password */}
        <div>
          <label className="mb-2 block text-sm text-slate-600">
            Xác nhận mật khẩu
          </label>

          <input
            type={showPassword ? "text" : "password"}
            name="confirmPassword"
            placeholder="Xác nhận mật khẩu"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="w-full rounded-xl border border-blue-100 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500"
          />
        </div>

        {/* Toggle password */}
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="text-sm text-blue-600 hover:text-blue-500"
        >
          {showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
        </button>

        {/* Error */}
        {error && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white transition hover:scale-[1.02] hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? "Đang tạo tài khoản..." : "Đăng ký"}
        </button>
      </form>

      {/* Login */}
      <p className="mt-8 text-center text-sm text-slate-500">
        Bạn đã có tài khoản?{" "}
        <Link
          to="/login"
          className="font-semibold text-blue-600 hover:text-blue-500"
        >
          Đăng nhập
        </Link>
      </p>
    </div>
  );
};

export default RegisterForm;
