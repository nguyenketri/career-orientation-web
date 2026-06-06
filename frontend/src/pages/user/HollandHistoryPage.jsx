import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getMyHollandResults,
  deleteHollandResult,
} from "../../services/hollandService";

const HollandHistoryPage = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await getMyHollandResults();
        setResults(res.data);
      } catch {
        console.error("Error fetching history");
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (window.confirm("Bạn có chắc chắn muốn xóa kết quả này?")) {
      try {
        await deleteHollandResult(id);
        setResults(results.filter((r) => r._id !== id));
      } catch {
        alert("Có lỗi xảy ra khi xóa.");
      }
    }
  };

  if (loading)
    return <div className="pt-32 text-center">Đang tải lịch sử...</div>;

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-20 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-black text-slate-900 mb-8">
          Lịch sử Holland
        </h1>
        <div className="space-y-4">
          {results.map((result) => (
            <div
              key={result._id}
              onClick={() => navigate("/holland", { state: { result } })}
              className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 cursor-pointer hover:shadow-md transition flex justify-between items-center"
            >
              <div>
                <h3 className="font-bold text-lg">
                  Kết quả ngày {new Date(result.createdAt).toLocaleDateString()}
                </h3>
                <p className="text-slate-500">
                  Nhóm nổi bật: {result.hollandType}
                </p>
              </div>
              <button
                onClick={(e) => handleDelete(result._id, e)}
                className="text-red-500 hover:text-red-700 font-bold"
              >
                Xóa
              </button>
            </div>
          ))}
          {results.length === 0 && (
            <p className="text-center text-slate-500">Chưa có lịch sử test.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default HollandHistoryPage;
