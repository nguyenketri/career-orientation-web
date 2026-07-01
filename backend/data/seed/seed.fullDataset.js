// data/seed/seed.fullDataset.js
// Seed bộ dữ liệu lớn, chuẩn: Trường + Ngành + UniversityMajor (điểm chuẩn & học phí 2023/2024/2025).
//
// Chiến lược an toàn:
//  - University & Major: UPSERT theo "name" -> GIỮ NGUYÊN _id đang có (không phá reference test đã lưu).
//    Ảnh trường lấy từ data.universityImages (ảnh thật Wikimedia đã verify); trường nào không có -> giữ ảnh cũ.
//  - UniversityMajor: làm mới hoàn toàn (không có model nào tham chiếu _id của nó ngoài lịch sử recommend).
//
// Cách sinh điểm chuẩn: điểm mỗi cặp = baseScore(ngành) + scoreAdj(độ hot trường) + nhiễu nhỏ tất định,
//   trừ khi cặp có trong data.anchors (điểm chuẩn thật) thì dùng số thật đó.
// Học phí: baseTuition(trường) * feeMult(ngành), chuẩn hóa VNĐ/NĂM, tăng ~10%/năm khi dựng lịch sử.

const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });
const mongoose = require("mongoose");
const University = require("../../models/university.model");
const Major = require("../../models/major.model");
const UniversityMajor = require("../../models/universityMajor.model");

const universities = require("./data.universities");
const majors = require("./data.majors");
const imagesMap = require("./data.universityImages");
const anchors = require("./data.anchors");

const SUPPORTED_COMBOS = ["A00", "A01", "B00", "C00", "D01"]; // tổ hợp mà recommend theo điểm hỗ trợ

// nhiễu tất định trong [-amp, amp] từ chuỗi khóa (để điểm không bị trùng lặp máy móc mà vẫn ổn định giữa các lần chạy)
function seededNoise(key, amp) {
  let h = 2166136261;
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const unit = ((h >>> 0) % 1000) / 1000; // [0,1)
  return (unit * 2 - 1) * amp;
}

const round05 = (x) => Math.round(x * 20) / 20; // làm tròn 0.05 (điểm)
const round100k = (x) => Math.round(x / 100000) * 100000; // làm tròn 100.000đ (học phí)
const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));

function pickPrimaryCombo(major) {
  const inSupported = major.subjectCombinations.find((c) => SUPPORTED_COMBOS.includes(c));
  return inSupported || major.subjectCombinations[0];
}

// Trường có mở ngành này không? -> giao domain
function universityOffersMajor(uni, major) {
  return major.domains.some((d) => uni.domains.includes(d));
}

// Sinh điểm chuẩn 2025/2024/2023 cho một cặp (uni, major)
function buildScores(uni, major) {
  const key = `${uni.name}|||${major.name}`;
  const anchor = anchors[key];
  if (anchor) {
    return {
      combo: anchor.combo,
      y2025: anchor.y2025,
      y2024: anchor.y2024,
      y2023: anchor.y2023,
      anchored: true,
    };
  }
  const combo = pickPrimaryCombo(major);
  const capHi = major.domains.includes("medical") ? 29.2 : 28.75;
  const noise = seededNoise(key, 0.35);
  let y2025 = clamp(major.baseScore + uni.scoreAdj + noise, 15.5, capHi);
  // Lịch sử: các năm trước thấp hơn theo xu hướng tăng của ngành, thêm nhiễu nhẹ
  const trend = major.scoreTrend;
  let y2024 = clamp(y2025 - trend * 0.5 + seededNoise(key + "24", 0.18), 15.0, capHi);
  let y2023 = clamp(y2025 - trend + seededNoise(key + "23", 0.2), 14.5, capHi);
  // đảm bảo thứ tự hợp lý 2023 <= 2024 <= 2025 (cho phép biến động nhỏ)
  y2024 = Math.min(y2024, y2025);
  y2023 = Math.min(y2023, y2024);
  return {
    combo,
    y2025: round05(y2025),
    y2024: round05(y2024),
    y2023: round05(y2023),
    anchored: false,
  };
}

// Học phí VNĐ/năm cho cặp (uni, major), 3 năm.
// Trường flatTuition (FPT, RMIT, Văn Lang, UEF, NTTU...) thu học phí CỐ ĐỊNH theo trường,
// không nhân theo ngành. Các trường còn lại điều chỉnh nhẹ theo feeMult của ngành.
function buildTuition(uni, major) {
  const raw = uni.flatTuition ? uni.baseTuition : uni.baseTuition * major.feeMult;
  const fee2025 = round100k(clamp(raw, 5000000, 400000000));
  const fee2024 = round100k(fee2025 / 1.1);
  const fee2023 = round100k(fee2024 / 1.1);
  return { fee2025, fee2024, fee2023 };
}

