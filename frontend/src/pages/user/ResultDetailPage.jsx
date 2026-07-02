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
import axiosClient from "../../api/axios";

const tagClass = (c) =>
  c === "green"
    ? "bg-emerald-100 text-emerald-700"
    : c === "blue"
      ? "bg-blue-100 text-blue-700"
      : "bg-purple-100 text-purple-700";

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
          filename: `caZup-Career-Compass-${id || "report"}.pdf`,
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

  // ---- Holland derived data ----
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
      score: Number(s) || 0,
      pct: Math.round((Number(s) / maxScore) * 100),
      meta: HOLLAND_META[t] || {},
    }));
  const topTypes =
    result.topTypes?.length > 0 ? result.topTypes : top3.map((x) => x.type);
  const congruence = getCongruence(scores);
  const careerRecs = getCareerRecommendations(topTypes, scores);

  const universityMatches = (result.recommendedMajors || [])
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
    )
    .slice(0, 6);

  const completedDate = new Date(result.createdAt).toLocaleDateString("vi-VN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // ---- MBTI derived ----
  const getMbtiComponents = () => {
    const s = result.scores || {};
    const pairs = [
      { left: "E", right: "I", label: "Hướng ngoại / Hướng nội" },
      { left: "S", right: "N", label: "Cảm giác / Trực giác" },
      { left: "T", right: "F", label: "Lý trí / Cảm xúc" },
      { left: "J", right: "P", label: "Nguyên tắc / Linh hoạt" },
    ];
    return pairs.map(({ left, right, label }) => {
      const l = s[left] || 0;
      const r = s[right] || 0;
      const total = l + r || 1;
      return {
        label,
        left,
        right,
        leftPercent: Math.round((l / total) * 100),
        rightPercent: Math.round((r / total) * 100),
      };
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 md:px-8 pt-24 pb-20 text-slate-900">
      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-sm font-medium px-5 py-2.5 rounded-full shadow-lg">
          {toast}
        </div>
      )}

      <div className="mx-auto max-w-7xl">
        {/* Breadcrumb + title + actions */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5 mb-8">
          <div>
            <div className="flex items-center gap-2 text-sm mb-2">
              <button
                onClick={() => navigate("/history?tab=holland")}
                className="text-slate-400 hover:text-blue-600 font-medium transition"
              >
                Lịch sử Trắc nghiệm
              </button>
              <span className="text-slate-300">›</span>
              <span className="font-bold text-slate-700">
                {isHolland ? "Holland" : "MBTI"} Result #
                {String(id || "").slice(-4).toUpperCase()}
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900">
              {isHolland ? "Báo cáo Định hướng Nghề nghiệp" : "Báo cáo Tính cách MBTI"}
            </h1>
            <div className="flex items-center gap-2 text-slate-500 text-sm mt-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Hoàn thành ngày {completedDate} · Kết quả đã xác thực
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white border border-slate-200 text-slate-700 text-sm font-bold hover:bg-slate-50 transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
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
        </div>

        {isHolland ? (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            {/* Radar + Top 3 */}
            <div className="grid lg:grid-cols-2 gap-6 mb-10">
              <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-black">
                    Mã Holland:{" "}
                    <span className="text-blue-600">
                      {hollandCodeLetters(topTypes)}
                    </span>
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
                      <PolarAngleAxis
                        dataKey="subject"
                        tick={{ fill: "#64748b", fontSize: 12, fontWeight: 600 }}
                      />
                      <Radar
                        name="Score"
                        dataKey="score"
                        stroke="#2563eb"
                        fill="#3b82f6"
                        fillOpacity={0.55}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="space-y-4">
                {top3.map((item) => (
                  <div
                    key={item.type}
                    className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex gap-4 items-start"
                  >
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                      style={{ background: `${item.meta.color}1a` }}
                    >
                      {item.meta.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-black text-slate-900">
                          {item.meta.short}
                        </h4>
                        <span
                          className="text-sm font-black"
                          style={{ color: item.meta.color }}
                        >
                          {item.pct}%
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed mb-2">
                        {item.meta.role}
                      </p>
                      <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${item.pct}%`,
                            background: item.meta.color,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Mentorship Recommendations */}
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
                  <div
                    key={i}
                    className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition flex flex-col"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex gap-1">
                        {c.involved.map((t) => (
                          <span key={t} className="text-2xl">
                            {HOLLAND_META[t]?.icon}
                          </span>
                        ))}
                      </div>
                      <span className="text-4xl font-black text-orange-200">
                        {c.match}%
                      </span>
                    </div>
                    <h3 className="text-lg font-black text-slate-900 mb-2">
                      {c.title}
                    </h3>
                    <p className="text-sm text-slate-500 leading-relaxed mb-4 flex-1">
                      {c.desc}
                    </p>
                    <span
                      className={`self-start text-[11px] font-bold px-2.5 py-1 rounded-full mb-4 ${tagClass(c.tagColor)}`}
                    >
                      {c.tag}
                    </span>
                    <button
                      onClick={() => navigate("/mentor")}
                      className={`w-full py-3 rounded-xl text-sm font-bold transition ${
                        i === 0
                          ? "bg-slate-900 text-white hover:bg-slate-800"
                          : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      Hỏi AI Mentor về nghề này
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Top University Matches */}
            <div>
              <h2 className="text-2xl font-black mb-5">Trường & Ngành phù hợp</h2>
              {universityMatches.length > 0 ? (
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
                        {universityMatches.map((u) => (
                          <tr key={u.id} className="hover:bg-slate-50/60 transition">
                            <td className="px-6 py-4">
                              <div className="font-bold text-slate-900">{u.name}</div>
                              <div className="text-xs text-slate-400">{u.location}</div>
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-600 italic">
                              {u.program}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-black text-slate-800 w-9">
                                  {u.match}%
                                </span>
                                <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-emerald-500 rounded-full"
                                    style={{ width: `${u.match}%` }}
                                  />
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button
                                onClick={() =>
                                  u.website
                                    ? window.open(u.website, "_blank", "noopener,noreferrer")
                                    : u.uniId && navigate(`/university/${u.uniId}`)
                                }
                                className="text-orange-600 text-sm font-bold hover:underline"
                              >
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
                  <p className="text-blue-900 font-bold mb-1">
                    Mở khoá gợi ý trường & ngành theo tính cách
                  </p>
                  <p className="text-blue-700 text-sm mb-5">
                    Nâng cấp gói PAID/PREMIUM để caZup gợi ý ngành & trường phù hợp
                    nhất với hồ sơ Holland của bạn.
                  </p>
                  <button
                    onClick={() => navigate("/pricing")}
                    className="px-6 py-3 bg-blue-600 text-white rounded-full font-bold hover:bg-blue-700 transition"
                  >
                    Nâng cấp ngay
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          /* ===== MBTI ===== */
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid md:grid-cols-2 gap-8"
          >
            <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
              <div className="relative z-10">
                <h3 className="text-5xl font-black mb-2">{result?.mbtiType}</h3>
                <h4 className="text-xl font-bold text-blue-400 mb-4">
                  {mbtiMaps[result?.mbtiType]?.name}
                </h4>
                <p className="text-slate-300 leading-relaxed opacity-90">
                  {mbtiMaps[result?.mbtiType]?.desc}
                </p>
              </div>
            </div>
            <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm">
              <h3 className="text-lg font-black mb-6">Chỉ số thành phần tính cách</h3>
              <div className="space-y-6">
                {getMbtiComponents().map((comp, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between text-xs font-bold mb-2">
                      <span className="text-slate-700">
                        {comp.left} ({comp.leftPercent}%)
                      </span>
                      <span className="text-slate-400">{comp.label}</span>
                      <span className="text-slate-700">
                        ({comp.rightPercent}%) {comp.right}
                      </span>
                    </div>
                    <div className="h-3 bg-slate-100 rounded-full overflow-hidden flex">
                      <div className="h-full bg-blue-600" style={{ width: `${comp.leftPercent}%` }} />
                      <div className="h-full bg-slate-300" style={{ width: `${comp.rightPercent}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* ===== Báo cáo ẩn để xuất PDF ===== */}
      <div style={{ position: "fixed", left: "-10000px", top: 0 }} aria-hidden="true">
        <div
          ref={reportRef}
          style={{ width: "760px", fontFamily: "Arial, sans-serif", background: "#fff", color: "#0f172a" }}
        >
          <div style={{ background: "#0f172a", padding: "26px 36px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: "26px", fontWeight: 800, color: "#fff" }}>caZup</div>
            <div style={{ fontSize: "12px", letterSpacing: "2px", color: "#f97316", fontWeight: 700 }}>
              {isHolland ? "BÁO CÁO HƯỚNG NGHIỆP" : "BÁO CÁO TÍNH CÁCH"}
            </div>
          </div>
          <div style={{ padding: "30px 36px" }}>
            {isHolland ? (
              <>
                <div style={{ fontSize: "12px", color: "#f97316", fontWeight: 700, textTransform: "uppercase" }}>
                  Mã Holland
                </div>
                <div style={{ fontSize: "28px", fontWeight: 800, margin: "2px 0 4px" }}>
                  {hollandCodeLetters(topTypes)} — {formatHollandCode(topTypes)}
                </div>
                <div style={{ fontSize: "13px", color: "#64748b" }}>
                  Hoàn thành ngày {completedDate} · Mức đồng nhất: {congruence.label}
                </div>

                <div style={{ marginTop: "22px", fontSize: "14px", fontWeight: 800, marginBottom: "8px" }}>
                  Điểm 6 nhóm sở thích (RIASEC)
                </div>
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

                <div style={{ marginTop: "20px", fontSize: "14px", fontWeight: 800, marginBottom: "6px" }}>
                  Gợi ý nghề nghiệp
                </div>
                <ul style={{ margin: 0, paddingLeft: "18px" }}>
                  {careerRecs.map((c, i) => (
                    <li key={i} style={{ fontSize: "13px", lineHeight: 1.6, color: "#334155", marginBottom: "3px" }}>
                      <b>{c.title}</b> — {c.match}% phù hợp
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <>
                <div style={{ fontSize: "28px", fontWeight: 800 }}>
                  {result?.mbtiType} — {mbtiMaps[result?.mbtiType]?.name}
                </div>
                <div style={{ fontSize: "13px", color: "#64748b", marginTop: "4px" }}>
                  Hoàn thành ngày {completedDate}
                </div>
                <p style={{ fontSize: "13px", lineHeight: 1.6, color: "#334155", marginTop: "14px" }}>
                  {mbtiMaps[result?.mbtiType]?.desc}
                </p>
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
