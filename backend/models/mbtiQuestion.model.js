// models/mbtiQuestion.model.js
// Mô hình lưu trữ câu hỏi cho bài test MBTI

const mongoose = require('mongoose');

const mbtiQuestionSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    
    // dimension là 1 trong 4 cặp: 'EI' (Extroversion - Introversion), 'SN' (Sensing - iNtuition),
    // 'TF' (Thinking - Feeling), 'JP' (Judging - Perceiving)
    dimension: { type: String, enum: ['EI', 'SN', 'TF', 'JP'], required: true },
    
    // Mỗi câu hỏi thường sẽ có 2 lựa chọn A và B, với điểm nghiêng về một cực nào đó
    // Ví dụ 'EI', nếu chọn optionA -> điểm E, chọn optionB -> điểm I
    optionA: {
      text: { type: String, required: true },
      typeValue: { type: String, required: true } // Vd: 'E'
    },
    optionB: {
      text: { type: String, required: true },
      typeValue: { type: String, required: true } // Vd: 'I'
    },
    
    // Soft delete
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('MbtiQuestion', mbtiQuestionSchema);
