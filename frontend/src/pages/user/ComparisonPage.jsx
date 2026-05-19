import { useState, useEffect } from "react";
import { getAllUniversityMajors } from "../../services/universityService";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import SkeletonLoader from "../../components/SkeletonLoader";

const ComparisonPage = () => {
  const [allMajors, setAllMajors] = useState([]);
  const [selectedMajors, setSelectedMajors] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getAllUniversityMajors();
        setAllMajors(res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredMajors = allMajors.filter(item => 
    (item.major?.name + item.university?.name).toLowerCase().includes(searchTerm.toLowerCase()) &&
    !selectedMajors.find(selected => selected._id === item._id)
  );

  const handleSelect = (item) => {
    if (selectedMajors.length >= 3) {
      alert("Bạn chỉ có thể so sánh tối đa 3 ngành cùng lúc.");
      return;
    }
    setSelectedMajors([...selectedMajors, item]);
    setSearchTerm("");
  };

  const handleRemove = (id) => {
    setSelectedMajors(selectedMajors.filter(item => item._id !== id));
  };

  return (
    <div className="min-h-screen bg-black px-6 py-20 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-between mb-10">
          <button onClick={() => navigate(-1)} className="hover:text-purple-400 transition">← Trở về</button>
          <h1 className="text-4xl font-bold">So Sánh Ngành & Trường</h1>
        </div>

        {/* Search & Select */}
        <div className="relative mb-12">
          {loading ? (
            <div className="h-14 w-full bg-white/5 border border-white/10 rounded-2xl animate-pulse"></div>
          ) : (
            <input 
              type="text"
              placeholder="Tìm kiếm ngành hoặc trường để so sánh..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-purple-500 transition"
            />
          )}
          
          <AnimatePresence>
            {searchTerm && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute top-full left-0 w-full mt-2 bg-gray-900 border border-white/10 rounded-2xl overflow-hidden z-50 shadow-2xl max-h-60 overflow-y-auto"
              >
                {filteredMajors.length > 0 ? filteredMajors.map(item => (
                  <div 
                    key={item._id}
                    onClick={() => handleSelect(item)}
                    className="p-4 hover:bg-white/10 cursor-pointer border-b border-white/5 last:border-0"
                  >
                    <div className="font-bold">{item.major?.name}</div>
                    <div className="text-sm text-gray-400">{item.university?.name}</div>
                  </div>
                )) : (
                  <div className="p-4 text-gray-500 text-center">Không tìm thấy kết quả</div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Comparison Table */}
        {selectedMajors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {selectedMajors.map((item) => (
              <motion.div 
                key={item._id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white/5 border border-white/10 rounded-3xl p-8 relative"
              >
                <button 
                  onClick={() => handleRemove(item._id)}
                  className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition"
                >
                  ✕
                </button>

                <div className="mb-8">
                  <h3 className="text-2xl font-bold mb-2">{item.major?.name}</h3>
                  <p className="text-purple-400 font-medium">{item.university?.name}</p>
                </div>

                <div className="space-y-6">
                  <div className="pb-4 border-b border-white/5">
                    <p className="text-gray-500 text-sm mb-1">Điểm Chuẩn (2024)</p>
                    <p className="text-2xl font-bold">{item.admissionScore}</p>
                  </div>
                  
                  <div className="pb-4 border-b border-white/5">
                    <p className="text-gray-500 text-sm mb-1">Tổ Hợp Xét Tuyển</p>
                    <p className="text-xl font-semibold text-blue-400">{item.subjectCombination}</p>
                  </div>

                  <div className="pb-4 border-b border-white/5">
                    <p className="text-gray-500 text-sm mb-1">Học Phí Ước Tính / Năm</p>
                    <p className="text-xl font-semibold">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.tuitionFee)}
                    </p>
                  </div>

                  <div>
                     <p className="text-gray-500 text-sm mb-1">Lĩnh Vực</p>
                     <p className="px-3 py-1 bg-white/5 rounded-lg inline-block text-sm">
                        {item.major?.hollandTypes?.join(", ") || "Đang cập nhật"}
                     </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 border-2 border-dashed border-white/10 rounded-3xl">
            <p className="text-gray-500 text-lg">Chọn ít nhất một ngành để bắt đầu so sánh</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ComparisonPage;
