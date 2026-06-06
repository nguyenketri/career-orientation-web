// data/seed/seed.universities.js
// Script tạo dữ liệu các trường đại học thực tế

require("dotenv").config({ path: "../../.env" });
const mongoose = require("mongoose");
const University = require("../../models/university.model");

const universities = [
  {
    name: "Đại học Quốc gia Hà Nội",
    image:
      "https://images.unsplash.com/photo-1562774053-701939374587?q=80&w=1974&auto=format&fit=crop",
    location: "Hà Nội",
    address: "144 Xuân Thủy, Cầu Giấy, Hà Nội",
    type: "Public",
    admissionYear: 2024,
    website: "https://vnu.edu.vn",
  },
  {
    name: "Đại học Bách khoa Hà Nội",
    image:
      "https://images.unsplash.com/photo-1592280771195-a6976a97337a?q=80&w=2070&auto=format&fit=crop",
    location: "Hà Nội",
    address: "Số 1 Đại Cồ Việt, Hai Bà Trưng, Hà Nội",
    type: "Public",
    admissionYear: 2024,
    website: "https://hust.edu.vn",
  },
  {
    name: "Đại học Kinh tế Quốc dân",
    image:
      "https://images.unsplash.com/photo-1523050853063-915894691067?q=80&w=2070&auto=format&fit=crop",
    location: "Hà Nội",
    address: "207 Giải Phóng, Đồng Tâm, Hai Bà Trưng, Hà Nội",
    type: "Public",
    admissionYear: 2024,
    website: "https://neu.edu.vn",
  },
  {
    name: "Đại học Ngoại thương",
    image:
      "https://images.unsplash.com/photo-1541339907198-e08756edd81f?q=80&w=2070&auto=format&fit=crop",
    location: "Hà Nội",
    address: "91 Chùa Láng, Láng Thượng, Đống Đa, Hà Nội",
    type: "Public",
    admissionYear: 2024,
    website: "https://ftu.edu.vn",
  },
  {
    name: "Đại học Y Hà Nội",
    image:
      "https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=600",
    location: "Hà Nội",
    address: "1 Tôn Thất Tùng, Kim Liên, Đống Đa, Hà Nội",
    type: "Public",
    admissionYear: 2024,
    website: "https://hmu.edu.vn",
  },
  {
    name: "Học viện Bưu chính Viễn thông",
    image:
      "https://images.unsplash.com/photo-1523050853063-915894691067?q=80&w=2070&auto=format&fit=crop",
    location: "Hà Nội",
    address: "122 Hoàng Quốc Việt, Cầu Giấy, Hà Nội",
    type: "Public",
    admissionYear: 2024,
    website: "https://ptit.edu.vn",
  },
  {
    name: "Học viện Tài chính",
    image:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=600",
    location: "Hà Nội",
    address: "58 Lê Văn Hiến, Đức Thắng, Bắc Từ Liêm, Hà Nội",
    type: "Public",
    admissionYear: 2024,
    website: "https://hvtc.edu.vn",
  },
  {
    name: "Học viện Ngân hàng",
    image:
      "https://images.unsplash.com/photo-1562774053-701939374587?q=80&w=1974&auto=format&fit=crop",
    location: "Hà Nội",
    address: "12 Chùa Bộc, Quang Trung, Đống Đa, Hà Nội",
    type: "Public",
    admissionYear: 2024,
    website: "https://hvnh.edu.vn",
  },
  {
    name: "Đại học Công nghệ - ĐHQGHN",
    image:
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=600",
    location: "Hà Nội",
    address: "144 Xuân Thủy, Cầu Giấy, Hà Nội",
    type: "Public",
    admissionYear: 2024,
    website: "https://uet.vnu.edu.vn",
  },
  {
    name: "Đại học FPT",
    image:
      "https://images.unsplash.com/photo-1541339907198-e08756edd81f?q=80&w=2070&auto=format&fit=crop",
    location: "Hà Nội",
    address: "Khu công nghệ cao Hòa Lạc, Thạch Thất, Hà Nội",
    type: "Private",
    admissionYear: 2024,
    website: "https://fpt.edu.vn",
  },
  {
    name: "Đại học Quốc gia TP.HCM",
    image:
      "https://images.unsplash.com/photo-1523050853063-915894691067?q=80&w=2070&auto=format&fit=crop",
    location: "TP.HCM",
    address: "Khu đô thị ĐHQG, Linh Trung, Thủ Đức, TP.HCM",
    type: "Public",
    admissionYear: 2024,
    website: "https://vnuhcm.edu.vn",
  },
  {
    name: "Đại học Bách khoa - ĐHQG TP.HCM",
    image:
      "https://images.unsplash.com/photo-1592280771195-a6976a97337a?q=80&w=2070&auto=format&fit=crop",
    location: "TP.HCM",
    address: "268 Lý Thường Kiệt, P. 14, Q. 10, TP.HCM",
    type: "Public",
    admissionYear: 2024,
    website: "https://hcmut.edu.vn",
  },
  {
    name: "Đại học Kinh tế TP.HCM (UEH)",
    image:
      "https://images.unsplash.com/photo-1562774053-701939374587?q=80&w=1974&auto=format&fit=crop",
    location: "TP.HCM",
    address: "59C Nguyễn Đình Chiểu, P. 6, Q. 3, TP.HCM",
    type: "Public",
    admissionYear: 2024,
    website: "https://ueh.edu.vn",
  },
  {
    name: "Đại học Tài chính - Marketing",
    image:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=600",
    location: "TP.HCM",
    address: "778 Nguyễn Kiệm, P. 4, Phú Nhuận, TP.HCM",
    type: "Public",
    admissionYear: 2024,
    website: "https://ufm.edu.vn",
  },
  {
    name: "Đại học RMIT Việt Nam",
    image:
      "https://images.unsplash.com/photo-1541339907198-e08756edd81f?q=80&w=2070&auto=format&fit=crop",
    location: "TP.HCM",
    address: "702 Nguyễn Văn Linh, Tân Hưng, Q. 7, TP.HCM",
    type: "International",
    admissionYear: 2024,
    website: "https://rmit.edu.vn",
  },
  {
    name: "Đại học Sư phạm Kỹ thuật TP.HCM",
    image:
      "https://images.unsplash.com/photo-1523050853063-915894691067?q=80&w=2070&auto=format&fit=crop",
    location: "TP.HCM",
    address: "1 Võ Văn Ngân, Linh Chiểu, Thủ Đức, TP.HCM",
    type: "Public",
    admissionYear: 2024,
    website: "https://hcmute.edu.vn",
  },
  {
    name: "Đại học Y Dược TP.HCM",
    image:
      "https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=600",
    location: "TP.HCM",
    address: "217 Hồng Bàng, P. 11, Q. 5, TP.HCM",
    type: "Public",
    admissionYear: 2024,
    website: "https://ump.edu.vn",
  },
  {
    name: "Đại học Tôn Đức Thắng",
    image:
      "https://images.unsplash.com/photo-1562774053-701939374587?q=80&w=1974&auto=format&fit=crop",
    location: "TP.HCM",
    address: "19 Nguyễn Hữu Thọ, Tân Phong, Q. 7, TP.HCM",
    type: "Public",
    admissionYear: 2024,
    website: "https://tdtu.edu.vn",
  },
  {
    name: "Đại học Nguyễn Tất Thành",
    image:
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=600",
    location: "TP.HCM",
    address: "300A Nguyễn Tất Thành, P. 13, Q. 4, TP.HCM",
    type: "Private",
    admissionYear: 2024,
    website: "https://ntt.edu.vn",
  },
  {
    name: "Đại học Kinh tế - Luật (UEL)",
    image:
      "https://images.unsplash.com/photo-1541339907198-e08756edd81f?q=80&w=2070&auto=format&fit=crop",
    location: "TP.HCM",
    address: "Khu đô thị ĐHQG, Linh Trung, Thủ Đức, TP.HCM",
    type: "Public",
    admissionYear: 2024,
    website: "https://uel.edu.vn",
  },
  {
    name: "Đại học Duy Tân",
    image:
      "https://images.unsplash.com/photo-1523050853063-915894691067?q=80&w=2070&auto=format&fit=crop",
    location: "Đà Nẵng",
    address: "101 Nguyễn Văn Linh, Đà Nẵng",
    type: "Private",
    admissionYear: 2024,
    website: "https://duytan.edu.vn",
  },
  {
    name: "Đại học Bách khoa - ĐH Đà Nẵng",
    image:
      "https://images.unsplash.com/photo-1592280771195-a6976a97337a?q=80&w=2070&auto=format&fit=crop",
    location: "Đà Nẵng",
    address: "54 Nguyễn Lương Bằng, Đà Nẵng",
    type: "Public",
    admissionYear: 2024,
    website: "https://dut.udn.vn",
  },
  {
    name: "Đại học Kinh tế - ĐH Đà Nẵng",
    image:
      "https://images.unsplash.com/photo-1562774053-701939374587?q=80&w=1974&auto=format&fit=crop",
    location: "Đà Nẵng",
    address: "73 Phan Đăng Lưu, Đà Nẵng",
    type: "Public",
    admissionYear: 2024,
    website: "https://ueh.udn.vn",
  },
  {
    name: "Đại học Sư phạm - ĐH Đà Nẵng",
    image:
      "https://images.unsplash.com/photo-1523050853063-915894691067?q=80&w=2070&auto=format&fit=crop",
    location: "Đà Nẵng",
    address: "135 Phan Đăng Lưu, Đà Nẵng",
    type: "Public",
    admissionYear: 2024,
    website: "https://ued.udn.vn",
  },
  {
    name: "Đại học VinUniversity",
    image:
      "https://images.unsplash.com/photo-1541339907198-e08756edd81f?q=80&w=2070&auto=format&fit=crop",
    location: "Hà Nội",
    address: "Xuân Quan, Đông Anh, Hà Nội",
    type: "Private",
    admissionYear: 2024,
    website: "https://vinuni.edu.vn",
  },
  {
    name: "Đại học Fulbright Việt Nam",
    image:
      "https://images.unsplash.com/photo-1523050853063-915894691067?q=80&w=2070&auto=format&fit=crop",
    location: "TP.HCM",
    address: "Thủ Đức, TP.HCM",
    type: "International",
    admissionYear: 2024,
    website: "https://fulbright.edu.vn",
  },
  {
    name: "Đại học Hoa Sen",
    image:
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=600",
    location: "TP.HCM",
    address: "8 Nguyễn Văn Tráng, Quận 1, TP.HCM",
    type: "Private",
    admissionYear: 2024,
    website: "https://hsen.edu.vn",
  },
  {
    name: "Đại học HUTECH",
    image:
      "https://images.unsplash.com/photo-1562774053-701939374587?q=80&w=1974&auto=format&fit=crop",
    location: "TP.HCM",
    address: "475A Điện Biên Phủ, Bình Thạnh, TP.HCM",
    type: "Private",
    admissionYear: 2024,
    website: "https://hutech.edu.vn",
  },
  {
    name: "Đại học Văn Lang",
    image:
      "https://images.unsplash.com/photo-1541339907198-e08756edd81f?q=80&w=2070&auto=format&fit=crop",
    location: "TP.HCM",
    address: "69/68 Đặng Thùy Trâm, Bình Thạnh, TP.HCM",
    type: "Private",
    admissionYear: 2024,
    website: "https://vanlanguni.edu.vn",
  },
  {
    name: "Đại học Thủy lợi",
    image:
      "https://images.unsplash.com/photo-1523050853063-915894691067?q=80&w=2070&auto=format&fit=crop",
    location: "Hà Nội",
    address: "175 Tây Sơn, Đống Đa, Hà Nội",
    type: "Public",
    admissionYear: 2024,
    website: "https://tlu.edu.vn",
  },
  {
    name: "Đại học Giao thông Vận tải",
    image:
      "https://images.unsplash.com/photo-1592280771195-a6976a97337a?q=80&w=2070&auto=format&fit=crop",
    location: "Hà Nội",
    address: "3 Cầu Giấy, Cầu Giấy, Hà Nội",
    type: "Public",
    admissionYear: 2024,
    website: "https://utc.edu.vn",
  },
  {
    name: "Đại học Xây dựng Hà Nội",
    image:
      "https://images.unsplash.com/photo-1562774053-701939374587?q=80&w=1974&auto=format&fit=crop",
    location: "Hà Nội",
    address: "165 Thái Hà, Đống Đa, Hà Nội",
    type: "Public",
    admissionYear: 2024,
    website: "https://huce.edu.vn",
  },
  {
    name: "Đại học Luật Hà Nội",
    image:
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=600",
    location: "Hà Nội",
    address: "87 Nguyễn Chí Thanh, Đống Đa, Hà Nội",
    type: "Public",
    admissionYear: 2024,
    website: "https://hlu.edu.vn",
  },
  {
    name: "Đại học Sư phạm Hà Nội",
    image:
      "https://images.unsplash.com/photo-1523050853063-915894691067?q=80&w=2070&auto=format&fit=crop",
    location: "Hà Nội",
    address: "136 Xuân Thủy, Cầu Giấy, Hà Nội",
    type: "Public",
    admissionYear: 2024,
    website: "https://hnue.edu.vn",
  },
  {
    name: "Đại học Mở Hà Nội",
    image:
      "https://images.unsplash.com/photo-1541339907198-e08756edd81f?q=80&w=2070&auto=format&fit=crop",
    location: "Hà Nội",
    address: "Khương Trung, Thanh Xuân, Hà Nội",
    type: "Public",
    admissionYear: 2024,
    website: "https://hou.edu.vn",
  },
  {
    name: "Đại học Công nghiệp Hà Nội",
    image:
      "https://images.unsplash.com/photo-1562774053-701939374587?q=80&w=1974&auto=format&fit=crop",
    location: "Hà Nội",
    address: "298 Nguyễn Trãi, Thanh Xuân, Hà Nội",
    type: "Public",
    admissionYear: 2024,
    website: "https://haui.edu.vn",
  },
  {
    name: "Đại học Thăng Long",
    image:
      "https://images.unsplash.com/photo-1523050853063-915894691067?q=80&w=2070&auto=format&fit=crop",
    location: "Hà Nội",
    address: "17 Vĩnh Phúc, Đông Da, Hà Nội",
    type: "Private",
    admissionYear: 2024,
    website: "https://thanglong.edu.vn",
  },
  {
    name: "Đại học Phenikaa",
    image:
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=600",
    location: "Hà Nội",
    address: "Yên Nghĩa, Hà Đông, Hà Nội",
    type: "Private",
    admissionYear: 2024,
    website: "https://phenikaa-uni.edu.vn",
  },
  {
    name: "Đại học Kinh tế - ĐH Đà Nẵng",
    image:
      "https://images.unsplash.com/photo-1562774053-701939374587?q=80&w=1974&auto=format&fit=crop",
    location: "Đà Nẵng",
    address: "73 Phan Đăng Lưu, Đà Nẵng",
    type: "Public",
    admissionYear: 2024,
    website: "https://ueh.udn.vn",
  },
  {
    name: "Đại học Sư phạm - ĐH Đà Nẵng",
    image:
      "https://images.unsplash.com/photo-1523050853063-915894691067?q=80&w=2070&auto=format&fit=crop",
    location: "Đà Nẵng",
    address: "135 Phan Đăng Lưu, Đà Nẵng",
    type: "Public",
    admissionYear: 2024,
    website: "https://ued.udn.vn",
  },
  {
    name: "Đại học Ngoại ngữ - ĐHQGHN",
    image:
      "https://images.unsplash.com/photo-1541339907198-e08756edd81f?q=80&w=2070&auto=format&fit=crop",
    location: "Hà Nội",
    address: "Số 7 Phạm Văn Đồng, Cầu Giấy, Hà Nội",
    type: "Public",
    admissionYear: 2024,
    website: "https://ulis.vnu.edu.vn",
  },
  {
    name: "Đại học Luật TP.HCM",
    image:
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=600",
    location: "TP.HCM",
    address: "2 Nguyễn Tất Thành, Quận 4, TP.HCM",
    type: "Public",
    admissionYear: 2024,
    website: "https://hcmule.edu.vn",
  },
  {
    name: "Đại học Sư phạm TP.HCM",
    image:
      "https://images.unsplash.com/photo-1523050853063-915894691067?q=80&w=2070&auto=format&fit=crop",
    location: "TP.HCM",
    address: "280 An Dương Vương, Quận 5, TP.HCM",
    type: "Public",
    admissionYear: 2024,
    website: "https://hcmue.edu.vn",
  },
  {
    name: "Đại học Mở TP.HCM",
    image:
      "https://images.unsplash.com/photo-1541339907198-e08756edd81f?q=80&w=2070&auto=format&fit=crop",
    location: "TP.HCM",
    address: "97 Võ Văn Tần, Quận 3, TP.HCM",
    type: "Public",
    admissionYear: 2024,
    website: "https://ou.edu.vn",
  },
  {
    name: "Đại học Công nghệ TP.HCM (HUTECH)",
    image:
      "https://images.unsplash.com/photo-1562774053-701939374587?q=80&w=1974&auto=format&fit=crop",
    location: "TP.HCM",
    address: "475A Điện Biên Phủ, Bình Thạnh, TP.HCM",
    type: "Private",
    admissionYear: 2024,
    website: "https://hutech.edu.vn",
  },
  {
    name: "Đại học Quốc tế - ĐHQG TP.HCM",
    image:
      "https://images.unsplash.com/photo-1523050853063-915894691067?q=80&w=2070&auto=format&fit=crop",
    location: "TP.HCM",
    address: "66-68 Mai Chí Thọ, TP. Thủ Đức, TP.HCM",
    type: "Public",
    admissionYear: 2024,
    website: "https://hcmiu.edu.vn",
  },
];

const seedUniversities = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/cazup";
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB");

    // Clear existing data
    await University.deleteMany({});
    console.log("Cleared universities");

    // Insert new data
    await University.insertMany(universities);
    console.log(`Successfully seeded ${universities.length} universities`);

    mongoose.disconnect();
  } catch (error) {
    console.error("Error seeding universities:", error);
    process.exit(1);
  }
};

seedUniversities();
