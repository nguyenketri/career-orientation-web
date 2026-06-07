// data/seed/runAllSeeds.js
// Chạy tuần tự tất cả các script seed dữ liệu để không bị lỗi đồng bộ

const { exec } = require("child_process");
const path = require("path");

const seeds = [
  "seed.universities.js",
  "seed.majors.js", // Phải chạy sau universities vì cần lấy ID trường
  "seed.hollandQuestions.js",
  "seed.mbtiQuestions.js",
  "seed.universityMajor.js",
];

console.log("🚀 Bắt đầu quá trình nạp dữ liệu (seed)...");

const runSeed = (index) => {
  if (index >= seeds.length) {
    console.log("🎉 Đã hoàn tất toàn bộ quá trình nạp dữ liệu!");
    return;
  }

  const file = seeds[index];
  console.log(`\n⏳ Đang chạy: ${file}...`);

  exec(`node ${file}`, { cwd: __dirname }, (error, stdout, stderr) => {
    if (error) {
      console.error(`❌ Lỗi khi chạy ${file}:`);
      console.error(stderr);
      // Có thể không thoát để chạy tiếp file khác, hoặc thoát tùy nhu cầu
      process.exit(1);
    }

    console.log(stdout.trim());
    console.log(`✅ Chạy xong: ${file}`);

    // Đệ quy chạy file tiếp theo
    runSeed(index + 1);
  });
};

// Bắt đầu chạy từ file số 0
runSeed(0);
