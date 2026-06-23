const mongoose = require("mongoose");
require("dotenv").config({ path: ".env" });

const UniversityMajor = require("./models/universityMajor.model");
const University = require("./models/university.model");
const Major = require("./models/major.model");

const dataToUpdate = [
  // Existing and Fixed
  {
    university: "Đại học Bách khoa Hà Nội",
    major: "Khoa học Máy tính",
    scores: [29.25, 28.5, 28.0],
  },
  {
    university: "Đại học Bách khoa Hà Nội",
    major: "Kỹ thuật Điện - Điện tử",
    scores: [27.5, 26.8, 26.0],
  },
  {
    university: "Đại học Công nghệ - ĐHQGHN",
    major: "Công nghệ Thông tin",
    scores: [28.5, 27.8, 27.2],
  },
  {
    university: "Đại học Công nghệ - ĐHQGHN",
    major: "Khoa học Máy tính",
    scores: [28.2, 27.5, 27.0],
  },
  {
    university: "Đại học Bách khoa - ĐHQG TP.HCM",
    major: "Khoa học Máy tính",
    scores: [28.0, 27.2, 26.8],
  },
  {
    university: "Đại học Bách khoa - ĐHQG TP.HCM",
    major: "Kỹ thuật Cơ điện tử",
    scores: [26.5, 25.8, 25.0],
  },
  {
    university: "Đại học FPT",
    major: "Kỹ thuật Phần mềm",
    scores: [24.0, 23.5, 23.0],
  },
  {
    university: "Đại học Kinh tế Quốc dân",
    major: "Logistics & Quản lý Chuỗi cung ứng",
    scores: [28.2, 27.8, 27.5],
  },
  {
    university: "Đại học Kinh tế Quốc dân",
    major: "Kinh tế Quốc tế",
    scores: [28.0, 27.5, 27.2],
  },
  {
    university: "Đại học Kinh tế Quốc dân",
    major: "Quản trị Kinh doanh",
    scores: [27.5, 27.0, 26.8],
  },
  {
    university: "Đại học Ngoại thương",
    major: "Kinh tế Quốc tế",
    scores: [28.5, 28.2, 28.0],
  },
  {
    university: "Đại học Ngoại thương",
    major: "Quản trị Kinh doanh",
    scores: [27.8, 27.5, 27.0],
  },
  {
    university: "Đại học Kinh tế TP.HCM (UEH)",
    major: "Tài chính - Ngân hàng",
    scores: [26.5, 26.0, 25.5],
  },
  {
    university: "Đại học Kinh tế TP.HCM (UEH)",
    major: "Marketing",
    scores: [27.2, 26.8, 26.0],
  },
  {
    university: "Đại học Kinh tế - Luật (UEL)",
    major: "Luật Kinh tế",
    scores: [26.0, 25.5, 25.0],
  },
  {
    university: "Đại học Y Hà Nội",
    major: "Y Đa khoa",
    scores: [28.5, 28.0, 27.5],
  },
  {
    university: "Đại học Y Hà Nội",
    major: "Răng Hàm Mặt",
    scores: [28.2, 27.8, 27.2],
  },
  {
    university: "Đại học Y Dược TP.HCM",
    major: "Y Đa khoa",
    scores: [27.8, 27.2, 26.8],
  },
  {
    university: "Đại học Y Dược TP.HCM",
    major: "Dược học",
    scores: [26.5, 26.0, 25.5],
  },
  {
    university: "Đại học Quốc gia Hà Nội",
    major: "Ngôn ngữ Anh",
    scores: [26.5, 26.0, 25.5],
  },
  {
    university: "Đại học Quốc gia Hà Nội",
    major: "Tâm lý học",
    scores: [26.8, 26.2, 25.8],
  },
  {
    university: "Đại học Kinh tế Quốc dân",
    major: "Kỹ thuật Phần mềm",
    scores: [27.5, 27.0, 26.5],
  },
  {
    university: "Đại học Sư phạm Kỹ thuật TP.HCM",
    major: "Răng Hàm Mặt",
    scores: [26.0, 25.5, 25.0],
  },

  // Filling the remaining missing records identified from the database
  {
    university: "Đại học Tôn Đức Thắng",
    major: "Kế toán",
    scores: [24.5, 24.0, 23.5],
  },
  {
    university: "Đại học Quốc gia TP.HCM",
    major: "Kinh tế Quốc tế",
    scores: [27.0, 26.5, 26.0],
  },
  {
    university: "Đại học Kinh tế - Luật (UEL)",
    major: "Y Đa khoa",
    scores: [28.0, 27.5, 27.0],
  },
  {
    university: "Đại học Ngoại thương",
    major: "Răng Hàm Mặt",
    scores: [28.5, 28.0, 27.5],
  },
  {
    university: "Đại học Tài chính - Marketing",
    major: "Điều dưỡng",
    scores: [22.0, 21.5, 21.0],
  },
  {
    university: "Đại học Quốc gia Hà Nội",
    major: "Marketing",
    scores: [27.5, 27.0, 26.5],
  },
  {
    university: "Học viện Ngân hàng",
    major: "An toàn Thông tin",
    scores: [25.5, 25.0, 24.5],
  },
  {
    university: "Học viện Tài chính",
    major: "Kỹ thuật Điện - Điện tử",
    scores: [23.0, 22.5, 22.0],
  },
  {
    university: "Đại học Tôn Đức Thắng",
    major: "Quản trị Kinh doanh",
    scores: [24.0, 23.5, 23.0],
  },
  {
    university: "Đại học Tài chính - Marketing",
    major: "Marketing",
    scores: [24.5, 24.0, 23.5],
  },
  {
    university: "Đại học Sư phạm Kỹ thuật TP.HCM",
    major: "Điều dưỡng",
    scores: [22.5, 22.0, 21.5],
  },
  {
    university: "Đại học Công nghệ - ĐHQGHN",
    major: "Kỹ thuật Phần mềm",
    scores: [28.0, 27.5, 27.0],
  },
  {
    university: "Đại học Kinh tế - Luật (UEL)",
    major: "Logistics & Quản lý Chuỗi cung ứng",
    scores: [26.5, 26.0, 25.5],
  },
  {
    university: "Học viện Bưu chính Viễn thông",
    major: "Luật Kinh tế",
    scores: [24.0, 23.5, 23.0],
  },
  {
    university: "Học viện Bưu chính Viễn thông",
    major: "Khoa học Máy tính",
    scores: [26.0, 25.5, 25.0],
  },
  {
    university: "Đại học Bách khoa - ĐHQG TP.HCM",
    major: "Luật Kinh tế",
    scores: [25.0, 24.5, 24.0],
  },
  {
    university: "Đại học Tôn Đức Thắng",
    major: "Ngôn ngữ Anh",
    scores: [23.5, 23.0, 22.5],
  },
  {
    university: "Đại học Tài chính - Marketing",
    major: "Kỹ thuật Cơ điện tử",
    scores: [22.0, 21.5, 21.0],
  },
  {
    university: "Đại học FPT",
    major: "Ngôn ngữ Anh",
    scores: [21.0, 20.5, 20.0],
  },
  {
    university: "Đại học RMIT Việt Nam",
    major: "Quan hệ Quốc tế",
    scores: [20.0, 19.5, 19.0],
  },
  {
    university: "Đại học Quốc gia Hà Nội",
    major: "Công nghệ Thông tin",
    scores: [28.0, 27.5, 27.0],
  },
  {
    university: "Đại học RMIT Việt Nam",
    major: "Kinh tế Quốc tế",
    scores: [20.0, 19.5, 19.0],
  },
  {
    university: "Đại học Ngoại thương",
    major: "Luật Kinh tế",
    scores: [27.5, 27.0, 26.5],
  },
  {
    university: "Học viện Ngân hàng",
    major: "Kỹ thuật Phần mềm",
    scores: [25.0, 24.5, 24.0],
  },
  {
    university: "Đại học Quốc gia Hà Nội",
    major: "Kỹ thuật Cơ điện tử",
    scores: [26.0, 25.5, 25.0],
  },
  {
    university: "Đại học Tôn Đức Thắng",
    major: "Truyền thông Đa phương tiện",
    scores: [25.0, 24.5, 24.0],
  },
  {
    university: "Học viện Tài chính",
    major: "Ngôn ngữ Anh",
    scores: [23.0, 22.5, 22.0],
  },
  {
    university: "Đại học Sư phạm Kỹ thuật TP.HCM",
    major: "Kỹ thuật Điện - Điện tử",
    scores: [24.0, 23.5, 23.0],
  },
  {
    university: "Đại học Tôn Đức Thắng",
    major: "Quan hệ Quốc tế",
    scores: [23.0, 22.5, 22.0],
  },
  {
    university: "Học viện Ngân hàng",
    major: "Răng Hàm Mặt",
    scores: [27.0, 26.5, 26.0],
  },
  {
    university: "Đại học Quốc gia Hà Nội",
    major: "Tài chính - Ngân hàng",
    scores: [26.5, 26.0, 25.5],
  },
  {
    university: "Đại học Công nghệ - ĐHQGHN",
    major: "Kinh tế Quốc tế",
    scores: [27.0, 26.5, 26.0],
  },
  { university: "Đại học FPT", major: "Dược học", scores: [23.0, 22.5, 22.0] },
  {
    university: "Đại học Bách khoa Hà Nội",
    major: "Kỹ thuật Cơ điện tử",
    scores: [26.0, 25.5, 25.0],
  },
  {
    university: "Đại học Công nghệ - ĐHQGHN",
    major: "Quản trị Kinh doanh",
    scores: [26.0, 25.5, 25.0],
  },
  {
    university: "Đại học Kinh tế - Luật (UEL)",
    major: "Marketing",
    scores: [25.5, 25.0, 24.5],
  },
  {
    university: "Đại học Tài chính - Marketing",
    major: "Quan hệ Quốc tế",
    scores: [23.0, 22.5, 22.0],
  },
  {
    university: "Đại học RMIT Việt Nam",
    major: "Khoa học Máy tính",
    scores: [21.0, 20.5, 20.0],
  },
  {
    university: "Đại học Quốc gia Hà Nội",
    major: "Quản trị Kinh doanh",
    scores: [27.0, 26.5, 26.0],
  },
  {
    university: "Đại học Quốc gia Hà Nội",
    major: "Truyền thông Đa phương tiện",
    scores: [26.5, 26.0, 25.5],
  },
  {
    university: "Đại học Quốc gia Hà Nội",
    major: "An toàn Thông tin",
    scores: [27.0, 26.5, 26.0],
  },
  {
    university: "Đại học Công nghệ - ĐHQGHN",
    major: "Tâm lý học",
    scores: [26.0, 25.5, 25.0],
  },
  {
    university: "Học viện Ngân hàng",
    major: "Truyền thông Đa phương tiện",
    scores: [24.0, 23.5, 23.0],
  },
];

async function updateScores() {
  try {
    console.log("MONGO_URI:", process.env.MONGO_URI);
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB...");

    for (const item of dataToUpdate) {
      const escapeRegExp = (string) =>
        string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const university = await University.findOne({
        name: new RegExp(escapeRegExp(item.university), "i"),
      });
      const major = await Major.findOne({
        name: new RegExp(escapeRegExp(item.major), "i"),
      });

      if (university && major) {
        const currentScore = item.scores[0]; // 2025
        const history = [
          { year: 2025, admissionScore: item.scores[0] },
          { year: 2024, admissionScore: item.scores[1] },
          { year: 2023, admissionScore: item.scores[2] },
        ];

        await UniversityMajor.findOneAndUpdate(
          { university: university._id, major: major._id },
          {
            admissionScore: currentScore,
            admissionHistory: history,
          },
          { upsert: true },
        );
        console.log(`Updated: ${item.university} - ${item.major}`);
      } else {
        console.log(`Not found: ${item.university} or ${item.major}`);
      }
    }

    console.log("Update completed successfully!");
  } catch (error) {
    console.error("Error updating data:", error);
  } finally {
    await mongoose.disconnect();
  }
}

updateScores();
