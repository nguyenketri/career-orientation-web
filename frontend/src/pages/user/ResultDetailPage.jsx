import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";
import { mbtiMaps } from "../../utils/mbtiMap";
import {
  HOLLAND_META,
  formatHollandCode,
  hollandCodeLetters,
  getCongruence,
  getCareerRecommendations,
} from "../../utils/hollandCareerMap";
import {
  getNickname,
  getViName,
  getTraitBreakdown,
  getMbtiCareers,
  getMbtiInsight,
  getMbtiNextSteps,
  COMPAT_LABEL,
} from "../../utils/mbtiCareerMap";
import axiosClient from "../../api/axios";
import { getUser } from "../../utils/auth";

const tagClass = (c) =>
  c === "green"
    ? "bg-emerald-100 text-emerald-700"
    : c === "blue"
      ? "bg-blue-100 text-blue-700"
      : "bg-purple-100 text-purple-700";

const RECOMMEND_IMG =
  "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=70";

// Số ngành/trường gợi ý theo gói — khớp với backend/utils/planLimits.js.
// Hiển thị ở đây để user hiểu rõ vì sao danh sách bị giới hạn và cần nâng cấp
// gói nào để xem thêm.
const buildUniversityMatches = (majors) =>
  (majors || [])
    .flatMap((m, mi) =>
      (m.universities || []).slice(0, 1).map((u) => ({
        id: `${m._id}-${u._id}`,
        name: u.name,
        location: u.location,
        program: m.name,
        match: Math.max(72, 96 - mi * 4),
        website: u.website,
        uniId: u._id,
      })),
    );

