// services/university.service.js
// Service xử lý logic CRUD cho University

const University = require("../models/university.model");
const UniversityMajor = require("../models/universityMajor.model");
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

module.exports = {
  getAllUniversities,
  getUniversityById,
  createUniversity,
  updateUniversity,
  deleteUniversity,
  getAllUniversityMajors,
  getUniversityMajorsByIds,
};
