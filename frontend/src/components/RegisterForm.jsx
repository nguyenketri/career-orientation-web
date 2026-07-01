import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  registerUser,
  linkGuestResult,
  loginUser,
  googleLoginUser,
} from "../services/authService";
import { GoogleLogin } from "@react-oauth/google";

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

      // After registration, we need to log in to get the token for linking
      const loginRes = await loginUser({
        email: formData.email,
        password: formData.password,
      });

      // save token
      localStorage.setItem("token", loginRes.data.token);

      // save user
      localStorage.setItem("user", JSON.stringify(loginRes.data.user));

      // carry over guest results if any
      const linkedResult = await linkGuestResult();

      // Trigger update for Navbar
      window.dispatchEvent(new Event("userUpdate"));

      // redirect based on result
      if (linkedResult) {
        navigate(
          `/test-result/${linkedResult.type}/${linkedResult.result._id}`,
          {
            state: { type: linkedResult.type, result: linkedResult.result },
          },
        );
      } else {
        navigate("/");
      }
    } catch (error) {
      setError(error.response?.data?.message || "Đăng ký thất bại");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setLoading(true);
      const response = await googleLoginUser(credentialResponse.credential);
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      // carry over guest results if any
      const linkedResult = await linkGuestResult();

      window.dispatchEvent(new Event("userUpdate"));
      if (linkedResult) {
        navigate(
          `/test-result/${linkedResult.type}/${linkedResult.result._id}`,
          {
            state: { type: linkedResult.type, result: linkedResult.result },
          },
        );
      } else {
        navigate("/");
      }
    } catch {
      setError("Đăng nhập Google thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
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
          className="text-sm text-orange-600 hover:text-orange-500"
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
          className="w-full rounded-xl bg-orange-500 py-3 font-semibold text-white transition hover:scale-[1.02] hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? "Đang tạo tài khoản..." : "Đăng ký"}
        </button>
      </form>

      <div className="relative flex items-center justify-center py-2">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200"></div>
        </div>
        <div className="relative bg-white px-4 text-sm text-slate-500">
          Hoặc
        </div>
      </div>

      <div className="flex w-full justify-center overflow-hidden">
        <GoogleLogin
          width="280"
          onSuccess={handleGoogleSuccess}
          onError={() => setError("Đăng nhập Google thất bại")}
        />
      </div>

      {/* Login */}
      <p className="mt-8 text-center text-sm text-slate-500">
        Bạn đã có tài khoản?{" "}
        <Link
          to="/login"
          className="font-semibold text-orange-600 hover:text-orange-500"
        >
          Đăng nhập
        </Link>
      </p>
    </div>
  );
};

export default RegisterForm;
