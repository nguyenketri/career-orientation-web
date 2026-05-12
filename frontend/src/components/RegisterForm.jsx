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
      return setError("Name is required");
    }

    if (!formData.email.trim()) {
      return setError("Email is required");
    }

    if (!formData.password.trim()) {
      return setError("Password is required");
    }

    if (formData.password.length < 6) {
      return setError("Password must be at least 6 characters");
    }
    // validate confirm password
    if (formData.password !== formData.confirmPassword) {
      return setError("Passwords do not match");
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
      const response = await registerUser(payload);

      console.log(response);

      // redirect login
      navigate("/login");
    } catch (error) {
      setError(error.response?.data?.message || "Register failed");
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
          Create Account
        </p>

        <h2 className="text-4xl font-bold text-white">Register</h2>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name */}
        <div>
          <label className="mb-2 block text-sm text-gray-300">Name</label>

          <input
            type="text"
            name="name"
            placeholder="Enter your name"
            value={formData.name}
            onChange={handleChange}
            className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition focus:border-purple-500"
          />
        </div>

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
          <label className="mb-2 block text-sm text-gray-300">Password</label>

          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Enter password"
            value={formData.password}
            onChange={handleChange}
            className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition focus:border-purple-500"
          />
        </div>

        {/* Confirm Password */}
        <div>
          <label className="mb-2 block text-sm text-gray-300">
            Confirm Password
          </label>

          <input
            type={showPassword ? "text" : "password"}
            name="confirmPassword"
            placeholder="Confirm password"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition focus:border-purple-500"
          />
        </div>

        {/* Toggle password */}
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="text-sm text-purple-400 hover:text-purple-300"
        >
          {showPassword ? "Hide Password" : "Show Password"}
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
          className="w-full rounded-xl bg-white py-3 font-semibold text-black transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? "Creating account..." : "Register"}
        </button>
      </form>

      {/* Login */}
      <p className="mt-8 text-center text-sm text-gray-400">
        Already have an account?{" "}
        <Link
          to="/login"
          className="font-semibold text-purple-400 hover:text-purple-300"
        >
          Login
        </Link>
      </p>
    </div>
  );
};

export default RegisterForm;
