import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getAllUniversityMajors } from "../../services/universityService";

const ComparisonPage = () => {
  const [allMajors, setAllMajors] = useState([]);
  const [selectedMajors, setSelectedMajors] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const maxComparisons = 2;

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

  const filteredMajors = allMajors.filter(
    (item) =>
      (item.major?.name + item.university?.name)
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) &&
      !selectedMajors.find((selected) => selected._id === item._id),
  );

  const handleSelect = (item) => {
    if (selectedMajors.length >= maxComparisons) {
      return;
    }
    setSelectedMajors([...selectedMajors, item]);
    setSearchTerm("");
  };

  const handleRemove = (id) => {
    setSelectedMajors(selectedMajors.filter((item) => item._id !== id));
  };

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
              EduPath AI
            </h1>
            <p className="text-xs text-slate-500 font-medium mb-2">
              So sánh trường học hôm nay
            </p>
            <p className="text-xs text-slate-400 font-medium">
              Tìm kiếm và so sánh chi tiết các tiêu chí của các trường đại học.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 font-bold hover:bg-slate-50 transition text-sm">
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
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 font-bold hover:bg-slate-50 transition text-sm">
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
        </div>

        {/* School Selection */}
        <div className="mb-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* School 1 */}
          <div>
            {selectedMajors[0] ? (
              <div className="bg-white border-2 border-blue-400 rounded-lg p-4 relative">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      1
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">
                        Trường 1
                      </p>
                      <p className="text-sm font-bold text-slate-900">
                        {selectedMajors[0].university?.name}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemove(selectedMajors[0]._id)}
                    className="text-slate-400 hover:text-red-500 transition"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-slate-100 rounded-lg p-4 border-2 border-dashed border-slate-300 flex items-center justify-center h-20">
                <span className="text-slate-500 font-medium text-sm">
                  Chọn trường 1
                </span>
              </div>
            )}
          </div>

          {/* Center Circle */}
          <div className="flex items-center justify-center">
            <div className="w-16 h-16 bg-white rounded-full border-4 border-slate-200 flex items-center justify-center shadow-lg">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-xs text-center px-2">
                So sánh
              </div>
            </div>
          </div>

          {/* School 2 */}
          <div>
            {selectedMajors[1] ? (
              <div className="bg-white border-2 border-green-400 rounded-lg p-4 relative">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      2
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">
                        Trường 2
                      </p>
                      <p className="text-sm font-bold text-slate-900">
                        {selectedMajors[1].university?.name}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemove(selectedMajors[1]._id)}
                    className="text-slate-400 hover:text-red-500 transition"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-slate-100 rounded-lg p-4 border-2 border-dashed border-slate-300 flex items-center justify-center h-20">
                <span className="text-slate-500 font-medium text-sm">
                  Chọn trường 2
                </span>
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
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-md">
            <table className="w-full">
              <tbody>
                {/* Title Row */}
                <tr className="border-b border-slate-200 bg-slate-50">
                  <td className="p-4 w-1/4">
                    <p className="text-sm font-black text-slate-900">
                      Tiêu chí
                    </p>
                  </td>
                  <td className="p-4 w-3/8 border-l border-slate-200">
                    <p className="text-sm font-black text-slate-900 text-center">
                      {selectedMajors[0].university?.name}
                    </p>
                  </td>
                  {selectedMajors[1] && (
                    <td className="p-4 w-3/8 border-l border-slate-200">
                      <p className="text-sm font-black text-slate-900 text-center">
                        {selectedMajors[1].university?.name}
                      </p>
                    </td>
                  )}
                </tr>

                {/* Website */}
                <tr className="border-b border-slate-200 hover:bg-slate-50">
                  <td className="p-4 bg-slate-50">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center text-blue-600 text-xs">
                        🌐
                      </div>
                      <span className="text-sm font-bold text-slate-900">
                        Website
                      </span>
                    </div>
                  </td>
                  <td className="p-4 border-l border-slate-200">
                    <p className="text-xs text-blue-500 text-center">
                      {selectedMajors[0].university?.website
                        ?.split("//")[1]
                        ?.split("/")[0] || "N/A"}
                    </p>
                  </td>
                  {selectedMajors[1] && (
                    <td className="p-4 border-l border-slate-200">
                      <p className="text-xs text-blue-500 text-center">
                        {selectedMajors[1].university?.website
                          ?.split("//")[1]
                          ?.split("/")[0] || "N/A"}
                      </p>
                    </td>
                  )}
                </tr>

                {/* Địa chỉ */}
                <tr className="border-b border-slate-200 hover:bg-slate-50">
                  <td className="p-4 bg-slate-50">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-orange-100 rounded flex items-center justify-center text-orange-600 text-xs">
                        📍
                      </div>
                      <span className="text-sm font-bold text-slate-900">
                        Địa chỉ
                      </span>
                    </div>
                  </td>
                  <td className="p-4 border-l border-slate-200">
                    <p className="text-xs text-slate-600 text-center">
                      {selectedMajors[0].university?.address || "N/A"}
                    </p>
                  </td>
                  {selectedMajors[1] && (
                    <td className="p-4 border-l border-slate-200">
                      <p className="text-xs text-slate-600 text-center">
                        {selectedMajors[1].university?.address || "N/A"}
                      </p>
                    </td>
                  )}
                </tr>

                {/* Học phí trung bình */}
                <tr className="border-b border-slate-200 hover:bg-slate-50">
                  <td className="p-4 bg-slate-50">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-teal-100 rounded flex items-center justify-center text-teal-600 text-xs">
                        💳
                      </div>
                      <span className="text-sm font-bold text-slate-900">
                        Học phí trung bình
                      </span>
                    </div>
                  </td>
                  <td className="p-4 border-l border-slate-200">
                    <p className="text-xs font-bold text-slate-900 text-center">
                      {selectedMajors[0].tuitionFee
                        ? `${Math.floor(selectedMajors[0].tuitionFee / 1000000)} - ${Math.floor(selectedMajors[0].tuitionFee / 1000000) + 6} triệu VND/năm`
                        : "N/A"}
                    </p>
                  </td>
                  {selectedMajors[1] && (
                    <td className="p-4 border-l border-slate-200">
                      <p className="text-xs font-bold text-slate-900 text-center">
                        {selectedMajors[1].tuitionFee
                          ? `${Math.floor(selectedMajors[1].tuitionFee / 1000000)} - ${Math.floor(selectedMajors[1].tuitionFee / 1000000) + 6} triệu VND/năm`
                          : "N/A"}
                      </p>
                    </td>
                  )}
                </tr>

                {/* Điểm chuẩn */}
                <tr className="border-b border-slate-200 hover:bg-slate-50">
                  <td className="p-4 bg-slate-50">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-indigo-100 rounded flex items-center justify-center text-indigo-600 text-xs">
                        📊
                      </div>
                      <span className="text-sm font-bold text-slate-900">
                        Điểm chuẩn (2 năm)
                      </span>
                    </div>
                  </td>
                  <td className="p-4 border-l border-slate-200">
                    <div className="grid grid-cols-2 gap-2 text-center">
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold">
                          2023
                        </p>
                        <p className="text-xs font-bold text-slate-900">
                          {selectedMajors[0].admissionScore
                            ? `${(selectedMajors[0].admissionScore - 1.5).toFixed(1)} - ${selectedMajors[0].admissionScore.toFixed(1)}`
                            : "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold">
                          2022
                        </p>
                        <p className="text-xs font-bold text-slate-900">
                          {selectedMajors[0].admissionScore
                            ? `${(selectedMajors[0].admissionScore - 2).toFixed(1)} - ${(selectedMajors[0].admissionScore - 0.5).toFixed(1)}`
                            : "N/A"}
                        </p>
                      </div>
                    </div>
                  </td>
                  {selectedMajors[1] && (
                    <td className="p-4 border-l border-slate-200">
                      <div className="grid grid-cols-2 gap-2 text-center">
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold">
                            2023
                          </p>
                          <p className="text-xs font-bold text-slate-900">
                            {selectedMajors[1].admissionScore
                              ? `${(selectedMajors[1].admissionScore - 1.5).toFixed(1)} - ${selectedMajors[1].admissionScore.toFixed(1)}`
                              : "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold">
                            2022
                          </p>
                          <p className="text-xs font-bold text-slate-900">
                            {selectedMajors[1].admissionScore
                              ? `${(selectedMajors[1].admissionScore - 2).toFixed(1)} - ${(selectedMajors[1].admissionScore - 0.5).toFixed(1)}`
                              : "N/A"}
                          </p>
                        </div>
                      </div>
                    </td>
                  )}
                </tr>

                {/* Cơ sở vật chất */}
                <tr className="border-b border-slate-200 hover:bg-slate-50">
                  <td className="p-4 bg-slate-50">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-purple-100 rounded flex items-center justify-center text-purple-600 text-xs">
                        🏢
                      </div>
                      <span className="text-sm font-bold text-slate-900">
                        Cơ sở vật chất
                      </span>
                    </div>
                  </td>
                  <td className="p-4 border-l border-slate-200">
                    <div className="flex flex-wrap gap-1 justify-center">
                      <span className="px-2 py-1 bg-teal-50 text-teal-700 text-[10px] font-bold rounded">
                        Thư viện hiện đại
                      </span>
                      <span className="px-2 py-1 bg-blue-50 text-blue-700 text-[10px] font-bold rounded">
                        Phòng lab tốt
                      </span>
                    </div>
                  </td>
                  {selectedMajors[1] && (
                    <td className="p-4 border-l border-slate-200">
                      <div className="flex flex-wrap gap-1 justify-center">
                        <span className="px-2 py-1 bg-teal-50 text-teal-700 text-[10px] font-bold rounded">
                          Ký túc xá tốt
                        </span>
                        <span className="px-2 py-1 bg-blue-50 text-blue-700 text-[10px] font-bold rounded">
                          Sân thể thao rộng
                        </span>
                      </div>
                    </td>
                  )}
                </tr>

                {/* Xếp hạng */}
                <tr className="hover:bg-slate-50">
                  <td className="p-4 bg-slate-50">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-yellow-100 rounded flex items-center justify-center text-yellow-600 text-xs">
                        ⭐
                      </div>
                      <span className="text-sm font-bold text-slate-900">
                        Review học sinh
                      </span>
                    </div>
                  </td>
                  <td className="p-4 border-l border-slate-200">
                    <div className="text-center">
                      <div className="flex justify-center gap-1 mb-2">
                        {[...Array(5)].map((_, i) => (
                          <span
                            key={i}
                            className={
                              i < 4 ? "text-yellow-400" : "text-slate-300"
                            }
                          >
                            ★
                          </span>
                        ))}
                      </div>
                      <p className="text-[10px] text-slate-600 font-medium">
                        "Trường tốt nhưng học phí hơi cao"
                      </p>
                    </div>
                  </td>
                  {selectedMajors[1] && (
                    <td className="p-4 border-l border-slate-200">
                      <div className="text-center">
                        <div className="flex justify-center gap-1 mb-2">
                          {[...Array(5)].map((_, i) => (
                            <span
                              key={i}
                              className={
                                i < 4.5 ? "text-yellow-400" : "text-slate-300"
                              }
                            >
                              ★
                            </span>
                          ))}
                        </div>
                        <p className="text-[10px] text-slate-600 font-medium">
                          "Giáo dục tốt, khí quyển tích cực"
                        </p>
                      </div>
                    </td>
                  )}
                </tr>
              </tbody>
            </table>
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
