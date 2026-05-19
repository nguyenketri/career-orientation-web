// data/seed/seed.majors.js
// Script tạo dữ liệu các ngành học (majors) phổ biến và liên kết với trường đại học

require('dotenv').config({ path: '../../.env' });
const mongoose = require('mongoose');
const Major = require('../../models/major.model');
const University = require('../../models/university.model');
const UniversityMajor = require('../../models/universityMajor.model');

const majorData = [
  // Khối Kỹ Thuật & Công Nghệ
  {
    name: 'Công nghệ Thông tin',
    description: 'Chuyên nghiên cứu phần mềm, mạng máy tính và hệ thống thông tin.',
    benchmarkScore: 26.5,
    hollandTypes: ['I', 'R', 'C'],
    mbtiTypes: ['INTJ', 'INTP', 'ISTJ'],
    subjectCombinations: ['A00', 'A01'],
    tuitionFee: 30000000
  },
  {
    name: 'Kỹ thuật Cơ điện tử',
    description: 'Kết hợp cơ khí, điện tử và khoa học máy tính.',
    benchmarkScore: 24.5,
    hollandTypes: ['R', 'I'],
    mbtiTypes: ['ISTP', 'ISTJ', 'ESTP'],
    subjectCombinations: ['A00', 'A01'],
    tuitionFee: 25000000
  },
  
  // Khối Kinh Tế & Quản Trị
  {
    name: 'Quản trị Kinh doanh',
    description: 'Đào tạo kiến thức quản lý, điều hành doanh nghiệp.',
    benchmarkScore: 25.0,
    hollandTypes: ['E', 'S', 'C'],
    mbtiTypes: ['ENTJ', 'ESTJ', 'ENFJ'],
    subjectCombinations: ['A00', 'A01', 'D01'],
    tuitionFee: 28000000
  },
  {
    name: 'Tài chính - Ngân hàng',
    description: 'Quản lý tài chính, phân tích đầu tư và hoạt động ngân hàng.',
    benchmarkScore: 26.0,
    hollandTypes: ['C', 'E', 'I'],
    mbtiTypes: ['ISTJ', 'ESTJ', 'INTJ'],
    subjectCombinations: ['A00', 'A01', 'D01'],
    tuitionFee: 27000000
  },
  
  // Khối Xã Hội & Nhân Văn
  {
    name: 'Tâm lý học',
    description: 'Nghiên cứu về tâm trí và hành vi con người.',
    benchmarkScore: 24.0,
    hollandTypes: ['S', 'I', 'A'],
    mbtiTypes: ['INFP', 'INFJ', 'ENFP'],
    subjectCombinations: ['C00', 'D01'],
    tuitionFee: 20000000
  },
  {
    name: 'Truyền thông Đa phương tiện',
    description: 'Ứng dụng công nghệ vào thiết kế, báo chí và truyền thông.',
    benchmarkScore: 25.5,
    hollandTypes: ['A', 'E', 'S'],
    mbtiTypes: ['ENFP', 'ENTP', 'ESFP'],
    subjectCombinations: ['D01', 'D15', 'A01'],
    tuitionFee: 32000000
  },
  
  // Khối Y Dược
  {
    name: 'Y Đa khoa',
    description: 'Khám, chẩn đoán, điều trị bềnh và chăm sóc sức khỏe.',
    benchmarkScore: 28.0,
    hollandTypes: ['I', 'S', 'R'],
    mbtiTypes: ['ISFJ', 'ISTJ', 'INFJ'],
    subjectCombinations: ['B00'],
    tuitionFee: 50000000
  },
  {
    name: 'Dược học',
    description: 'Nghiên cứu về thuốc, cách bào chế và sử dụng thuốc.',
    benchmarkScore: 27.5,
    hollandTypes: ['I', 'C', 'R'],
    mbtiTypes: ['ISTJ', 'ISFJ', 'INTP'],
    subjectCombinations: ['A00', 'B00'],
    tuitionFee: 45000000
  }
];

const seedMajors = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/cazup';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Xóa bộ nhớ cũ
    await Major.deleteMany({});
    await UniversityMajor.deleteMany({});
    console.log('Cleared existing majors and universityMajor links');

    // Lấy một số trường ĐH để gắn với ngành học cho có dữ liệu demo (universityMajors)
    const universities = await University.find({});
    
    for (const data of majorData) {
      // Chọn ngẫu nhiên 3 trường đại học để gán cho ngành này
      const shuffledUnis = universities.sort(() => 0.5 - Math.random());
      const selectedUnis = shuffledUnis.slice(0, Math.min(3, universities.length));
      
      const uniIds = selectedUnis.map(u => u._id);
      
      // Update data with university IDs array
      data.universities = uniIds;
      
      const newMajor = await Major.create(data);
      
      // Seed UniversityMajor (liên kết thực tế ngành-trường với điểm admission)
      for (const uniId of uniIds) {
        // Có thể biến đổi admissionScore, tuitionFee một chút dựa theo trường
        const variance = (Math.random() * 2 - 1).toFixed(1); // +/- 1 điểm
        const admissionScore = Math.max(15, (parseFloat(newMajor.benchmarkScore) + parseFloat(variance)));
        
        await UniversityMajor.create({
          university: uniId,
          major: newMajor._id,
          admissionScore: admissionScore.toFixed(2),
          subjectCombination: newMajor.subjectCombinations[0], // Chọn tạm tổ hợp đầu
          tuitionFee: newMajor.tuitionFee + (Math.random() * 5000000) // Khác nhau tí
        });
      }
    }
    
    console.log(`Successfully seeded ${majorData.length} majors and generated UniversityMajor links`);
    
    mongoose.disconnect();
  } catch (error) {
    console.error('Error seeding majors:', error);
    process.exit(1);
  }
};

seedMajors();
