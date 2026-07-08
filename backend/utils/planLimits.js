// Số lượng ngành/trường gợi ý theo kết quả trắc nghiệm MBTI/Holland, tính theo
// gói thuê bao HIỆN TẠI của user (không phải gói tại thời điểm làm bài) — nhờ
// vậy khi user nâng cấp gói, các bài test cũ cũng lập tức mở khoá thêm gợi ý.
const MAJOR_SUGGESTION_LIMITS = {
  FREE: 0,
  PAID: 6,
  PREMIUM: Infinity,
};

const limitMajorsByPlan = (majors, plan) => {
  const limit = MAJOR_SUGGESTION_LIMITS[plan] ?? 0;
  if (!Array.isArray(majors) || limit === Infinity) return majors || [];
  return majors.slice(0, limit);
};

module.exports = { MAJOR_SUGGESTION_LIMITS, limitMajorsByPlan };
