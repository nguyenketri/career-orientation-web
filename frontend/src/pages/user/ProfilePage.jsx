import { useState, useEffect } from "react";
import { getProfile, updateProfile } from "../../services/userService";
import { useNavigate } from "react-router-dom";

const ProfilePage = () => {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    dob: "",
    phone: "",
    bio: "",
    avatar: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getProfile();
        if (res.data) {
          const u = res.data;
          setProfile({
            name: u.name || "",
            email: u.email || "",
            dob: u.dob ? u.dob.split("T")[0] : "",
            phone: u.phone || "",
            bio: u.bio || "",
            avatar: u.avatar || "",
          });
        }
      } catch {
        setMessage({ type: "error", text: "Không thể lấy thông tin cá nhân." });
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: "", text: "" });
    try {
      await updateProfile({
        name: profile.name,
        dob: profile.dob,
        phone: profile.phone,
        bio: profile.bio,
      });
      setMessage({ type: "success", text: "Đã cập nhật hồ sơ thành công!" });
    } catch {
      setMessage({
        type: "error",
        text: "Lỗi cập nhật hồ sơ, vui lòng thử lại.",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center items-center">
        <p className="text-slate-600 animate-pulse font-bold">
          Đang tải hồ sơ...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-6 pt-32 pb-20 text-slate-900 flex justify-center">
      <div className="w-full max-w-7xl">
        <div className="flex items-center justify-between mb-10">
          <button
            onClick={() => navigate(-1)}
            className="text-slate-500 hover:text-blue-600 transition font-bold flex items-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Trở về
          </button>
          <h1 className="text-4xl font-black text-slate-900">Hồ Sơ Của Bạn</h1>
        </div>

        <div className="bg-white border border-slate-100 rounded-[40px] p-8 lg:p-12 shadow-2xl shadow-blue-100/50">
          <div className="flex flex-col md:flex-row gap-12 items-start">
            {/* Avatar Section */}
            <div className="flex flex-col items-center shrink-0 w-full md:w-auto">
              <div className="w-40 h-40 rounded-full overflow-hidden bg-blue-50 border-4 border-blue-100 mb-6 shadow-lg">
                <img
                  src={profile.avatar}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-sm text-slate-400 text-center font-medium">
                Avatar tự động cấp từ hệ thống
              </p>
            </div>

            {/* Form Section */}
            <form onSubmit={handleSave} className="flex-grow w-full space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm text-slate-600 font-bold uppercase tracking-wider mb-2">
                    Họ và Tên
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={profile.name}
                    onChange={handleChange}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 text-slate-900 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-600 font-bold uppercase tracking-wider mb-2">
                    Địa chỉ Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={profile.email}
                    disabled
                    className="w-full bg-slate-100 border border-slate-100 rounded-2xl px-6 py-4 text-slate-400 cursor-not-allowed font-bold"
                  />
                  <p className="text-xs text-slate-400 mt-2 font-medium">
                    Email không thể thay đổi
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm text-slate-600 font-bold uppercase tracking-wider mb-2">
                    Ngày sinh
                  </label>
                  <input
                    type="date"
                    name="dob"
                    value={profile.dob}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 text-slate-900 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-600 font-bold uppercase tracking-wider mb-2">
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={profile.phone}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 text-slate-900 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-slate-600 font-bold uppercase tracking-wider mb-2">
                  Giới thiệu ngắn (Bio)
                </label>
                <textarea
                  name="bio"
                  rows="4"
                  value={profile.bio}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 text-slate-900 font-bold resize-none"
                  placeholder="Một chút chia sẻ về ước mơ nghề nghiệp của bạn..."
                ></textarea>
              </div>

              {message.text && (
                <div
                  className={`p-5 rounded-2xl text-sm font-bold border ${
                    message.type === "success"
                      ? "bg-green-50 text-green-700 border-green-100"
                      : "bg-red-50 text-red-700 border-red-100"
                  }`}
                >
                  {message.text}
                </div>
              )}

              <button
                type="submit"
                disabled={saving}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-black py-5 rounded-full transition shadow-xl shadow-blue-200 hover:scale-[1.02] active:scale-[0.98] text-xl"
              >
                {saving ? "Đang lưu..." : "Lưu Thông Tin"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
