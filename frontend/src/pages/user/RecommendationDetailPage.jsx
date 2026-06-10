import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getScoreAnalysisHistory } from "../../services/recommendService";
import { getUser } from "../../utils/auth";

const RecommendationDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const user = getUser();

  useEffect(() => {
    const fetchResult = async () => {
      setLoading(true);
      try {
        const res = await getScoreAnalysisHistory();
        const data = (res.data?.data || res.data || []).find(
          (r) => r._id === id,
        );
        setResult(data);
      } catch (err) {
        console.error("Error fetching recommendation detail:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <p className="text-slate-500 mb-4">Không tìm thấy dữ liệu gợi ý.</p>
          <button
            onClick={() => navigate("/history")}
            className="bg-blue-600 text-white px-6 py-2 rounded-full font-bold"
          >
            Quay lại lịch sử
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white px-4 md:px-8 pt-24 md:pt-32 pb-20 text-slate-900">
      <div className="mx-auto max-w-7xl">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold mb-6 transition-colors"
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
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Quay lại
        </button>

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-2">
              High School Exam Results{" "}
              {new Date(result.createdAt).getFullYear()}
            </h1>
            <div className="flex items-center gap-2 text-slate-500 text-sm">
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
                  d="M8 7V3m8 4V3m-//9 5h.01M12 20h.01M7 20h.01M17 20h.01M12 15V5"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7h8"
                />
              </svg>
              <span>
                Recommended on{" "}
                {new Date(result.createdAt).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm font-bold hover:bg-slate-50 transition">
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
                  d="M8.684 13.342C8.886 13.171 9 13.103 9.178 13.053c.18-.05.348-.046.555.03c.206.074.41.176.569.314h.4c.22.164.347.483.347.743 0 .26-.127.579-.347.743h-.4c-.21.138-.369.24-.569.314-.207.074-.375.078-.555.03-.18-.05-.312-.122-.438-.25zM15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 11V3m0 0L9 6m3-3l3 3"
                />
              </svg>
              Share
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-bold hover:bg-slate-800 transition">
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
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Download PDF
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="space-y-8">
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
              <h3 className="text-lg font-black mb-6">Historical Entry</h3>
              <div className="space-y-3">
                {Object.entries(result.subjectScores || {}).map(
                  ([subject, score]) => (
                    <div
                      key={subject}
                      className="flex justify-between items-center p-4 bg-white rounded-xl border border-slate-100 shadow-sm"
                    >
                      <span className="text-slate-600 font-medium">
                        {subject}
                      </span>
                      <span className="font-black text-slate-900">{score}</span>
                    </div>
                  ),
                )}
                <div className="flex justify-between items-center p-4 bg-blue-50 rounded-xl border border-blue-100 mt-6">
                  <span className="text-blue-700 font-bold">
                    Total ({result.topCombinations?.[0]?.combination || "N/A"}{" "}
                    Group)
                  </span>
                  <span className="font-black text-blue-800 text-lg">
                    {result.topCombinations?.[0]?.totalScore || "0"}
                  </span>
                </div>
              </div>
            </div>

            {/* AI Insights */}
            <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-black">AI Insights</h3>
                </div>
                <p className="text-slate-300 italic leading-relaxed mb-8 opacity-90">
                  "Based on these scores, you have a high probability of
                  admission into top-tier programs. Your{" "}
                  {
                    Object.entries(result.subjectScores || {}).sort(
                      (a, b) => b[1] - a[1],
                    )[0]?.[0]
                  }{" "}
                  score is a major competitive advantage."
                </p>
                <button
                  onClick={() => navigate("/mentor")}
                  className="w-full py-3 bg-slate-800 text-white rounded-xl text-sm font-bold hover:bg-slate-700 transition-colors border border-slate-700"
                >
                  Ask Follow-up
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Recommended Matches */}
          <div className="lg:col-span-2">
            <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-black">Recommended Matches</h3>
                <span className="px-3 py-1 bg-slate-100 text-slate-500 text-xs font-bold rounded-full">
                  {result.recommendedUniversityMajors?.length || 0} Total
                  Matches
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-slate-400 text-xs font-bold uppercase tracking-wider border-b border-slate-100">
                      <th className="pb-4 font-medium">University & Major</th>
                      <th className="pb-4 font-medium">Matching Group</th>
                      <th className="pb-4 font-medium">2022 Benchmark</th>
                      <th className="pb-4 font-medium">Chance</th>
                      <th className="pb-4 font-medium text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {result.recommendedUniversityMajors
                      ?.slice(
                        (currentPage - 1) * itemsPerPage,
                        currentPage * itemsPerPage,
                      )
                      .map((item, idx) => (
                        <tr
                          key={idx}
                          className="group hover:bg-slate-50 transition-colors"
                        >
                          <td className="py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center overflow-hidden">
                                <img
                                  src={`https://source.unsplash.com/featured/?university,${item.university?.name}`}
                                  alt="uni"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div>
                                <div className="font-bold text-slate-900 text-sm">
                                  {item.university?.name}
                                </div>
                                <div className="text-xs text-slate-500">
                                  {item.major?.name}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4">
                            <span className="px-2 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold rounded">
                              {item.matchingGroup || "A01"}
                            </span>
                          </td>
                          <td className="py-4 text-sm font-medium text-slate-700">
                            {item.admissionScore}
                          </td>
                          <td className="py-4">
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                  className={`h-full ${idx === 0 ? "bg-orange-500" : "bg-green-500"}`}
                                  style={{ width: `${90 - idx * 5}%` }}
                                />
                              </div>
                              <span className="text-xs font-bold text-slate-700">
                                {90 - idx * 5}%
                              </span>
                            </div>
                          </td>
                          <td className="py-4 text-right">
                            {item.university?.website && (
                              <a
                                href={item.university.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-block px-3 py-1 bg-slate-900 text-white text-[10px] font-bold rounded-lg hover:bg-slate-800 transition"
                              >
                                Website
                              </a>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              {result.recommendedUniversityMajors?.length > itemsPerPage && (
                <div className="mt-8 px-8 py-10 border-t border-slate-100 flex justify-center">
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
                          result.recommendedUniversityMajors.length /
                            itemsPerPage,
                        );
                        const pages = [];

                        if (totalPages <= 7) {
                          for (let i = 1; i <= totalPages; i++) pages.push(i);
                        } else {
                          pages.push(1);
                          if (currentPage > 3) pages.push("...");

                          const start = Math.max(2, currentPage - 1);
                          const end = Math.min(totalPages - 1, currentPage + 1);

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
                            Math.ceil(
                              result.recommendedUniversityMajors.length /
                                itemsPerPage,
                            ),
                          ),
                        )
                      }
                      disabled={
                        currentPage ===
                        Math.ceil(
                          result.recommendedUniversityMajors.length /
                            itemsPerPage,
                        )
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecommendationDetailPage;
