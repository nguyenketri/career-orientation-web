// data/seed/seed.hollandQuestions.js
// Script tạo dữ liệu 42 câu hỏi Holland phân loại RIASEC

require('dotenv').config({ path: '../../.env' });
const mongoose = require('mongoose');
const HollandQuestion = require('../../models/hollandQuestion.model');

const hollandQuestions = [
  // R - Realistic (Thực tế)
  { content: 'Tôi thích sửa chữa các thiết bị điện, điện tử.', type: 'R' },
  { content: 'Tôi thích làm vườn, trồng cây.', type: 'R' },
  { content: 'Tôi thích làm việc ngoài trời thay vì ngồi văn phòng.', type: 'R' },
  { content: 'Tôi thích tự tay lắp ráp các đồ nội thất hoặc thiết bị.', type: 'R' },
  { content: 'Tôi thích tham gia các hoạt động thể thao đòi hỏi thể lực.', type: 'R' },
  { content: 'Tôi thích giải quyết các vấn đề thực tế bằng công cụ, máy móc.', type: 'R' },
  { content: 'Tôi thích tìm hiểu về cách hoạt động của các loại động cơ.', type: 'R' },

  // I - Investigative (Nghiên cứu)
  { content: 'Tôi thích đọc sách khoa học, kỹ thuật.', type: 'I' },
  { content: 'Tôi muốn tìm hiểu sâu về nguyên nhân của các hiện tượng tự nhiên.', type: 'I' },
  { content: 'Tôi thích thực hiện các thí nghiệm trong phòng lab.', type: 'I' },
  { content: 'Tôi thích phân tích số liệu và giải các bài toán khó.', type: 'I' },
  { content: 'Tôi muốn làm nghiên cứu sinh hoặc nhà khoa học.', type: 'I' },
  { content: 'Tôi luôn tò mò và đặt câu hỏi "Tại sao?" cho mọi thứ.', type: 'I' },
  { content: 'Tôi thích làm việc độc lập để suy nghĩ và giải quyết vấn đề.', type: 'I' },

  // A - Artistic (Nghệ thuật)
  { content: 'Tôi thích vẽ, thiết kế hoặc trang trí nội thất.', type: 'A' },
  { content: 'Tôi thích chơi một loại nhạc cụ hoặc ca hát.', type: 'A' },
  { content: 'Tôi có khả năng tự sáng tác những câu chuyện hoặc làm thơ.', type: 'A' },
  { content: 'Tôi thích xem các buổi biểu diễn kịch, hòa nhạc hoặc triển lãm tranh.', type: 'A' },
  { content: 'Tôi có trí tưởng tượng phong phú và thích các công việc sáng tạo.', type: 'A' },
  { content: 'Tôi thích thể hiện cảm xúc và suy nghĩ thông qua nghệ thuật.', type: 'A' },
  { content: 'Tôi không thích những công việc rập khuôn, gò bó.', type: 'A' },

  // S - Social (Xã hội)
  { content: 'Tôi rất thích giúp đỡ người khác giải quyết vấn đề của họ.', type: 'S' },
  { content: 'Tôi thích tham gia hoạt động tình nguyện hoặc từ thiện.', type: 'S' },
  { content: 'Tôi có khả năng lắng nghe và đồng cảm với người khác.', type: 'S' },
  { content: 'Tôi thích dạy dỗ, hướng dẫn người khác học một kỹ năng mới.', type: 'S' },
  { content: 'Tôi cảm thấy vui vẻ khi được giao tiếp và làm việc với nhiều người.', type: 'S' },
  { content: 'Tôi muốn trở thành bác sĩ tâm lý, giáo viên hoặc nhân viên xã hội.', type: 'S' },
  { content: 'Tôi giỏi trong việc hòa giải các xung đột trong tập thể.', type: 'S' },

  // E - Enterprising (Kinh doanh)
  { content: 'Tôi thích tham gia thuyết trình và nói trước đám đông.', type: 'E' },
  { content: 'Tôi thích lãnh đạo một nhóm hoặc tổ chức một dự án.', type: 'E' },
  { content: 'Tôi quan tâm đến các vấn đề kinh doanh, buôn bán.', type: 'E' },
  { content: 'Tôi có khả năng thuyết phục người khác đồng ý với ý kiến của mình.', type: 'E' },
  { content: 'Tôi mong muốn trở thành giám đốc hoặc doanh nhân.', type: 'E' },
  { content: 'Tôi có tính cạnh tranh cao và thích thử thách để đạt mục tiêu.', type: 'E' },
  { content: 'Tôi thích tranh luận và bảo vệ quan điểm của mình.', type: 'E' },

  // C - Conventional (Hành chính/Lưu trữ)
  { content: 'Tôi thích sắp xếp tài liệu, hồ sơ một cách gọn gàng, ngăn nắp.', type: 'C' },
  { content: 'Tôi có khả năng ghi chép chính xác và làm việc với các con số.', type: 'C' },
  { content: 'Tôi thích những công việc có quy trình và luật lệ rõ ràng.', type: 'C' },
  { content: 'Tôi luôn kiểm tra cẩn thận lỗi chính tả, lỗi tính toán.', type: 'C' },
  { content: 'Tôi thích làm việc với các bảng tính Excel tĩnh toán số liệu.', type: 'C' },
  { content: 'Tôi quản lý tiền bạc và chi tiêu cá nhân rất hợp lý.', type: 'C' },
  { content: 'Tôi cảm thấy lúng túng khi phải làm việc không có kế hoạch trước.', type: 'C' }
];

const seedHollandQuestions = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/cazup';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Xóa dữ liệu cũ
    await HollandQuestion.deleteMany({});
    console.log('Cleared Holland questions');

    // Chèn dữ liệu mới
    await HollandQuestion.insertMany(hollandQuestions);
    console.log(`Successfully seeded ${hollandQuestions.length} Holland questions`);
    
    mongoose.disconnect();
  } catch (error) {
    console.error('Error seeding Holland questions:', error);
    process.exit(1);
  }
};

seedHollandQuestions();
