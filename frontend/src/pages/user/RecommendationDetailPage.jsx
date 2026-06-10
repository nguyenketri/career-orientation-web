import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getScoreAnalysisHistory } from "../../services/recommendService";

const RecommendationDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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

  const totalPages = Math.ceil(
    (result.recommendedUniversityMajors?.length || 0) / itemsPerPage,
  );

  return (
    <div className="min-h-screen bg-slate-50 px-4 md:px-8 pt-20 md:pt-32 pb-20 text-slate-900">
      <div className="mx-auto max-w-7xl">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold mb-6 transition-colors"
        >
          Quay lại
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          <div className="lg:col-span-3">
            <h1 className="text-2xl md:text-4xl font-black text-slate-900 mb-2">
              High School Exam Results{" "}
              {new Date(result.createdAt).getFullYear()}
            </h1>
          </div>

          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <h3 className="text-lg font-black mb-6">Historical Entry</h3>
              {Object.entries(result.subjectScores || {}).map(
                ([subject, score]) => (
                  <div
                    key={subject}
                    className="flex justify-between items-center p-4 bg-slate-50 rounded-xl border border-slate-100 mb-2"
                  >
                    <span className="text-slate-600 font-medium capitalize">
                      {subject}
                    </span>
                    <span className="font-black text-slate-900">{score}</span>
                  </div>
                ),
              )}
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm">
              <h3 className="text-xl font-black mb-8">Recommended Matches</h3>
              <div className="space-y-4">
                {result.recommendedUniversityMajors
                  ?.slice(
                    (currentPage - 1) * itemsPerPage,
                    currentPage * itemsPerPage,
                  )
                  .map((item, idx) => (
                    <div
                      key={idx}
                      className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center"
                    >
                      <div>
                        <div className="font-bold text-slate-900">
                          {item.university?.name}
                        </div>
                        <div className="text-sm text-slate-500">
                          {item.major?.name}
                        </div>
                      </div>
                      <div className="font-black text-slate-900">
                        {item.admissionScore}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecommendationDetailPage;
