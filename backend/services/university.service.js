// services/university.service.js
// Service xử lý logic CRUD cho University

const University = require('../models/university.model');
const mongoose = require('mongoose');

const getAllUniversities = async () => {
  // Lấy tất cả các trường đại học chưa bị xóa
  return await University.find({ isDeleted: false }).sort({ createdAt: -1 });
};

const getUniversityById = async (id) => {
  // Kiểm tra if ID hợp lệ
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error('Invalid university ID');
  }
  const uni = await University.findOne({ _id: id, isDeleted: false });
  if (!uni) throw new Error('University not found');
  return uni;
};

const createUniversity = async (data) => {
  return await University.create(data);
};

const updateUniversity = async (id, data) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error('Invalid university ID');
  }
  const uni = await University.findOneAndUpdate(
    { _id: id, isDeleted: false },
    data,
    { new: true, runValidators: true }
  );
  if (!uni) throw new Error('University not found or deleted');
  return uni;
};

const deleteUniversity = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error('Invalid university ID');
  }
  // Soft delete
  const uni = await University.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { isDeleted: true, deletedAt: new Date() },
    { new: true }
  );
  if (!uni) throw new Error('University not found');
  return uni;
};

module.exports = {
  getAllUniversities,
  getUniversityById,
  createUniversity,
  updateUniversity,
  deleteUniversity,
};
