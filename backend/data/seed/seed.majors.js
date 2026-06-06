// data/seed/seed.majors.js
// Script tạo dữ liệu các ngành học (majors) thực tế và liên kết với trường đại học

require("dotenv").config({ path: "../../.env" });
const mongoose = require("mongoose");
const Major = require("../../models/major.model");
const University = require("../../models/university.model");
const UniversityMajor = require("../../models/universityMajor.model");

const majorData = [
  // Khối Kỹ Thuật & Công Nghệ
  {
    name: "Công nghệ Thông tin",
    description:
      "Chuyên nghiên cứu phần mềm, mạng máy tính và hệ thống thông tin.",
    benchmarkScore: 26.5,
    hollandTypes: ["I", "R", "C"],
    mbtiTypes: ["INTJ", "INTP", "ISTJ"],
    subjectCombinations: ["A00", "A01", "D01"],
    tuitionFee: 30000000,
  },
  {
    name: "Khoa học Máy tính",
    description:
      "Nghiên cứu lý thuyết tính toán, thuật toán và kiến trúc máy tính.",
    benchmarkScore: 27.0,
    hollandTypes: ["I", "R"],
    mbtiTypes: ["INTJ", "INTP"],
    subjectCombinations: ["A00", "A01"],
    tuitionFee: 32000000,
  },
  {
    name: "Kỹ thuật Phần mềm",
    description:
      "Quy trình xây dựng, vận hành và bảo trì phần mềm chất lượng cao.",
    benchmarkScore: 25.5,
    hollandTypes: ["I", "R", "C"],
    mbtiTypes: ["ISTJ", "INTJ"],
    subjectCombinations: ["A00", "A01"],
    tuitionFee: 28000000,
  },
  {
    name: "An toàn Thông tin",
    description: "Bảo vệ hệ thống thông tin khỏi các cuộc tấn công mạng.",
    benchmarkScore: 26.0,
    hollandTypes: ["I", "R"],
    mbtiTypes: ["ISTP", "INTJ"],
    subjectCombinations: ["A00", "A01"],
    tuitionFee: 30000000,
  },
  {
    name: "Kỹ thuật Cơ điện tử",
    description: "Kết hợp cơ khí, điện tử và khoa học máy tính.",
    benchmarkScore: 24.5,
    hollandTypes: ["R", "I"],
    mbtiTypes: ["ISTP", "ISTJ", "ESTP"],
    subjectCombinations: ["A00", "A01"],
    tuitionFee: 25000000,
  },
  {
    name: "Kỹ thuật Điện - Điện tử",
    description: "Thiết kế và vận hành các hệ thống điện, mạch điện tử.",
    benchmarkScore: 23.5,
    hollandTypes: ["R", "I"],
    mbtiTypes: ["ISTP", "ISTJ"],
    subjectCombinations: ["A00", "A01"],
    tuitionFee: 22000000,
  },

  // Khối Kinh Tế & Quản Trị
  {
    name: "Quản trị Kinh doanh",
    description: "Đào tạo kiến thức quản lý, điều hành doanh nghiệp.",
    benchmarkScore: 25.0,
    hollandTypes: ["E", "S", "C"],
    mbtiTypes: ["ENTJ", "ESTJ", "ENFJ"],
    subjectCombinations: ["A00", "A01", "D01", "D07"],
    tuitionFee: 28000000,
  },
  {
    name: "Tài chính - Ngân hàng",
    description: "Quản lý tài chính, phân tích đầu tư và hoạt động ngân hàng.",
    benchmarkScore: 26.0,
    hollandTypes: ["C", "E", "I"],
    mbtiTypes: ["ISTJ", "ESTJ", "INTJ"],
    subjectCombinations: ["A00", "A01", "D01", "D07"],
    tuitionFee: 27000000,
  },
  {
    name: "Kế toán",
    description:
      "Ghi chép, phân tích và báo cáo tình hình tài chính doanh nghiệp.",
    benchmarkScore: 24.0,
    hollandTypes: ["C", "I"],
    mbtiTypes: ["ISTJ", "ISFJ"],
    subjectCombinations: ["A00", "A01", "D01"],
    tuitionFee: 25000000,
  },
  {
    name: "Marketing",
    description:
      "Nghiên cứu thị trường, xây dựng thương hiệu và quảng bá sản phẩm.",
    benchmarkScore: 25.5,
    hollandTypes: ["E", "A", "S"],
    mbtiTypes: ["ENFP", "ENTP", "ESFP"],
    subjectCombinations: ["A01", "D01", "D15"],
    tuitionFee: 30000000,
  },
  {
    name: "Kinh tế Quốc tế",
    description:
      "Nghiên cứu thương mại, đầu tư và quan hệ kinh tế giữa các quốc gia.",
    benchmarkScore: 26.5,
    hollandTypes: ["E", "I", "C"],
    mbtiTypes: ["ENTJ", "INTJ"],
    subjectCombinations: ["A00", "A01", "D01"],
    tuitionFee: 29000000,
  },
  {
    name: "Logistics & Quản lý Chuỗi cung ứng",
    description: "Tối ưu hóa quá trình vận chuyển và lưu kho hàng hóa.",
    benchmarkScore: 25.0,
    hollandTypes: ["C", "R", "E"],
    mbtiTypes: ["ISTJ", "ESTJ"],
    subjectCombinations: ["A00", "A01", "D01"],
    tuitionFee: 28000000,
  },

  // Khối Xã Hội & Nhân Văn
  {
    name: "Tâm lý học",
    description: "Nghiên cứu về tâm trí và hành vi con người.",
    benchmarkScore: 24.0,
    hollandTypes: ["S", "I", "A"],
    mbtiTypes: ["INFP", "INFJ", "ENFP"],
    subjectCombinations: ["C00", "D01", "D15"],
    tuitionFee: 20000000,
  },
  {
    name: "Truyền thông Đa phương tiện",
    description: "Ứng dụng công nghệ vào thiết kế, báo chí và truyền thông.",
    benchmarkScore: 25.5,
    hollandTypes: ["A", "E", "S"],
    mbtiTypes: ["ENFP", "ENTP", "ESFP"],
    subjectCombinations: ["D01", "D15", "A01"],
    tuitionFee: 32000000,
  },
  {
    name: "Luật Kinh tế",
    description: "Pháp luật điều chỉnh các quan hệ kinh doanh, thương mại.",
    benchmarkScore: 25.0,
    hollandTypes: ["E", "C", "I"],
    mbtiTypes: ["ESTJ", "ISTJ"],
    subjectCombinations: ["A00", "A01", "D01"],
    tuitionFee: 24000000,
  },
  {
    name: "Ngôn ngữ Anh",
    description:
      "Đào tạo chuyên sâu về tiếng Anh, biên phiên dịch và giảng dạy.",
    benchmarkScore: 24.5,
    hollandTypes: ["S", "A", "E"],
    mbtiTypes: ["ENFP", "ESFP"],
    subjectCombinations: ["D01", "A01"],
    tuitionFee: 26000000,
  },
  {
    name: "Quan hệ Quốc tế",
    description: "Nghiên cứu chính trị, ngoại giao và hợp tác quốc tế.",
    benchmarkScore: 26.0,
    hollandTypes: ["E", "S", "I"],
    mbtiTypes: ["ENFJ", "ENTJ"],
    subjectCombinations: ["D01", "D15", "A01"],
    tuitionFee: 25000000,
  },

  // Khối Y Dược
  {
    name: "Y Đa khoa",
    description: "Khám, chẩn đoán, điều trị bệnh và chăm sóc sức khỏe.",
    benchmarkScore: 28.0,
    hollandTypes: ["I", "S", "R"],
    mbtiTypes: ["ISFJ", "ISTJ", "INFJ"],
    subjectCombinations: ["B00"],
    tuitionFee: 50000000,
  },
  {
    name: "Dược học",
    description: "Nghiên cứu về thuốc, cách bào chế và sử dụng thuốc.",
    benchmarkScore: 27.5,
    hollandTypes: ["I", "C", "R"],
    mbtiTypes: ["ISTJ", "ISFJ", "INTP"],
    subjectCombinations: ["A00", "B00"],
    tuitionFee: 45000000,
  },
  {
    name: "Răng Hàm Mặt",
    description: "Chuyên khoa điều trị các bệnh lý về răng và hàm.",
    benchmarkScore: 27.0,
    hollandTypes: ["I", "R", "S"],
    mbtiTypes: ["ISFJ", "ISTJ"],
    subjectCombinations: ["B00"],
    tuitionFee: 48000000,
  },
  {
    name: "Điều dưỡng",
    description: "Chăm sóc bệnh nhân và hỗ trợ điều trị y tế.",
    benchmarkScore: 22.0,
    hollandTypes: ["S", "R", "I"],
    mbtiTypes: ["ISFJ", "ESFJ"],
    subjectCombinations: ["B00"],
    tuitionFee: 20000000,
  },
];

