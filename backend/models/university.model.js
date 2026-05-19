// models/university.model.js
// Mô hình đại diện cho một trường đại học
// Lưu thông tin cơ bản: tên, địa chỉ, loại (công lập / tư thục), website

const mongoose = require('mongoose');

const universitySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true }, // Tên trường
    address: { type: String, required: true }, // Địa chỉ đầy đủ
    type: { type: String, enum: ['Public', 'Private'], required: true }, // Loại trường
    website: { type: String }, // URL website
    // Soft delete fields
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('University', universitySchema);
