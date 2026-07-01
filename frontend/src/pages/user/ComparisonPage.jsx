import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  getAllUniversityMajors,
  analyzeComparison,
} from "../../services/universityService";
import { getUser } from "../../utils/auth";
import UpgradePrompt from "../../components/UpgradePrompt";

/* Logo trường trong vòng tròn, tự fallback về chữ cái đầu nếu ảnh lỗi */
const SchoolLogo = ({ src, name, size = "w-16 h-16" }) => {
  const [err, setErr] = useState(false);
  return (
    <div
      className={`${size} mx-auto rounded-full bg-white ring-2 ring-slate-100 shadow-sm flex items-center justify-center overflow-hidden`}
    >
      {src && !err ? (
        <img
          src={src}
          alt={name}
          onError={() => setErr(true)}
          className="w-full h-full object-contain p-1.5"
        />
      ) : (
        <span className="text-slate-500 font-black text-xl">
          {name?.charAt(0) || "?"}
        </span>
      )}
    </div>
  );
};

/* Học phí năm gần nhất (2025) -> hiển thị 1 con số VNĐ/năm, không bịa range */
const getAnnualTuition = (item) => {
  let fee = item?.tuitionFee;
  if (!fee && item?.admissionHistory?.length) {
    const sorted = [...item.admissionHistory]
      .filter((h) => h.tuitionFee)
      .sort((a, b) => b.year - a.year);
    fee = sorted[0]?.tuitionFee;
  }
  return fee || null;
};
const fmtTuition = (item) => {
  const fee = getAnnualTuition(item);
  if (!fee) return "N/A";
  const m = fee / 1000000;
  const s = Number.isInteger(m) ? `${m}` : m.toFixed(1);
  return `${s} triệu VNĐ/năm`;
};

const YEARS = [2025, 2024, 2023];
const getScoreForYear = (item, year) => {
  const h = item.admissionHistory?.find((x) => x.year === year);
  const score = h ? h.admissionScore : year === 2025 ? item.admissionScore : null;
  if (score == null) return "N/A";
  return typeof score === "number" ? score.toFixed(2) : score;
};

