const mongoose = require("mongoose");
require("dotenv").config({ path: ".env" });
const UniversityMajor = require("./models/universityMajor.model");
require("./models/university.model");
require("./models/major.model");

const tuitionData = [
  {
    uni: "Đại học Bách khoa Hà Nội",
    major: "Khoa học Máy tính",
    fee: 35000000,
  },
  {
    uni: "Đại học Bách khoa Hà Nội",
    major: "Kỹ thuật Điện - Điện tử",
    fee: 32000000,
  },
  {
    uni: "Đại học Công nghệ - ĐHQGHN",
    major: "Công nghệ Thông tin",
    fee: 38000000,
  },
  {
    uni: "Đại học Công nghệ - ĐHQGHN",
    major: "Khoa học Máy tính",
    fee: 38000000,
  },
  {
    uni: "Đại học Bách khoa - ĐHQG TP.HCM",
    major: "Khoa học Máy tính",
    fee: 30000000,
  },
  {
    uni: "Đại học Bách khoa - ĐHQG TP.HCM",
    major: "Kỹ thuật Cơ điện tử",
    fee: 30000000,
  },
  { uni: "Đại học FPT", major: "Kỹ thuật Phần mềm", fee: 28000000 },
  {
    uni: "Đại học Kinh tế Quốc dân",
    major: "Logistics & Quản lý Chuỗi cung ứng",
    fee: 35000000,
  },
  { uni: "Đại học Kinh tế Quốc dân", major: "Kinh tế Quốc tế", fee: 35000000 },
  {
    uni: "Đại học Kinh tế Quốc dân",
    major: "Quản trị Kinh doanh",
    fee: 35000000,
  },
  { uni: "Đại học Ngoại thương", major: "Kinh tế Quốc tế", fee: 40000000 },
  { uni: "Đại học Ngoại thương", major: "Quản trị Kinh doanh", fee: 40000000 },
  {
    uni: "Đại học Kinh tế TP.HCM (UEH)",
    major: "Tài chính - Ngân hàng",
    fee: 32000000,
  },
  { uni: "Đại học Kinh tế TP.HCM (UEH)", major: "Marketing", fee: 32000000 },
  { uni: "Đại học Y Hà Nội", major: "Y Đa khoa", fee: 45000000 },
  { uni: "Đại học Y Hà Nội", major: "Răng Hàm Mặt", fee: 45000000 },
  { uni: "Đại học Y Dược TP.HCM", major: "Y Đa khoa", fee: 42000000 },
  { uni: "Đại học Y Dược TP.HCM", major: "Dược học", fee: 40000000 },
  { uni: "Đại học Quốc gia Hà Nội", major: "Ngôn ngữ Anh", fee: 28000000 },
  { uni: "Đại học Quốc gia Hà Nội", major: "Tâm lý học", fee: 28000000 },
];

async function updateTuition() {
  await mongoose.connect(process.env.MONGO_URI);
  for (const item of tuitionData) {
    const docs = await UniversityMajor.find().populate("university major");
    const target = docs.find(
      (d) =>
        d.university?.name.includes(item.uni) &&
        d.major?.name.includes(item.major),
    );
    if (target) {
      target.tuitionFee = item.fee;
      await target.save();
      console.log(`Updated ${item.uni} - ${item.major}: ${item.fee}`);
    } else {
      console.log(`Not found: ${item.uni} - ${item.major}`);
    }
  }
  await mongoose.disconnect();
}
updateTuition();
