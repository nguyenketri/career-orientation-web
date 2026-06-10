const puppeteer = require("puppeteer-core");
const chromium = require("@sparticuz/chromium");
const os = require("os");
const path = require("path");
const User = require("../models/user.model");
const HollandResult = require("../models/hollandResult.model");
const MbtiResult = require("../models/mbtiResult.model");

const generateHtmlTemplate = (user, holland, mbti) => {
  const reportCode = `CZ-${user._id.toString().slice(-6).toUpperCase()}-${new Date().getFullYear()}`;

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

  // Holland Top 3
  const hollandScores = Object.entries(holland.hollandScores || {})
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

  // Recommended Majors Table
  const recommendations = holland.recommendedMajors || [];
  const tableRows = recommendations
    .slice(0, 5)
    .map((rec) => {
      const majorName = rec.name || rec.majorName || "N/A";
      const analysis =
        rec.aiAnalysis ||
        rec.description ||
        holland.aiAnalysis ||
        "Phù hợp với thiên hướng tính cách và năng lực cốt lõi của bạn.";
      const universities =
        rec.universities && rec.universities.length > 0
          ? rec.universities.map((u) => u.name || u).join(", ")
          : "Đang cập nhật";

      return `
        <tr>
          <td style="border: 1px solid #e2e8f0; padding: 12px; font-weight: bold;">${majorName}</td>
          <td style="border: 1px solid #e2e8f0; padding: 12px;">${analysis.substring(0, 150)}${analysis.length > 150 ? "..." : ""}</td>
          <td style="border: 1px solid #e2e8f0; padding: 12px;">${universities}</td>
        </tr>
      `;
    })
    .join("");

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #334155; margin: 0; padding: 0; line-height: 1.6; }
        .page { width: 210mm; height: 297mm; padding: 20mm; box-sizing: border-box; position: relative; page-break-after: always; }
        .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #f97316; padding-bottom: 10px; margin-bottom: 30px; }
        .logo { font-size: 24px; font-weight: 900; color: #f97316; }
        .report-code { font-size: 12px; color: #94a3b8; font-weight: bold; }
        .welcome-box { background: #fff7ed; border-left: 5px solid #f97316; padding: 20px; margin-bottom: 30px; border-radius: 0 10px 10px 0; }
        .section-title { font-size: 18px; font-weight: 800; color: #0f172a; margin-bottom: 20px; display: flex; align-items: center; gap: 10px; }
        .section-title::before { content: ''; width: 4px; height: 20px; background: #f97316; display: inline-block; border-radius: 2px; }
        
        /* MBTI Bars */
        .mbti-container { margin-bottom: 30px; }
        .mbti-bar-group { margin-bottom: 15px; }
        .bar-label { display: flex; justify-content: space-between; font-size: 12px; font-weight: bold; margin-bottom: 5px; }
        .bar-bg { height: 12px; background: #e2e8f0; border-radius: 6px; overflow: hidden; display: flex; }
        .bar-fill { height: 100%; background: #f97316; transition: width 0.3s; }
        
        /* Holland Section */
        .holland-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; }
        .holland-chart { display: flex; flex-direction: column; gap: 10px; }
        .holland-bar-item { display: flex; align-items: center; gap: 10px; }
        .h-label { width: 20px; font-weight: bold; }
        .h-bar-bg { flex: 1; height: 15px; background: #e2e8f0; border-radius: 3px; overflow: hidden; }
        .h-bar-fill { height: 100%; background: #3b82f6; }
        
        /* Table */
        table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 13px; }
        th { background: #f8fafc; text-align: left; padding: 12px; border: 1px solid #e2e8f0; color: #64748b; font-weight: bold; }
        
        /* Timeline */
        .timeline { margin-top: 30px; position: relative; padding-left: 30px; }
        .timeline-item { position: relative; margin-bottom: 25px; }
        .timeline-item::before { content: ''; position: absolute; left: -30px; top: 5px; width: 12px; height: 12px; background: #f97316; border-radius: 50%; z-index: 2; }
        .timeline-item::after { content: ''; position: absolute; left: -25px; top: 17px; width: 2px; height: calc(100% + 10px); background: #e2e8f0; z-index: 1; }
        .timeline-item:last-child::after { display: none; }
        .timeline-date { font-weight: 800; color: #f97316; font-size: 14px; }
        .timeline-content { font-size: 13px; color: #475569; }
        
        .highlight-box { background: #f0f9ff; border: 1px solid #bae6fd; padding: 20px; border-radius: 15px; margin-top: 40px; font-style: italic; color: #0369a1; }
        .footer { position: absolute; bottom: 20mm; left: 20mm; right: 20mm; text-align: center; font-size: 10px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 10px; }
      </style>
    </head>
    <body>
      <!-- PAGE 1 -->
      <div class="page">
        <div class="header">
          <div class="logo">caZup.</div>
          <div class="report-code">Mã báo cáo: ${reportCode}</div>
        </div>
        
        <div class="welcome-box">
          <h2 style="margin: 0; font-size: 20px; color: #0f172a;">Chúc mừng bạn ${user.name}!</h2>
          <p style="margin: 5px 0 0 0; font-size: 14px; color: #64748b;">Bạn đã hoàn thành bộ giải pháp định hướng nghề nghiệp toàn diện.</p>
        </div>

        <div class="section-title">Bản đồ Tính cách MBTI</div>
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
        <div style="font-size: 13px; color: #475569; margin-bottom: 40px;">
          <strong>Ưu điểm:</strong> Thấu hiểu, chiến lược, độc lập và có khả năng tập trung cao.<br>
          <strong>Điểm mù:</strong> Đôi khi quá cầu toàn hoặc khó khăn trong việc thích nghi nhanh với thay đổi đột ngột.
        </div>

        <div class="section-title">Thiên hướng Nghề nghiệp Holland</div>
        <div class="holland-grid">
          <div class="holland-chart">
            ${Object.entries(holland.hollandScores || {})
              .map(
                ([type, score]) => `
              <div class="holland-bar-item">
                <div class="h-label">${type}</div>
                <div class="h-bar-bg">
                  <div class="h-bar-fill" style="width: ${(score / 300) * 100}%"></div>
                </div>
              </div>
            `,
              )
              .join("")}
          </div>
          <div style="font-size: 13px; color: #475569;">
            <strong>Top 3 mã kết hợp:</strong> ${hollandScores.map((s) => s.type).join(" - ")}<br><br>
            ${hollandScores.map((s) => `• <strong>${hollandMap[s.type] || s.type}</strong>: Thiên hướng về ${s.type === "I" ? "nghiên cứu, phân tích" : s.type === "A" ? "sáng tạo, nghệ thuật" : "xã hội và con người"}.`).join("<br>")}
          </div>
        </div>
      </div>

      <!-- PAGE 2 -->
      <div class="page">
        <div class="header">
          <div class="logo">caZup.</div>
          <div class="report-code">Chiến lược AI Mentor</div>
        </div>

        <div class="section-title">Phân tích giao thoa & Đề xuất bởi AI Mentor</div>
        <p style="font-size: 13px; color: #64748b; margin-bottom: 20px;">Dựa trên sự kết hợp giữa tính cách ${mbti.mbtiType} và thiên hướng ${holland.hollandType}, AI đề xuất các lộ trình tối ưu sau:</p>
        
        <table>
          <thead>
            <tr>
              <th>Top Ngành Học Tối Ưu</th>
              <th>Tại sao bạn hợp?</th>
              <th>Trường Đào Tạo Gợi Ý</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>

        <div style="margin-top: 40px; padding: 20px; background: #f8fafc; border-radius: 15px; border: 1px solid #e2e8f0;">
          <h4 style="margin: 0 0 10px 0; font-size: 15px; color: #0f172a;">💡 Lời khuyên chiến lược:</h4>
          <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.6;">
            Hãy tập trung phát triển kỹ năng tư duy phản biện và khả năng tự học. Sự kết hợp giữa tính cách của bạn và thiên hướng nghề nghiệp cho thấy bạn sẽ thành công nhất trong những môi trường cho phép sự sáng tạo đi kèm với kỷ luật logic.
          </p>
        </div>
      </div>

      <!-- PAGE 3 -->
      <div class="page">
        <div class="header">
          <div class="logo">caZup.</div>
          <div class="report-code">Lộ trình hành động</div>
        </div>

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

        <div class="footer">
          <p>Báo cáo được tạo tự động bởi Hệ thống Định hướng Nghề nghiệp caZup</p>
          <p>Website: www.cazup.vn | Hotline: 1900 XXXX | Email: support@cazup.vn</p>
          <p style="margin-top: 10px; font-weight: bold; color: #647316;">✓ Đã xác thực bởi AI Mentor</p>
        </div>
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
      const isProduction = process.env.NODE_ENV === "production";
      console.log(
        `[PDF Service] Launching Puppeteer (isProduction: ${isProduction})`,
      );

      let executablePath;
      let args = [];

      if (isProduction) {
        executablePath = await chromium.getExecutablePath();
        args = chromium.getArgs();
      } else {
        // Local Windows Fix: Explicitly point to the installed Chrome
        const homeDir = os.homedir();
        executablePath = path.join(
          homeDir,
          ".cache",
          "puppeteer",
          "chrome",
          "win64-148.0.7778.97",
          "chrome-win64",
          "chrome.exe",
        );
        console.log(
          `[PDF Service] Manually setting executablePath to: ${executablePath}`,
        );
      }

      browser = await puppeteer.launch({
        headless: isProduction ? chromium.headless : true,
        executablePath: executablePath,
        args: args,
      });
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
