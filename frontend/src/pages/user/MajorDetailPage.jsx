import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { getUniversityMajorById } from "../../services/universityService";
import { getUser } from "../../utils/auth";

/* ---------- Helpers (thuần, đặt ngoài component) ---------- */

const typeLabel = (t) =>
  t === "Public" ? "CÔNG LẬP" : t === "Private" ? "DÂN LẬP" : "QUỐC TẾ";

const typeChipClass = (t) =>
  t === "Public"
    ? "bg-blue-100 text-blue-600"
    : t === "Private"
      ? "bg-orange-100 text-orange-600"
      : "bg-emerald-100 text-emerald-600";

const fmtTuition = (fee) => {
  if (!fee) return "Đang cập nhật";
  const m = fee / 1000000;
  const s = Number.isInteger(m) ? `${m}` : m.toFixed(1);
  return `${s} triệu`;
};

const AVATAR = (name) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name || "Uni")}&background=random&size=200`;

// Ảnh minh họa ổn định cho album (khi trường chưa có ảnh thực tế) — dùng picsum theo seed
const stockGallery = (seed) =>
  [1, 2, 3, 4].map(
    (n) =>
      `https://picsum.photos/seed/${encodeURIComponent(String(seed || "cazup"))}-${n}/500/500`,
  );

// Bộ ảnh bìa campus (ảnh kiến trúc trường học, URL đã kiểm tra sống) — chọn cố định theo từng trường
const COVER_POOL = [
  "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1600&q=70",
  "https://images.unsplash.com/photo-1568792923760-d70635a89fdc?auto=format&fit=crop&w=1600&q=70",
  "https://images.unsplash.com/photo-1607013407627-6ee814329547?auto=format&fit=crop&w=1600&q=70",
  "https://images.unsplash.com/photo-1580537659466-0a9bfa916a54?auto=format&fit=crop&w=1600&q=70",
  "https://images.unsplash.com/photo-1607013251379-e6eecfffe234?auto=format&fit=crop&w=1600&q=70",
  "https://images.unsplash.com/photo-1592280771190-3e2e4d571952?auto=format&fit=crop&w=1600&q=70",
  "https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?auto=format&fit=crop&w=1600&q=70",
  "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1600&q=70",
];

// Ảnh bìa của 1 trường: ưu tiên ảnh campus thật (coverImage / gallery), nếu không thì chọn ổn định theo id
const coverForUni = (uni) => {
  if (uni?.coverImage) return uni.coverImage;
  if (uni?.gallery?.length) return uni.gallery[0];
  const seed = String(uni?._id || uni?.name || "cazup");
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return COVER_POOL[h % COVER_POOL.length];
};

// Mã ngành: dùng code có sẵn, nếu không thì sinh mã ổn định từ tên + id
const getMajorCode = (major, umId = "") => {
  if (major.code) return major.code;
  const initials = (major.name || "")
    .normalize("NFD")
    .replace(/[^a-zA-Z ]/g, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 3)
    .map((w) => w[0].toUpperCase())
    .join("");
  const num = parseInt(umId.slice(-4) || "0", 16) % 1000;
  return `${initials || "MJ"}${String(num).padStart(3, "0")}`;
};

const getDuration = (major, uni) =>
  major.duration || (uni?.type === "International" ? "3 - 4 Năm" : "4 Năm");

const getIntakes = (major) =>
  major.intakes?.length ? major.intakes.join(", ") : "Tháng 9 hằng năm";

const getHighlights = (major) => {
  if (major.highlights?.length) return major.highlights;
  return [
    {
      title: "Kiến thức nền tảng",
      description: `Trang bị nền tảng vững chắc và tư duy chuyên sâu về ${major.name}.`,
    },
    {
      title: "Thực hành thực tế",
      description:
        "Học đi đôi với hành qua dự án, tình huống và thực tập tại doanh nghiệp.",
    },
    {
      title: "Kỹ năng hội nhập",
      description:
        "Phát triển ngoại ngữ, làm việc nhóm và kỹ năng số theo chuẩn công nghiệp 4.0.",
    },
    {
      title: "Định hướng nghề nghiệp",
      description:
        "Mạng lưới đối tác rộng, hỗ trợ việc làm ngay sau khi tốt nghiệp.",
    },
  ];
};