const seedMajors = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/cazup";
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB");

    // Xóa bộ nhớ cũ
    await Major.deleteMany({});
    await UniversityMajor.deleteMany({});
    console.log("Cleared existing majors and universityMajor links");

    // Lấy tất cả trường ĐH
    const universities = await University.find({});

    for (const data of majorData) {
      // Chọn ngẫu nhiên 8 trường đại học để gán cho ngành này (tăng số lượng kết quả)
      const shuffledUnis = universities.sort(() => 0.5 - Math.random());
      const selectedUnis = shuffledUnis.slice(
        0,
        Math.min(8, universities.length),
      );

      const uniIds = selectedUnis.map((u) => u._id);

      // Update data with university IDs array
      data.universities = uniIds;

      const newMajor = await Major.create(data);

      // Seed UniversityMajor (liên kết thực tế ngành-trường với điểm admission)
      for (const uniId of uniIds) {
        // Tạo bản ghi cho MỖI tổ hợp môn của ngành này
        for (const combination of newMajor.subjectCombinations) {
          // Biến đổi admissionScore, tuitionFee một chút dựa theo trường
          const variance = (Math.random() * 4 - 2).toFixed(1); // +/- 2 điểm để đa dạng
          const admissionScore = Math.max(
            15,
            parseFloat(newMajor.benchmarkScore) + parseFloat(variance),
          );

          await UniversityMajor.create({
            university: uniId,
            major: newMajor._id,
            admissionScore: Number(admissionScore.toFixed(2)),
            subjectCombination: combination,
            tuitionFee:
              newMajor.tuitionFee + (Math.random() * 10000000 - 5000000), // +/- 5 triệu
            admissionHistory: [
              {
                year: 2023,
                admissionScore: Number((admissionScore - 0.5).toFixed(2)),
              },
              {
                year: 2022,
                admissionScore: Number((admissionScore - 1.2).toFixed(2)),
              },
              {
                year: 2021,
                admissionScore: Number((admissionScore + 0.3).toFixed(2)),
              },
            ],
          });
        }
      }
    }

    console.log(
      `Successfully seeded ${majorData.length} majors and generated UniversityMajor links for all combinations`,
    );

    mongoose.disconnect();
  } catch (error) {
    console.error("Error seeding majors:", error);
    process.exit(1);
  }
};

seedMajors();
