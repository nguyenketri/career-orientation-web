import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getUniversityById } from "../../services/universityService";
import { motion } from "framer-motion";

const UniversityDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [university, setUniversity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUniversity = async () => {
      try {
        setLoading(true);
        const response = await getUniversityById(id);
        setUniversity(response.data);
      } catch (err) {
        setError("Không thể tải thông tin trường đại học.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUniversity();
  }, [id]);

  const getUniversityImage = (name) => {
    // Fallback logic if university.image is missing or invalid
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name || "Uni")}&background=random&size=400`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-600">Đang tải thông tin trường...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!university) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-600">Không tìm thấy trường đại học.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 md:px-8 pt-24 pb-20 text-slate-900">
      <div className="mx-auto max-w-7xl">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition mb-6 group"
        >
          <svg
            className="w-5 h-5 transition-transform group-hover:-translate-x-1"
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
          <span className="font-bold text-sm">Quay lại kết quả</span>
        </button>

        {/* University Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-3xl border border-slate-100 p-6 md:p-8 shadow-sm mb-8 flex flex-col md:flex-row items-center gap-6"
        >
          <div className="w-32 h-32 md:w-48 md:h-48 rounded-2xl overflow-hidden flex-shrink-0">
            <img
              src={university.image || getUniversityImage(university.name)}
              alt={university.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = getUniversityImage(university.name);
              }}
            />
          </div>
          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
              <span
                className={`text-xs font-black px-3 py-1 rounded-full uppercase ${
                  university.type === "Public"
                    ? "bg-blue-100 text-blue-600"
                    : university.type === "Private"
                      ? "bg-orange-100 text-orange-600"
                      : "bg-purple-100 text-purple-600"
                }`}
              >
                {university.type === "Public"
                  ? "Công lập"
                  : university.type === "Private"
                    ? "Dân lập"
                    : "Quốc tế"}
              </span>
              <span className="text-sm font-bold text-slate-500">
                {university.location}
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-3">
              {university.name}
            </h1>
            <p className="text-md text-slate-600 mb-4">{university.address}</p>
            <a
              href={university.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline text-sm font-medium"
            >
              Truy cập website trường →
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default UniversityDetailPage;
