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
      setError(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-lg">
      {/* Back */}
      <Link
        to="/"
        className="mb-6 inline-block text-sm text-gray-400 transition hover:text-white"
      >
        ← Back to Home
      </Link>

      {/* Heading */}
      <div className="mb-8 text-center">
        <p className="mb-2 text-sm uppercase tracking-[0.3em] text-purple-400">
          Welcome Back
        </p>

        <h2 className="text-4xl font-bold text-white">Login</h2>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email */}
        <div>
          <label className="mb-2 block text-sm text-gray-300">Email</label>

          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition focus:border-purple-500"
          />
        </div>

        {/* Password */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-sm text-gray-300">Password</label>

            <button
              type="button"
              className="text-sm text-purple-400 hover:text-purple-300"
            >
              Forgot password?
            </button>
          </div>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition focus:border-purple-500"
            />

            {/* Toggle password */}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400 hover:text-white"
            >
              {showPassword ? "Hide" : "Show"}
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
          className="w-full rounded-xl bg-white py-3 font-semibold text-black transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      {/* Register */}
      <p className="mt-8 text-center text-sm text-gray-400">
        Don&apos;t have an account?{" "}
        <Link
          to="/register"
          className="font-semibold text-purple-400 hover:text-purple-300"
        >
          Register
        </Link>
      </p>
    </div>
  );
};

export default LoginForm;