async function run() {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error("MONGO_URI missing in .env");
  await mongoose.connect(uri);
  console.log("✔ Connected to MongoDB Atlas\n");

  // ---------- 1) UPSERT UNIVERSITIES (giữ _id) ----------
  const uniIdByName = {};
  let uniCreated = 0, uniUpdated = 0;
  for (const u of universities) {
    const existing = await University.findOne({ name: u.name });
    const image = imagesMap[u.name] || (existing && existing.image) || "";
    const doc = {
      name: u.name,
      image,
      location: u.location,
      address: u.address,
      type: u.type,
      website: u.website,
      facilities: u.facilities,
      rating: u.rating,
      reviewCount: u.reviewCount,
      isDeleted: false,
      deletedAt: null,
    };
    if (existing) {
      await University.updateOne({ _id: existing._id }, { $set: doc });
      uniIdByName[u.name] = existing._id;
      uniUpdated++;
    } else {
      const created = await University.create(doc);
      uniIdByName[u.name] = created._id;
      uniCreated++;
    }
  }
  console.log(`Universities -> created ${uniCreated}, updated ${uniUpdated}, total ${universities.length}`);

  // ---------- 2) Tính offerings (cặp uni-major) trước để set Major.universities ----------
  const offerings = []; // { uni, major }
  const uniIdsByMajor = {};
  for (const m of majors) uniIdsByMajor[m.name] = [];
  for (const m of majors) {
    for (const u of universities) {
      if (universityOffersMajor(u, m)) {
        offerings.push({ uni: u, major: m });
        uniIdsByMajor[m.name].push(uniIdByName[u.name]);
      }
    }
  }
  console.log(`Offerings (university-major pairs): ${offerings.length}`);

  // ---------- 3) UPSERT MAJORS (giữ _id) ----------
  const majorIdByName = {};
  let mCreated = 0, mUpdated = 0;
  for (const m of majors) {
    const existing = await Major.findOne({ name: m.name });
    const doc = {
      name: m.name,
      description: m.description,
      benchmarkScore: m.baseScore,
      hollandTypes: m.hollandTypes,
      mbtiTypes: m.mbtiTypes,
      subjectCombinations: m.subjectCombinations,
      tuitionFee: m.tuitionFee,
      universities: uniIdsByMajor[m.name],
      isDeleted: false,
      deletedAt: null,
    };
    if (existing) {
      await Major.updateOne({ _id: existing._id }, { $set: doc });
      majorIdByName[m.name] = existing._id;
      mUpdated++;
    } else {
      const created = await Major.create(doc);
      majorIdByName[m.name] = created._id;
      mCreated++;
    }
  }
  console.log(`Majors -> created ${mCreated}, updated ${mUpdated}, total ${majors.length}`);

  // ---------- 4) Làm mới UNIVERSITYMAJOR ----------
  await UniversityMajor.deleteMany({});
  console.log("Cleared old UniversityMajor documents");

  const umDocs = [];
  let anchoredCount = 0;
  for (const { uni, major } of offerings) {
    const s = buildScores(uni, major);
    const t = buildTuition(uni, major);
    if (s.anchored) anchoredCount++;
    umDocs.push({
      university: uniIdByName[uni.name],
      major: majorIdByName[major.name],
      admissionScore: s.y2025,
      subjectCombination: s.combo,
      tuitionFee: t.fee2025,
      admissionHistory: [
        { year: 2025, admissionScore: s.y2025, tuitionFee: t.fee2025, subjectCombination: s.combo },
        { year: 2024, admissionScore: s.y2024, tuitionFee: t.fee2024, subjectCombination: s.combo },
        { year: 2023, admissionScore: s.y2023, tuitionFee: t.fee2023, subjectCombination: s.combo },
      ],
      isDeleted: false,
      deletedAt: null,
    });
  }
  await UniversityMajor.insertMany(umDocs);
  console.log(`UniversityMajor -> inserted ${umDocs.length} (trong đó ${anchoredCount} cặp dùng điểm chuẩn thật/anchor)`);

  // ---------- 5) Tổng kết ----------
  const [uc, mc, umc] = await Promise.all([
    University.countDocuments({ isDeleted: false }),
    Major.countDocuments({ isDeleted: false }),
    UniversityMajor.countDocuments({ isDeleted: false }),
  ]);
  console.log(`\n=== DONE. DB now has: ${uc} universities, ${mc} majors, ${umc} universityMajors ===`);

  await mongoose.disconnect();
}

run().catch((e) => {
  console.error("SEED ERROR:", e);
  process.exit(1);
});
