import { useEffect, useState } from "react";
import { getMyHollandResults } from "../../services/hollandResult.service";
import { getMyMbtiResults } from "../../services/mbtiService";
import { getScoreAnalysisHistory } from "../../services/recommendService";
import { getPaymentHistory } from "../../services/paymentService";
import { hollandMaps } from "../../utils/hollandMap";
import { mbtiMaps } from "../../utils/mbtiMap";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

const HistoryPage = () => {
  const navigate = useNavigate();
  const [hollandResults, setHollandResults] = useState([]);
  const [mbtiResults, setMbtiResults] = useState([]);
  const [hollandStability, setHollandStability] = useState(0);
  const [mbtiStability, setMbtiStability] = useState(0);
  const [academicResults, setAcademicResults] = useState([]);
  const [payments, setPayments] = useState([]);
  const [activeTab, setActiveTab] = useState("holland");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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
              <h2 className="text-xl font-black mb-2">
                {activeTab === "academic"
                  ? "Lịch sử Nhập điểm"
                  : "Lịch sử kết quả"}
              </h2>
              {activeTab === "academic" && (
                <p className="text-slate-500 text-sm max-w-md">
                  Xem lại các lần nhập điểm trước đây và nhận các đề xuất cá
                  nhân hóa dựa trên tổ hợp môn của bạn.
                </p>
              )}
            </div>
            {activeTab === "academic" && (
              <button
                onClick={() => navigate("/recommend")}
                className="w-full md:w-auto bg-orange-500 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-orange-600 transition shadow-lg shadow-orange-500/30"
              >
                <span className="text-xl">+</span> Nhập điểm mới
              </button>
            )}
          </div>

          <div className="flex overflow-x-auto space-x-6 border-b border-slate-200 mb-8 no-scrollbar">
            {["holland", "mbti", "academic"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
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

          {activeTab === "holland" && hollandResults.length > 0 && (
            <div className="mb-8 p-6 bg-blue-600 rounded-3xl text-white shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
              <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                <div>
                  <h3 className="text-lg font-bold opacity-80 mb-1">
                    Độ ổn định nghề nghiệp
                  </h3>
                  <div className="text-5xl font-black">{hollandStability}%</div>
                </div>
                <div className="flex-1 max-w-md">
                  <p className="text-sm opacity-90 leading-relaxed">
                    Dựa trên {hollandResults.length} lần test, nhóm mã phổ biến
                    nhất của bạn là{" "}
                    <span className="font-black underline">
                      {hollandResults[0]?.mostFrequentTrait}
                    </span>
                    . Độ ổn định cao giúp bạn tự tin hơn trong việc chọn ngành
                    học.
                  </p>
                </div>
                <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-md">
                  <div className="text-xs font-bold uppercase opacity-70 mb-1 text-center">
                    Xu hướng
                  </div>
                  <div className="text-xl font-black text-center">
                    {hollandStability > 70
                      ? "Rất ổn định"
                      : hollandStability > 40
                        ? "Đang định hình"
                        : "Cần khám phá thêm"}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "mbti" && mbtiResults.length > 0 && (
            <div className="mb-8 p-6 bg-indigo-600 rounded-3xl text-white shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
              <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                <div>
                  <h3 className="text-lg font-bold opacity-80 mb-1">
                    Độ ổn định tính cách
                  </h3>
                  <div className="text-5xl font-black">{mbtiStability}%</div>
                </div>
                <div className="flex-1 max-w-md">
                  <p className="text-sm opacity-90 leading-relaxed">
                    Tính cách của bạn có xu hướng ổn định ở kiểu{" "}
                    <span className="font-black underline">
                      {mbtiResults[0]?.mostFrequentTrait}
                    </span>
                    . Sự nhất quán trong kết quả phản ánh sự thấu hiểu bản thân
                    sâu sắc.
                  </p>
                </div>
                <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-md">
                  <div className="text-xs font-bold uppercase opacity-70 mb-1 text-center">
                    Trạng thái
                  </div>
                  <div className="text-xl font-black text-center">
                    {mbtiStability > 70
                      ? "Nhất quán"
                      : mbtiStability > 40
                        ? "Linh hoạt"
                        : "Đang thay đổi"}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeTab === "holland" &&
              hollandResults.map((r) => (
                <div
                  key={r._id}
                  className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex flex-col gap-2">
                      <span className="px-3 py-1 bg-teal-50 text-teal-600 text-xs font-bold rounded-full w-fit">
                        {hollandMaps[r.hollandType]?.name || r.hollandType}
                      </span>
                      {r.status && (
                        <span
                          className={`text-[10px] font-black uppercase tracking-wider ${r.status === "Shift Detected" ? "text-orange-500" : "text-slate-400"}`}
                        >
                          {r.status === "Shift Detected"
                            ? "⚠ Có sự thay đổi"
                            : "✓ Ổn định"}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-400">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="font-bold text-lg mb-2">
                    Kiểu {r.hollandType}
                  </h3>
                  <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                    {hollandMaps[r.hollandType]?.desc ||
                      "Không có mô tả chi tiết."}
                  </p>
                  <button
                    onClick={() => navigate(`/result-detail/holland/${r._id}`)}
                    className="text-blue-600 text-sm font-bold hover:underline"
                  >
                    Chi tiết →
                  </button>
                </div>
              ))}

            {activeTab === "mbti" &&
              mbtiResults.map((r) => (
                <div
                  key={r._id}
                  className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex flex-col gap-2">
                      <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-full w-fit">
                        {mbtiMaps[r.mbtiType]?.name || r.mbtiType}
                      </span>
                      {r.status && (
                        <span
                          className={`text-[10px] font-black uppercase tracking-wider ${r.status === "Shift Detected" ? "text-orange-500" : "text-slate-400"}`}
                        >
                          {r.status === "Shift Detected"
                            ? "⚠ Có sự thay đổi"
                            : "✓ Ổn định"}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-400">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="font-bold text-lg mb-2">Kiểu {r.mbtiType}</h3>
                  <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                    {mbtiMaps[r.mbtiType]?.desc || "Không có mô tả chi tiết."}
                  </p>
                  <button
                    onClick={() => navigate(`/result-detail/mbti/${r._id}`)}
                    className="text-blue-600 text-sm font-bold hover:underline"
                  >
                    Chi tiết →
                  </button>
                </div>
              ))}

            {activeTab === "academic" && (
              <div className="col-span-full bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-slate-400 text-xs font-bold uppercase tracking-wider border-b border-slate-100">
                        <th className="px-8 py-6 font-medium">
                          Tổ hợp môn & Điểm
                        </th>
                        <th className="px-8 py-6 font-medium">
                          Ngày thực hiện
                        </th>
                        <th className="px-8 py-6 font-medium">Trạng thái</th>
                        <th className="px-8 py-6 font-medium text-right">
                          Thao tác
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {academicResults
                        .slice(
                          (currentPage - 1) * itemsPerPage,
                          currentPage * itemsPerPage,
                        )
                        .map((r) => (
                          <tr
                            key={r._id}
                            className="group hover:bg-slate-50 transition-colors"
                          >
                            <td className="px-8 py-6">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center">
                                  <svg
                                    className="w-5 h-5 text-teal-600"
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
                                    {r.topCombinations?.[0]?.combination}:{" "}
                                    {r.topCombinations?.[0]?.totalScore}
                                  </div>
                                  <div className="text-[10px] font-black text-slate-400 uppercase">
                                    {r.topCombinations?.[0]?.totalScore >= 27
                                      ? "XUẤT SẮC"
                                      : r.topCombinations?.[0]?.totalScore >= 24
                                        ? "GIỎI"
                                        : "KHÁ"}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-8 py-6 text-slate-600 font-medium">
                              <div className="flex items-center gap-2">
                                <svg
                                  className="w-4 h-4 text-slate-400"
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
                                {new Date(r.createdAt).toLocaleDateString(
                                  "vi-VN",
                                  {
                                    day: "2-digit",
                                    month: "long",
                                    year: "numeric",
                                  },
                                )}
                              </div>
                            </td>
                            <td className="px-8 py-6">
                              <span
                                className={`px-3 py-1 rounded-full text-[10px] font-bold ${r.isNew ? "bg-orange-50 text-orange-600" : "bg-blue-50 text-blue-600"}`}
                              >
                                {r.isNew ? "● Có đề xuất mới" : "● Đã xem"}
                              </span>
                            </td>
                            <td className="px-8 py-6 text-right">
                              <div className="flex items-center justify-end gap-4">
                                <button className="p-2 hover:bg-slate-100 rounded-full transition text-slate-400">
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
                                      d="M8.684 13.342C8.886 13.171 9 13.103 9.178 13.053c.18-.05.348-.046.555.03c.206.074.41.176.569.314h.4c.22.164.347.483.347.743 0 .26-.127.579-.347.743h-.4c-.21.138-.369.24-.569.314-.207.074-.375.078-.555.03-.18-.05-.312-.122-.438-.25zM15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                    />
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M12 11V3m0 0L9 6m3-3l3 3"
                                    />
                                  </svg>
                                </button>
                                <button
                                  onClick={() =>
                                    navigate(`/recommendation-detail/${r._id}`)
                                  }
                                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-blue-700 transition shadow-md shadow-blue-600/20"
                                >
                                  Re-view Recommendations
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
                                      d="M14 5l7 7-7 7"
                                    />
                                  </svg>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden divide-y divide-slate-50">
                  {academicResults
                    .slice(
                      (currentPage - 1) * itemsPerPage,
                      currentPage * itemsPerPage,
                    )
                    .map((r) => (
                      <div key={r._id} className="p-6 space-y-4">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center">
                              <svg
                                className="w-5 h-5 text-teal-600"
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
                                {r.topCombinations?.[0]?.combination}:{" "}
                                {r.topCombinations?.[0]?.totalScore}
                              </div>
                              <div className="text-[10px] font-black text-slate-400 uppercase">
                                {r.topCombinations?.[0]?.totalScore >= 27
                                  ? "XUẤT SẮC"
                                  : r.topCombinations?.[0]?.totalScore >= 24
                                    ? "GIỎI"
                                    : "KHÁ"}
                              </div>
                            </div>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-[10px] font-bold ${r.isNew ? "bg-orange-50 text-orange-600" : "bg-blue-50 text-blue-600"}`}
                          >
                            {r.isNew ? "● Mới" : "● Đã xem"}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
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
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          {new Date(r.createdAt).toLocaleDateString("vi-VN", {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                          })}
                        </div>

                        <div className="flex justify-end">
                          <button
                            onClick={() =>
                              navigate(`/recommendation-detail/${r._id}`)
                            }
                            className="w-full bg-blue-600 text-white py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition shadow-md shadow-blue-600/20"
                          >
                            Xem đề xuất
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
                                d="M14 5l7 7-7 7"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
                {academicResults.length === 0 && (
                  <div className="p-20 text-center">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg
                        className="w-10 h-10 text-slate-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                    <p className="text-slate-400 font-medium">
                      Chưa có lịch sử nhập điểm.
                    </p>
                  </div>
                )}

                {/* Pagination */}
                {academicResults.length > itemsPerPage && (
                  <div className="px-8 py-10 border-t border-slate-100 flex justify-center">
                    <div className="bg-white px-8 py-4 rounded-full shadow-md border border-slate-100 flex items-center gap-6">
                      <button
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(prev - 1, 1))
                        }
                        disabled={currentPage === 1}
                        className="flex items-center gap-2 text-blue-600 font-bold text-sm hover:text-blue-800 disabled:opacity-30 disabled:cursor-not-allowed transition"
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
                            d="M15 19l-7-7 7-7"
                          />
                        </svg>
                        Back
                      </button>

                      <div className="flex items-center gap-2">
                        {(() => {
                          const totalPages = Math.ceil(
                            academicResults.length / itemsPerPage,
                          );
                          const pages = [];

                          if (totalPages <= 7) {
                            for (let i = 1; i <= totalPages; i++) pages.push(i);
                          } else {
                            pages.push(1);
                            if (currentPage > 3) pages.push("...");

                            const start = Math.max(2, currentPage - 1);
                            const end = Math.min(
                              totalPages - 1,
                              currentPage + 1,
                            );

                            for (let i = start; i <= end; i++) {
                              if (!pages.includes(i)) pages.push(i);
                            }

                            if (currentPage < totalPages - 2) pages.push("...");
                            pages.push(totalPages);
                          }

                          return pages.map((page, idx) =>
                            page === "..." ? (
                              <span
                                key={`ellipsis-${idx}`}
                                className="text-slate-400 font-medium px-1"
                              >
                                ...
                              </span>
                            ) : (
                              <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className={`w-10 h-10 rounded-xl text-sm font-bold transition-all ${
                                  currentPage === page
                                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/40 scale-110"
                                    : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                                }`}
                              >
                                {page}
                              </button>
                            ),
                          );
                        })()}
                      </div>

                      <button
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(
                              prev + 1,
                              Math.ceil(academicResults.length / itemsPerPage),
                            ),
                          )
                        }
                        disabled={
                          currentPage ===
                          Math.ceil(academicResults.length / itemsPerPage)
                        }
                        className="flex items-center gap-2 text-blue-600 font-bold text-sm hover:text-blue-800 disabled:opacity-30 disabled:cursor-not-allowed transition"
                      >
                        Next
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
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Smart Tip Section */}
        {activeTab === "academic" && (
          <div className="mt-10 bg-slate-100/50 p-8 rounded-3xl border border-slate-100 flex flex-col md:flex-row items-center gap-8">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-sm shrink-0">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.477.859h4.001z" />
                </svg>
              </div>
            </div>
            <div>
              <h4 className="text-lg font-black text-slate-900 mb-2">
                Mẹo chọn trường thông minh
              </h4>
              <p className="text-slate-500 text-sm leading-relaxed mb-4">
                Bạn có thể nhập nhiều tổ hợp điểm khác nhau để so sánh tỷ lệ
                trúng tuyển giữa các khối thi. EduPath AI sẽ tự động phân tích
                và đưa ra lộ trình tối ưu nhất.
              </p>
              <a
                href="#"
                className="text-sm font-bold text-slate-900 hover:underline flex items-center gap-1"
              >
                Tìm hiểu thêm về thuật toán EduPath AI
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
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
            </div>
          </div>
        )}

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
