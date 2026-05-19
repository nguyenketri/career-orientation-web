// data/seed/seed.mbtiQuestions.js
// Script tạo dữ liệu câu hỏi MBTI

require('dotenv').config({ path: '../../.env' });
const mongoose = require('mongoose');
const MbtiQuestion = require('../../models/mbtiQuestion.model');

const mbtiQuestions = [
  // Hướng ngoại (E) vs Hướng nội (I)
  {
    question: 'Khi tham gia một buổi tiệc, bạn thường...',
    dimension: 'EI',
    optionA: { text: 'Nói chuyện với nhiều người, kể cả người lạ', typeValue: 'E' },
    optionB: { text: 'Chỉ trò chuyện với một vài người quen thân', typeValue: 'I' }
  },
  {
    question: 'Bạn cảm thấy tràn đầy năng lượng khi...',
    dimension: 'EI',
    optionA: { text: 'Được làm việc hoặc vui chơi trong nhóm đông người', typeValue: 'E' },
    optionB: { text: 'Được ở một mình để thư giãn và suy ngẫm', typeValue: 'I' }
  },
  {
    question: 'Bạn thường tự nhận mình là người...',
    dimension: 'EI',
    optionA: { text: 'Dễ gần, cởi mở và thích trò chuyện', typeValue: 'E' },
    optionB: { text: 'Kín đáo, trầm cẩn và thích lắng nghe', typeValue: 'I' }
  },
  {
    question: 'Trong các cuộc họp hoặc thảo luận, bạn thường...',
    dimension: 'EI',
    optionA: { text: 'Phát biểu ý kiến ngay lập tức', typeValue: 'E' },
    optionB: { text: 'Suy nghĩ kỹ rồi mới nói', typeValue: 'I' }
  },
  {
    question: 'Khi rảnh rỗi, bạn thích...',
    dimension: 'EI',
    optionA: { text: 'Gọi điện, nhắn tin rủ bạn bè đi chơi', typeValue: 'E' },
    optionB: { text: 'Ở nhà đọc sách, xem phim một mình', typeValue: 'I' }
  },
  {
    question: 'Bạn thích môi trường làm việc...',
    dimension: 'EI',
    optionA: { text: 'Năng động, nhộn nhịp, nhiều tương tác', typeValue: 'E' },
    optionB: { text: 'Yên tĩnh, riêng tư, ít bị làm phiền', typeValue: 'I' }
  },
  {
    question: 'Sau một tuần làm việc căng thẳng, cuối tuần bạn muốn...',
    dimension: 'EI',
    optionA: { text: 'Ra ngoài mua sắm, gặp gỡ hội nhóm', typeValue: 'E' },
    optionB: { text: 'Nghỉ ngơi tĩnh lặng để sạc lại năng lượng', typeValue: 'I' }
  },

  // Giác quan (S) vs Trực giác (N)
  {
    question: 'Khi tiếp nhận thông tin mới, bạn quan tâm nhiều hơn đến...',
    dimension: 'SN',
    optionA: { text: 'Sự thật, dữ liệu cụ thể và chi tiết', typeValue: 'S' },
    optionB: { text: 'Ý tưởng, khái niệm và bức tranh tổng thể', typeValue: 'N' }
  },
  {
    question: 'Bạn thích làm việc với...',
    dimension: 'SN',
    optionA: { text: 'Những gì đang xảy ra ở hiện tại và có thể ứng dụng ngay', typeValue: 'S' },
    optionB: { text: 'Những gì có thể xảy ra trong tương lai và mang tính đổi mới', typeValue: 'N' }
  },
  {
    question: 'Bạn thường bị thu hút bởi...',
    dimension: 'SN',
    optionA: { text: 'Sự thực tế và logic rõ ràng', typeValue: 'S' },
    optionB: { text: 'Sự tưởng tượng và sáng tạo', typeValue: 'N' }
  },
  {
    question: 'Khi giải quyết vấn đề, bạn thường...',
    dimension: 'SN',
    optionA: { text: 'Dựa vào kinh nghiệm đã có và các phương pháp chuẩn', typeValue: 'S' },
    optionB: { text: 'Tìm kiếm những hướng đi mới, giải pháp độ phá', typeValue: 'N' }
  },
  {
    question: 'Trong mô tả một sự vật, bạn sẽ...',
    dimension: 'SN',
    optionA: { text: 'Trình bày chính xác, mạch lạc từng chi tiết', typeValue: 'S' },
    optionB: { text: 'Sử dụng hình ảnh ẩn dụ, khái quát', typeValue: 'N' }
  },
  {
    question: 'Bạn cảm thấy thoải mái hơn khi...',
    dimension: 'SN',
    optionA: { text: 'Làm những việc quen thuộc, cầm nắm được', typeValue: 'S' },
    optionB: { text: 'Khám phá những lý thuyết, ẩn ý sâu xa', typeValue: 'N' }
  },
  {
    question: 'Người khác thường nhận xét bạn là...',
    dimension: 'SN',
    optionA: { text: 'Người thực tế, nhạy bén', typeValue: 'S' },
    optionB: { text: 'Người mơ mộng, giàu trí tưởng tượng', typeValue: 'N' }
  },

  // Lý trí (T) vs Tình cảm (F)
  {
    question: 'Khi đưa ra quyết định quan trọng, bạn thường dựa vào...',
    dimension: 'TF',
    optionA: { text: 'Sự phân tích logic, công bằng, khách quan', typeValue: 'T' },
    optionB: { text: 'Cảm xúc cá nhân và ảnh hưởng đến người khác', typeValue: 'F' }
  },
  {
    question: 'Bạn cho rằng điều gì quan trọng hơn?',
    dimension: 'TF',
    optionA: { text: 'Tính nhất quán và sự công bằng', typeValue: 'T' },
    optionB: { text: 'Sự đồng cảm và lòng tốt', typeValue: 'F' }
  },
  {
    question: 'Trong một cuộc tranh luận, bạn muốn...',
    dimension: 'TF',
    optionA: { text: 'Tìm ra sự thật, dù người khác có mếch lòng', typeValue: 'T' },
    optionB: { text: 'Giữ hòa khí và không làm tổn thương ai', typeValue: 'F' }
  },
  {
    question: 'Bạn có xu hướng đánh giá người khác qua...',
    dimension: 'TF',
    optionA: { text: 'Năng lực và kết quả công việc', typeValue: 'T' },
    optionB: { text: 'Thái độ và sự nỗ lực của họ', typeValue: 'F' }
  },
  {
    question: 'Nếu phải phê bình một người sai lầm, bạn sẽ...',
    dimension: 'TF',
    optionA: { text: 'Chỉ rỏ thẳng thắn vào vấn đề cốt lõi', typeValue: 'T' },
    optionB: { text: 'Tìm cách nói nhẹ nhàng, khéo léo để họ không buồn', typeValue: 'F' }
  },
  {
    question: 'Bạn tự thấy mình là người...',
    dimension: 'TF',
    optionA: { text: 'Lý trí, cái đầu lạnh', typeValue: 'T' },
    optionB: { text: 'Tình cảm, trái tim nóng', typeValue: 'F' }
  },
  {
    question: 'Động lực làm việc lớn nhất của bạn là...',
    dimension: 'TF',
    optionA: { text: 'Hoàn thành xuất sắc nhiệm vụ, đạt thành tích', typeValue: 'T' },
    optionB: { text: 'Được ghi nhận, được làm việc trong môi trường yêu thương', typeValue: 'F' }
  },

  // Nguyên tắc (J) vs Linh hoạt (P)
  {
    question: 'Trong cuộc sống hàng ngày, bạn thích...',
    dimension: 'JP',
    optionA: { text: 'Mọi thứ được lên kế hoạch và có tổ chức rõ ràng', typeValue: 'J' },
    optionB: { text: 'Sự tự do, linh hoạt và ứng biến theo hoàng cảnh', typeValue: 'P' }
  },
  {
    question: 'Trước một chuyến du lịch, bạn sẽ...',
    dimension: 'JP',
    optionA: { text: 'Đặt trước vé, khách sạn, lập lịch trình chi tiết từng ngày', typeValue: 'J' },
    optionB: { text: 'Chỉ chọn điểm đến, đến đó rồi tính tiếp', typeValue: 'P' }
  },
  {
    question: 'Bàn làm việc hoặc không gian sống của bạn...',
    dimension: 'JP',
    optionA: { text: 'Thường rất ngăn nắp, gọn gàng', typeValue: 'J' },
    optionB: { text: 'Thường khá bừa bộn nhưng bạn biết đồ đạc để đâu', typeValue: 'P' }
  },
  {
    question: 'Khi làm việc, bạn...',
    dimension: 'JP',
    optionA: { text: 'Muốn hoàn thành dứt điểm từng việc một', typeValue: 'J' },
    optionB: { text: 'Thường xen kẽ nhiều việc cùng lúc và thích deadline gấp', typeValue: 'P' }
  },
  {
    question: 'Quy định và luật lệ đối với bạn là...',
    dimension: 'JP',
    optionA: { text: 'Những thứ cần tuân thủ nghiêm ngặt để tạo trật tự', typeValue: 'J' },
    optionB: { text: 'Những hướng dẫn mềm dẻo có thể thay đổi tùy tình hình', typeValue: 'P' }
  },
  {
    question: 'Cảm giác của bạn khi một kế hoạch bị thay đổi bất ngờ là...',
    dimension: 'JP',
    optionA: { text: 'Khó chịu và cần thời gian để sắp xếp lại', typeValue: 'J' },
    optionB: { text: 'Hào hứng vì có sự mới mẻ, dễ dàng thích nghi', typeValue: 'P' }
  },
  {
    question: 'Bạn cảm thấy thoải mái với...',
    dimension: 'JP',
    optionA: { text: 'Sự chắc chắn, quyết định rõ ràng', typeValue: 'J' },
    optionB: { text: 'Sự lựa chọn mở, tìm hiểu thêm thông tin', typeValue: 'P' }
  }
];

const seedMbtiQuestions = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/cazup';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Xóa dữ liệu cũ
    await MbtiQuestion.deleteMany({});
    console.log('Cleared MBTI questions');

    // Chèn dữ liệu mới
    await MbtiQuestion.insertMany(mbtiQuestions);
    console.log(`Successfully seeded ${mbtiQuestions.length} MBTI questions`);
    
    mongoose.disconnect();
  } catch (error) {
    console.error('Error seeding MBTI questions:', error);
    process.exit(1);
  }
};

seedMbtiQuestions();