const getCareers = (major) => {
  if (major.careerOutcomes?.length) return major.careerOutcomes;
  return [
    `Chuyên viên trong lĩnh vực ${major.name}`,
    "Quản lý / điều phối dự án và vận hành",
    "Chuyên gia tư vấn & phân tích",
    "Nghiên cứu, giảng dạy hoặc khởi nghiệp trong ngành",
  ];
};

const getCurriculum = (major) => {
  if (major.curriculum?.length) return major.curriculum;
  return [
    {
      title: "Giai đoạn 1 — Đại cương",
      items: ["Toán & Khoa học cơ bản", "Tin học & Ngoại ngữ", "Kỹ năng học tập"],
    },
    {
      title: "Giai đoạn 2 — Cơ sở ngành",
      items: [`Nhập môn ${major.name}`, "Nền tảng chuyên môn", "Phương pháp nghiên cứu"],
    },
    {
      title: "Giai đoạn 3 — Chuyên ngành",
      items: ["Các môn chuyên sâu", "Đồ án môn học", "Thực hành ứng dụng"],
    },
    {
      title: "Giai đoạn 4 — Thực tập & Tốt nghiệp",
      items: ["Thực tập doanh nghiệp", "Khóa luận tốt nghiệp", "Kỹ năng nghề nghiệp"],
    },
  ];
};

const HIGHLIGHT_ICONS = [
  "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
  "M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z",
  "M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  "M13 10V3L4 14h7v7l9-11h-7z",
];

/* ---------- Component ---------- */

const MajorDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [toast, setToast] = useState("");
  const brochureRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const res = await getUniversityMajorById(id);
        if (mounted) setDetail(res.data);
      } catch (err) {
        console.error(err);
        if (mounted) setError("Không tìm thấy thông tin ngành học này.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2600);
  };

  const handleCompare = () => {
    const u = getUser();
    const uid = u?._id || u?.id;
    const key = uid
      ? `comparison_selected_majors_${uid}`
      : "comparison_selected_majors";
    const saved = JSON.parse(localStorage.getItem(key) || "[]");
    const umForCompare = {
      _id: detail._id,
      university: detail.university,
      major: detail.major,
      admissionScore: detail.admissionScore,
      subjectCombination: detail.subjectCombination,
      tuitionFee: detail.tuitionFee,
      admissionHistory: detail.admissionHistory,
    };
    if (!saved.some((x) => x._id === detail._id)) saved.push(umForCompare);
    localStorage.setItem(key, JSON.stringify(saved));
    navigate("/comparison");
  };

  const handleApply = () => {
    if (detail?.university?.website) {
      window.open(detail.university.website, "_blank", "noopener,noreferrer");
    } else {
      showToast("Thông tin ứng tuyển đang được cập nhật.");
    }
  };

  // Tạo & tải brochure (hồ sơ ngành học) dạng PDF từ DOM ẩn -> giữ nguyên tiếng Việt
  const handleBrochure = async () => {
    if (!brochureRef.current) return;
    try {
      setToast("Đang tạo brochure...");
      const html2pdf = (await import("html2pdf.js")).default;
      await html2pdf()
        .set({
          margin: 0,
          filename: `caZup-Brochure-${(detail.major?.name || "nganh").replace(/\s+/g, "_")}.pdf`,
          image: { type: "jpeg", quality: 0.95 },
          html2canvas: { scale: 2, backgroundColor: "#ffffff", useCORS: true },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        })
        .from(brochureRef.current)
        .save();
      setToast("");
    } catch (err) {
      console.error(err);
      setToast("Không tạo được brochure, vui lòng thử lại.");
      setTimeout(() => setToast(""), 2600);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4 px-4">
        <p className="text-slate-500">{error || "Không tìm thấy ngành học."}</p>
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-2 bg-blue-600 text-white rounded-full font-bold"
        >
          Quay lại
        </button>
      </div>
    );
  }

  const { university: uni, major, compatibility, otherUniversities } = detail;
  const coverPhoto = coverForUni(uni);
  const gallery = uni.gallery?.length
    ? uni.gallery
    : stockGallery(uni._id || uni.name);
  const highlights = getHighlights(major);
  const careers = getCareers(major);
  const curriculum = getCurriculum(major);

  const tabs = [
    { key: "overview", label: "Tổng quan" },
    { key: "curriculum", label: "Chương trình học" },
    { key: "career", label: "Cơ hội nghề nghiệp" },
    { key: "facilities", label: "Cơ sở vật chất" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Toast */}
      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-sm font-medium px-5 py-2.5 rounded-full shadow-lg">
          {toast}
        </div>
      )}

      {/* ===== HERO ===== */}
      <div className="relative h-[300px] md:h-[380px] w-full overflow-hidden bg-slate-800">
        {/* Ảnh bìa full-bleed */}
        <img
          src={coverPhoto}
          alt={uni.name}
          className="absolute inset-0 w-full h-full object-cover"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = `https://picsum.photos/seed/${encodeURIComponent(String(uni._id || uni.name))}/1600/600`;
          }}
        />
        {/* Overlay tối nhẹ ở trái & dưới để chữ dễ đọc, vẫn giữ ảnh bìa sáng rõ */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/85 via-slate-900/35 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/75 via-transparent to-transparent" />

        {/* Logo trường (nhận diện thương hiệu) */}
        <div className="hidden lg:flex absolute right-8 top-8 w-28 h-28 rounded-3xl bg-white shadow-2xl items-center justify-center p-3">
          <img
            src={uni.image || AVATAR(uni.name)}
            alt={uni.name}
            className="max-w-full max-h-full object-contain"
            onError={(e) => (e.target.src = AVATAR(uni.name))}
          />
        </div>

        <div className="absolute inset-0 flex items-end">
          <div className="mx-auto max-w-7xl w-full px-4 md:px-8 pb-8">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center mb-5 px-4 py-2 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/25 text-white text-sm font-semibold transition active:scale-95"
            >
              Quay lại kết quả
            </button>

            <div className="flex items-center gap-3 mb-3">
              <span
                className={`text-[11px] font-black px-3 py-1 rounded-full ${typeChipClass(uni.type)}`}
              >
                {typeLabel(uni.type)}
              </span>
              <span className="flex items-center gap-1.5 text-white/90 text-sm font-medium">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                {uni.address || uni.location}
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-white mb-3 max-w-3xl leading-tight">
              {uni.name}
            </h1>
            <p className="text-white/85 max-w-2xl leading-relaxed">
              {uni.description ||
                `Môi trường học tập ${typeLabel(uni.type).toLowerCase()} tại ${uni.location} với cơ sở vật chất hiện đại và chương trình đào tạo cập nhật.`}
            </p>
          </div>
        </div>
      </div>

      {/* ===== BODY ===== */}
      <div className="mx-auto max-w-7xl px-4 md:px-8 -mt-8 relative z-10">
        {/* Major summary card */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 md:p-7 mb-8 flex flex-col md:flex-row md:items-center gap-6">
          <div className="flex-1">
            <h2 className="text-2xl md:text-3xl font-black text-slate-900">
              {major.name}
            </h2>
            {major.englishName && (
              <p className="text-slate-500 italic mt-1">{major.englishName}</p>
            )}
            <div className="flex flex-wrap gap-2 mt-3">
              {(major.subjectCombinations || []).map((c) => (
                <span
                  key={c}
                  className="text-[11px] font-bold text-blue-600 bg-blue-50 border border-blue-100 rounded-md px-2 py-0.5"
                >
                  {c}
                </span>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-8 md:border-l md:border-slate-100 md:pl-8">
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                Điểm chuẩn
              </div>
              <div className="text-3xl font-black text-orange-500">
                {detail.admissionScore ?? "—"}
              </div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                Học phí / năm
              </div>
              <div className="text-3xl font-black text-slate-900">
                {fmtTuition(detail.tuitionFee)}
              </div>
            </div>
          </div>
        </div>

        {/* Grid: left content (tabs) + right sidebar */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* LEFT */}
          <div className="lg:col-span-2">
            {/* Tabs */}
            <div className="flex flex-wrap gap-x-5 gap-y-2 sm:gap-6 border-b border-slate-200 mb-8">
              {tabs.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setActiveTab(t.key)}
                  className={`pb-3 text-xs sm:text-sm font-bold whitespace-nowrap transition relative ${
                    activeTab === t.key
                      ? "text-slate-900"
                      : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  {t.label}
                  {activeTab === t.key && (
                    <span className="absolute -bottom-px left-0 w-full h-0.5 bg-orange-500 rounded-full" />
                  )}
                </button>
              ))}
            </div>

            {/* --- TAB: Tổng quan --- */}
            {activeTab === "overview" && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h3 className="text-xl font-black text-slate-900 mb-3">
                  Giới thiệu ngành học
                </h3>
                <p className="text-slate-600 leading-relaxed mb-8">
                  {major.description ||
                    `Ngành ${major.name} tại ${uni.name} trang bị cho sinh viên kiến thức chuyên môn vững chắc và kỹ năng thực hành, đáp ứng nhu cầu nhân lực chất lượng cao của thị trường.`}
                </p>

                <div className="grid sm:grid-cols-2 gap-4 mb-10">
                  {highlights.slice(0, 4).map((h, i) => (
                    <div
                      key={i}
                      className="p-5 rounded-2xl bg-blue-50/60 border border-blue-100/70"
                    >
                      <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center mb-3 text-blue-600">
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
                            d={HIGHLIGHT_ICONS[i % HIGHLIGHT_ICONS.length]}
                          />
                        </svg>
                      </div>
                      <h4 className="font-bold text-slate-900 mb-1">
                        {h.title}
                      </h4>
                      <p className="text-sm text-slate-500 leading-relaxed">
                        {h.description}
                      </p>
                    </div>
                  ))}
                </div>

                <h3 className="text-xl font-black text-slate-900 mb-4">
                  Hình ảnh thực tế
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {gallery.slice(0, 4).map((src, i) => (
                    <div
                      key={i}
                      className="aspect-square rounded-2xl overflow-hidden bg-slate-100"
                    >
                      <img
                        src={src}
                        alt={`${uni.name} ${i + 1}`}
                        className="w-full h-full object-cover hover:scale-105 transition duration-500"
                        onError={(e) => (e.target.src = AVATAR(uni.name))}
                      />
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* --- TAB: Chương trình học --- */}
            {activeTab === "curriculum" && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h3 className="text-xl font-black text-slate-900 mb-2">
                  Lộ trình đào tạo
                </h3>
                <p className="text-slate-500 mb-6 text-sm">
                  Tổ hợp xét tuyển:{" "}
                  <span className="font-bold text-blue-600">
                    {(major.subjectCombinations || []).join(", ") ||
                      detail.subjectCombination}
                  </span>
                </p>
                <div className="space-y-4">
                  {curriculum.map((phase, i) => (
                    <div
                      key={i}
                      className="p-5 rounded-2xl border border-slate-100 bg-white"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <span className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 font-black flex items-center justify-center">
                          {i + 1}
                        </span>
                        <h4 className="font-bold text-slate-900">
                          {phase.title}
                        </h4>
                      </div>
                      <div className="flex flex-wrap gap-2 pl-11">
                        {phase.items.map((it, j) => (
                          <span
                            key={j}
                            className="text-sm text-slate-600 bg-slate-50 border border-slate-100 rounded-lg px-3 py-1"
                          >
                            {it}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* --- TAB: Cơ hội nghề nghiệp --- */}
            {activeTab === "career" && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h3 className="text-xl font-black text-slate-900 mb-4">
                  Vị trí công việc sau tốt nghiệp
                </h3>
                <div className="space-y-3 mb-8">
                  {careers.map((c, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 p-4 rounded-xl border border-slate-100 bg-white"
                    >
                      <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg
                          className="w-3.5 h-3.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </span>
                      <span className="text-slate-700 font-medium">{c}</span>
                    </div>
                  ))}
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
                  <h4 className="font-bold text-slate-900 mb-2">
                    Phù hợp với tính cách
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {(major.hollandTypes || []).map((h) => (
                      <span
                        key={h}
                        className="text-xs font-bold text-purple-600 bg-purple-100 rounded-full px-3 py-1"
                      >
                        Holland {h}
                      </span>
                    ))}
                    {(major.mbtiTypes || []).map((m) => (
                      <span
                        key={m}
                        className="text-xs font-bold text-blue-600 bg-blue-100 rounded-full px-3 py-1"
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* --- TAB: Cơ sở vật chất --- */}
            {activeTab === "facilities" && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center gap-6 mb-6">
                  <div className="flex items-center gap-2">
                    <span className="text-3xl font-black text-slate-900">
                      {uni.rating || "—"}
                    </span>
                    <div className="flex flex-col">
                      <div className="flex text-amber-400">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <svg
                            key={s}
                            className="w-4 h-4"
                            fill={
                              s <= Math.round(uni.rating || 0)
                                ? "currentColor"
                                : "none"
                            }
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                            />
                          </svg>
                        ))}
                      </div>
                      <span className="text-xs text-slate-400 font-medium">
                        {uni.reviewCount || 0} đánh giá
                      </span>
                    </div>
                  </div>
                </div>

                <h3 className="text-lg font-black text-slate-900 mb-4">
                  Cơ sở vật chất nổi bật
                </h3>
                {uni.facilities?.length ? (
                  <div className="grid sm:grid-cols-2 gap-3 mb-8">
                    {uni.facilities.map((f, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 p-4 rounded-xl border border-slate-100 bg-white"
                      >
                        <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                            />
                          </svg>
                        </span>
                        <span className="text-slate-700 font-medium text-sm">
                          {f}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 mb-8">
                    Thông tin cơ sở vật chất đang được cập nhật.
                  </p>
                )}

                <div className="flex flex-col sm:flex-row gap-3 text-sm">
                  <div className="flex-1 p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">
                      Địa chỉ
                    </div>
                    <div className="text-slate-700 font-medium">
                      {uni.address || uni.location}
                    </div>
                  </div>
                  {uni.website && (
                    <a
                      href={uni.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center px-6 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition py-4 sm:py-0"
                    >
                      Website trường →
                    </a>
                  )}
                </div>
              </motion.div>
            )}

            {/* Các trường khác đào tạo ngành này */}
            {otherUniversities?.length > 0 && (
              <div className="mt-12">
                <h3 className="text-xl font-black text-slate-900 mb-4">
                  Trường khác đào tạo ngành này
                </h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  {otherUniversities.map((o) => (
                    <button
                      key={o._id}
                      onClick={() => {
                        navigate(`/major/${o._id}`);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="flex items-center gap-3 p-3 rounded-2xl border border-slate-100 bg-white hover:shadow-md hover:border-slate-200 transition text-left"
                    >
                      <img
                        src={o.university.image || AVATAR(o.university.name)}
                        alt={o.university.name}
                        className="w-11 h-11 rounded-lg object-contain bg-slate-50 p-1 flex-shrink-0"
                        onError={(e) => (e.target.src = AVATAR(o.university.name))}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-slate-800 text-sm truncate">
                          {o.university.name}
                        </div>
                        <div className="text-xs text-slate-400">
                          {o.university.location}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-[10px] text-slate-400 font-bold uppercase">
                          Điểm
                        </div>
                        <div className="font-black text-orange-500">
                          {o.admissionScore}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT SIDEBAR */}
          <aside className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              <button
                onClick={handleApply}
                className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-2xl transition shadow-lg shadow-orange-200 flex items-center justify-center gap-2 active:scale-[0.98]"
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
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
                Ứng tuyển ngay
              </button>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleCompare}
                  className="py-3 bg-white border border-slate-200 rounded-2xl font-bold text-slate-700 hover:bg-slate-50 transition flex flex-col items-center gap-1 text-xs"
                >
                  <svg
                    className="w-5 h-5 text-slate-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                    />
                  </svg>
                  SO SÁNH
                </button>
                <button
                  onClick={handleBrochure}
                  className="py-3 bg-white border border-slate-200 rounded-2xl font-bold text-slate-700 hover:bg-slate-50 transition flex flex-col items-center gap-1 text-xs"
                >
                  <svg
                    className="w-5 h-5 text-slate-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                  TẢI BROCHURE
                </button>
              </div>

              {/* AI Compatibility */}
              <div className="bg-slate-900 rounded-2xl p-6 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl -mr-10 -mt-10" />
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-5">
                    <span className="text-orange-400">✦</span>
                    <h4 className="font-black text-sm tracking-wide uppercase">
                      Phân tích từ caZup AI
                    </h4>
                  </div>

                  {compatibility ? (
                    <>
                      <div className="flex items-center gap-4 mb-4">
                        <div className="relative w-16 h-16 flex-shrink-0">
                          <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
                            <circle
                              cx="18"
                              cy="18"
                              r="15.5"
                              fill="none"
                              stroke="rgba(255,255,255,0.15)"
                              strokeWidth="3"
                            />
                            <circle
                              cx="18"
                              cy="18"
                              r="15.5"
                              fill="none"
                              stroke="#f97316"
                              strokeWidth="3"
                              strokeLinecap="round"
                              strokeDasharray={`${(compatibility.score / 100) * 97.4} 97.4`}
                            />
                          </svg>
                          <span className="absolute inset-0 flex items-center justify-center font-black text-orange-400">
                            {compatibility.score}%
                          </span>
                        </div>
                        <div>
                          <div className="font-bold">Mức độ tương thích</div>
                          <div className="text-xs text-slate-400">
                            Dựa trên kết quả MBTI & Holland của bạn
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-slate-300 italic leading-relaxed mb-4">
                        "{compatibility.reason}"
                      </p>
                      <button
                        onClick={() => navigate("/history")}
                        className="text-orange-400 text-sm font-bold hover:text-orange-300 flex items-center gap-1"
                      >
                        Xem chi tiết phân tích ›
                      </button>
                    </>
                  ) : (
                    <>
                      <p className="text-sm text-slate-300 leading-relaxed mb-4">
                        Làm bài trắc nghiệm <b>MBTI</b> & <b>Holland</b> để caZup
                        AI tính mức độ phù hợp của bạn với ngành này.
                      </p>
                      <button
                        onClick={() => navigate("/tests")}
                        className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold rounded-xl transition"
                      >
                        Làm bài test ngay →
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Meta info */}
              <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-1">
                {[
                  { label: "Mã ngành", value: getMajorCode(major, String(detail._id)) },
                  { label: "Thời gian học", value: getDuration(major, uni) },
                  { label: "Khai giảng", value: getIntakes(major) },
                  {
                    label: "Tổ hợp xét tuyển",
                    value:
                      (major.subjectCombinations || []).join(", ") ||
                      detail.subjectCombination ||
                      "—",
                  },
                ].map((row) => (
                  <div
                    key={row.label}
                    className="flex justify-between items-center py-2.5 border-b border-slate-50 last:border-0"
                  >
                    <span className="text-slate-500 text-sm">{row.label}</span>
                    <span className="font-bold text-slate-900 text-sm text-right">
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* ===== Brochure ẩn dùng để xuất PDF (giữ tiếng Việt vì render từ DOM) ===== */}
      <div style={{ position: "fixed", left: "-10000px", top: 0 }} aria-hidden="true">
        <div
          ref={brochureRef}
          style={{
            width: "760px",
            fontFamily: "Arial, Helvetica, sans-serif",
            color: "#0f172a",
            background: "#ffffff",
          }}
        >
          <div style={{ background: "#0f172a", padding: "26px 36px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div style={{ fontSize: "26px", fontWeight: 800, color: "#ffffff" }}>
                caZup
              </div>
              <div
                style={{
                  fontSize: "12px",
                  letterSpacing: "2px",
                  color: "#f97316",
                  fontWeight: 700,
                }}
              >
                HỒ SƠ NGÀNH HỌC
              </div>
            </div>
          </div>

          <div style={{ padding: "30px 36px" }}>
            <div
              style={{
                fontSize: "12px",
                color: "#f97316",
                fontWeight: 700,
                textTransform: "uppercase",
              }}
            >
              {typeLabel(uni.type)} · {uni.location}
            </div>
            <div style={{ fontSize: "22px", fontWeight: 800, margin: "4px 0 2px" }}>
              {uni.name}
            </div>
            <div style={{ fontSize: "13px", color: "#64748b" }}>{uni.address}</div>

            <div
              style={{
                marginTop: "22px",
                paddingTop: "20px",
                borderTop: "2px solid #f1f5f9",
              }}
            >
              <div style={{ fontSize: "26px", fontWeight: 800 }}>{major.name}</div>
              {major.englishName && (
                <div
                  style={{ fontSize: "14px", color: "#64748b", fontStyle: "italic" }}
                >
                  {major.englishName}
                </div>
              )}
            </div>

            <div style={{ display: "flex", gap: "12px", marginTop: "18px" }}>
              {[
                { l: "Điểm chuẩn", v: detail.admissionScore ?? "—", c: "#f97316" },
                { l: "Học phí / năm", v: fmtTuition(detail.tuitionFee), c: "#0f172a" },
                {
                  l: "Tổ hợp",
                  v:
                    (major.subjectCombinations || []).join(", ") ||
                    detail.subjectCombination ||
                    "—",
                  c: "#2563eb",
                },
              ].map((s) => (
                <div
                  key={s.l}
                  style={{
                    flex: 1,
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderRadius: "10px",
                    padding: "12px 14px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "10px",
                      color: "#94a3b8",
                      fontWeight: 700,
                      textTransform: "uppercase",
                    }}
                  >
                    {s.l}
                  </div>
                  <div style={{ fontSize: "18px", fontWeight: 800, color: s.c }}>
                    {s.v}
                  </div>
                </div>
              ))}
            </div>

            <div
              style={{
                display: "flex",
                gap: "24px",
                marginTop: "16px",
                fontSize: "13px",
                color: "#334155",
              }}
            >
              <div>
                <b>Mã ngành:</b> {getMajorCode(major, String(detail._id))}
              </div>
              <div>
                <b>Thời gian:</b> {getDuration(major, uni)}
              </div>
              <div>
                <b>Khai giảng:</b> {getIntakes(major)}
              </div>
            </div>

            <div style={{ marginTop: "22px" }}>
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: 800,
                  color: "#0f172a",
                  marginBottom: "6px",
                }}
              >
                Giới thiệu ngành học
              </div>
              <div style={{ fontSize: "13px", lineHeight: 1.6, color: "#334155" }}>
                {major.description || `Ngành ${major.name} tại ${uni.name}.`}
              </div>
            </div>

            <div style={{ marginTop: "18px" }}>
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: 800,
                  color: "#0f172a",
                  marginBottom: "6px",
                }}
              >
                Điểm nổi bật
              </div>
              <ul style={{ margin: 0, paddingLeft: "18px" }}>
                {highlights.slice(0, 4).map((h, i) => (
                  <li
                    key={i}
                    style={{
                      fontSize: "13px",
                      lineHeight: 1.6,
                      color: "#334155",
                      marginBottom: "3px",
                    }}
                  >
                    <b>{h.title}:</b> {h.description}
                  </li>
                ))}
              </ul>
            </div>

            <div style={{ marginTop: "18px" }}>
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: 800,
                  color: "#0f172a",
                  marginBottom: "6px",
                }}
              >
                Cơ hội nghề nghiệp
              </div>
              <ul style={{ margin: 0, paddingLeft: "18px" }}>
                {careers.map((c, i) => (
                  <li
                    key={i}
                    style={{
                      fontSize: "13px",
                      lineHeight: 1.6,
                      color: "#334155",
                      marginBottom: "3px",
                    }}
                  >
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div
            style={{
              background: "#f8fafc",
              padding: "14px 36px",
              fontSize: "11px",
              color: "#94a3b8",
              display: "flex",
              justifyContent: "space-between",
              borderTop: "1px solid #e2e8f0",
            }}
          >
            <span>Tạo bởi caZup · cazup.io.vn</span>
            <span>{uni.website || ""}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MajorDetailPage;
