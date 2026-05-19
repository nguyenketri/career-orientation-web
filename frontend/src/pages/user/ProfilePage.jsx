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
    avatar: ""
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
            avatar: u.avatar || ""
          });
        }
      } catch (err) {
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
        bio: profile.bio
      });
      setMessage({ type: "success", text: "Đã cập nhật hồ sơ thành công!" });
    } catch (err) {
      setMessage({ type: "error", text: "Lỗi cập nhật hồ sơ, vui lòng thử lại." });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex justify-center items-center">
        <p className="text-white animate-pulse">Đang tải hồ sơ...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black px-6 py-20 text-white flex justify-center">
      <div className="w-full max-w-3xl">
        <div className="flex items-center justify-between mb-10">
          <button onClick={() => navigate(-1)} className="hover:text-purple-400 transition">← Trở về</button>
          <h1 className="text-3xl font-bold">Hồ Sơ Của Bạn</h1>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 shadow-xl">
          <div className="flex flex-col md:flex-row gap-10 items-start">
            {/* Avatar Section */}
            <div className="flex flex-col items-center shrink-0 w-full md:w-auto">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-purple-900/50 border-4 border-purple-500/30 mb-4">
                <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
              </div>
              <p className="text-sm text-gray-400 text-center">Avatar tự động cấp từ hệ thống</p>
            </div>

            {/* Form Section */}
            <form onSubmit={handleSave} className="flex-grow w-full space-y-5">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Họ và Tên</label>
                <input 
                  type="text" 
                  name="name" 
                  value={profile.name} 
                  onChange={handleChange}
                  required
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-purple-500 text-white" 
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Địa chỉ Email</label>
                <input 
                  type="email" 
                  name="email" 
                  value={profile.email} 
                  disabled
                  className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-gray-400 cursor-not-allowed" 
                />
                <p className="text-xs text-gray-500 mt-1">Email không thể thay đổi</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Ngày sinh</label>
                  <input 
                    type="date" 
                    name="dob" 
                    value={profile.dob} 
                    onChange={handleChange}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-purple-500 text-white" 
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Số điện thoại</label>
                  <input 
                    type="tel" 
                    name="phone" 
                    value={profile.phone} 
                    onChange={handleChange}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-purple-500 text-white" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Giới thiệu ngắn (Bio)</label>
                <textarea 
                  name="bio" 
                  rows="3" 
                  value={profile.bio} 
                  onChange={handleChange}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-purple-500 text-white resize-none" 
                  placeholder="Một chút chia sẻ về ước mơ nghề nghiệp của bạn..."
                ></textarea>
              </div>

              {message.text && (
                <div className={`p-4 rounded-xl text-sm ${message.type === "success" ? "bg-green-500/20 text-green-400 border border-green-500/20" : "bg-red-500/20 text-red-400 border border-red-500/20"}`}>
                  {message.text}
                </div>
              )}

              <button 
                type="submit" 
                disabled={saving}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold py-4 rounded-xl transition shadow-lg shadow-purple-900/50"
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
