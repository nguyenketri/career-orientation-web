// Render (production) là môi trường Linux tối giản: thiếu các thư viện hệ
// thống mà Chrome đầy đủ cần (libnss3, libatk...) và RAM giới hạn khiến
// puppeteer full-Chrome liên tục lỗi 500 (dù local Windows luôn chạy được
// vì có sẵn đủ thư viện). @sparticuz/chromium là bản Chromium build riêng
// cho môi trường serverless/PaaS — không phụ thuộc thư viện hệ thống ngoài,
// nhẹ hơn nhiều, dùng cho production; local dev vẫn dùng puppeteer đầy đủ.
const isProd = process.env.NODE_ENV === "production" || !!process.env.RENDER;
const puppeteer = isProd ? require("puppeteer-core") : require("puppeteer");
const chromium = isProd ? require("@sparticuz/chromium") : null;
const User = require("../models/user.model");
const HollandResult = require("../models/hollandResult.model");
const MbtiResult = require("../models/mbtiResult.model");

// Ưu điểm / điểm mù ngắn gọn theo từng loại MBTI — dùng để cá nhân hoá báo cáo
// thay vì hiển thị 1 đoạn text chung chung cho mọi loại tính cách.
const MBTI_INSIGHTS = {
  INTJ: { strengths: "Tư duy chiến lược, độc lập, lập kế hoạch dài hạn xuất sắc.", blindspots: "Đôi khi quá cầu toàn, khó thích nghi với thay đổi đột ngột." },
  INTP: { strengths: "Phân tích sắc bén, sáng tạo khi giải quyết vấn đề, ham học hỏi.", blindspots: "Dễ sa đà vào lý thuyết, thiếu kiên nhẫn với chi tiết thực thi." },
  ENTJ: { strengths: "Lãnh đạo quyết đoán, tổ chức tốt, định hướng mục tiêu rõ ràng.", blindspots: "Có thể nóng vội, ít chú ý cảm xúc người khác khi ra quyết định." },
  ENTP: { strengths: "Sáng tạo, linh hoạt, giỏi tranh biện và kết nối ý tưởng mới.", blindspots: "Dễ mất tập trung, khó hoàn thành công việc lặp đi lặp lại." },
  INFJ: { strengths: "Thấu cảm sâu sắc, có tầm nhìn, kiên định với giá trị bản thân.", blindspots: "Dễ ôm đồm cảm xúc người khác, ngại xung đột." },
  INFP: { strengths: "Giàu lý tưởng, sáng tạo, trung thành với giá trị cá nhân.", blindspots: "Nhạy cảm quá mức với phê bình, dễ trì hoãn khi thiếu cảm hứng." },
  ENFJ: { strengths: "Truyền cảm hứng, thấu hiểu người khác, giỏi kết nối cộng đồng.", blindspots: "Dễ đặt nhu cầu người khác lên trên bản thân, dễ kiệt sức." },
  ENFP: { strengths: "Năng động, sáng tạo, truyền năng lượng tích cực cho tập thể.", blindspots: "Khó tập trung dài hạn, dễ bị phân tán bởi ý tưởng mới." },
  ISTJ: { strengths: "Trách nhiệm cao, kỷ luật, đáng tin cậy trong công việc.", blindspots: "Ngại thay đổi, đôi khi cứng nhắc với quy trình." },
  ISFJ: { strengths: "Tận tụy, chu đáo, quan tâm chi tiết đến người xung quanh.", blindspots: "Ngại nói lên nhu cầu bản thân, dễ ôm việc quá sức." },
  ESTJ: { strengths: "Quyết đoán, tổ chức chặt chẽ, giỏi quản lý và thực thi kế hoạch.", blindspots: "Có thể áp đặt quan điểm, ít linh hoạt với cách làm mới." },
  ESFJ: { strengths: "Hòa đồng, tận tâm, giỏi xây dựng và duy trì các mối quan hệ.", blindspots: "Quá coi trọng ý kiến người khác, ngại quyết định gây tranh cãi." },
  ISTP: { strengths: "Thực tế, bình tĩnh xử lý tình huống, khéo léo với vấn đề kỹ thuật.", blindspots: "Ngại cam kết dài hạn, đôi khi khép kín cảm xúc." },
  ISFP: { strengths: "Nhạy cảm với cái đẹp, linh hoạt, sống thật với cảm xúc bản thân.", blindspots: "Ngại xung đột, dễ tránh né kế hoạch dài hạn." },
  ESTP: { strengths: "Năng động, quyết đoán, xử lý tình huống thực tế nhanh nhạy.", blindspots: "Dễ hành động bốc đồng, thiếu kiên nhẫn với lý thuyết dài dòng." },
  ESFP: { strengths: "Vui vẻ, nhiệt tình, giỏi tạo không khí tích cực cho tập thể.", blindspots: "Dễ xao nhãng mục tiêu dài hạn, ngại đối mặt vấn đề nghiêm túc." },
};

