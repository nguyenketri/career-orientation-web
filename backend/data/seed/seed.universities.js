// data/seed/seed.universities.js
// Script cập nhật dữ liệu trường đại học bằng cách khớp tên linh hoạt và cập nhật theo ID

const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });
const mongoose = require("mongoose");
const University = require("../../models/university.model");

console.log("Seed script started...");

const universityData = [
  {
    nameKeywords: ["Kinh tế TP.HCM", "UEH"],
    data: {
      facilities: [
        "Thư viện hiện đại",
        "Phòng lab tốt",
        "Ký túc xá tiện nghi",
        "Trung tâm khởi nghiệp",
      ],
      rating: 4.5,
      reviewCount: 1250,
    },
  },
  {
    nameKeywords: ["Kinh tế Quốc dân", "NEU"],
    data: {
      facilities: [
        "Thư viện hiện đại",
        "Hội trường lớn",
        "Khu phức hợp thể thao",
        "Phòng học thông minh",
      ],
      rating: 4.7,
      reviewCount: 1800,
    },
  },
  {
    nameKeywords: ["Tôn Đức Thắng", "TDTU"],
    data: {
      facilities: [
        "Thư viện chuẩn quốc tế",
        "Nhà thi đấu đa năng",
        "Ký túc xá hiện đại",
      ],
      rating: 4.2,
      reviewCount: 980,
    },
  },
  {
    nameKeywords: ["RMIT"],
    data: {
      facilities: [
        "Campus hiện đại",
        "Phòng studio chuyên dụng",
        "Trung tâm hỗ trợ sinh viên",
      ],
      rating: 4.8,
      reviewCount: 650,
    },
  },
  {
    nameKeywords: ["Nguyễn Tất Thành", "NTT"],
    data: {
      facilities: ["Phòng thực hành hiện đại", "Thư viện số", "Khu học tập mở"],
      rating: 3.9,
      reviewCount: 1100,
    },
  },
  {
    nameKeywords: ["Kinh tế - Luật", "UEL"],
    data: {
      facilities: ["Thư viện thông minh", "Giảng đường chuẩn quốc tế"],
      rating: 4.3,
      reviewCount: 890,
    },
  },
  {
    nameKeywords: ["Bách khoa Hà Nội", "HUST"],
    data: {
      facilities: ["Phòng thí nghiệm trọng điểm", "Trung tâm đổi mới sáng tạo"],
      rating: 4.8,
      reviewCount: 2100,
    },
  },
  {
    nameKeywords: ["FPT"],
    data: {
      facilities: ["Khu thể thao phức hợp", "Ký túc xá hiện đại"],
      rating: 4.6,
      reviewCount: 1500,
    },
  },
  {
    nameKeywords: ["Bưu chính Viễn thông", "PTIT"],
    data: {
      facilities: ["Phòng lab công nghệ cao", "Thư viện số"],
      rating: 4.2,
      reviewCount: 750,
    },
  },
];

const seedUniversities = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/cazup";
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB");

    // 1. Lấy tất cả các trường hiện có trong DB
    const allUniversities = await University.find({});
    console.log(`Found ${allUniversities.length} universities in database.`);

    let updatedCount = 0;

    // 2. Duyệt qua từng trường trong DB và tìm dữ liệu khớp
    for (const uni of allUniversities) {
      const match = universityData.find((item) =>
        item.nameKeywords.some((keyword) =>
          uni.name.toLowerCase().includes(keyword.toLowerCase()),
        ),
      );

      if (match) {
        await University.updateOne({ _id: uni._id }, { $set: match.data });
        updatedCount++;
        console.log(`Updated: ${uni.name}`);
      } else {
        // Gán dữ liệu mặc định cho các trường không khớp để không bị N/A
        await University.updateOne(
          { _id: uni._id },
          {
            $set: {
              facilities: ["Thư viện", "Phòng học"],
              rating: 4.0,
              reviewCount: 100,
            },
          },
        );
        console.log(`Set default data for: ${uni.name}`);
      }
    }

    console.log(
      `\nSuccessfully processed ${allUniversities.length} universities.`,
    );
    console.log(
      `Specifically updated ${updatedCount} universities with real data.`,
    );

    mongoose.disconnect();
  } catch (error) {
    console.error("Error seeding universities:", error);
    process.exit(1);
  }
};

seedUniversities();
