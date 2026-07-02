import { useEffect, useState } from "react";
import { getMyHollandResults } from "../../services/hollandResult.service";
import { getMyMbtiResults } from "../../services/mbtiService";
import { getScoreAnalysisHistory } from "../../services/recommendService";
import { getPaymentHistory } from "../../services/paymentService";
import { mbtiMaps } from "../../utils/mbtiMap";
import {
  formatHollandCode,
  getPrimaryCareer,
  getStrengths,
  HOLLAND_META,
} from "../../utils/hollandCareerMap";
import { getNickname, getViName } from "../../utils/mbtiCareerMap";
import { motion } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";

// Gom các lượt nhập điểm theo NGÀY (nhiều tổ hợp cùng ngày -> 1 mục)
const groupAcademicByDay = (results) => {
  const groups = {};
  (results || []).forEach((r) => {
    const d = new Date(r.createdAt);
    const key = isNaN(d.getTime()) ? "unknown" : d.toISOString().slice(0, 10);
    if (!groups[key]) groups[key] = { key, date: d, items: [] };
    groups[key].items.push(r);
  });
  return Object.values(groups).sort((a, b) => b.date - a.date);
};

const scoreQuality = (s) =>
  s >= 27 ? "XUẤT SẮC" : s >= 24 ? "GIỎI" : s >= 21 ? "KHÁ" : "TRUNG BÌNH";

const typeLabelVi = (t) =>
  t === "Public"
    ? "Công lập"
    : t === "Private"
      ? "Dân lập"
      : t === "International"
        ? "Quốc tế"
        : t || "Tất cả";

const HistoryPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [hollandResults, setHollandResults] = useState([]);
  const [mbtiResults, setMbtiResults] = useState([]);
  const [hollandStability, setHollandStability] = useState(0);
  const [mbtiStability, setMbtiStability] = useState(0);
  const [academicResults, setAcademicResults] = useState([]);
  const [payments, setPayments] = useState([]);
  const activeTab = searchParams.get("tab") || "holland";
  const [hollandVisible, setHollandVisible] = useState(3);
  const [mbtiVisible, setMbtiVisible] = useState(4);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [hollandRes, mbtiRes, academicRes, paymentRes] =
          await Promise.all([
            getMyHollandResults().catch(() => ({ data: { data: [] } })),
            getMyMbtiResults().catch(() => ({ data: { data: [] } })),
            getScoreAnalysisHistory().catch(() => ({ data: { data: [] } })),
            getPaymentHistory().catch(() => ({ data: { data: [] } })),
          ]);

        setHollandResults(hollandRes.data?.data || hollandRes.data || []);
        setHollandStability(hollandRes.data?.stabilityScore || 0);
        setMbtiResults(mbtiRes.data?.data || mbtiRes.data || []);
        setMbtiStability(mbtiRes.data?.stabilityScore || 0);
        setAcademicResults(academicRes.data?.data || academicRes.data || []);
        setPayments(paymentRes.data?.data || paymentRes.data || []);
      } catch (err) {
        console.error("Error fetching history:", err);
      }
    };

    fetchData();
  }, []);

  const handleExportPDF = async () => {
    if (!payments || payments.length === 0) {
      alert("Không có dữ liệu thanh toán để xuất PDF.");
      return;
    }

    try {
      alert("Đã nhấn nút Xuất PDF. Đang tải thư viện...");

      // Dynamic imports to avoid initialization crashes and handle errors better
      const { jsPDF } = await import("jspdf");
      const autoTableModule = await import("jspdf-autotable");
      const autoTable = autoTableModule.default;

      const doc = new jsPDF();

      // Add Title
      doc.setFontSize(18);
      doc.text("LICH SU THANH TOAN", 14, 20);

      // Prepare Table Data
      const tableColumn = [
        "Ma giao dich",
        "Goi dich vu",
        "Ngay giao dich",
        "So tien",
        "Trang thai",
      ];

      const tableRows = payments.map((p) => [
        String(p.transactionCode || p.transactionId || `#${p._id?.slice(-5)}`),
        String(p.planType || p.planName || p.plan || "N/A"),
        p.createdAt && !isNaN(new Date(p.createdAt).getTime())
          ? new Date(p.createdAt).toLocaleDateString("vi-VN")
          : "N/A",
        String(`${p.amount?.toLocaleString() || 0}d`),
        p.status === "SUCCESS" || p.status === "completed"
          ? "Thanh cong"
          : p.status === "PENDING"
            ? "Dang cho"
            : "That bai",
      ]);

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 30,
        theme: "grid",
        headStyles: { fillColor: [79, 70, 229] },
        styles: { font: "helvetica", textColor: [0, 0, 0] },
      });

      doc.save("lich-su-thanh-toan.pdf");
      alert("Xuất PDF thành công!");
    } catch (error) {
      console.error("PDF Export Error:", error);
      alert(
        "Có lỗi xảy ra khi xuất PDF: " +
          (error.message || "Lỗi không xác định"),
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 px-6 pt-10 pb-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-7xl"
      >
        {/* Results Section */}
        <div className="mb-16">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-6">
            <div>
              <h2 className="text-3xl md:text-4xl font-black mb-2">
                {activeTab === "holland"
                  ? "Lịch sử Hướng nghiệp Holland"
                  : activeTab === "mbti"
                    ? "Lịch sử Tính cách MBTI"
                    : "Lịch sử Nhập điểm"}
              </h2>
              <p className="text-slate-500 text-sm max-w-xl">
                {activeTab === "holland"
                  ? "Theo dõi sự thay đổi sở thích nghề nghiệp của bạn. Kết quả RIASEC giúp caZup AI tinh chỉnh lộ trình học tập cho bạn."
                  : activeTab === "mbti"
                    ? "Xem lại các kiểu tính cách MBTI qua từng lần test và mức độ nhất quán của bạn."
                    : "Xem lại các lần nhập điểm trước đây và nhận các đề xuất cá nhân hóa dựa trên tổ hợp môn của bạn."}
              </p>
            </div>
            {activeTab === "academic" ? (
              <button
                onClick={() => navigate("/recommend")}
                className="w-full md:w-auto bg-orange-500 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-orange-600 transition shadow-lg shadow-orange-500/30"
              >
                <span className="text-xl">+</span> Nhập điểm mới
              </button>
            ) : (
              <button
                onClick={() =>
                  navigate(
                    activeTab === "mbti" ? "/tests/mbti" : "/tests/holland",
                  )
                }
                className="w-full md:w-auto bg-orange-500 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-orange-600 transition shadow-lg shadow-orange-500/30"
              >
                <span className="text-xl">+</span> Làm lại bài test
              </button>
            )}
          </div>

          <div className="flex overflow-x-auto space-x-6 border-b border-slate-200 mb-8 no-scrollbar">
            {["holland", "mbti", "academic"].map((tab) => (
              <button
                key={tab}
                onClick={() => setSearchParams({ tab })}
                className={`pb-4 font-bold capitalize transition-colors whitespace-nowrap ${
                  activeTab === tab
                    ? "text-orange-600 border-b-2 border-orange-600"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                {tab === "holland"
                  ? "Holland (Sở thích)"
                  : tab === "mbti"
                    ? "MBTI (Tính cách)"
                    : "Gợi ý điểm"}
              </button>
            ))}
          </div>

          {activeTab === "holland" &&
            (hollandResults.length > 0 ? (
              <div className="mb-4">
                {/* Latest attempt + Stability */}
                <div className="grid lg:grid-cols-3 gap-6 mb-10">
                  <div className="lg:col-span-2 relative overflow-hidden bg-white rounded-3xl border border-slate-100 shadow-sm p-7">
                    <div className="absolute -right-12 -top-12 w-64 h-64 rounded-full bg-gradient-to-br from-blue-100 to-teal-100 blur-2xl opacity-70" />
                    <div className="relative z-10 max-w-xl">
                      <span className="inline-block text-[10px] font-black tracking-wider uppercase text-orange-600 bg-orange-100 px-3 py-1 rounded-full mb-4">
                        Lần gần nhất
                      </span>
                      <h3 className="text-2xl md:text-3xl font-black text-slate-900 mb-1">
                        {formatHollandCode(hollandResults[0].topTypes)}
                      </h3>
                      <p className="text-sm text-slate-500 mb-5">
                        Hoàn thành ngày{" "}
                        {new Date(
                          hollandResults[0].createdAt,
                        ).toLocaleDateString("vi-VN", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                      <div className="flex flex-wrap gap-2 mb-6">
                        {getStrengths(hollandResults[0].topTypes).map((s) => (
                          <span
                            key={s}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-full"
                          >
                            <span className="text-blue-500">✦</span> {s}
                          </span>
                        ))}
                      </div>
                      <button
                        onClick={() =>
                          navigate(
                            `/result-detail/holland/${hollandResults[0]._id}`,
                            { state: { result: hollandResults[0] } },
                          )
                        }
                        className="inline-flex items-center gap-2 bg-slate-900 text-white px-5 py-3 rounded-xl font-bold text-sm hover:bg-slate-800 transition"
                      >
                        Xem phân tích chuyên sâu
                        <span className="text-base">→</span>
                      </button>
                    </div>
                  </div>

                  <div className="bg-slate-900 rounded-3xl p-7 text-white relative overflow-hidden">
                    <div className="absolute -right-10 -bottom-10 w-48 h-48 rounded-full bg-blue-500/20 blur-3xl" />
                    <div className="relative z-10">
                      <h3 className="text-lg font-black mb-1">
                        Độ ổn định sở thích
                      </h3>
                      <p className="text-xs text-slate-400 mb-5 leading-relaxed">
                        Mức nhất quán của sở thích nghề nghiệp qua các lần test.
                      </p>
                      <div className="text-6xl font-black mb-5">
                        {hollandStability}%
                      </div>
                      <div className="bg-white/10 rounded-xl p-4 text-xs leading-relaxed">
                        Nhóm{" "}
                        <span className="font-black text-blue-300">
                          {HOLLAND_META[hollandResults[0].mostFrequentTrait]
                            ?.short ||
                            hollandResults[0].mostFrequentTrait ||
                            "—"}
                        </span>{" "}
                        là sở thích chủ đạo trong{" "}
                        <span className="font-black">
                          {hollandResults[0].frequentCount || 1}/
                          {hollandResults.length}
                        </span>{" "}
                        lần test gần đây.
                      </div>
                    </div>
                  </div>
                </div>

                {/* Past attempts */}
                <h3 className="text-xl font-black mb-4">Các lần làm trước</h3>
                <div className="space-y-3">
                  {hollandResults.slice(0, hollandVisible).map((r) => (
                    <div
                      key={r._id}
                      className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 md:p-5 flex flex-col md:flex-row md:items-center gap-4 hover:shadow-md transition"
                    >
                      <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
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
                            d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[11px] font-bold text-slate-400 uppercase">
                          {new Date(r.createdAt).toLocaleDateString("vi-VN", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </div>
                        <div className="font-black text-slate-900">
                          {formatHollandCode(r.topTypes)}
                        </div>
                        {r.status && (
                          <span
                            className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              r.status === "Shift Detected"
                                ? "bg-orange-100 text-orange-600"
                                : "bg-teal-100 text-teal-600"
                            }`}
                          >
                            {r.status === "Shift Detected"
                              ? "Có thay đổi"
                              : "Ổn định"}
                          </span>
                        )}
                      </div>
                      <div className="md:text-right md:mr-2">
                        <div className="text-[10px] font-bold text-slate-400 uppercase">
                          Nghề gợi ý
                        </div>
                        <div className="font-bold text-slate-700 text-sm">
                          {getPrimaryCareer(r.topTypes)}
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          navigate(`/result-detail/holland/${r._id}`, {
                            state: { result: r },
                          })
                        }
                        className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-bold hover:bg-slate-50 transition whitespace-nowrap"
                      >
                        Xem chi tiết
                      </button>
                    </div>
                  ))}
                </div>

                {hollandResults.length > hollandVisible && (
                  <div className="text-center mt-6">
                    <button
                      onClick={() => setHollandVisible((v) => v + 5)}
                      className="text-blue-600 font-bold text-sm hover:underline"
                    >
                      Xem thêm kết quả cũ
                    </button>
                  </div>
                )}

                {/* Compare promo */}
                <div className="mt-10 bg-blue-50 border border-blue-100 rounded-3xl p-7 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="max-w-lg">
                    <h3 className="text-2xl font-black text-slate-900 mb-2">
                      So sánh mức độ phù hợp
                    </h3>
                    <p className="text-slate-600 text-sm mb-5">
                      Gói caZup Premium cho phép so sánh điểm sở thích của bạn với
                      sinh viên các trường top tại Việt Nam.
                    </p>
                    <button
                      onClick={() => navigate("/pricing")}
                      className="bg-orange-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-orange-600 transition shadow-lg shadow-orange-200"
                    >
                      Nâng cấp để so sánh
                    </button>
                  </div>
                  <div className="hidden md:block w-64 bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
                    <div className="text-xs font-bold text-slate-700 mb-3">
                      Benchmarking
                    </div>
                    {[
                      { c: "bg-orange-500", w: "w-full" },
                      { c: "bg-blue-900", w: "w-4/5" },
                      { c: "bg-teal-400", w: "w-11/12" },
                    ].map((b, i) => (
                      <div
                        key={i}
                        className="h-2.5 bg-slate-100 rounded-full mb-3 overflow-hidden"
                      >
                        <div className={`h-full ${b.c} ${b.w} rounded-full`} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-16 text-center">
                <p className="text-slate-500 font-medium mb-4">
                  Bạn chưa có kết quả trắc nghiệm Holland nào.
                </p>
                <button
                  onClick={() => navigate("/tests/holland")}
                  className="px-6 py-3 bg-blue-600 text-white rounded-full font-bold hover:bg-blue-700 transition"
                >
                  Làm bài test ngay
                </button>
              </div>
            ))}

          {activeTab === "mbti" &&
            (mbtiResults.length > 0 ? (
              <div className="mb-4">
                {/* Latest insight + Progress tracker */}
                <div className="grid lg:grid-cols-3 gap-6 mb-10">
                  <div className="lg:col-span-2 bg-slate-900 rounded-3xl p-7 text-white relative overflow-hidden">
                    <div className="absolute -right-16 -top-16 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl" />
                    <div className="relative z-10 max-w-xl">
                      <span className="inline-block text-[10px] font-black tracking-wider uppercase text-emerald-400 mb-3">
                        Insight mới nhất
                      </span>
                      <h3 className="text-2xl md:text-3xl font-black mb-3">
                        {mbtiStability >= 60
                          ? "Sự nhất quán là thế mạnh của bạn."
                          : "Bạn đang khám phá bản thân."}
                      </h3>
                      <p className="text-sm text-slate-300 leading-relaxed mb-6">
                        Trong {mbtiResults.length} lần test gần đây, nhóm{" "}
                        <span className="font-black text-white">
                          {getViName(mbtiResults[0].mostFrequentTrait) ||
                            mbtiResults[0].mostFrequentTrait}
                        </span>{" "}
                        xuất hiện{" "}
                        <span className="font-black text-white">
                          {mbtiResults[0].frequentCount || 1}/
                          {mbtiResults.length}
                        </span>{" "}
                        lần (độ ổn định {mbtiStability}%) — cho thấy bạn ngày càng
                        hiểu rõ bản thân.
                      </p>
                      <div className="flex items-center gap-3">
                        <div className="flex">
                          {(mbtiResults[0].mbtiType || "")
                            .split("")
                            .map((ltr, i) => (
                              <div
                                key={i}
                                className={`w-9 h-9 -ml-2 first:ml-0 rounded-full flex items-center justify-center text-xs font-black border-2 border-slate-900 ${
                                  [
                                    "bg-blue-500",
                                    "bg-orange-500",
                                    "bg-emerald-500",
                                    "bg-slate-500",
                                  ][i] || "bg-slate-500"
                                }`}
                              >
                                {ltr}
                              </div>
                            ))}
                        </div>
                        <span className="text-sm text-slate-400 font-medium">
                          Kiểu mới nhất:{" "}
                          <b className="text-white">{mbtiResults[0].mbtiType}</b>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 rounded-3xl p-7 border border-blue-100">
                    <h3 className="text-lg font-black mb-1">Tiến trình</h3>
                    <p className="text-sm text-slate-500 mb-6">
                      Bạn đã hoàn thành {mbtiResults.length} lần đánh giá.
                    </p>
                    <div className="flex items-end gap-3 h-32">
                      {[...mbtiResults]
                        .slice(0, 5)
                        .reverse()
                        .map((_, i, arr) => (
                          <div
                            key={i}
                            className={`flex-1 rounded-t-lg ${
                              i === arr.length - 1
                                ? "bg-orange-500"
                                : "bg-slate-300"
                            }`}
                            style={{
                              height: `${45 + (i / Math.max(arr.length - 1, 1)) * 55}%`,
                            }}
                          />
                        ))}
                    </div>
                  </div>
                </div>

                {/* All results */}
                <h3 className="text-xl font-black mb-4">Tất cả kết quả</h3>
                <div className="space-y-3">
                  {mbtiResults.slice(0, mbtiVisible).map((r, idx) => (
                    <div
                      key={r._id}
                      className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 md:p-5 flex flex-col md:flex-row md:items-center gap-4 hover:shadow-md transition"
                    >
                      <div
                        className={`w-16 h-16 rounded-xl flex flex-col items-center justify-center flex-shrink-0 ${
                          idx === 0
                            ? "bg-slate-900 text-white"
                            : "bg-blue-50 text-slate-700"
                        }`}
                      >
                        <span className="font-black text-sm">{r.mbtiType}</span>
                        <span className="text-[8px] font-bold uppercase opacity-70 leading-none mt-0.5">
                          {getNickname(r.mbtiType)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-[11px] font-bold text-slate-400 uppercase">
                            {new Date(r.createdAt).toLocaleDateString("vi-VN", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })}
                          </span>
                          {idx === 0 && (
                            <span className="text-[9px] font-black uppercase text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
                              Mới nhất
                            </span>
                          )}
                          {r.status === "Shift Detected" && idx !== 0 && (
                            <span className="text-[9px] font-black uppercase text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full">
                              Có thay đổi
                            </span>
                          )}
                        </div>
                        <h4 className="font-black text-slate-900">
                          {getViName(r.mbtiType)}
                        </h4>
                        <p className="text-sm text-slate-500 line-clamp-2">
                          {mbtiMaps[r.mbtiType]?.desc}
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          navigate(`/result-detail/mbti/${r._id}`, {
                            state: { result: r },
                          })
                        }
                        className="text-slate-900 text-sm font-bold hover:underline flex items-center gap-1 whitespace-nowrap"
                      >
                        Xem chi tiết →
                      </button>
                    </div>
                  ))}
                </div>

                {mbtiResults.length > mbtiVisible && (
                  <div className="text-center mt-6">
                    <button
                      onClick={() => setMbtiVisible((v) => v + 5)}
                      className="text-blue-600 font-bold text-sm hover:underline"
                    >
                      Xem thêm kết quả cũ
                    </button>
                  </div>
                )}

                {/* Deeper analysis promo */}
                <div className="mt-10 bg-blue-50 border border-blue-100 rounded-3xl p-7 md:p-8 flex flex-col md:flex-row items-center gap-8">
                  <div className="flex-1">
                    <h3 className="text-2xl font-black text-slate-900 mb-2">
                      Muốn phân tích sâu hơn?
                    </h3>
                    <p className="text-slate-600 text-sm mb-5">
                      caZup AI Mentor có thể đối chiếu lịch sử test của bạn với
                      yêu cầu của từng trường để tìm ngành học phù hợp nhất.
                    </p>
                    <button
                      onClick={() => navigate("/mentor")}
                      className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 transition"
                    >
                      Trò chuyện với AI Mentor
                    </button>
                  </div>
                  <div className="w-full md:w-72 h-44 rounded-2xl overflow-hidden flex-shrink-0">
                    <img
                      src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=70"
                      alt="AI Mentor"
                      className="w-full h-full object-cover"
                      onError={(e) => (e.target.style.display = "none")}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-16 text-center">
                <p className="text-slate-500 font-medium mb-4">
                  Bạn chưa có kết quả trắc nghiệm MBTI nào.
                </p>
                <button
                  onClick={() => navigate("/tests/mbti")}
                  className="px-6 py-3 bg-blue-600 text-white rounded-full font-bold hover:bg-blue-700 transition"
                >
                  Làm bài test ngay
                </button>
              </div>
            ))}

          {activeTab === "academic" &&
            (academicResults.length > 0 ? (
              <div className="space-y-8">
                {groupAcademicByDay(academicResults).map((group) => (
                  <div key={group.key}>
                    {/* Date header — gom mọi lượt nhập trong cùng ngày */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
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
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                      <div>
                        <div className="font-black text-slate-900">
                          {group.date.toLocaleDateString("vi-VN", {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </div>
                        <div className="text-xs text-slate-400">
                          {group.items.length} lượt nhập điểm
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm divide-y divide-slate-50 overflow-hidden">
                      {group.items.map((r) => {
                        const combo = r.topCombinations?.[0];
                        const sc = combo?.totalScore || 0;
                        return (
                          <div
                            key={r._id}
                            className="p-4 md:p-5 flex flex-col md:flex-row md:items-center gap-4 hover:bg-slate-50/50 transition"
                          >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <div className="w-11 h-11 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center flex-shrink-0">
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
                                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                                  />
                                </svg>
                              </div>
                              <div>
                                <div className="font-black text-slate-900">
                                  {combo?.combination || "—"}: {sc}
                                </div>
                                <div className="text-[10px] font-black text-slate-400 uppercase">
                                  {scoreQuality(sc)}
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-2">
                              <span className="text-[11px] font-medium text-slate-500 bg-slate-100 rounded-md px-2 py-1">
                                📍 {r.filters?.location || "Toàn quốc"}
                              </span>
                              <span className="text-[11px] font-medium text-slate-500 bg-slate-100 rounded-md px-2 py-1">
                                🏫 {typeLabelVi(r.filters?.type)}
                              </span>
                              <span className="text-[11px] font-medium text-slate-500 bg-slate-100 rounded-md px-2 py-1">
                                💳{" "}
                                {r.filters?.maxTuition
                                  ? `≤ ${(r.filters.maxTuition / 1000000).toFixed(0)}M`
                                  : "Không giới hạn"}
                              </span>
                            </div>

                            <span
                              className={`px-3 py-1 rounded-full text-[10px] font-bold whitespace-nowrap ${r.isNew ? "bg-orange-50 text-orange-600" : "bg-blue-50 text-blue-600"}`}
                            >
                              {r.isNew ? "● Có đề xuất mới" : "● Đã xem"}
                            </span>

                            <button
                              onClick={() =>
                                navigate(`/recommendation-detail/${r._id}`)
                              }
                              className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 transition whitespace-nowrap"
                            >
                              Xem lại gợi ý
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {/* Tip card */}
                <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 md:p-7 flex items-start gap-5">
                  <div className="w-14 h-14 rounded-full bg-white shadow-sm flex items-center justify-center text-2xl flex-shrink-0">
                    💡
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 mb-1">
                      Mẹo chọn trường thông minh
                    </h3>
                    <p className="text-sm text-slate-500 leading-relaxed mb-2">
                      Bạn có thể nhập nhiều tổ hợp điểm khác nhau để so sánh tỉ lệ
                      trúng tuyển giữa các khối thi. caZup sẽ tự động phân tích và
                      đưa ra lộ trình tối ưu nhất.
                    </p>
                    <button
                      onClick={() => navigate("/recommend")}
                      className="text-blue-600 text-sm font-bold hover:underline"
                    >
                      Nhập điểm & xem gợi ý ngay
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-16 text-center">
                <p className="text-slate-500 font-medium mb-4">
                  Chưa có lịch sử nhập điểm.
                </p>
                <button
                  onClick={() => navigate("/recommend")}
                  className="px-6 py-3 bg-orange-500 text-white rounded-full font-bold hover:bg-orange-600 transition"
                >
                  Nhập điểm ngay
                </button>
              </div>
            ))}
        </div>

        {/* Payment History */}
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-xl font-black">Lịch sử thanh toán</h3>
              <p className="text-slate-500 text-sm">
                Quản lý các giao dịch và hóa đơn của bạn.
              </p>
            </div>
            <button
              onClick={handleExportPDF}
              className="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-blue-100 transition shadow-sm"
            >
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
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              Xuất PDF
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-slate-400 border-b">
                  <th className="pb-4 font-medium">Mã giao dịch</th>
                  <th className="pb-4 font-medium">Gói dịch vụ</th>
                  <th className="pb-4 font-medium">Ngày giao dịch</th>
                  <th className="pb-4 font-medium">Số tiền</th>
                  <th className="pb-4 font-medium">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="text-slate-700">
                {payments.length > 0 ? (
                  payments.map((p, i) => (
                    <tr key={p._id || i} className="border-b last:border-0">
                      <td className="py-4 font-medium">
                        {p.transactionCode ||
                          p.transactionId ||
                          `#${p._id?.slice(-5)}`}
                      </td>
                      <td className="py-4 font-bold">
                        {p.planType || p.planName || p.plan || "N/A"}
                      </td>
                      <td className="py-4">
                        {p.createdAt && !isNaN(new Date(p.createdAt).getTime())
                          ? new Date(p.createdAt).toLocaleDateString("vi-VN")
                          : "N/A"}
                      </td>
                      <td className="py-4">{p.amount?.toLocaleString()}đ</td>
                      <td className="py-4">
                        <span
                          className={`px-2 py-1 rounded-lg text-[10px] font-bold ${
                            p.status === "SUCCESS" || p.status === "completed"
                              ? "bg-green-50 text-green-600"
                              : p.status === "PENDING"
                                ? "bg-yellow-50 text-yellow-600"
                                : "bg-red-50 text-red-600"
                          }`}
                        >
                          {p.status === "SUCCESS" || p.status === "completed"
                            ? "Thành công"
                            : p.status === "PENDING"
                              ? "Đang chờ"
                              : p.status === "FAILED"
                                ? "Thất bại"
                                : p.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="5"
                      className="py-8 text-center text-slate-400 italic"
                    >
                      Không có lịch sử giao dịch.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default HistoryPage;
