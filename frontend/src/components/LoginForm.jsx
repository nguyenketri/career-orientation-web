import { useState } from "react";
import { Link } from "react-router-dom";
import {
  loginUser,
  googleLoginUser,
  linkGuestResult,
} from "../services/authService";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";

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

      // save token
      localStorage.setItem("token", response.data.token);

      // save user
      localStorage.setItem("user", JSON.stringify(response.data.user));

      // carry over guest results if any
      const linkedResult = await linkGuestResult();

      // Trigger update for Navbar
      window.dispatchEvent(new Event("userUpdate"));

      // redirect based on role
      if (linkedResult) {
        navigate(
          `/test-result/${linkedResult.type}/${linkedResult.result._id}`,
          {
            state: { type: linkedResult.type, result: linkedResult.result },
          },
        );
      } else if (response.data.user.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/");
      }
    } catch (error) {
      setError(error.response?.data?.message || "Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
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

            <Link
              to="/forgot-password"
              className="text-sm text-blue-600 hover:text-blue-500"
            >
              Quên mật khẩu?
            </Link>
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
          className="w-full rounded-xl bg-orange-500 py-3 font-semibold text-white transition hover:scale-[1.02] hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>

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
            onSuccess={async (credentialResponse) => {
              try {
                setLoading(true);
                const response = await googleLoginUser(
                  credentialResponse.credential,
                );
                localStorage.setItem("token", response.data.token);
                localStorage.setItem(
                  "user",
                  JSON.stringify(response.data.user),
                );

                // carry over guest results if any
                const linkedResult = await linkGuestResult();

                window.dispatchEvent(new Event("userUpdate"));
                if (linkedResult) {
                  navigate(
                    `/test-result/${linkedResult.type}/${linkedResult.result._id}`,
                    {
                      state: {
                        type: linkedResult.type,
                        result: linkedResult.result,
                      },
                    },
                  );
                } else if (response.data.user.role === "admin") {
                  navigate("/admin/dashboard");
                } else {
                  navigate("/");
                }
              } catch {
                setError("Đăng nhập Google thất bại");
              } finally {
                setLoading(false);
              }
            }}
            onError={() => {
              setError("Đăng nhập Google thất bại");
            }}
          />
        </div>
      </form>

      {/* Register */}
      <p className="mt-8 text-center text-sm text-slate-500">
        Bạn chưa có tài khoản?{" "}
        <Link
          to="/register"
          className="font-semibold text-orange-600 hover:text-orange-500"
        >
          Đăng ký
        </Link>
      </p>
    </div>
  );
};

export default LoginForm;
