// data/seed/seed.majorDetail.js
// Seed các trường thông tin mở rộng cho trang chi tiết ngành (khớp mẫu UI).
// Chạy: node data/seed/seed.majorDetail.js
require("dotenv").config();
const mongoose = require("mongoose");
const Major = require("../../models/major.model");
const University = require("../../models/university.model");

// --- Nội dung ngành Logistics & Quản lý Chuỗi cung ứng ---
const logisticsDetail = {
  englishName: "Bachelor of Business (Logistics and Supply Chain Management)",
  code: "BP254",
  duration: "3 - 4 Năm",
  intakes: ["Tháng 2", "Tháng 6", "Tháng 10"],
  description:
    "Ngành Quản lý Logistics và Chuỗi cung ứng trang bị cho sinh viên khả năng điều hành các quy trình vận chuyển, lưu kho và phân phối hàng hóa trên quy mô toàn cầu. Chương trình được thiết kế với sự tham vấn từ các chuyên gia hàng đầu trong ngành, đảm bảo kiến thức luôn cập nhật với xu hướng công nghiệp 4.0.",
  highlights: [
    {
      title: "Quản trị Vận hành",
      description:
        "Tối ưu hóa quy trình sản xuất và dịch vụ để đạt hiệu quả cao nhất.",
      icon: "operations",
    },
    {
      title: "Quản trị Kho bãi",
      description:
        "Chiến lược quản lý tồn kho và thiết kế hệ thống lưu trữ thông minh.",
      icon: "warehouse",
    },
    {
      title: "Vận tải Quốc tế",
      description:
        "Nắm vững các phương thức vận chuyển đường biển, hàng không và bộ.",
      icon: "transport",
    },
    {
      title: "Chuỗi cung ứng Bền vững",
      description:
        "Áp dụng các giải pháp xanh và trách nhiệm xã hội trong chuỗi giá trị.",
      icon: "sustainability",
    },
  ],
  careerOutcomes: [
    "Chuyên viên Logistics & Chuỗi cung ứng",
    "Quản lý kho vận / điều phối vận tải",
    "Chuyên viên mua hàng & quản lý nhà cung cấp",
    "Chuyên viên xuất nhập khẩu (Import - Export)",
    "Quản lý vận hành / Chuyên gia tư vấn chuỗi cung ứng",
  ],
  curriculum: [
    {
      title: "Năm 1 — Kiến thức nền tảng",
      items: [
        "Kinh tế học đại cương",
        "Toán ứng dụng trong kinh doanh",
        "Tin học & Ngoại ngữ chuyên ngành",
      ],
    },
    {
      title: "Năm 2 — Cơ sở ngành",
      items: [
        "Nhập môn Logistics",
        "Quản trị chuỗi cung ứng",
        "Quản trị vận hành",
      ],
    },
    {
      title: "Năm 3 — Chuyên ngành",
      items: [
        "Quản trị kho bãi & tồn kho",
        "Vận tải & giao nhận quốc tế",
        "Hệ thống thông tin Logistics",
      ],
    },
    {
      title: "Năm 4 — Thực tập & Tốt nghiệp",
      items: [
        "Thực tập doanh nghiệp",
        "Đồ án chuỗi cung ứng bền vững",
        "Khóa luận tốt nghiệp",
      ],
    },
  ],
};

// --- Mô tả trường RMIT ---
const rmitDescription =
  "Môi trường giáo dục quốc tế hàng đầu, chuẩn Úc ngay tại Việt Nam với cơ sở vật chất hiện đại bậc nhất.";

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("✔ Connected to MongoDB");

  const major = await Major.findOneAndUpdate(
    { name: /logistics/i, isDeleted: false },
    { $set: logisticsDetail },
    { new: true },
  );
  if (major) {
    console.log(`✔ Updated major: ${major.name} (code ${major.code})`);
  } else {
    console.log("⚠ Không tìm thấy ngành Logistics để cập nhật.");
  }

  const rmit = await University.findOneAndUpdate(
    { name: /RMIT/i, isDeleted: false },
    { $set: { description: rmitDescription } },
    { new: true },
  );
  if (rmit) {
    console.log(`✔ Updated university: ${rmit.name}`);
  } else {
    console.log("⚠ Không tìm thấy trường RMIT để cập nhật.");
  }

  await mongoose.disconnect();
  console.log("✔ Done. Disconnected.");
}

run().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});
