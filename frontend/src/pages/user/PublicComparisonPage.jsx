import { useState, useEffect, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import axiosClient from "../../api/axios";

const PublicComparisonPage = () => {
  const [searchParams] = useSearchParams();
  const [selectedMajors, setSelectedMajors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const tableRef = useRef(null);

  useEffect(() => {
    const fetchPublicData = async () => {
      try {
        const ids = searchParams.get("ids");
        if (!ids) {
          setError("Không tìm thấy dữ liệu so sánh trong liên kết.");
          setLoading(false);
          return;
        }

        const res = await axiosClient.get(`/comparison/public?ids=${ids}`);
        setSelectedMajors(res.data || []);
      } catch (err) {
        console.error("Fetch public comparison error:", err);
        setError("Có lỗi xảy ra khi tải dữ liệu so sánh.");
      } finally {
        setLoading(false);
      }
    };

    fetchPublicData();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F7FA]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-500 font-medium">
            Đang tải dữ liệu so sánh...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F7FA] px-6">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">
            Lỗi tải dữ liệu
          </h2>
          <p className="text-slate-500 mb-6">{error}</p>
          <Link
            to="/comparison"
            className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition"
          >
            Quay lại trang so sánh
          </Link>
        </div>
      </div>
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
          <span className="text-sm font-medium">Xem so sánh công khai</span>
        </div>

        {/* Title and Actions */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 mb-2">
              caZup AI - Kết quả so sánh
            </h1>
            <p className="text-xs text-slate-500 font-medium mb-2">
              Xem chi tiết so sánh các trường đại học được chia sẻ.
            </p>
          </div>
          <div className="flex items-center gap-3"></div>
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
                        {(() => {
                          const history = item.admissionHistory || [];
                          const fees = history
                            .filter((h) => h.tuitionFee)
                            .map((h) => h.tuitionFee);
                          if (fees.length === 0) return "N/A";
                          const avg =
                            fees.reduce((a, b) => a + b, 0) / fees.length;
                          return `${Math.floor(avg / 1000000)} - ${Math.floor(avg / 1000000) + 6} triệu/năm`;
                        })()}
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
                          {(() => {
                            const history = item.admissionHistory || [];
                            const fees = history
                              .filter((h) => h.tuitionFee)
                              .map((h) => h.tuitionFee);
                            if (fees.length === 0) return "N/A";
                            const avg =
                              fees.reduce((a, b) => a + b, 0) / fees.length;
                            return `${Math.floor(avg / 1000000)} - ${Math.floor(avg / 1000000) + 6} triệu VND/năm`;
                          })()}
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

        {/* Growth Hacking Banner */}
        <div className="mt-12 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h3 className="text-2xl font-black mb-2">
                Bạn muốn so sánh thêm nhiều trường khác?
              </h3>
              <p className="text-blue-100 mb-6 max-w-xl">
                Đăng ký tài khoản Miễn Phí ngay hôm nay để tự tạo bảng so sánh,
                sử dụng AI phân tích chuyên sâu và xuất PDF cho riêng bạn!
              </p>
              <Link
                to="/register"
                className="px-8 py-3 bg-white text-blue-600 font-black rounded-full hover:bg-blue-50 transition shadow-lg inline-block"
              >
                Đăng ký Miễn Phí ngay
              </Link>
            </div>
            <div className="hidden lg:block">
              <div className="w-32 h-32 bg-white/20 rounded-full blur-3xl absolute -right-10 -top-10"></div>
              <div className="w-32 h-32 bg-blue-400/30 rounded-full blur-3xl absolute -right-20 -bottom-10"></div>
            </div>
          </div>
        </div>

        {/* AI Mentor CTA */}
        <div className="mt-8 bg-slate-900 rounded-lg p-8 text-white">
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
                to="/login"
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

export default PublicComparisonPage;
