// models/mbtiQuestion.model.js
// Mô hình lưu trữ câu hỏi cho bài test MBTI

const mongoose = require('mongoose');

// Mỗi dimension chỉ có đúng 2 giá trị hợp lệ — optionA/optionB.typeValue
// phải là chính 2 giá trị này (không trùng nhau) thì bài test mới chấm điểm đúng.
const DIMENSION_PAIRS = {
  EI: ['E', 'I'],
  SN: ['S', 'N'],
  TF: ['T', 'F'],
  JP: ['J', 'P'],
};

const mbtiQuestionSchema = new mongoose.Schema(
  {
    question: { type: String, required: true, trim: true },

    // dimension là 1 trong 4 cặp: 'EI' (Extroversion - Introversion), 'SN' (Sensing - iNtuition),
    // 'TF' (Thinking - Feeling), 'JP' (Judging - Perceiving)
    dimension: { type: String, enum: ['EI', 'SN', 'TF', 'JP'], required: true },

    // Mỗi câu hỏi thường sẽ có 2 lựa chọn A và B, với điểm nghiêng về một cực nào đó
    // Ví dụ 'EI', nếu chọn optionA -> điểm E, chọn optionB -> điểm I
    optionA: {
      text: { type: String, required: true, trim: true },
      typeValue: {
        type: String,
        required: true,
        enum: ['E', 'I', 'S', 'N', 'T', 'F', 'J', 'P'],
      },
    },
    optionB: {
      text: { type: String, required: true, trim: true },
      typeValue: {
        type: String,
        required: true,
        enum: ['E', 'I', 'S', 'N', 'T', 'F', 'J', 'P'],
      },
    },

    // Câu hỏi có đang được đưa vào bài test cho người dùng hay không —
    // cho phép admin tạm ẩn 1 câu lỗi mà không phải xóa (mất lịch sử/số liệu)
    isActive: { type: Boolean, default: true },

    // Soft delete
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Đảm bảo optionA/optionB.typeValue luôn đúng là 2 giá trị của dimension đã chọn —
// nếu không, kết quả chấm điểm MBTI sẽ âm thầm bỏ qua câu hỏi này (không báo lỗi ở đâu cả)
mbtiQuestionSchema.pre('validate', function () {
  const pair = DIMENSION_PAIRS[this.dimension];
  if (!pair) return;

  const a = this.optionA?.typeValue;
  const b = this.optionB?.typeValue;
  const valid =
    a && b && a !== b && pair.includes(a) && pair.includes(b);

  if (!valid) {
    throw new Error(
      `Với dimension '${this.dimension}', optionA và optionB phải nhận đúng 2 giá trị '${pair[0]}' và '${pair[1]}' (mỗi giá trị 1 lần).`,
    );
  }
});

module.exports = mongoose.model('MbtiQuestion', mbtiQuestionSchema);
module.exports.DIMENSION_PAIRS = DIMENSION_PAIRS;
