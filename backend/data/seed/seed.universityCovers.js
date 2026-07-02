// data/seed/seed.universityCovers.js
// Gán ảnh bìa campus THẬT (Wikimedia Commons) cho các trường tiêu biểu.
// Các trường khác sẽ dùng ảnh campus dự phòng ở frontend.
// Chạy: node data/seed/seed.universityCovers.js
require("dotenv").config();
const mongoose = require("mongoose");
const University = require("../../models/university.model");

// match: regex tên trường  |  url: ảnh bìa campus (đã kiểm tra HTTP 200)
const COVERS = [
  {
    match: /RMIT/i,
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/Saigon_south_campus_facilities.jpg/1280px-Saigon_south_campus_facilities.jpg",
  },
  {
    match: /Bách khoa Hà Nội/i,
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/To%C3%A0_C1.jpg/1280px-To%C3%A0_C1.jpg",
  },
  {
    match: /UEH|Kinh tế TP\.HCM/i,
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Campus_A_of_University_of_Economics_Ho_Chi_Minh_City%2C_Sep_2022.jpg/1280px-Campus_A_of_University_of_Economics_Ho_Chi_Minh_City%2C_Sep_2022.jpg",
  },
  {
    match: /Quốc gia Hà Nội/i,
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/C%E1%BB%95ng_%C4%90%E1%BA%A1i_h%E1%BB%8Dc_Qu%E1%BB%91c_gia_H%C3%A0_N%E1%BB%99i%2C_t%E1%BA%A1i_x%C3%A3_H%C3%B2a_L%E1%BA%A1c%2C_H%C3%A0_N%E1%BB%99i%2C_Vi%E1%BB%87t_Nam.jpg/1280px-C%E1%BB%95ng_%C4%90%E1%BA%A1i_h%E1%BB%8Dc_Qu%E1%BB%91c_gia_H%C3%A0_N%E1%BB%99i%2C_t%E1%BA%A1i_x%C3%A3_H%C3%B2a_L%E1%BA%A1c%2C_H%C3%A0_N%E1%BB%99i%2C_Vi%E1%BB%87t_Nam.jpg",
  },
  {
    match: /Ngoại thương/i,
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/FTU_2011.jpg/1280px-FTU_2011.jpg",
  },
  {
    match: /Đại học FPT/i,
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Fpt02.jpg/1280px-Fpt02.jpg",
  },
  {
    match: /Quốc gia TP\.HCM/i,
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Nh%C3%A0_%C4%91i%E1%BB%81u_h%C3%A0nh_%C4%90%E1%BA%A1i_h%E1%BB%8Dc_Qu%E1%BB%91c_gia_TPHCM.jpg/1280px-Nh%C3%A0_%C4%91i%E1%BB%81u_h%C3%A0nh_%C4%90%E1%BA%A1i_h%E1%BB%8Dc_Qu%E1%BB%91c_gia_TPHCM.jpg",
  },
];

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("✔ Connected to MongoDB");

  for (const c of COVERS) {
    const uni = await University.findOneAndUpdate(
      { name: c.match, isDeleted: false },
      { $set: { coverImage: c.url } },
      { new: true },
    );
    console.log(
      uni ? `✔ ${uni.name}` : `⚠ Không tìm thấy trường khớp ${c.match}`,
    );
  }

  await mongoose.disconnect();
  console.log("✔ Done. Disconnected.");
}

run().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});