// Bảng "Trường & Ngành phù hợp" dùng chung cho cả Holland và MBTI — số dòng
// hiển thị do backend giới hạn theo gói hiện tại (planLimits.js: FREE 0 /
// PAID tối đa 6 / PREMIUM không giới hạn), nên bảng luôn khớp với gói thật.
const SchoolMatchSection = ({ matches, plan, navigate, title }) => (
  <div>
    <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
      <h2 className="text-2xl font-black">{title}</h2>
      {plan !== "PREMIUM" && (
        <button
          onClick={() => navigate("/pricing")}
          className="text-xs font-bold text-blue-600 hover:underline whitespace-nowrap"
        >
          {plan === "FREE"
            ? "Gói Cơ Bản: chưa mở khoá — Nâng cấp ngay ›"
            : `Gói Tiêu Chuẩn: tối đa 6 gợi ý — Nâng cấp Cao Cấp để xem không giới hạn ›`}
        </button>
      )}
    </div>
    {matches.length > 0 ? (
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-slate-400 text-xs font-bold uppercase tracking-wider bg-slate-50/70">
                <th className="px-6 py-4 font-medium">Trường</th>
                <th className="px-6 py-4 font-medium">Ngành gợi ý</th>
                <th className="px-6 py-4 font-medium">Độ phù hợp</th>
                <th className="px-6 py-4 font-medium text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {matches.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/60 transition">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900">{u.name}</div>
                    <div className="text-xs text-slate-400">{u.location}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 italic">{u.program}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-slate-800 w-9">{u.match}%</span>
                      <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${u.match}%` }} />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => (u.website ? window.open(u.website, "_blank", "noopener,noreferrer") : u.uniId && navigate(`/university/${u.uniId}`))} className="text-orange-600 text-sm font-bold hover:underline">
                      Xem trường ›
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    ) : (
      <div className="bg-blue-50 border border-blue-100 rounded-3xl p-8 text-center">
        <p className="text-blue-900 font-bold mb-1">Mở khoá gợi ý trường & ngành theo tính cách</p>
        <p className="text-blue-700 text-sm mb-5">
          Gói Cơ Bản (FREE) chưa bao gồm gợi ý trường/ngành. Nâng cấp Tiêu Chuẩn (PAID) để xem tối đa 6 gợi ý, hoặc Cao Cấp (PREMIUM) để xem không giới hạn.
        </p>
        <button onClick={() => navigate("/pricing")} className="px-6 py-3 bg-blue-600 text-white rounded-full font-bold hover:bg-blue-700 transition">Nâng cấp ngay</button>
      </div>
    )}
  </div>
);

const ResultDetailPage = () => {
  const { type, id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [result, setResult] = useState(location.state?.result || null);
  const [loading, setLoading] = useState(!location.state?.result);
  const [toast, setToast] = useState("");
  const reportRef = useRef(null);

  useEffect(() => {
    if (location.state?.result) return;
    const fetchResult = async () => {
      if (!id) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const endpoint = type === "holland" ? "holland-results" : type;
        const res = await axiosClient.get(`/${endpoint}/${id}`);
        setResult(res.data.data);
      } catch (err) {
        console.error("Error fetching result detail:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchResult();
  }, [type, id, location.state]);

  const showToast = (m) => {
    setToast(m);
    setTimeout(() => setToast(""), 2600);
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      showToast("Đã sao chép liên kết kết quả!");
    } catch {
      showToast("Không sao chép được liên kết.");
    }
  };

  const handleDownloadPDF = async () => {
    if (!reportRef.current) return;
    try {
      setToast("Đang tạo PDF...");
      const html2pdf = (await import("html2pdf.js")).default;
      await html2pdf()
        .set({
          margin: 0,
          filename: `caZup-${type === "holland" ? "Career-Compass" : "MBTI"}-${id || "report"}.pdf`,
          image: { type: "jpeg", quality: 0.95 },
          html2canvas: { scale: 2, backgroundColor: "#ffffff" },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        })
        .from(reportRef.current)
        .save();
      setToast("");
    } catch (err) {
      console.error(err);
      showToast("Không tạo được PDF, vui lòng thử lại.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
        <p className="text-slate-500">Không tìm thấy kết quả trắc nghiệm.</p>
        <button
          onClick={() => navigate("/history?tab=holland")}
          className="px-6 py-3 bg-slate-900 text-white rounded-full font-bold hover:bg-slate-800 transition"
        >
          Quay lại lịch sử
        </button>
      </div>
    );
  }

  const isHolland = type === "holland";
  const completedDate = new Date(result.createdAt).toLocaleDateString("vi-VN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // ---- Holland derived ----
  const scores = result.hollandScores || {};
  const maxScore =
    Math.max(...Object.values(scores).map((v) => Number(v) || 0), 1) || 1;
  const chartData = Object.entries(scores).map(([t, s]) => ({
    subject: HOLLAND_META[t]?.short || t,
    score: Number(s) || 0,
    fullMark: maxScore,
  }));
  const top3 = Object.entries(scores)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([t, s]) => ({
      type: t,
      pct: Math.round((Number(s) / maxScore) * 100),
      meta: HOLLAND_META[t] || {},
    }));
  const topTypes =
    result.topTypes?.length > 0 ? result.topTypes : top3.map((x) => x.type);
  const congruence = getCongruence(scores);
  const careerRecs = getCareerRecommendations(topTypes, scores);
  const universityMatches = buildUniversityMatches(result.recommendedMajors);

  // ---- MBTI derived ----
  const mType = result.mbtiType;
  const traitBreakdown = getTraitBreakdown(result.scores || {});
  const careers = getMbtiCareers(mType);
  const insight = getMbtiInsight(mType, result);
  const nextSteps = getMbtiNextSteps(mType);
  const mbtiUniversityMatches = buildUniversityMatches(result.recommendedMajors);

  // ---- Gói hiện tại (dùng để hiển thị lời nhắc nâng cấp đúng ngữ cảnh) ----
  const currentPlan = getUser()?.subscriptionPlan || "FREE";

  return (
    <div className="min-h-screen bg-slate-50 px-4 md:px-8 pt-24 pb-20 text-slate-900">
      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-sm font-medium px-5 py-2.5 rounded-full shadow-lg">
          {toast}
        </div>
      )}

      <div className="mx-auto max-w-7xl">
        {/* ===== HEADER ===== */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5 mb-8">
          <div>
            {isHolland ? (
              <div className="flex items-center gap-2 text-sm mb-2">
                <button
                  onClick={() => navigate("/history?tab=holland")}
                  className="text-slate-400 hover:text-blue-600 font-medium transition"
                >
                  Lịch sử Trắc nghiệm
                </button>
                <span className="text-slate-300">›</span>
                <span className="font-bold text-slate-700">
                  Holland Result #{String(id || "").slice(-4).toUpperCase()}
                </span>
              </div>
            ) : (
              <button
                onClick={() => navigate("/history?tab=mbti")}
                className="inline-flex items-center gap-2 text-sm mb-3 text-slate-500 hover:text-slate-900 font-medium transition"
              >
                <span className="inline-flex items-center gap-1.5 bg-white border border-slate-200 rounded-full px-3 py-1.5 hover:bg-slate-50">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Quay lại lịch sử
                </span>
                <span className="text-slate-400">Kết quả ngày {completedDate}</span>
              </button>
            )}

            {isHolland ? (
              <>
                <h1 className="text-3xl md:text-4xl font-black text-slate-900">
                  Báo cáo Định hướng Nghề nghiệp
                </h1>
                <div className="flex items-center gap-2 text-slate-500 text-sm mt-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Hoàn thành ngày {completedDate} · Kết quả đã xác thực
                </div>
              </>
            ) : (
              <>
                <div className="text-[11px] font-black tracking-widest uppercase text-orange-600 mb-1">
                  Phân tích chi tiết MBTI
                </div>
                <h1 className="text-3xl md:text-4xl font-black text-slate-900">
                  {getViName(mType)}{" "}
                  <span className="text-orange-500">: {mType}</span>
                </h1>
                <p className="text-slate-500 max-w-xl mt-2 leading-relaxed">
                  Bài test ngày <b>{completedDate}</b> cho thấy một tính cách{" "}
                  {(mbtiMaps[mType]?.desc || "").toLowerCase()}
                </p>
              </>
            )}
          </div>

          {/* right side */}
          {isHolland ? (
            <div className="flex items-center gap-3">
              <button
                onClick={handleShare}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white border border-slate-200 text-slate-700 text-sm font-bold hover:bg-slate-50 transition"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                Chia sẻ
              </button>
              <button
                onClick={handleDownloadPDF}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold transition shadow-lg shadow-orange-200 active:scale-95"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Tải PDF
              </button>
            </div>
          ) : (
            <div className="flex-shrink-0 w-40 h-32 rounded-3xl bg-orange-100 flex flex-col items-center justify-center">
              <span className="text-3xl font-black text-slate-900 tracking-wide">
                {mType}
              </span>
              <span className="text-[11px] font-bold text-orange-700 mt-1">
                Nhóm tính cách
              </span>
            </div>
          )}
        </div>

        {/* ===== HOLLAND BODY ===== */}
        {isHolland ? (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <div className="grid lg:grid-cols-2 gap-6 mb-10">
              <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-black">
                    Mã Holland:{" "}
                    <span className="text-blue-600">{hollandCodeLetters(topTypes)}</span>
                  </h3>
                  <span
                    className={`text-[11px] font-bold px-3 py-1 rounded-full ${
                      congruence.level === "high"
                        ? "bg-emerald-100 text-emerald-700"
                        : congruence.level === "mid"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {congruence.label}
                  </span>
                </div>
                <div className="w-full h-[320px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="78%" data={chartData}>
                      <PolarGrid stroke="#e2e8f0" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: "#64748b", fontSize: 12, fontWeight: 600 }} />
                      <Radar dataKey="score" stroke="#2563eb" fill="#3b82f6" fillOpacity={0.55} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="space-y-4">
                {top3.map((item) => (
                  <div key={item.type} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex gap-4 items-start">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0" style={{ background: `${item.meta.color}1a` }}>
                      {item.meta.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-black text-slate-900">{item.meta.short}</h4>
                        <span className="text-sm font-black" style={{ color: item.meta.color }}>{item.pct}%</span>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed mb-2">{item.meta.role}</p>
                      <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${item.pct}%`, background: item.meta.color }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-12">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-black">Gợi ý nghề nghiệp từ caZup AI</h2>
              </div>
              <p className="text-slate-500 text-sm mb-6 ml-12">
                Lộ trình cá nhân hoá dựa trên hồ sơ {hollandCodeLetters(topTypes)} của bạn.
              </p>
              <div className="grid md:grid-cols-3 gap-5">
                {careerRecs.map((c, i) => (
                  <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition flex flex-col">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex gap-1">
                        {c.involved.map((t) => (
                          <span key={t} className="text-2xl">{HOLLAND_META[t]?.icon}</span>
                        ))}
                      </div>
                      <span className="text-4xl font-black text-orange-200">{c.match}%</span>
                    </div>
                    <h3 className="text-lg font-black text-slate-900 mb-2">{c.title}</h3>
                    <p className="text-sm text-slate-500 leading-relaxed mb-4 flex-1">{c.desc}</p>
                    <span className={`self-start text-[11px] font-bold px-2.5 py-1 rounded-full mb-4 ${tagClass(c.tagColor)}`}>{c.tag}</span>
                    <button onClick={() => navigate("/mentor")} className={`w-full py-3 rounded-xl text-sm font-bold transition ${i === 0 ? "bg-slate-900 text-white hover:bg-slate-800" : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"}`}>
                      Hỏi AI Mentor về nghề này
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <SchoolMatchSection
              matches={universityMatches}
              plan={currentPlan}
              navigate={navigate}
              title="Trường & Ngành phù hợp"
            />
          </motion.div>
        ) : (
          /* ===== MBTI BODY ===== */
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Trait Breakdown */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 md:p-8">
                <h3 className="text-lg font-black mb-6 flex items-center gap-2">
                  <span className="text-orange-500">📊</span> Phân tích 4 chiều tính cách
                </h3>
                <div className="space-y-6">
                  {traitBreakdown.map((t, i) => (
                    <div key={i}>
                      <div className="flex justify-between text-sm font-bold mb-2">
                        <span className="text-slate-800">
                          {t.domLabel} ({t.domPct}%)
                        </span>
                        <span className="text-slate-400">
                          {t.subLabel} ({t.subPct}%)
                        </span>
                      </div>
                      <div className="h-3 bg-blue-50 rounded-full overflow-hidden">
                        <div className="h-full bg-orange-500 rounded-full transition-all duration-700" style={{ width: `${t.domPct}%` }} />
                      </div>
                      <p className="text-xs text-slate-500 mt-2">{t.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Optimized Career Paths */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 md:p-8">
                <h3 className="text-lg font-black mb-5 flex items-center gap-2">
                  <span className="text-orange-500">💼</span> Định hướng nghề nghiệp tối ưu
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-slate-400 text-xs font-bold uppercase tracking-wider bg-slate-50/70">
                        <th className="px-4 py-3 font-medium rounded-l-lg">Vai trò</th>
                        <th className="px-4 py-3 font-medium">Độ phù hợp</th>
                        <th className="px-4 py-3 font-medium">Lương khởi điểm</th>
                        <th className="px-4 py-3 font-medium rounded-r-lg">Tiềm năng</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {careers.map((c, i) => (
                        <tr key={i}>
                          <td className="px-4 py-4 font-bold text-slate-800">{c.role}</td>
                          <td className="px-4 py-4">
                            <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${COMPAT_LABEL[c.comp]?.cls}`}>
                              {COMPAT_LABEL[c.comp]?.text}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-sm text-slate-600">{c.salary}</td>
                          <td className="px-4 py-4">
                            <div className="flex gap-1">
                              {[1, 2, 3, 4, 5].map((d) => (
                                <span key={d} className={`w-2.5 h-2.5 rounded-sm ${d <= c.growth ? "bg-slate-800" : "bg-slate-200"}`} />
                              ))}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <SchoolMatchSection
                matches={mbtiUniversityMatches}
                plan={currentPlan}
                navigate={navigate}
                title="Trường & Ngành phù hợp theo MBTI"
              />
            </div>

            {/* Right column */}
            <div className="space-y-6">
              {/* AI Mentor Insight */}
              <div className="bg-slate-900 rounded-3xl p-6 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl -mr-10 -mt-10" />
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">🤖</div>
                    <div>
                      <div className="font-black text-sm">AI Mentor Insight</div>
                      <div className="text-[10px] text-slate-400 uppercase tracking-wider">Tạo từ kết quả test</div>
                    </div>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-slate-300 italic leading-relaxed mb-5">
                    "{insight}"
                  </div>
                  <div className="text-sm font-bold mb-3">Bước tiếp theo:</div>
                  <ul className="space-y-2.5 mb-5">
                    {nextSteps.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                        <span className="text-emerald-400 mt-0.5">✓</span> {s}
                      </li>
                    ))}
                  </ul>
                  <button onClick={() => navigate("/mentor")} className="w-full py-3 bg-orange-500 hover:bg-orange-600 rounded-xl text-sm font-bold transition flex items-center justify-center gap-2">
                    Trò chuyện với AI Mentor →
                  </button>
                </div>
              </div>

              {/* Recommended card */}
              <div className="rounded-3xl overflow-hidden relative h-52 group">
                <img src={RECOMMEND_IMG} alt="Recommended" className="absolute inset-0 w-full h-full object-cover" onError={(e) => (e.target.style.display = "none")} />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 to-slate-900/20" />
                <div className="absolute bottom-0 p-5 text-white">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-300 mb-1">Gợi ý cho bạn</div>
                  <div className="font-black text-lg leading-tight mb-2">
                    Chọn ngành hợp với nhóm {getNickname(mType)}
                  </div>
                  <button onClick={() => navigate("/recommend")} className="text-orange-400 text-sm font-bold hover:text-orange-300">
                    Khám phá ngay ›
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom actions */}
            <div className="lg:col-span-3 flex flex-col sm:flex-row justify-between gap-4 pt-6 border-t border-slate-100">
              <div className="flex gap-3">
                <button onClick={handleDownloadPDF} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white border border-slate-200 text-slate-700 text-sm font-bold hover:bg-slate-50 transition">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Tải PDF
                </button>
                <button onClick={handleShare} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white border border-slate-200 text-slate-700 text-sm font-bold hover:bg-slate-50 transition">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  Chia sẻ
                </button>
              </div>
              <button onClick={() => navigate("/tests/mbti")} className="inline-flex items-center justify-center px-6 py-2.5 rounded-full bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 transition">
                Làm lại bài test
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* ===== Báo cáo ẩn để xuất PDF ===== */}
      <div style={{ position: "fixed", left: "-10000px", top: 0 }} aria-hidden="true">
        <div ref={reportRef} style={{ width: "760px", fontFamily: "Arial, sans-serif", background: "#fff", color: "#0f172a" }}>
          <div style={{ background: "#0f172a", padding: "26px 36px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: "26px", fontWeight: 800, color: "#fff" }}>caZup</div>
            <div style={{ fontSize: "12px", letterSpacing: "2px", color: "#f97316", fontWeight: 700 }}>
              {isHolland ? "BÁO CÁO HƯỚNG NGHIỆP" : "BÁO CÁO TÍNH CÁCH MBTI"}
            </div>
          </div>
          <div style={{ padding: "30px 36px" }}>
            {isHolland ? (
              <>
                <div style={{ fontSize: "12px", color: "#f97316", fontWeight: 700, textTransform: "uppercase" }}>Mã Holland</div>
                <div style={{ fontSize: "28px", fontWeight: 800, margin: "2px 0 4px" }}>
                  {hollandCodeLetters(topTypes)} — {formatHollandCode(topTypes)}
                </div>
                <div style={{ fontSize: "13px", color: "#64748b" }}>Hoàn thành ngày {completedDate} · Mức đồng nhất: {congruence.label}</div>
                <div style={{ marginTop: "22px", fontSize: "14px", fontWeight: 800, marginBottom: "8px" }}>Điểm 6 nhóm sở thích (RIASEC)</div>
                {Object.entries(scores).map(([t, s]) => {
                  const pct = Math.round((Number(s) / maxScore) * 100);
                  return (
                    <div key={t} style={{ marginBottom: "8px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "2px" }}>
                        <span style={{ fontWeight: 700 }}>{HOLLAND_META[t]?.short || t}</span>
                        <span style={{ color: "#64748b" }}>{pct}%</span>
                      </div>
                      <div style={{ height: "8px", background: "#e2e8f0", borderRadius: "6px" }}>
                        <div style={{ height: "8px", width: `${pct}%`, background: HOLLAND_META[t]?.color || "#2563eb", borderRadius: "6px" }} />
                      </div>
                    </div>
                  );
                })}
              </>
            ) : (
              <>
                <div style={{ fontSize: "12px", color: "#f97316", fontWeight: 700, textTransform: "uppercase" }}>Nhóm tính cách</div>
                <div style={{ fontSize: "28px", fontWeight: 800, margin: "2px 0 4px" }}>{mType} — {getViName(mType)}</div>
                <div style={{ fontSize: "13px", color: "#64748b" }}>Hoàn thành ngày {completedDate}</div>
                <div style={{ marginTop: "22px", fontSize: "14px", fontWeight: 800, marginBottom: "8px" }}>Phân tích 4 chiều</div>
                {traitBreakdown.map((t, i) => (
                  <div key={i} style={{ marginBottom: "8px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "2px" }}>
                      <span style={{ fontWeight: 700 }}>{t.domLabel}</span>
                      <span style={{ color: "#64748b" }}>{t.domPct}%</span>
                    </div>
                    <div style={{ height: "8px", background: "#e2e8f0", borderRadius: "6px" }}>
                      <div style={{ height: "8px", width: `${t.domPct}%`, background: "#f97316", borderRadius: "6px" }} />
                    </div>
                  </div>
                ))}
                <div style={{ marginTop: "18px", fontSize: "14px", fontWeight: 800, marginBottom: "6px" }}>Định hướng nghề nghiệp</div>
                <ul style={{ margin: 0, paddingLeft: "18px" }}>
                  {careers.map((c, i) => (
                    <li key={i} style={{ fontSize: "13px", lineHeight: 1.6, color: "#334155" }}>
                      <b>{c.role}</b> — {COMPAT_LABEL[c.comp]?.text}, {c.salary}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
          <div style={{ background: "#f8fafc", padding: "14px 36px", fontSize: "11px", color: "#94a3b8", borderTop: "1px solid #e2e8f0" }}>
            Tạo bởi caZup · cazup.io.vn
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultDetailPage;