const ComparisonPage = () => {
  const user = getUser();
  const userId = user?._id || user?.id;
  const storageKey = userId
    ? `comparison_selected_majors_${userId}`
    : "comparison_selected_majors";

  const [allMajors, setAllMajors] = useState([]);
  const [selectedMajors, setSelectedMajors] = useState(() => {
    const saved = localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : [];
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);

  // AI analysis state
  const [analysis, setAnalysis] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState("");

  const tableRef = useRef(null);
  const analysisRef = useRef(null);

  const plan = user?.subscriptionPlan || "FREE";
  const maxComparisons = plan === "PREMIUM" ? 999 : plan === "PAID" ? 5 : 2;

  useEffect(() => {
    (async () => {
      try {
        const res = await getAllUniversityMajors();
        setAllMajors(res.data || []);
      } catch (err) {
        console.error(err);
      }
    })();
  }, []);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(selectedMajors));
  }, [selectedMajors, storageKey]);

  const filteredMajors = allMajors.filter(
    (item) =>
      (item.major?.name + item.university?.name)
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) &&
      !selectedMajors.find((selected) => selected._id === item._id),
  );

  const handleSelect = (item) => {
    if (selectedMajors.length >= maxComparisons) {
      setShowUpgradePrompt(true);
      return;
    }
    setSelectedMajors([...selectedMajors, item]);
    setSearchTerm("");
  };

  const handleRemove = (id) => {
    setSelectedMajors(selectedMajors.filter((item) => item._id !== id));
    setAnalysis("");
  };

  const handleShare = async () => {
    if (selectedMajors.length === 0) {
      alert("Vui lòng chọn ít nhất một trường để chia sẻ.");
      return;
    }
    try {
      const ids = selectedMajors.map((item) => item._id).join(",");
      const shareUrl = `${window.location.origin}/share-comparison?ids=${ids}`;
      await navigator.clipboard.writeText(shareUrl);
      alert("Đã sao chép liên kết chia sẻ công khai!");
    } catch {
      alert("Không thể sao chép liên kết.");
    }
  };

  const handleExportPdf = () => {
    if (selectedMajors.length === 0) {
      alert("Vui lòng chọn ít nhất một trường để xuất PDF.");
      return;
    }
    window.print();
  };

  const handleAnalyze = async () => {
    if (selectedMajors.length < 2) {
      setAnalyzeError("Vui lòng chọn ít nhất 2 lựa chọn để AI phân tích và so sánh.");
      return;
    }
    setAnalyzing(true);
    setAnalyzeError("");
    setAnalysis("");
    try {
      const data = await analyzeComparison(selectedMajors);
      setAnalysis(data.analysis || "");
      setTimeout(
        () => analysisRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
        100,
      );
    } catch (err) {
      setAnalyzeError(
        err?.response?.data?.message ||
          "Không thể tạo phân tích AI. Vui lòng đăng nhập và thử lại.",
      );
    } finally {
      setAnalyzing(false);
    }
  };

  if (showUpgradePrompt) {
    return (
      <UpgradePrompt
        feature="So sánh nhiều trường"
        requiredPlan={plan === "FREE" ? ["PAID", "PREMIUM"] : ["PREMIUM"]}
        currentPlan={plan}
        onBack={() => setShowUpgradePrompt(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA] pt-20 pb-20 print:pt-6 print:bg-white">
      <div className="mx-auto max-w-7xl px-6">
        {/* Header */}
        <div className="mb-6 flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900">So sánh trường học</h1>
            <p className="text-sm text-slate-500 mt-1">
              Tìm kiếm và so sánh chi tiết các tiêu chí của tối đa {maxComparisons > 5 ? "nhiều" : maxComparisons} trường đại học.
            </p>
          </div>
          <div className="flex items-center gap-3 print:hidden">
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-700 font-bold hover:bg-slate-50 transition text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              Chia sẻ
            </button>
            <button
              onClick={handleExportPdf}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-700 font-bold hover:bg-slate-50 transition text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Xuất PDF
            </button>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-3 flex items-start gap-3 mb-8 print:hidden">
          <svg className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-xs text-amber-700 leading-relaxed">
            <span className="font-bold">Lưu ý:</span> Dữ liệu so sánh được tổng hợp từ nhiều nguồn tham khảo và chỉ mang tính chất gợi ý. Học phí, chỉ tiêu và điểm chuẩn có thể thay đổi theo từng năm. Vui lòng kiểm tra trực tiếp với nhà trường hoặc Bộ Giáo dục để có thông tin chính xác nhất.
          </p>
        </div>

        {/* School selection cards */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4 print:hidden">
          {selectedMajors.map((item, index) => (
            <div
              key={item._id}
              className="bg-white border-2 border-slate-200 rounded-2xl p-4 flex items-center gap-3 relative"
            >
              <SchoolLogo src={item.university?.image} name={item.university?.name} size="w-12 h-12" />
              <div className="min-w-0">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">
                  Trường {index + 1}
                </p>
                <p className="text-sm font-bold text-slate-900 truncate">
                  {item.university?.name}
                </p>
                <p className="text-[11px] text-slate-500 truncate">{item.major?.name}</p>
              </div>
              <button
                onClick={() => handleRemove(item._id)}
                className="absolute top-3 right-3 text-slate-400 hover:text-red-500 transition"
              >
                ✕
              </button>
            </div>
          ))}

          {selectedMajors.length < maxComparisons && (
            <div className="bg-slate-50 rounded-2xl border-2 border-dashed border-slate-300 flex items-center justify-center min-h-[76px] text-slate-500 font-semibold text-sm gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Thêm trường so sánh
            </div>
          )}
        </div>

        {/* Search */}
        <div className="relative mb-10 print:hidden">
          <input
            type="text"
            placeholder="Tìm kiếm ngành hoặc trường để thêm vào so sánh..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 shadow-sm transition text-sm"
          />
          {searchTerm && filteredMajors.length > 0 && (
            <div className="absolute top-full left-0 w-full mt-2 bg-white border border-slate-200 rounded-xl overflow-hidden z-50 shadow-xl">
              {filteredMajors.slice(0, 6).map((item) => (
                <div
                  key={item._id}
                  onClick={() => handleSelect(item)}
                  className="p-3 hover:bg-emerald-50 cursor-pointer border-b border-slate-100 last:border-0 flex items-center gap-3"
                >
                  <SchoolLogo src={item.university?.image} name={item.university?.name} size="w-8 h-8" />
                  <div>
                    <div className="font-bold text-slate-900 text-sm">{item.major?.name}</div>
                    <div className="text-xs text-slate-500">{item.university?.name}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Comparison table */}
        {selectedMajors.length > 0 ? (
          <div ref={tableRef} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Mobile: stacked cards */}
            <div className="md:hidden p-4 space-y-6">
              {selectedMajors.map((item) => (
                <div key={item._id} className="border border-slate-200 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-4 border-b pb-3">
                    <SchoolLogo src={item.university?.image} name={item.university?.name} size="w-12 h-12" />
                    <div>
                      <div className="font-black text-slate-900 text-sm">{item.university?.name}</div>
                      <div className="text-xs font-bold text-emerald-600">{item.major?.name}</div>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between gap-3">
                      <span className="font-bold text-slate-500">Học phí</span>
                      <span className="text-right font-bold text-slate-900">{fmtTuition(item)}</span>
                    </div>
                    <div className="flex justify-between gap-3">
                      <span className="font-bold text-slate-500">Điểm chuẩn 2025</span>
                      <span>{getScoreForYear(item, 2025)}</span>
                    </div>
                    <div className="flex justify-between gap-3">
                      <span className="font-bold text-slate-500">Địa chỉ</span>
                      <span className="text-right text-xs">{item.university?.address || "N/A"}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop: table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full table-auto min-w-[900px]">
                <tbody>
                  {/* Header with logos */}
                  <tr className="border-b border-slate-100 bg-slate-50/60">
                    <td className="p-5 w-56 sticky left-0 bg-slate-50/60 z-10">
                      <p className="text-sm font-black text-slate-900">Tiêu chí</p>
                    </td>
                    {selectedMajors.map((item) => (
                      <td key={item._id} className="p-5 border-l border-slate-100 min-w-[240px] text-center">
                        <SchoolLogo src={item.university?.image} name={item.university?.name} />
                        <p className="text-sm font-black text-slate-900 leading-tight mt-2 break-words">
                          {item.university?.name}
                        </p>
                        <p className="text-xs font-bold text-emerald-600 leading-tight break-words mt-0.5">
                          {item.major?.name}
                        </p>
                      </td>
                    ))}
                  </tr>

                  {/* Website */}
                  <Row icon="🌐" iconBg="bg-blue-100 text-blue-600" label="Website" items={selectedMajors}>
                    {(item) =>
                      item.university?.website ? (
                        <a
                          href={item.university.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-emerald-600 font-semibold hover:underline"
                        >
                          {item.university.website?.split("//")[1]?.split("/")[0] || "Link"}
                        </a>
                      ) : (
                        <span className="text-xs text-slate-400">N/A</span>
                      )
                    }
                  </Row>

                  {/* Địa chỉ */}
                  <Row icon="📍" iconBg="bg-orange-100 text-orange-600" label="Địa chỉ" items={selectedMajors}>
                    {(item) => (
                      <p className="text-xs text-slate-600 px-2 break-words">
                        {item.university?.address || "N/A"}
                      </p>
                    )}
                  </Row>

                  {/* Học phí trung bình */}
                  <Row icon="💳" iconBg="bg-teal-100 text-teal-600" label="Học phí trung bình" items={selectedMajors}>
                    {(item) => (
                      <>
                        <p className="text-sm font-black text-slate-900">{fmtTuition(item)}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Chương trình chuẩn</p>
                      </>
                    )}
                  </Row>

                  {/* Điểm chuẩn (3 năm) */}
                  <Row icon="📊" iconBg="bg-indigo-100 text-indigo-600" label="Điểm chuẩn (3 năm)" items={selectedMajors}>
                    {(item) => (
                      <div className="grid grid-cols-3 gap-2">
                        {YEARS.map((year) => (
                          <div key={year}>
                            <p className="text-[10px] text-slate-400 font-bold">{year}</p>
                            <p className="text-sm font-bold text-slate-900">{getScoreForYear(item, year)}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </Row>

                  {/* Cơ sở vật chất */}
                  <Row icon="🏢" iconBg="bg-purple-100 text-purple-600" label="Cơ sở vật chất" items={selectedMajors}>
                    {(item) =>
                      item.university?.facilities?.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5 justify-center">
                          {item.university.facilities.map((f, idx) => (
                            <span
                              key={idx}
                              className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-full"
                            >
                              {f}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">N/A</span>
                      )
                    }
                  </Row>

                  {/* Review học sinh */}
                  <Row icon="⭐" iconBg="bg-yellow-100 text-yellow-600" label="Review học sinh" items={selectedMajors} last>
                    {(item) => (
                      <div>
                        <div className="flex justify-center gap-0.5 mb-1">
                          {[...Array(5)].map((_, i) => (
                            <span
                              key={i}
                              className={
                                i < Math.round(item.university?.rating || 0)
                                  ? "text-yellow-400"
                                  : "text-slate-300"
                              }
                            >
                              ★
                            </span>
                          ))}
                        </div>
                        <p className="text-[11px] text-slate-600 font-semibold">
                          {item.university?.rating
                            ? `${item.university.rating} • ${item.university.reviewCount || 0} đánh giá`
                            : "Chưa có đánh giá"}
                        </p>
                      </div>
                    )}
                  </Row>
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center text-slate-500 print:hidden">
            Chọn ít nhất một ngành/trường ở ô tìm kiếm phía trên để bắt đầu so sánh.
          </div>
        )}

        {/* AI Mentor CTA */}
        <div className="mt-10 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col md:flex-row md:items-center justify-between gap-5 print:hidden">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-white flex-shrink-0">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">Cần thêm lời khuyên từ AI Mentor?</h3>
              <p className="text-sm text-slate-500 mt-0.5">
                Dựa trên kết quả so sánh, AI có thể phân tích trường nào phù hợp nhất với năng lực và sở thích của bạn.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <button
              onClick={handleAnalyze}
              disabled={analyzing}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white font-bold rounded-xl text-sm transition flex items-center gap-2"
            >
              {analyzing && (
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              )}
              {analyzing ? "Đang phân tích..." : "Bắt đầu phân tích"}
            </button>
            <Link
              to="/mentor"
              className="px-5 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-sm transition"
            >
              Xem lộ trình học tập
            </Link>
          </div>
        </div>

        {analyzeError && (
          <p className="mt-4 text-sm text-red-500 font-medium print:hidden">{analyzeError}</p>
        )}

        {/* AI analysis result */}
        {analysis && (
          <div ref={analysisRef} className="mt-6 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">🤖</span>
              <h3 className="text-base font-black text-slate-900">Phân tích từ AI Mentor</h3>
            </div>
            <div className="prose prose-sm max-w-none text-slate-700 whitespace-pre-line leading-relaxed">
              {analysis}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/* Hàng tiêu chí dùng chung cho bảng desktop */
const Row = ({ icon, iconBg, label, items, children, last }) => (
  <tr className={`${last ? "" : "border-b border-slate-100"} hover:bg-slate-50/60`}>
    <td className="p-5 bg-white sticky left-0 z-10">
      <div className="flex items-center gap-2.5">
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs ${iconBg}`}>
          {icon}
        </div>
        <span className="text-sm font-bold text-slate-900">{label}</span>
      </div>
    </td>
    {items.map((item) => (
      <td key={item._id} className="p-5 border-l border-slate-100 text-center align-middle">
        {children(item)}
      </td>
    ))}
  </tr>
);

export default ComparisonPage;
