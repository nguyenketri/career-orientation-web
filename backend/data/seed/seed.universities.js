// data/seed/seed.universities.js
// Script tạo dữ liệu các trường đại học thực tế

require('dotenv').config({ path: '../../.env' });
const mongoose = require('mongoose');
const University = require('../../models/university.model');

const universities = [
  { name: 'Đại học Quốc gia Hà Nội', address: '144 Xuân Thủy, Cầu Giấy, Hà Nội', type: 'Public', website: 'https://vnu.edu.vn' },
  { name: 'Đại học Bách khoa Hà Nội', address: 'Số 1 Đại Cồ Việt, Hai Bà Trưng, Hà Nội', type: 'Public', website: 'https://hust.edu.vn' },
  { name: 'Đại học Kinh tế Quốc dân', address: '207 Giải Phóng, Đồng Tâm, Hai Bà Trưng, Hà Nội', type: 'Public', website: 'https://neu.edu.vn' },
  { name: 'Đại học Ngoại thương', address: '91 Chùa Láng, Láng Thượng, Đống Đa, Hà Nội', type: 'Public', website: 'https://ftu.edu.vn' },
  { name: 'Đại học Y Hà Nội', address: '1 Tôn Thất Tùng, Kim Liên, Đống Đa, Hà Nội', type: 'Public', website: 'https://hmu.edu.vn' },
  { name: 'Học viện Bưu chính Viễn thông', address: '122 Hoàng Quốc Việt, Cầu Giấy, Hà Nội', type: 'Public', website: 'https://ptit.edu.vn' },
  { name: 'Học viện Tài chính', address: '58 Lê Văn Hiến, Đức Thắng, Bắc Từ Liêm, Hà Nội', type: 'Public', website: 'https://hvtc.edu.vn' },
  { name: 'Học viện Ngân hàng', address: '12 Chùa Bộc, Quang Trung, Đống Đa, Hà Nội', type: 'Public', website: 'https://hvnh.edu.vn' },
  { name: 'Đại học Công nghệ - ĐHQGHN', address: '144 Xuân Thủy, Cầu Giấy, Hà Nội', type: 'Public', website: 'https://uet.vnu.edu.vn' },
  { name: 'Đại học FPT', address: 'Khu công nghệ cao Hòa Lạc, Thạch Thất, Hà Nội', type: 'Private', website: 'https://fpt.edu.vn' },
  
  // Miền Nam
  { name: 'Đại học Quốc gia TP.HCM', address: 'Khu đô thị ĐHQG, Linh Trung, Thủ Đức, TP.HCM', type: 'Public', website: 'https://vnuhcm.edu.vn' },
  { name: 'Đại học Bách khoa - ĐHQG TP.HCM', address: '268 Lý Thường Kiệt, P. 14, Q. 10, TP.HCM', type: 'Public', website: 'https://hcmut.edu.vn' },
  { name: 'Đại học Kinh tế TP.HCM (UEH)', address: '59C Nguyễn Đình Chiểu, P. 6, Q. 3, TP.HCM', type: 'Public', website: 'https://ueh.edu.vn' },
  { name: 'Đại học Tài chính - Marketing', address: '778 Nguyễn Kiệm, P. 4, Phú Nhuận, TP.HCM', type: 'Public', website: 'https://ufm.edu.vn' },
  { name: 'Đại học RMIT Việt Nam', address: '702 Nguyễn Văn Linh, Tân Hưng, Q. 7, TP.HCM', type: 'Private', website: 'https://rmit.edu.vn' },
  { name: 'Đại học Sư phạm Kỹ thuật TP.HCM', address: '1 Võ Văn Ngân, Linh Chiểu, Thủ Đức, TP.HCM', type: 'Public', website: 'https://hcmute.edu.vn' },
  { name: 'Đại học Y Dược TP.HCM', address: '217 Hồng Bàng, P. 11, Q. 5, TP.HCM', type: 'Public', website: 'https://ump.edu.vn' },
  { name: 'Đại học Tôn Đức Thắng', address: '19 Nguyễn Hữu Thọ, Tân Phong, Q. 7, TP.HCM', type: 'Public', website: 'https://tdtu.edu.vn' },
  { name: 'Đại học Nguyễn Tất Thành', address: '300A Nguyễn Tất Thành, P. 13, Q. 4, TP.HCM', type: 'Private', website: 'https://ntt.edu.vn' },
  { name: 'Đại học Kinh tế - Luật (UEL)', address: 'Khu đô thị ĐHQG, Linh Trung, Thủ Đức, TP.HCM', type: 'Public', website: 'https://uel.edu.vn' }
];

const seedUniversities = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/cazup';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Clear existing data
    await University.deleteMany({});
    console.log('Cleared universities');

    // Insert new data
    await University.insertMany(universities);
    console.log(`Successfully seeded ${universities.length} universities`);
    
    mongoose.disconnect();
  } catch (error) {
    console.error('Error seeding universities:', error);
    process.exit(1);
  }
};

seedUniversities();
