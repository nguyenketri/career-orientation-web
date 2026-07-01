// data/seed/data.anchors.js
// Điểm chuẩn THẬT (tham chiếu) cho các cặp Trường–Ngành nổi tiếng, dùng tổ hợp phổ biến nhất.
// Nguồn: điểm chuẩn công bố các năm 2023, 2024 + ước lượng 2025 theo xu hướng.
// Key: "Tên trường|||Tên ngành". Nếu có anchor, generator sẽ dùng số này thay cho công thức.
// (Các cặp không có anchor sẽ được sinh theo mô hình nhất quán: baseScore + độ hot của trường.)

module.exports = {
  // --- Công nghệ / Máy tính ---
  "Đại học Bách khoa Hà Nội|||Khoa học Máy tính": { combo: "A00", y2023: 28.8, y2024: 28.53, y2025: 28.4 },
  "Đại học Bách khoa Hà Nội|||Công nghệ Thông tin": { combo: "A00", y2023: 28.05, y2024: 28.0, y2025: 27.95 },
  "Đại học Bách khoa Hà Nội|||Kỹ thuật Điều khiển & Tự động hóa": { combo: "A00", y2023: 27.35, y2024: 27.42, y2025: 27.3 },
  "Đại học Công nghệ - ĐHQGHN|||Công nghệ Thông tin": { combo: "A00", y2023: 27.25, y2024: 27.68, y2025: 27.6 },
  "Đại học Công nghệ - ĐHQGHN|||Trí tuệ Nhân tạo": { combo: "A00", y2023: 27.5, y2024: 27.87, y2025: 27.8 },
  "Đại học Bách khoa - ĐHQG TP.HCM|||Khoa học Máy tính": { combo: "A00", y2023: 26.6, y2024: 27.2, y2025: 27.1 },
  "Đại học Công nghệ Thông tin - ĐHQG TP.HCM|||Khoa học Máy tính": { combo: "A00", y2023: 27.1, y2024: 27.3, y2025: 27.2 },
  "Đại học Công nghệ Thông tin - ĐHQG TP.HCM|||An toàn Thông tin": { combo: "A00", y2023: 26.75, y2024: 27.0, y2025: 26.9 },
  "Đại học Khoa học Tự nhiên - ĐHQG TP.HCM|||Khoa học Máy tính": { combo: "A00", y2023: 27.0, y2024: 27.2, y2025: 27.1 },

  // --- Kinh tế / Ngoại thương / NEU ---
  "Đại học Ngoại thương|||Kinh tế Quốc tế": { combo: "A00", y2023: 28.4, y2024: 28.5, y2025: 28.3 },
  "Đại học Ngoại thương|||Kinh doanh Quốc tế": { combo: "A00", y2023: 28.1, y2024: 28.15, y2025: 28.05 },
  "Đại học Kinh tế Quốc dân|||Quan hệ Quốc tế": { combo: "A01", y2023: 27.3, y2024: 27.6, y2025: 27.5 },
  "Đại học Kinh tế Quốc dân|||Marketing": { combo: "A00", y2023: 27.2, y2024: 27.55, y2025: 27.45 },
  "Đại học Kinh tế Quốc dân|||Logistics & Quản lý Chuỗi cung ứng": { combo: "A00", y2023: 27.4, y2024: 27.6, y2025: 27.5 },
  "Đại học Kinh tế Quốc dân|||Kinh tế Quốc tế": { combo: "A00", y2023: 27.25, y2024: 27.5, y2025: 27.4 },
  "Đại học Kinh tế TP.HCM (UEH)|||Marketing": { combo: "A00", y2023: 26.8, y2024: 27.0, y2025: 26.9 },
  "Đại học Kinh tế TP.HCM (UEH)|||Logistics & Quản lý Chuỗi cung ứng": { combo: "A00", y2023: 26.7, y2024: 26.9, y2025: 26.8 },

  // --- Y - Dược ---
  "Đại học Y Hà Nội|||Y Đa khoa": { combo: "B00", y2023: 27.73, y2024: 28.27, y2025: 28.1 },
  "Đại học Y Hà Nội|||Răng Hàm Mặt": { combo: "B00", y2023: 27.85, y2024: 28.0, y2025: 27.9 },
  "Đại học Y Dược TP.HCM|||Y Đa khoa": { combo: "B00", y2023: 27.34, y2024: 27.8, y2025: 27.65 },
  "Đại học Y Dược TP.HCM|||Răng Hàm Mặt": { combo: "B00", y2023: 27.4, y2024: 27.6, y2025: 27.5 },
  "Đại học Y Dược TP.HCM|||Dược học": { combo: "A00", y2023: 26.0, y2024: 26.3, y2025: 26.2 },
  "Đại học Dược Hà Nội|||Dược học": { combo: "A00", y2023: 25.05, y2024: 25.5, y2025: 25.4 },

  // --- Sư phạm ---
  "Đại học Sư phạm Hà Nội|||Sư phạm Toán học": { combo: "A00", y2023: 28.42, y2024: 28.6, y2025: 28.5 },
  "Đại học Sư phạm Hà Nội|||Sư phạm Tiếng Anh": { combo: "D01", y2023: 28.0, y2024: 28.2, y2025: 28.1 },

  // --- Luật / Ngoại giao ---
  "Đại học Luật Hà Nội|||Luật": { combo: "C00", y2023: 27.36, y2024: 27.0, y2025: 26.9 },
  "Học viện Ngoại giao|||Quan hệ Quốc tế": { combo: "C00", y2023: 28.46, y2024: 28.2, y2025: 28.1 },
};