const escapeHtml = (str) =>
  String(str ?? "").replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c],
  );

const generateHtmlTemplate = (user, holland, mbti) => {
  const reportCode = `CZ-${user._id.toString().slice(-6).toUpperCase()}-${new Date().getFullYear()}`;
  const reportDate = new Date().toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  // MBTI Progress Bars Calculation
  const mbtiPairs = [
    { left: "E", right: "I", label: "Hướng ngoại / Hướng nội" },
    { left: "S", right: "N", label: "Cảm giác / Trực giác" },
    { left: "T", right: "F", label: "Lý trí / Cảm xúc" },
    { left: "J", right: "P", label: "Nguyên tắc / Linh hoạt" },
  ];

  const mbtiBars = mbtiPairs.map((pair) => {
    const leftScore = mbti.scores?.[pair.left] || 0;
    const rightScore = mbti.scores?.[pair.right] || 0;
    const total = leftScore + rightScore || 1;
    const leftPercent = Math.round((leftScore / total) * 100);
    const rightPercent = 100 - leftPercent;
    return { ...pair, leftPercent, rightPercent };
  });

  const mbtiInsight = MBTI_INSIGHTS[mbti.mbtiType] || {
    strengths: "Hoàn thành bài test MBTI để nhận phân tích ưu điểm cá nhân hoá.",
    blindspots: "Hoàn thành bài test MBTI để nhận phân tích điểm mù cá nhân hoá.",
  };

  // Holland Top 3 — quy đổi % theo điểm cao nhất thực tế thay vì mốc cố định,
  // vì số câu hỏi (và điểm tối đa có thể) khác nhau giữa các gói.
  const hollandEntries = Object.entries(holland.hollandScores || {});
  const hollandMax = Math.max(1, ...hollandEntries.map(([, s]) => Number(s) || 0));
  const hollandScores = [...hollandEntries]
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([type, score]) => ({ type, score }));

  const hollandMap = {
    R: "Kỹ thuật (Realistic)",
    I: "Nghiên cứu (Investigative)",
    A: "Nghệ thuật (Artistic)",
    S: "Xã hội (Social)",
    E: "Quản lý (Enterprising)",
    C: "Công chức (Conventional)",
  };
  const hollandThemeMap = {
    R: "thực hành, kỹ thuật và máy móc",
    I: "nghiên cứu, phân tích",
    A: "sáng tạo, nghệ thuật",
    S: "xã hội và con người",
    E: "kinh doanh, lãnh đạo",
    C: "tổ chức, quy trình",
  };

  // Ngành học gợi ý — gộp từ cả 2 bài test (Holland + MBTI), loại trùng theo id.
  const seenMajorIds = new Set();
  const recommendations = [
    ...(holland.recommendedMajors || []),
    ...(mbti.recommendedMajors || []),
  ].filter((rec) => {
    const id = rec?._id ? String(rec._id) : rec?.name;
    if (!id || seenMajorIds.has(id)) return false;
    seenMajorIds.add(id);
    return true;
  });

  const MAX_UNIVERSITIES_SHOWN = 3;
  const tableRows = recommendations
    .slice(0, 5)
    .map((rec) => {
      const majorName = escapeHtml(rec.name || rec.majorName || "N/A");
      const analysisRaw =
        rec.aiAnalysis ||
        rec.description ||
        holland.aiAnalysis ||
        "Phù hợp với thiên hướng tính cách và năng lực cốt lõi của bạn.";
      const analysis = escapeHtml(analysisRaw);
      const uniList = rec.universities || [];
      const shownUnis = uniList.slice(0, MAX_UNIVERSITIES_SHOWN).map((u) => u.name || u);
      const extraCount = uniList.length - shownUnis.length;
      const universities =
        uniList.length > 0
          ? escapeHtml(shownUnis.join(", ")) +
            (extraCount > 0 ? ` <span class="td-more">+${extraCount} trường khác</span>` : "")
          : "Đang cập nhật";

      return `
        <tr>
          <td class="td-major">${majorName}</td>
          <td>${analysis.substring(0, 120)}${analysis.length > 120 ? "..." : ""}</td>
          <td>${universities}</td>
        </tr>
      `;
    })
    .join("");

  const tableEmptyState = `
    <tr>
      <td colspan="3" style="text-align:center; color:#94a3b8; padding: 24px;">
        Chưa có ngành học gợi ý — hãy hoàn thành bài test Holland/MBTI để nhận đề xuất cá nhân hoá.
      </td>
    </tr>
  `;

  const pageFooter = (pageNum) => `
    <div class="footer">
      <div class="footer-line">Báo cáo được tạo tự động bởi Hệ thống Định hướng Nghề nghiệp caZup · ${reportDate}</div>
      <div class="footer-line">Website: cazup.io.vn &nbsp;·&nbsp; Email: support@cazup.io.vn</div>
      <div class="footer-page">Trang ${pageNum} / 3</div>
    </div>
  `;

  const headerHtml = (subtitle) => `
    <div class="header">
      <div class="brand">
        <div class="brand-badge">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M12 2l2.4 6.6L21 11l-6.6 2.4L12 20l-2.4-6.6L3 11l6.6-2.4L12 2z" fill="#fff"/>
          </svg>
        </div>
        <div class="brand-text">caZup<span>.</span></div>
      </div>
      <div class="header-right">
        <div class="report-code">Mã báo cáo: ${reportCode}</div>
        <div class="report-sub">${subtitle}</div>
      </div>
    </div>
  `;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        * { box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #334155; margin: 0; padding: 0; line-height: 1.6; -webkit-font-smoothing: antialiased; }
        .page { width: 210mm; min-height: 297mm; padding: 16mm 20mm; display: flex; flex-direction: column; page-break-after: always; }
        .page:last-child { page-break-after: avoid; }
        .page-body { flex: 1 0 auto; }

        .header { display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 2px solid #f97316; padding-bottom: 12px; margin-bottom: 28px; }
        .brand { display: flex; align-items: center; gap: 10px; }
        .brand-badge { width: 32px; height: 32px; border-radius: 10px; background: linear-gradient(135deg, #f97316, #ea580c); display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 6px rgba(249,115,22,0.35); }
        .brand-text { font-size: 22px; font-weight: 900; color: #0f172a; }
        .brand-text span { color: #f97316; }
        .header-right { text-align: right; }
        .report-code { font-size: 11px; color: #94a3b8; font-weight: 700; letter-spacing: 0.3px; }
        .report-sub { font-size: 13px; color: #0f172a; font-weight: 800; margin-top: 2px; }

        .welcome-box { background: #fff7ed; border-left: 5px solid #f97316; padding: 18px 20px; margin-bottom: 26px; border-radius: 0 12px 12px 0; }
        .welcome-box h2 { margin: 0; font-size: 19px; color: #0f172a; }
        .welcome-box p { margin: 4px 0 0 0; font-size: 13px; color: #64748b; }

        .section-title { font-size: 16px; font-weight: 800; color: #0f172a; margin-bottom: 16px; display: flex; align-items: center; gap: 9px; }
        .section-title::before { content: ''; width: 4px; height: 18px; background: #f97316; display: inline-block; border-radius: 2px; }

        /* MBTI Bars */
        .mbti-container { margin-bottom: 22px; }
        .mbti-bar-group { margin-bottom: 13px; }
        .bar-label { display: flex; justify-content: space-between; font-size: 11px; font-weight: 700; margin-bottom: 5px; color: #475569; }
        .bar-bg { height: 10px; background: #e2e8f0; border-radius: 6px; overflow: hidden; display: flex; }
        .bar-fill { height: 100%; background: linear-gradient(90deg, #fb923c, #f97316); }
        .insight-box { font-size: 12.5px; color: #475569; margin-bottom: 32px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px 16px; }
        .insight-box p { margin: 0 0 6px 0; }
        .insight-box p:last-child { margin-bottom: 0; }

        /* Holland Section */
        .holland-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 26px; }
        .holland-chart { display: flex; flex-direction: column; gap: 11px; }
        .holland-bar-item { display: flex; align-items: center; gap: 10px; }
        .h-label { width: 18px; font-weight: 800; color: #1d4ed8; font-size: 12px; }
        .h-bar-bg { flex: 1; height: 12px; background: #e2e8f0; border-radius: 6px; overflow: hidden; }
        .h-bar-fill { height: 100%; background: linear-gradient(90deg, #60a5fa, #3b82f6); border-radius: 6px; }
        .h-pct { width: 32px; text-align: right; font-size: 11px; font-weight: 700; color: #64748b; }
        .holland-side { font-size: 12.5px; color: #475569; }
        .holland-side strong { color: #0f172a; }
        .holland-side .hl-item { margin-bottom: 6px; }

        /* Table */
        .table-wrap { border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; margin-top: 18px; }
        table { width: 100%; border-collapse: collapse; font-size: 12px; }
        th { background: #0f172a; color: #f8fafc; text-align: left; padding: 11px 14px; font-weight: 700; font-size: 11px; text-transform: uppercase; letter-spacing: 0.4px; }
        td { padding: 11px 14px; border-top: 1px solid #eef2f7; vertical-align: top; color: #475569; }
        tbody tr:nth-child(even) { background: #f8fafc; }
        .td-major { font-weight: 700; color: #0f172a; white-space: nowrap; }
        .td-more { color: #f97316; font-weight: 700; white-space: nowrap; }
        th:nth-child(1), td:nth-child(1) { width: 20%; }
        th:nth-child(2), td:nth-child(2) { width: 42%; }
        th:nth-child(3), td:nth-child(3) { width: 38%; }

        /* Timeline */
        .timeline { margin-top: 22px; position: relative; padding-left: 26px; }
        .timeline-item { position: relative; margin-bottom: 22px; }
        .timeline-item::before { content: ''; position: absolute; left: -26px; top: 4px; width: 11px; height: 11px; background: #f97316; border-radius: 50%; z-index: 2; box-shadow: 0 0 0 3px #ffedd5; }
        .timeline-item::after { content: ''; position: absolute; left: -21px; top: 15px; width: 2px; height: calc(100% + 8px); background: #e2e8f0; z-index: 1; }
        .timeline-item:last-child::after { display: none; }
        .timeline-date { font-weight: 800; color: #f97316; font-size: 13px; }
        .timeline-content { font-size: 12.5px; color: #475569; margin-top: 2px; }

        .highlight-box { background: #f0f9ff; border: 1px solid #bae6fd; padding: 18px 20px; border-radius: 14px; margin-top: 30px; font-style: italic; color: #0369a1; font-size: 12.5px; }
        .advice-box { margin-top: 26px; padding: 16px 18px; background: #f8fafc; border-radius: 14px; border: 1px solid #e2e8f0; }
        .advice-box h4 { margin: 0 0 8px 0; font-size: 13px; color: #0f172a; }
        .advice-box p { margin: 0; font-size: 12.5px; color: #475569; line-height: 1.6; }

        .footer { margin-top: auto; padding-top: 12px; border-top: 1px solid #e2e8f0; text-align: center; }
        .footer-line { font-size: 9.5px; color: #94a3b8; }
        .footer-page { font-size: 9.5px; color: #cbd5e1; margin-top: 4px; font-weight: 700; }
      </style>
    </head>
    <body>
      <!-- PAGE 1 -->
      <div class="page">
        <div class="page-body">
          ${headerHtml("Bản đồ Tính cách & Thiên hướng")}

          <div class="welcome-box">
            <h2>Chúc mừng bạn ${escapeHtml(user.name)}!</h2>
            <p>Bạn đã hoàn thành bộ giải pháp định hướng nghề nghiệp toàn diện · Ngày xuất báo cáo: ${reportDate}</p>
          </div>

          <div class="section-title">Bản đồ Tính cách MBTI · ${escapeHtml(mbti.mbtiType || "Chưa xác định")}</div>
          <div class="mbti-container">
            ${mbtiBars
              .map(
                (bar) => `
              <div class="mbti-bar-group">
                <div class="bar-label">
                  <span>${bar.left} (${bar.leftPercent}%)</span>
                  <span>${bar.label}</span>
                  <span>${bar.rightPercent}% (${bar.right})</span>
                </div>
                <div class="bar-bg">
                  <div class="bar-fill" style="width: ${bar.leftPercent}%"></div>
                </div>
              </div>
            `,
              )
              .join("")}
          </div>
          <div class="insight-box">
            <p><strong>Ưu điểm:</strong> ${escapeHtml(mbtiInsight.strengths)}</p>
            <p><strong>Điểm mù:</strong> ${escapeHtml(mbtiInsight.blindspots)}</p>
          </div>

          <div class="section-title">Thiên hướng Nghề nghiệp Holland · ${escapeHtml(holland.hollandType || "Chưa xác định")}</div>
          <div class="holland-grid">
            <div class="holland-chart">
              ${hollandEntries
                .map(
                  ([type, score]) => `
                <div class="holland-bar-item">
                  <div class="h-label">${type}</div>
                  <div class="h-bar-bg">
                    <div class="h-bar-fill" style="width: ${Math.round((Number(score) / hollandMax) * 100)}%"></div>
                  </div>
                  <div class="h-pct">${Math.round((Number(score) / hollandMax) * 100)}%</div>
                </div>
              `,
                )
                .join("")}
            </div>
            <div class="holland-side">
              <div class="hl-item"><strong>Top 3 mã kết hợp:</strong> ${hollandScores.map((s) => s.type).join(" - ") || "—"}</div>
              ${hollandScores.map((s) => `<div class="hl-item">• <strong>${hollandMap[s.type] || s.type}</strong>: Thiên hướng về ${hollandThemeMap[s.type] || "lĩnh vực phù hợp"}.</div>`).join("")}
            </div>
          </div>
        </div>
        ${pageFooter(1)}
      </div>

      <!-- PAGE 2 -->
      <div class="page">
        <div class="page-body">
          ${headerHtml("Chiến lược AI Mentor")}

          <div class="section-title">Phân tích giao thoa & Đề xuất bởi AI Mentor</div>
          <p style="font-size: 12.5px; color: #64748b; margin-bottom: 8px;">Dựa trên sự kết hợp giữa tính cách ${escapeHtml(mbti.mbtiType || "—")} và thiên hướng ${escapeHtml(holland.hollandType || "—")}, AI đề xuất các lộ trình tối ưu sau:</p>

          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Top Ngành Học Tối Ưu</th>
                  <th>Tại sao bạn hợp?</th>
                  <th>Trường Đào Tạo Gợi Ý</th>
                </tr>
              </thead>
              <tbody>
                ${tableRows || tableEmptyState}
              </tbody>
            </table>
          </div>

          <div class="advice-box">
            <h4>💡 Lời khuyên chiến lược</h4>
            <p>Hãy tập trung phát triển kỹ năng tư duy phản biện và khả năng tự học. Sự kết hợp giữa tính cách của bạn và thiên hướng nghề nghiệp cho thấy bạn sẽ thành công nhất trong những môi trường cho phép sự sáng tạo đi kèm với kỷ luật logic.</p>
          </div>
        </div>
        ${pageFooter(2)}
      </div>

      <!-- PAGE 3 -->
      <div class="page">
        <div class="page-body">
          ${headerHtml("Lộ trình hành động")}

          <div class="section-title">Lộ trình hành động 12 tháng</div>
          <div class="timeline">
            <div class="timeline-item">
              <div class="timeline-date">Tháng 1 - 3: Giai đoạn Chuẩn bị</div>
              <div class="timeline-content">Tập trung củng cố kiến thức nền tảng, xác định khối thi mục tiêu và rèn luyện kỹ năng quản lý thời gian.</div>
            </div>
            <div class="timeline-item">
              <div class="timeline-date">Tháng 4 - 6: Giai đoạn Trải nghiệm</div>
              <div class="timeline-content">Tham gia các ngày hội hướng nghiệp, tìm hiểu chi tiết về chương trình đào tạo của các trường Top gợi ý.</div>
            </div>
            <div class="timeline-item">
              <div class="timeline-date">Tháng 7 - 12: Giai đoạn Tăng tốc</div>
              <div class="timeline-content">Hoàn thiện hồ sơ xét tuyển, tập trung ôn luyện cường độ cao cho kỳ thi chính thức.</div>
            </div>
          </div>

          <div class="highlight-box">
            <strong>Thông điệp từ AI Mentor:</strong><br>
            "Bạn sở hữu một tổ hợp năng lực rất đặc biệt. Đừng ngần ngại thử thách bản thân ở những lĩnh vực mới. Sự kiên trì và niềm tin vào bản thân sẽ là chìa khóa mở ra cánh cửa thành công của bạn. Hãy tiến về phía trước với sự tự tin!"
          </div>
        </div>
        ${pageFooter(3)}
      </div>
    </body>
    </html>
  `;
};

const generateTestResultPdf = async (userId, res) => {
  console.log(`[PDF Service] Starting PDF generation for user: ${userId}`);
  try {
    const user = await User.findById(userId);
    console.log(`[PDF Service] User found: ${user ? user.name : "Not Found"}`);
    if (!user) {
      throw new Error("User not found.");
    }

    const holland = (await HollandResult.findOne({ user: userId })
      .sort({ createdAt: -1 })
      .populate({
        path: "recommendedMajors",
        populate: { path: "universities" },
      })) || {
      hollandScores: {},
      hollandType: "Chưa xác định",
      recommendedMajors: [],
      aiAnalysis:
        "Vui lòng hoàn thành bài test Holland để nhận phân tích chi tiết.",
    };
    console.log(
      `[PDF Service] Holland result fetched: ${!!holland.hollandScores}`,
    );

    const mbti = (await MbtiResult.findOne({ user: userId }).sort({
      createdAt: -1,
    })) || {
      mbtiType: "Chưa xác định",
      scores: {},
      aiAnalysis:
        "Vui lòng hoàn thành bài test MBTI để nhận phân tích chi tiết.",
    };
    console.log(`[PDF Service] MBTI result fetched: ${!!mbti.mbtiType}`);

    let htmlContent;
    try {
      htmlContent = generateHtmlTemplate(user, holland, mbti);
      console.log(`[PDF Service] HTML template generated successfully`);
    } catch (templateError) {
      console.error("[PDF Service] HTML Template Error:", templateError);
      throw new Error("Failed to generate report template.");
    }

    let browser;
    try {
      console.log(`[PDF Service] Launching Puppeteer (env: ${isProd ? "production/sparticuz" : "local/full-chrome"})`);

      if (isProd) {
        // executablePath() tải/giải nén binary Chromium đóng gói sẵn trong
        // chính package @sparticuz/chromium — không phụ thuộc bước cài Chrome
        // riêng ở build time, nên miễn nhiễm với các lỗi build OOM / sai
        // đường dẫn từng gặp trước đây trên Render.
        browser = await puppeteer.launch({
          args: chromium.args,
          defaultViewport: chromium.defaultViewport,
          executablePath: await chromium.executablePath(),
          headless: chromium.headless,
        });
      } else {
        // process.env.PUPPETEER_EXECUTABLE_PATH vẫn được tôn trọng nếu có,
        // cho phép override thủ công khi cần mà không phải sửa code.
        browser = await puppeteer.launch({
          headless: true,
          executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
          args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-dev-shm-usage",
            "--disable-gpu",
          ],
        });
      }
      console.log(`[PDF Service] Browser launched successfully`);

      const page = await browser.newPage();
      console.log(`[PDF Service] New page created`);
      await page.setContent(htmlContent, {
        waitUntil: "load",
        timeout: 30000,
      });
      console.log(`[PDF Service] Content set successfully`);

      const pdfBuffer = await page.pdf({
        format: "A4",
        printBackground: true,
        margin: { top: "0px", right: "0px", bottom: "0px", left: "0px" },
      });
      console.log(`[PDF Service] PDF buffer generated`);

      res.setHeader("Content-Type", "application/pdf");
      const safeName = (user.name || "user").replace(/\s+/g, "_");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=career-report-${safeName}.pdf`,
      );

      console.log(`[PDF Service] Sending PDF response`);
      return res.send(pdfBuffer);
    } catch (error) {
      console.error("[PDF Service] Puppeteer Error:", error);
      throw error;
    } finally {
      if (browser) {
        await browser.close();
        console.log(`[PDF Service] Browser closed`);
      }
    }
  } catch (globalError) {
    console.error("[PDF Service] Global Error:", globalError);
    throw globalError;
  }
};

module.exports = { generateTestResultPdf };
