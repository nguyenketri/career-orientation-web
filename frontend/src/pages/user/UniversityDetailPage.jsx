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
  const [selectedMajor, setSelectedMajor] = useState(null);
  const [selectedAdmissionYear, setSelectedAdmissionYear] = useState("");

  useEffect(() => {
    const fetchUniversity = async () => {
      try {
        setLoading(true);
        const response = await getUniversityById(id);
        setUniversity(response.data);
        if (response.data.majors && response.data.majors.length > 0) {
          setSelectedMajor(response.data.majors[0]);
          const years = [
            ...new Set(
              response.data.majors.flatMap(
                (major) =>
                  major.admissionHistory?.map((history) => history.year) || [],
              ),
            ),
          ].sort((a, b) => b - a);
          if (years.length > 0) {
            setSelectedAdmissionYear(years[0]);
          }
        }
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
    const images = {
      NEU: "https://images.unsplash.com/photo-1562774053-701939374587?q=80&w=1974&auto=format&fit=crop",
      FPT: "https://images.unsplash.com/photo-1541339907198-e08756edd81f?q=80&w=2070&auto=format&fit=crop",
      BK: "https://images.unsplash.com/photo-1592280771195-a6976a97337a?q=80&w=2070&auto=format&fit=crop",
    };
    return (
      images[name] ||
      "https://images.unsplash.com/photo-1523050853063-915894691067?q=80&w=2070&auto=format&fit=crop"
    );
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

  const admissionYears = [
    ...new Set(
      university.majors.flatMap(
        (major) => major.admissionHistory?.map((history) => history.year) || [],
      ),
    ),
  ].sort((a, b) => b - a);

  const currentMajorAdmissionHistory = selectedMajor?.admissionHistory?.find(
    (history) => history.year === Number(selectedAdmissionYear),
  );

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

        {/* Majors and Admission Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Major List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-1 bg-white rounded-3xl border border-slate-100 p-6 shadow-sm"
          >
            <h3 className="text-xl font-black text-slate-900 mb-6">
              Các ngành đào tạo
            </h3>
            <div className="space-y-3">
              {university.majors.map((major) => (
                <button
                  key={major._id}
                  onClick={() => setSelectedMajor(major)}
                  className={`w-full text-left px-4 py-3 rounded-xl transition ${
                    selectedMajor?._id === major._id
                      ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                      : "bg-slate-50 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <p className="font-bold text-md">{major.name}</p>
                  <p
                    className={`text-xs ${
                      selectedMajor?._id === major._id
                        ? "text-blue-200"
                        : "text-slate-400"
                    }`}
                  >
                    Mã ngành: {major.majorCode}
                  </p>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Major Detail */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 p-6 shadow-sm"
          >
            {selectedMajor ? (
              <>
                <h3 className="text-xl font-black text-slate-900 mb-4">
                  {selectedMajor.name}
                </h3>
                <p className="text-sm text-slate-600 mb-6">
                  Mã ngành: {selectedMajor.majorCode}
                </p>

                {/* Admission Year Selector */}
                <div className="mb-6">
                  <label
                    htmlFor="admissionYear"
                    className="block text-sm font-bold text-slate-400 uppercase tracking-wider mb-2"
                  >
                    Chọn năm tuyển sinh
                  </label>
                  <select
                    id="admissionYear"
                    value={selectedAdmissionYear}
                    onChange={(e) => setSelectedAdmissionYear(e.target.value)}
                    className="w-full md:w-1/2 lg:w-1/3 px-4 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-700 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {admissionYears.map((year) => (
                      <option key={year} value={year}>
                        Năm {year}
                      </option>
                    ))}
                  </select>
                </div>

                {currentMajorAdmissionHistory ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
                      <p className="text-sm font-bold text-slate-400 mb-2">
                        Điểm chuẩn ({selectedAdmissionYear})
                      </p>
                      <p className="text-3xl font-black text-blue-600">
                        {currentMajorAdmissionHistory.admissionScore}
                      </p>
                    </div>
                    <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
                      <p className="text-sm font-bold text-slate-400 mb-2">
                        Học phí ({selectedAdmissionYear})
                      </p>
                      <p className="text-3xl font-black text-green-600">
                        {selectedMajor.tuitionFee
                          ? `${(selectedMajor.tuitionFee / 1000000).toFixed(0)} Triệu / năm`
                          : "Đang cập nhật"}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-50 p-5 rounded-xl border border-slate-100 text-center text-slate-500">
                    Không có dữ liệu tuyển sinh cho năm đã chọn.
                  </div>
                )}

                <h4 className="text-lg font-black text-slate-900 mb-3">
                  Các tổ hợp xét tuyển
                </h4>
                <div className="flex flex-wrap gap-2">
                  {(
                    selectedMajor.major?.subjectCombinations ||
                    (selectedMajor.subjectCombination
                      ? [selectedMajor.subjectCombination]
                      : [])
                  ).map((combo, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium"
                    >
                      {combo}
                    </span>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-20 text-slate-500">
                Chọn một ngành để xem chi tiết.
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default UniversityDetailPage;
