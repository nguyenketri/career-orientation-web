import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAllUniversityMajors } from "../../services/universityService";
import { getUser } from "../../utils/auth";
import UpgradePrompt from "../../components/UpgradePrompt";
import axiosClient from "../../api/axios";

const ComparisonPage = () => {
  const navigate = useNavigate();
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
  const [isExporting, setIsExporting] = useState(false);
  const tableRef = useRef(null);

  const plan = user?.subscriptionPlan || "FREE";

  const maxComparisons = plan === "PREMIUM" ? 999 : plan === "PAID" ? 5 : 2;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getAllUniversityMajors();
        setAllMajors(res.data || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
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

  // Removed prepareElementForPdf as we now use the onclone callback for better reliability

  const handleExportPdf = async () => {
    if (selectedMajors.length === 0) {
      alert("Vui lòng chọn ít nhất một trường để xuất PDF.");
      return;
    }

    if (plan === "FREE") {
      setShowUpgradePrompt(true);
      return;
    }

    try {
      setIsExporting(true);

      // 1. EXTRACT AND SANITIZE CSS
      let sanitizedCss = "";
      Array.from(document.styleSheets).forEach((sheet) => {
        try {
          const rules = sheet.cssRules || sheet.rules;
          if (rules) {
            Array.from(rules).forEach((rule) => {
              if (rule.cssText) {
                sanitizedCss +=
                  rule.cssText.replace(/oklch\([^)]*\)/g, "rgb(128,128,128)") +
                  "\n";
              }
            });
          }
        } catch {
          // Ignore CORS errors
        }
      });

      // 2. CREATE ISOLATED ENVIRONMENT (Hidden IFrame)
      const iframe = document.createElement("iframe");
      iframe.style.position = "absolute";
      iframe.style.width = "1200px";
      iframe.style.height = "2000px";
      iframe.style.left = "-9999px";
      iframe.style.top = "0";
      document.body.appendChild(iframe);

      const iframeWin = iframe.contentWindow;
      const iframeDoc = iframeWin.document;
      iframeDoc.head.innerHTML = `<style>${sanitizedCss}</style>`;

      // 3. INJECT html2pdf LIBRARY INTO IFRAME
      const script = iframeDoc.createElement("script");
      script.src =
        "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
      iframeDoc.head.appendChild(script);

      // Wait for library to load
      await new Promise((resolve) => {
        script.onload = resolve;
      });

      const commonOpt = {
        margin: 10,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          windowWidth: 1200,
          onclone: (doc) => {
            const desktopView = doc.querySelector('[class*="md:block"]');
            if (desktopView) {
              desktopView.style.setProperty("display", "block", "important");
              desktopView.classList.remove("hidden");
              desktopView.style.width = "1200px";
              desktopView.style.setProperty("overflow", "visible", "important");
            }
            const mobileView = doc.querySelector('[class*="md:hidden"]');
            if (mobileView) {
              mobileView.style.setProperty("display", "none", "important");
            }
            doc.querySelectorAll("*").forEach((el) => {
              el.style.setProperty("overflow", "visible", "important");
            });
            const table = doc.querySelector("table");
            if (table) {
              table.style.width = "1200px";
              table.style.setProperty("table-layout", "fixed", "important");
            }
          },
        },
      };

      try {
        if (plan === "PAID") {
          const targetElement = iframeDoc.createElement("div");
          targetElement.appendChild(tableRef.current.cloneNode(true));
          iframeDoc.body.appendChild(targetElement);

          const opt = {
            ...commonOpt,
            filename: "so-sanh-truong-hoc.pdf",
            jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
          };
          // EXECUTE INSIDE IFRAME
          await iframeWin.html2pdf().set(opt).from(targetElement).save();
        } else if (plan === "PREMIUM") {
          const res = await axiosClient.post("/comparison/analyze", {
            selectedMajors,
          });
          const analysisText = res.data.analysis;

          const container = iframeDoc.createElement("div");
          container.style.width = "1200px";
          container.style.backgroundColor = "white";

          const tableClone = tableRef.current.cloneNode(true);
          container.appendChild(tableClone);

          const aiSection = iframeDoc.createElement("div");
          aiSection.style.marginTop = "30px";
          aiSection.style.padding = "20px";
          aiSection.style.borderRadius = "12px";
          aiSection.style.background =
            "linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)";
          aiSection.style.border = "2px solid #e2e8f0";
          aiSection.style.boxShadow = "0 4px 6px rgba(0,0,0,0.05)";

          const title = iframeDoc.createElement("h2");
          title.innerText = "✨ Phân tích chuyên sâu từ Trợ lý AI";
          title.style.color = "#1e293b";
          title.style.fontSize = "20px";
          title.style.marginBottom = "15px";
          title.style.borderBottom = "2px solid #3b82f6";
          title.style.display = "inline-block";
          aiSection.appendChild(title);

          const content = iframeDoc.createElement("div");
          content.style.color = "#475569";
          content.style.lineHeight = "1.6";
          content.style.fontSize = "14px";
          content.style.whiteSpace = "pre-wrap";
          content.innerText = analysisText;
          aiSection.appendChild(content);

          container.appendChild(aiSection);
          iframeDoc.body.appendChild(container);

          const opt = {
            ...commonOpt,
            filename: "so-sanh-truong-hoc-premium.pdf",
            jsPDF: { unit: "mm", format: "a4", orientation: "landscape" },
          };
          // EXECUTE INSIDE IFRAME
          await iframeWin.html2pdf().set(opt).from(container).save();
        }
      } catch (innerErr) {
        if (plan === "PREMIUM") {
          console.error(
            "AI Analysis failed, falling back to standard PDF:",
            innerErr,
          );
          const targetElement = iframeDoc.createElement("div");
          targetElement.appendChild(tableRef.current.cloneNode(true));
          iframeDoc.body.appendChild(targetElement);

          const opt = {
            ...commonOpt,
            filename: "so-sanh-truong-hoc.pdf",
            jsPDF: { unit: "mm", format: "a4", orientation: "landscape" },
          };
          // EXECUTE INSIDE IFRAME
          await iframeWin.html2pdf().set(opt).from(targetElement).save();
        } else {
          throw innerErr;
        }
      } finally {
        document.body.removeChild(iframe);
      }
    } catch (err) {
      console.error("Export PDF Error:", err);
      alert("Có lỗi xảy ra khi xuất PDF.");
    } finally {
      setIsExporting(false);
    }
  };
  if (showUpgradePrompt) {
    const featureName =
      selectedMajors.length >= maxComparisons
        ? "So sánh nhiều trường"
        : "Xuất PDF";

    return (
      <UpgradePrompt
        feature={featureName}
        requiredPlan={plan === "FREE" ? ["PAID", "PREMIUM"] : ["PREMIUM"]}
        currentPlan={plan}
        onBack={() => navigate("/recommend")}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA] pt-20 pb-20">
      <div className="mx-auto max-w-7xl px-6">
        {/* Breadcrumb */}
        <div className="mb-8 flex items-center gap-2 text-slate-500">
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
              d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7"
            />
          </svg>
          <span className="text-sm font-medium">So sánh Trường học</span>
        </div>

        {/* Title and Actions */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 mb-2">
              caZup AI
            </h1>
            <p className="text-xs text-slate-500 font-medium mb-2">
              So sánh trường học hôm nay
            </p>
            <p className="text-xs text-slate-400 font-medium">
              Tìm kiếm và so sánh chi tiết các tiêu chí của các trường đại học.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 font-bold hover:bg-slate-50 transition text-sm"
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
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                />
              </svg>
              Chia sẻ
            </button>
            <button
              onClick={handleExportPdf}
              disabled={isExporting}
              className={`flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 font-bold hover:bg-slate-50 transition text-sm ${
                isExporting ? "opacity-50 cursor-not-allowed" : ""
              }`}
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
              {isExporting ? "Đang xử lý..." : "Xuất PDF"}
            </button>
          </div>
        </div>

        {/* School Selection */}
        <div className="mb-12">
          <div className="flex flex-wrap items-center justify-center gap-6">
            {selectedMajors.map((item, index) => (
              <div key={item._id} className="w-full md:w-64">
                <div
                  className={`bg-white border-2 rounded-lg p-4 relative ${index === 0 ? "border-blue-400" : index === 1 ? "border-green-400" : "border-slate-300"}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${index === 0 ? "bg-blue-600" : index === 1 ? "bg-green-600" : "bg-slate-600"}`}
                      >
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">
                          Lựa chọn {index + 1}
                        </p>
                        <p className="text-sm font-bold text-slate-900 line-clamp-1">
                          {item.university?.name}
                        </p>
                        <p className="text-[11px] text-slate-500 line-clamp-1">
                          {item.major?.name}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemove(item._id)}
                      className="text-slate-400 hover:text-red-500 transition"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {selectedMajors.length < maxComparisons && (
              <div className="w-full md:w-64">
                <div className="bg-slate-100 rounded-lg p-4 border-2 border-dashed border-slate-300 flex items-center justify-center h-20">
                  <span className="text-slate-500 font-medium text-sm">
                    Thêm trường {selectedMajors.length + 1}
                  </span>
                </div>
              </div>
            )}

            {selectedMajors.length > 0 && (
              <div className="flex items-center justify-center">
                <div className="w-16 h-16 bg-white rounded-full border-4 border-slate-200 flex items-center justify-center shadow-lg">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-xs text-center px-2">
                    So sánh
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Search Input */}
        <div className="relative mb-12">
          <input
            type="text"
            placeholder="Tìm kiếm ngành hoặc trường để thêm vào so sánh..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-300 rounded-lg px-4 py-3 outline-none focus:border-blue-500 shadow-sm transition text-sm"
          />
          {searchTerm && filteredMajors.length > 0 && (
            <div className="absolute top-full left-0 w-full mt-2 bg-white border border-slate-300 rounded-lg overflow-hidden z-50 shadow-lg">
              {filteredMajors.slice(0, 5).map((item) => (
                <div
                  key={item._id}
                  onClick={() => handleSelect(item)}
                  className="p-3 hover:bg-blue-50 cursor-pointer border-b border-slate-100 last:border-0"
                >
                  <div className="font-bold text-slate-900 text-sm">
                    {item.major?.name}
                  </div>
                  <div className="text-xs text-slate-500">
                    {item.university?.name}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Comparison Table */}
        {selectedMajors.length > 0 && (
          <div
            ref={tableRef}
            className="bg-white rounded-lg border border-slate-200 shadow-md overflow-hidden"
          >
            {/* Mobile View: Cards */}
            <div className="md:hidden p-4 space-y-6">
              {selectedMajors.map((item) => (
                <div
                  key={item._id}
                  className="border border-slate-200 rounded-lg p-4 bg-slate-50"
                >
                  <div className="font-black text-slate-900 mb-4 border-b pb-2">
                    {item.university?.name} - {item.major?.name}
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="font-bold text-slate-500">Website:</span>
                      <a
                        href={item.university?.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline"
                      >
                        Link
                      </a>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-bold text-slate-500">Địa chỉ:</span>
                      <span className="text-right">
                        {item.university?.address || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-bold text-slate-500">Học phí:</span>
                      <span>
                        {item.tuitionFee
                          ? `${Math.floor(item.tuitionFee / 1000000)} - ${Math.floor(item.tuitionFee / 1000000) + 6} triệu/năm`
                          : "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-bold text-slate-500">
                        Điểm chuẩn:
                      </span>
                      <span>{item.admissionScore?.toFixed(1) || "N/A"}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop View: Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full table-fixed min-w-[800px]">
                <tbody>
                  {/* Title Row */}
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <td className="p-4 w-64 sticky left-0 bg-slate-50 z-10">
                      <p className="text-sm font-black text-slate-900">
                        Tiêu chí
                      </p>
                    </td>
                    {selectedMajors.map((item) => (
                      <td
                        key={item._id}
                        className="p-4 border-l border-slate-200 min-w-[200px]"
                      >
                        <div className="text-center">
                          <p className="text-sm font-black text-slate-900 line-clamp-1">
                            {item.university?.name}
                          </p>
                          <p className="text-xs font-bold text-orange-600 line-clamp-1">
                            {item.major?.name}
                          </p>
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Website */}
                  <tr className="border-b border-slate-200 hover:bg-slate-50">
                    <td className="p-4 bg-slate-50 sticky left-0 z-10">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center text-blue-600 text-xs">
                          🌐
                        </div>
                        <span className="text-sm font-bold text-slate-900">
                          Website
                        </span>
                      </div>
                    </td>
                    {selectedMajors.map((item) => (
                      <td
                        key={item._id}
                        className="p-4 border-l border-slate-200"
                      >
                        {item.university?.website ? (
                          <a
                            href={item.university.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-500 text-center hover:underline block"
                          >
                            {item.university.website
                              ?.split("//")[1]
                              ?.split("/")[0] || "N/A"}
                          </a>
                        ) : (
                          <p className="text-xs text-slate-400 text-center">
                            N/A
                          </p>
                        )}
                      </td>
                    ))}
                  </tr>

                  {/* Địa chỉ */}
                  <tr className="border-b border-slate-200 hover:bg-slate-50">
                    <td className="p-4 bg-slate-50 sticky left-0 z-10">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-orange-100 rounded flex items-center justify-center text-orange-600 text-xs">
                          📍
                        </div>
                        <span className="text-sm font-bold text-slate-900">
                          Địa chỉ
                        </span>
                      </div>
                    </td>
                    {selectedMajors.map((item) => (
                      <td
                        key={item._id}
                        className="p-4 border-l border-slate-200"
                      >
                        <p className="text-xs text-slate-600 text-center">
                          {item.university?.address || "N/A"}
                        </p>
                      </td>
                    ))}
                  </tr>

                  {/* Học phí trung bình */}
                  <tr className="border-b border-slate-200 hover:bg-slate-50">
                    <td className="p-4 bg-slate-50 sticky left-0 z-10">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-teal-100 rounded flex items-center justify-center text-teal-600 text-xs">
                          💳
                        </div>
                        <span className="text-sm font-bold text-slate-900">
                          Học phí trung bình
                        </span>
                      </div>
                    </td>
                    {selectedMajors.map((item) => (
                      <td
                        key={item._id}
                        className="p-4 border-l border-slate-200"
                      >
                        <p className="text-xs font-bold text-slate-900 text-center">
                          {item.tuitionFee
                            ? `${Math.floor(item.tuitionFee / 1000000)} - ${Math.floor(item.tuitionFee / 1000000) + 6} triệu VND/năm`
                            : "N/A"}
                        </p>
                      </td>
                    ))}
                  </tr>

                  {/* Điểm chuẩn */}
                  <tr className="border-b border-slate-200 hover:bg-slate-50">
                    <td className="p-4 bg-slate-50 sticky left-0 z-10">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-indigo-100 rounded flex items-center justify-center text-indigo-600 text-xs">
                          📊
                        </div>
                        <span className="text-sm font-bold text-slate-900">
                          Điểm chuẩn (2 năm)
                        </span>
                      </div>
                    </td>
                    {selectedMajors.map((item) => (
                      <td
                        key={item._id}
                        className="p-4 border-l border-slate-200"
                      >
                        <div className="grid grid-cols-2 gap-2 text-center">
                          <div>
                            <p className="text-[10px] text-slate-400 font-bold">
                              2023
                            </p>
                            <p className="text-xs font-bold text-slate-900">
                              {item.admissionScore
                                ? `${(item.admissionScore - 1.5).toFixed(1)} - ${item.admissionScore.toFixed(1)}`
                                : "N/A"}
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] text-slate-400 font-bold">
                              2022
                            </p>
                            <p className="text-xs font-bold text-slate-900">
                              {item.admissionScore
                                ? `${(item.admissionScore - 2).toFixed(1)} - ${(item.admissionScore - 0.5).toFixed(1)}`
                                : "N/A"}
                            </p>
                          </div>
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Cơ sở vật chất */}
                  <tr className="border-b border-slate-200 hover:bg-slate-50">
                    <td className="p-4 bg-slate-50 sticky left-0 z-10">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-purple-100 rounded flex items-center justify-center text-purple-600 text-xs">
                          🏢
                        </div>
                        <span className="text-sm font-bold text-slate-900">
                          Cơ sở vật chất
                        </span>
                      </div>
                    </td>
                    {selectedMajors.map((item) => (
                      <td
                        key={item._id}
                        className="p-4 border-l border-slate-200"
                      >
                        <div className="flex flex-wrap gap-1 justify-center">
                          {item.university?.facilities &&
                          item.university.facilities.length > 0 ? (
                            item.university.facilities.map((facility, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-1 bg-blue-50 text-blue-700 text-[10px] font-bold rounded"
                              >
                                {facility}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-slate-400 text-center">
                              N/A
                            </span>
                          )}
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Xếp hạng */}
                  <tr className="hover:bg-slate-50">
                    <td className="p-4 bg-slate-50 sticky left-0 z-10">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-yellow-100 rounded flex items-center justify-center text-yellow-600 text-xs">
                          ⭐
                        </div>
                        <span className="text-sm font-bold text-slate-900">
                          Review học sinh
                        </span>
                      </div>
                    </td>
                    {selectedMajors.map((item) => (
                      <td
                        key={item._id}
                        className="p-4 border-l border-slate-200"
                      >
                        <div className="text-center">
                          <div className="flex justify-center gap-1 mb-1">
                            {[...Array(5)].map((_, i) => (
                              <span
                                key={i}
                                className={
                                  i < Math.floor(item.university?.rating || 0)
                                    ? "text-yellow-400"
                                    : "text-slate-300"
                                }
                              >
                                ★
                              </span>
                            ))}
                          </div>
                          <p className="text-[10px] text-slate-600 font-medium">
                            {item.university?.rating
                              ? `${item.university.rating} ⭐ (${item.university.reviewCount || 0} đánh giá)`
                              : "Chưa có đánh giá"}
                          </p>
                        </div>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* AI Mentor Section */}
        <div className="mt-12 bg-gradient-to-r from-slate-900 to-slate-800 rounded-lg p-8 text-white">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-black mb-1">
                  Bạn muốn tư vấn từ AI Mentor?
                </h3>
                <p className="text-sm text-slate-300">
                  Nhân viên tư vấn sẽ giúp bạn lựa chọn ngành học, trường đại
                  học và con đường sự nghiệp tương lai phù hợp với bạn.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <Link
                to="/mentor"
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded text-sm transition"
              >
                Tham tư vấn ngay
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComparisonPage;
