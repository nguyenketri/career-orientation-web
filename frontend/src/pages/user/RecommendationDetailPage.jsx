import { useEffect, useState, useRef, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getScoreAnalysisById } from "../../services/recommendService";

const SUBJECT_VI = {
  math: "Toán",
  literature: "Ngữ văn",
  english: "Tiếng Anh",
  physics: "Vật lý",
  chemistry: "Hóa học",
  biology: "Sinh học",
  history: "Lịch sử",
  geography: "Địa lý",
  civicEducation: "GDCD",
};

const AVATAR = (name) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name || "Uni")}&background=random&size=200`;

const RecommendationDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(null);
  const [showAll, setShowAll] = useState(false);
  const [toast, setToast] = useState("");
  const reportRef = useRef(null);

  useEffect(() => {
    const fetchResult = async () => {
      setLoading(true);
      try {
        const res = await getScoreAnalysisById(id);
        setResult(res.data || null);
      } catch (err) {
        console.error("Error fetching recommendation detail:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchResult();
  }, [id]);

  const availableYears = useMemo(() => {
    const set = new Set();
    (result?.recommendedUniversityMajors || []).forEach((um) =>
      (um.admissionHistory || []).forEach(
        (h) => h.year && set.add(Number(h.year)),
      ),
    );
    const arr = [...set].sort((a, b) => b - a);
    return arr.length ? arr : [2025, 2024, 2023];
  }, [result]);

  const selectedYear = year ?? availableYears[0];

  const showToast = (m) => {
    setToast(m);
    setTimeout(() => setToast(""), 2600);
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      showToast("Đã sao chép liên kết!");
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
          filename: `caZup-Goi-y-diem-${id || "report"}.pdf`,
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
        <p className="text-slate-500">Không tìm thấy dữ liệu gợi ý.</p>
        <button
          onClick={() => navigate("/history?tab=academic")}
          className="bg-slate-900 text-white px-6 py-3 rounded-full font-bold hover:bg-slate-800 transition"
        >
          Quay lại lịch sử
        </button>
      </div>
    );
  }

  const subjectEntries = Object.entries(result.subjectScores || {}).filter(
    ([, v]) => Number(v) > 0,
  );
  const topCombo = result.topCombinations?.[0];
  const matches = result.recommendedUniversityMajors || [];

  const benchmarkForYear = (item) => {
    const rec = (item.admissionHistory || []).find(
      (h) => Number(h.year) === Number(selectedYear),
    );
    return rec ? rec.admissionScore : item.admissionScore;
  };

  const userScoreForCombo = (combo) => {
    const c = (result.topCombinations || []).find(
      (x) => x.combination === combo,
    );
    return c ? c.totalScore : topCombo?.totalScore;
  };

  const chanceFor = (item) => {
    const bm = Number(benchmarkForYear(item));
    const us = Number(userScoreForCombo(item.subjectCombination));
    if (isNaN(bm) || isNaN(us)) return { pct: 80, color: "bg-blue-500", label: "text-blue-600" };
    const margin = us - bm;
    if (margin >= 2) return { pct: 98, color: "bg-emerald-500", label: "text-emerald-600" };
    if (margin >= 0) return { pct: 92, color: "bg-emerald-500", label: "text-emerald-600" };
    if (margin >= -2) return { pct: 75, color: "bg-orange-500", label: "text-orange-600" };
    return { pct: 55, color: "bg-rose-500", label: "text-rose-600" };
  };

  const visibleMatches = showAll ? matches : matches.slice(0, 6);
  const recommendedDate = new Date(result.createdAt).toLocaleDateString("vi-VN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const topMajorName = matches[0]?.major?.name || "ngành bạn quan tâm";

  return (
    <div className="min-h-screen bg-slate-50 px-4 md:px-8 pt-24 pb-20 text-slate-900">
      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-sm font-medium px-5 py-2.5 rounded-full shadow-lg">
          {toast}
        </div>
      )}

      <div className="mx-auto max-w-7xl">
        {/* Breadcrumb (no arrow) */}
        <div className="flex items-center gap-2 text-sm mb-3">
          <button
            onClick={() => navigate("/history?tab=academic")}
            className="text-slate-400 hover:text-blue-600 font-medium transition"
          >
            Lịch sử điểm
          </button>
          <span className="text-slate-300">›</span>
          <span className="font-bold text-slate-700">Chi tiết gợi ý</span>
        </div>

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 leading-tight">
              Phân tích điểm {new Date(result.createdAt).getFullYear()}
            </h1>
            <div className="flex items-center gap-2 text-slate-500 text-sm mt-2">
              <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Gợi ý ngày {recommendedDate}
            </div>
          </div>
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
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Tải PDF
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* LEFT */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <h3 className="text-lg font-black mb-5">Điểm đã nhập</h3>
              <div className="space-y-2.5">
                {subjectEntries.map(([subject, score]) => (
                  <div
                    key={subject}
                    className="flex justify-between items-center px-4 py-3 bg-slate-50 rounded-xl"
                  >
                    <span className="text-slate-600 font-medium">
                      {SUBJECT_VI[subject] || subject}
                    </span>
                    <span className="font-black text-slate-900">{score}</span>
                  </div>
                ))}
                <div className="flex justify-between items-center px-4 py-3 bg-blue-50 rounded-xl border border-blue-100 mt-4">
                  <span className="text-blue-700 font-bold">
                    Tổng ({topCombo?.combination || "—"})
                  </span>
                  <span className="font-black text-blue-800 text-lg">
                    {topCombo?.totalScore ?? "0"}
                  </span>
                </div>
              </div>
            </div>

            {/* AI Insights */}
            <div className="bg-slate-900 text-white p-7 rounded-3xl shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl -mr-14 -mt-14" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-9 h-9 bg-orange-500 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-black">Nhận định từ caZup AI</h3>
                </div>
                <p className="text-slate-300 italic leading-relaxed mb-6 text-sm">
                  "Với tổ hợp {topCombo?.combination} đạt {topCombo?.totalScore} điểm, bạn có cơ hội tốt vào các ngành top. Môn{" "}
                  {SUBJECT_VI[
                    [...subjectEntries].sort((a, b) => b[1] - a[1])[0]?.[0]
                  ] || "thế mạnh"}{" "}
                  là lợi thế cạnh tranh lớn của bạn."
                </p>
                <button
                  onClick={() => navigate("/mentor")}
                  className="w-full py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-bold transition border border-white/10"
                >
                  Hỏi thêm AI Mentor
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT: Recommended Matches */}
          <div className="lg:col-span-2">
            <div className="bg-white p-6 md:p-7 rounded-3xl border border-slate-100 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-black">Trường phù hợp</h3>
                  <span className="px-3 py-1 bg-slate-100 text-slate-500 text-xs font-bold rounded-full">
                    {matches.length} kết quả
                  </span>
                </div>
                {/* Year filter */}
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">
                    Điểm chuẩn
                  </span>
                  <div className="inline-flex items-center gap-1 bg-slate-100 rounded-full p-1">
                    {availableYears.map((y) => (
                      <button
                        key={y}
                        onClick={() => setYear(y)}
                        className={`px-3 py-1 rounded-full text-xs font-bold transition ${
                          selectedYear === y
                            ? "bg-white text-blue-600 shadow-sm"
                            : "text-slate-500 hover:text-slate-700"
                        }`}
                      >
                        {y}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-slate-400 text-xs font-bold uppercase tracking-wider border-b border-slate-100">
                      <th className="pb-3 font-medium">Trường & Ngành</th>
                      <th className="pb-3 font-medium">Tổ hợp</th>
                      <th className="pb-3 font-medium">Điểm chuẩn {selectedYear}</th>
                      <th className="pb-3 font-medium">Khả năng đậu</th>
                      <th className="pb-3 font-medium text-right">Chi tiết</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {visibleMatches.map((item, idx) => {
                      const chance = chanceFor(item);
                      return (
                        <tr key={`${item._id}-${idx}`} className="hover:bg-slate-50/60 transition">
                          <td className="py-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={item.university?.image || AVATAR(item.university?.name)}
                                alt="uni"
                                className="w-10 h-10 rounded-lg object-contain bg-slate-50 p-1 flex-shrink-0"
                                onError={(e) => (e.target.src = AVATAR(item.university?.name))}
                              />
                              <div>
                                <div className="font-bold text-slate-900 text-sm">{item.university?.name}</div>
                                <div className="text-xs text-slate-500">{item.major?.name}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4">
                            <span className="px-2 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold rounded">
                              {item.subjectCombination || "—"}
                            </span>
                          </td>
                          <td className="py-4 text-sm font-bold text-slate-800">
                            {benchmarkForYear(item)}
                          </td>
                          <td className="py-4">
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div className={`h-full ${chance.color}`} style={{ width: `${chance.pct}%` }} />
                              </div>
                              <span className={`text-xs font-bold ${chance.label}`}>{chance.pct}%</span>
                            </div>
                          </td>
                          <td className="py-4 text-right">
                            <button
                              onClick={() => navigate(`/major/${item._id}`)}
                              className="text-orange-600 text-sm font-bold hover:underline"
                            >
                              Xem ›
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="md:hidden space-y-3">
                {visibleMatches.map((item, idx) => {
                  const chance = chanceFor(item);
                  return (
                    <div key={`${item._id}-${idx}`} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.university?.image || AVATAR(item.university?.name)}
                          alt="uni"
                          className="w-10 h-10 rounded-lg object-contain bg-white p-1 border border-slate-200"
                          onError={(e) => (e.target.src = AVATAR(item.university?.name))}
                        />
                        <div className="min-w-0">
                          <div className="font-bold text-slate-900 text-sm truncate">{item.university?.name}</div>
                          <div className="text-xs text-slate-500 truncate">{item.major?.name}</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div>
                          <div className="text-[9px] text-slate-400 uppercase font-bold">Tổ hợp</div>
                          <div className="text-xs font-bold text-blue-600">{item.subjectCombination}</div>
                        </div>
                        <div>
                          <div className="text-[9px] text-slate-400 uppercase font-bold">Chuẩn {selectedYear}</div>
                          <div className="text-xs font-black text-slate-800">{benchmarkForYear(item)}</div>
                        </div>
                        <div>
                          <div className="text-[9px] text-slate-400 uppercase font-bold">Đậu</div>
                          <div className={`text-xs font-black ${chance.label}`}>{chance.pct}%</div>
                        </div>
                      </div>
                      <button onClick={() => navigate(`/major/${item._id}`)} className="w-full py-2 bg-slate-900 text-white text-xs font-bold rounded-lg">
                        Xem chi tiết
                      </button>
                    </div>
                  );
                })}
              </div>

              {matches.length > 6 && (
                <div className="text-center mt-6">
                  <button
                    onClick={() => setShowAll((s) => !s)}
                    className="text-blue-600 font-bold text-sm hover:underline"
                  >
                    {showAll ? "Thu gọn" : `Xem tất cả ${matches.length} gợi ý`}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Market outlook */}
        <div className="mt-8 bg-blue-50 border border-blue-100 rounded-3xl p-7 md:p-9 flex flex-col lg:flex-row items-center gap-8">
          <div className="flex-1">
            <div className="text-[11px] font-black tracking-widest uppercase text-orange-600 mb-2">
              Triển vọng nghề nghiệp
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-5">
              Tương lai ngành {topMajorName}
            </h2>
            <div className="grid sm:grid-cols-2 gap-5 mb-6">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-700 shadow-sm">💰</div>
                <div>
                  <div className="font-bold text-slate-800 text-sm">Mức lương khởi điểm</div>
                  <div className="text-xs text-slate-500">Khoảng 8 – 15 triệu/tháng cho sinh viên mới ra trường.</div>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-700 shadow-sm">📈</div>
                <div>
                  <div className="font-bold text-slate-800 text-sm">Nhu cầu nhân lực</div>
                  <div className="text-xs text-slate-500">Tăng trưởng ổn định, nhiều cơ hội việc làm tại Việt Nam.</div>
                </div>
              </div>
            </div>
            <button
              onClick={() => navigate("/mentor")}
              className="bg-white border border-slate-200 text-slate-800 px-6 py-3 rounded-full font-bold hover:bg-slate-50 transition"
            >
              Khám phá lộ trình nghề nghiệp
            </button>
          </div>
          <div className="w-48 h-48 rounded-full bg-gradient-to-br from-blue-200 to-blue-100 flex items-center justify-center text-6xl flex-shrink-0">
            🎓
          </div>
        </div>
      </div>

      {/* Hidden PDF report */}
      <div style={{ position: "fixed", left: "-10000px", top: 0 }} aria-hidden="true">
        <div ref={reportRef} style={{ width: "760px", fontFamily: "Arial, sans-serif", background: "#fff", color: "#0f172a" }}>
          <div style={{ background: "#0f172a", padding: "26px 36px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: "26px", fontWeight: 800, color: "#fff" }}>caZup</div>
            <div style={{ fontSize: "12px", letterSpacing: "2px", color: "#f97316", fontWeight: 700 }}>GỢI Ý TRƯỜNG THEO ĐIỂM</div>
          </div>
          <div style={{ padding: "30px 36px" }}>
            <div style={{ fontSize: "22px", fontWeight: 800 }}>Phân tích điểm — {recommendedDate}</div>
            <div style={{ marginTop: "16px", fontSize: "14px", fontWeight: 800, marginBottom: "6px" }}>Điểm đã nhập</div>
            <div style={{ fontSize: "13px", color: "#334155" }}>
              {subjectEntries.map(([s, v]) => `${SUBJECT_VI[s] || s}: ${v}`).join("  ·  ")}
            </div>
            <div style={{ fontSize: "13px", color: "#334155", marginTop: "6px" }}>
              Tổng {topCombo?.combination}: <b>{topCombo?.totalScore}</b>
            </div>

            <div style={{ marginTop: "20px", fontSize: "14px", fontWeight: 800, marginBottom: "8px" }}>
              Trường phù hợp (điểm chuẩn {selectedYear})
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
              <thead>
                <tr style={{ color: "#94a3b8", textAlign: "left" }}>
                  <th style={{ padding: "6px 4px" }}>Trường / Ngành</th>
                  <th style={{ padding: "6px 4px" }}>Tổ hợp</th>
                  <th style={{ padding: "6px 4px" }}>Điểm chuẩn</th>
                </tr>
              </thead>
              <tbody>
                {matches.slice(0, 12).map((it, i) => (
                  <tr key={i} style={{ borderTop: "1px solid #e2e8f0" }}>
                    <td style={{ padding: "6px 4px" }}>
                      <b>{it.university?.name}</b> — {it.major?.name}
                    </td>
                    <td style={{ padding: "6px 4px" }}>{it.subjectCombination}</td>
                    <td style={{ padding: "6px 4px" }}>{benchmarkForYear(it)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ background: "#f8fafc", padding: "14px 36px", fontSize: "11px", color: "#94a3b8", borderTop: "1px solid #e2e8f0" }}>
            Tạo bởi caZup · cazup.io.vn
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecommendationDetailPage;
