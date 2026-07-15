import { useState, useEffect, useRef } from "react";
import { getProfile, updateProfile } from "../../services/userService";
import { useNavigate } from "react-router-dom";

const MAX_AVATAR_DIMENSION = 400;
const AVATAR_JPEG_QUALITY = 0.85;

// Nén + resize ảnh xuống dạng JPEG base64 phía client trước khi gửi lên server
// (cùng kỹ thuật với upload ảnh ở AI Mentor) — tránh phình document User trong DB.
const compressAvatar = (file) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      let { width, height } = img;
      if (width > MAX_AVATAR_DIMENSION || height > MAX_AVATAR_DIMENSION) {
        if (width > height) {
          height = Math.round((height * MAX_AVATAR_DIMENSION) / width);
          width = MAX_AVATAR_DIMENSION;
        } else {
          width = Math.round((width * MAX_AVATAR_DIMENSION) / height);
          height = MAX_AVATAR_DIMENSION;
        }
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      canvas.getContext("2d").drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", AVATAR_JPEG_QUALITY));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Không thể đọc ảnh."));
    };
    img.src = url;
  });

const ProfilePage = () => {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    dob: "",
    phone: "",
    bio: "",
    avatar: "",
    subscriptionPlan: "FREE",
    subscriptionExpiry: null,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [avatarDirty, setAvatarDirty] = useState(false);
  const fileInputRef = useRef(null);
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
            subscriptionPlan: u.subscriptionPlan || "FREE",
            subscriptionExpiry: u.subscriptionExpiry || null,
          });
          // Sync local storage and dispatch update event
          localStorage.setItem("user", JSON.stringify(u));
          window.dispatchEvent(new Event("userUpdate"));
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

  const handleAvatarSelect = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setMessage({ type: "error", text: "Vui lòng chọn một tệp ảnh." });
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      setMessage({ type: "error", text: "Ảnh quá lớn. Vui lòng chọn ảnh dưới 15MB." });
      return;
    }
    try {
      const compressed = await compressAvatar(file);
      setProfile((prev) => ({ ...prev, avatar: compressed }));
      setAvatarDirty(true);
      setMessage({ type: "", text: "" });
    } catch {
      setMessage({ type: "error", text: "Không thể xử lý ảnh, vui lòng thử ảnh khác." });
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: "", text: "" });
    try {
      const res = await updateProfile({
        name: profile.name,
        dob: profile.dob,
        phone: profile.phone,
        bio: profile.bio,
        ...(avatarDirty ? { avatar: profile.avatar } : {}),
      });
      if (res && res.data) {
        // Sync local storage and dispatch update event
        localStorage.setItem("user", JSON.stringify(res.data));
        window.dispatchEvent(new Event("userUpdate"));
      }
      setAvatarDirty(false);
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
        <div className="bg-white border border-slate-100 rounded-[40px] p-8 lg:p-12 shadow-2xl shadow-blue-100/50">
          <div className="flex flex-col md:flex-row gap-12 items-start">
            {/* Avatar Section */}
            <div className="flex flex-col items-center shrink-0 w-full md:w-auto">
              <div className="relative w-40 h-40 mb-6">
                <div className="w-40 h-40 rounded-full overflow-hidden bg-blue-50 border-4 border-blue-100 shadow-lg">
                  <img
                    src={profile.avatar}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  title="Đổi ảnh đại diện"
                  className="absolute bottom-1 right-1 w-11 h-11 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-lg border-4 border-white transition"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarSelect}
                  className="hidden"
                />
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-sm text-blue-600 hover:text-blue-700 text-center font-bold mb-1 underline underline-offset-2"
              >
                Đổi ảnh đại diện
              </button>
              <p className="text-xs text-slate-400 text-center font-medium mb-6">
                {avatarDirty
                  ? "Ảnh mới sẽ được lưu khi bạn bấm “Lưu Thông Tin”"
                  : "JPG, PNG tối đa 15MB"}
              </p>

              {/* Plan Card */}
              <div
                className={`w-full p-6 rounded-3xl border text-center ${
                  profile.subscriptionPlan === "PREMIUM"
                    ? "bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200"
                    : profile.subscriptionPlan === "PAID"
                      ? "bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200"
                      : "bg-slate-50 border-slate-200"
                }`}
              >
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                  Gói Tài Khoản
                </p>
                <h4
                  className={`text-xl font-black ${
                    profile.subscriptionPlan === "PREMIUM"
                      ? "text-purple-600"
                      : profile.subscriptionPlan === "PAID"
                        ? "text-blue-600"
                        : "text-slate-600"
                  }`}
                >
                  {profile.subscriptionPlan === "PREMIUM"
                    ? "⭐ CAO CẤP"
                    : profile.subscriptionPlan === "PAID"
                      ? "✔️ TRẢ PHÍ"
                      : "MIỄN PHÍ"}
                </h4>
                {profile.subscriptionExpiry &&
                  profile.subscriptionPlan !== "FREE" && (
                    <p className="text-[11px] text-slate-400 font-bold mt-2">
                      Hết hạn:{" "}
                      {new Date(profile.subscriptionExpiry).toLocaleDateString(
                        "vi-VN",
                      )}
                    </p>
                  )}
                {profile.subscriptionPlan === "FREE" && (
                  <button
                    type="button"
                    onClick={() => navigate("/pricing")}
                    className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-full transition shadow-md shadow-blue-200"
                  >
                    Nâng Cấp Ngay
                  </button>
                )}
              </div>
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
                  placeholder="Một chút chia sẻ về ước mơ ngành học, trường học của bạn..."
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
