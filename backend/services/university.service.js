// services/university.service.js
// Service xử lý logic CRUD cho University

const University = require("../models/university.model");
const UniversityMajor = require("../models/universityMajor.model");
const User = require("../models/user.model");
const MbtiResult = require("../models/mbtiResult.model");
const HollandResult = require("../models/hollandResult.model");
const mongoose = require("mongoose");

const getAllUniversities = async () => {
  // Lấy tất cả các trường đại học chưa bị xóa
  return await University.find({ isDeleted: false }).sort({ createdAt: -1 });
};

const getUniversityById = async (id) => {
  // Kiểm tra if ID hợp lệ
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid university ID");
  }
  const uni = await University.findOne({ _id: id, isDeleted: false }).lean();
  if (!uni) throw new Error("University not found");

  // Lấy danh sách các ngành của trường này
  const majors = await UniversityMajor.find({
    university: id,
    isDeleted: false,
  })
    .populate("major")
    .lean();

  return { ...uni, majors };
};

const createUniversity = async (data) => {
  return await University.create(data);
};

const updateUniversity = async (id, data) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid university ID");
  }
  const uni = await University.findOneAndUpdate(
    { _id: id, isDeleted: false },
    data,
    { new: true, runValidators: true },
  );
  if (!uni) throw new Error("University not found or deleted");
  return uni;
};

const deleteUniversity = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid university ID");
  }
  // Soft delete
  const uni = await University.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { isDeleted: true, deletedAt: new Date() },
    { new: true },
  );
  if (!uni) throw new Error("University not found");
  return uni;
};

const getAllUniversityMajors = async () => {
  return await UniversityMajor.find({ isDeleted: false })
    .populate("university")
    .populate("major")
    .sort({ admissionScore: -1 });
};

const getUniversityMajorsByIds = async (ids) => {
  return await UniversityMajor.find({
    _id: { $in: ids },
    isDeleted: false,
  })
    .populate("university")
    .populate("major")
    .lean();
};

// Tính độ tương thích của ngành với tính cách người dùng (MBTI + Holland)
// personality: { mbtiType, hollandType, hollandTopTypes[] }
const computeCompatibility = (major, personality) => {
  const userMbti = personality?.mbtiType || null;
  const userHolland = personality?.hollandType || null;
  const topTypes = personality?.hollandTopTypes?.length
    ? personality.hollandTopTypes.map((t) => String(t).toUpperCase())
    : userHolland
      ? String(userHolland).toUpperCase().split("")
      : [];

  // Chưa làm bài test => không có dữ liệu để tính
  if (!userMbti && !topTypes.length) return null;

  const majorMbti = major.mbtiTypes || [];
  const majorHolland = (major.hollandTypes || []).map((h) =>
    String(h).toUpperCase(),
  );

  let score = 55; // điểm nền
  let mbtiMatch = false;
  let hollandMatch = 0;

  if (userMbti && majorMbti.includes(userMbti)) {
    score += 22;
    mbtiMatch = true;
  }

  if (topTypes.length) {
    const overlap = majorHolland.filter((h) => topTypes.includes(h));
    hollandMatch = overlap.length;
    score += Math.min(21, overlap.length * 8);
  }

  score = Math.max(40, Math.min(98, score));

  // Sinh câu nhận xét ngắn gọn
  const hollandLabel = topTypes.join("");
  const parts = [];
  if (userMbti) parts.push(`nhóm tính cách ${userMbti}`);
  if (hollandLabel) parts.push(`xu hướng Holland ${hollandLabel}`);
  const traitText = parts.join(" và ");
  const fitText =
    score >= 85 ? "rất phù hợp" : score >= 70 ? "phù hợp" : "có thể cân nhắc";
  const reason = `Với ${traitText}, ngành ${major.name} được đánh giá ${fitText} — giúp bạn phát huy tối đa thế mạnh của bản thân.`;

  return {
    score,
    mbtiMatch,
    hollandMatch,
    mbtiType: userMbti,
    hollandType: hollandLabel || null,
    reason,
  };
};

// Chi tiết 1 ngành tại 1 trường (UniversityMajor) + độ tương thích + trường khác cùng ngành
const getUniversityMajorDetail = async (umId, userId) => {
  if (!mongoose.Types.ObjectId.isValid(umId)) {
    throw new Error("Invalid ID");
  }

  const um = await UniversityMajor.findOne({ _id: umId, isDeleted: false })
    .populate("university")
    .populate("major")
    .lean();

  if (!um || !um.university || !um.major) {
    throw new Error("Không tìm thấy ngành học tại trường này");
  }

  // Các trường khác cũng đào tạo ngành này (để tham khảo / so sánh)
  const otherUniversities = await UniversityMajor.find({
    major: um.major._id,
    _id: { $ne: um._id },
    isDeleted: false,
  })
    .populate("university")
    .sort({ admissionScore: -1 })
    .limit(6)
    .lean();

  // Độ tương thích với tính cách người dùng (nếu đã đăng nhập & có kết quả test)
  // Ưu tiên kết quả test mới nhất (MbtiResult/HollandResult), fallback về careerPath
  let compatibility = null;
  if (userId) {
    const [mbtiRes, hollandRes, user] = await Promise.all([
      MbtiResult.findOne({ user: userId })
        .sort({ createdAt: -1 })
        .select("mbtiType")
        .lean(),
      HollandResult.findOne({ user: userId })
        .sort({ createdAt: -1 })
        .select("hollandType topTypes")
        .lean(),
      User.findById(userId).select("careerPath").lean(),
    ]);

    const personality = {
      mbtiType: mbtiRes?.mbtiType || user?.careerPath?.mbtiType || null,
      hollandType: hollandRes?.hollandType || user?.careerPath?.hollandType || null,
      hollandTopTypes: hollandRes?.topTypes || [],
    };
    compatibility = computeCompatibility(um.major, personality);
  }

  return {
    ...um,
    otherUniversities: otherUniversities.filter((o) => o.university),
    compatibility,
  };
};

module.exports = {
  getAllUniversities,
  getUniversityById,
  createUniversity,
  updateUniversity,
  deleteUniversity,
  getAllUniversityMajors,
  getUniversityMajorsByIds,
  getUniversityMajorDetail,
};
