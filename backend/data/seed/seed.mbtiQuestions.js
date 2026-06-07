// data/seed/seed.mbtiQuestions.js
// Script tạo dữ liệu câu hỏi MBTI (Mở rộng)

require("dotenv").config({ path: "../../.env" });
const mongoose = require("mongoose");
const MbtiQuestion = require("../../models/mbtiQuestion.model");

const mbtiQuestions = [
  // EI - Extraversion vs Introversion
  {
    question: "Khi tham gia một buổi tiệc, bạn thường...",
    dimension: "EI",
    optionA: {
      text: "Nói chuyện với nhiều người, kể cả người lạ",
      typeValue: "E",
    },
    optionB: {
      text: "Chỉ trò chuyện với một vài người quen thân",
      typeValue: "I",
    },
  },
  {
    question: "Bạn cảm thấy tràn đầy năng lượng khi...",
    dimension: "EI",
    optionA: {
      text: "Được làm việc hoặc vui chơi trong nhóm đông người",
      typeValue: "E",
    },
    optionB: {
      text: "Được ở một mình để thư giãn và suy ngẫm",
      typeValue: "I",
    },
  },
  {
    question: "Bạn thường tự nhận mình là người...",
    dimension: "EI",
    optionA: { text: "Dễ gần, cởi mở và thích trò chuyện", typeValue: "E" },
    optionB: { text: "Kín đáo, trầm cẩn và thích lắng nghe", typeValue: "I" },
  },
  {
    question: "Trong các cuộc họp hoặc thảo luận, bạn thường...",
    dimension: "EI",
    optionA: { text: "Phát biểu ý kiến ngay lập tức", typeValue: "E" },
    optionB: { text: "Suy nghĩ kỹ rồi mới nói", typeValue: "I" },
  },
  {
    question: "Khi rảnh rỗi, bạn thích...",
    dimension: "EI",
    optionA: { text: "Gọi điện, nhắn tin rủ bạn bè đi chơi", typeValue: "E" },
    optionB: { text: "Ở nhà đọc sách, xem phim một mình", typeValue: "I" },
  },
  {
    question: "Bạn thích môi trường làm việc...",
    dimension: "EI",
    optionA: { text: "Năng động, nhộn nhịp, nhiều tương tác", typeValue: "E" },
    optionB: { text: "Yên tĩnh, riêng tư, ít bị làm phiền", typeValue: "I" },
  },
  {
    question: "Sau một tuần làm việc căng thẳng, cuối tuần bạn muốn...",
    dimension: "EI",
    optionA: { text: "Ra ngoài mua sắm, gặp gỡ hội nhóm", typeValue: "E" },
    optionB: {
      text: "Nghỉ ngơi tĩnh lặng để sạc lại năng lượng",
      typeValue: "I",
    },
  },
  {
    question: "Bạn thường bắt đầu cuộc trò chuyện với người lạ?",
    dimension: "EI",
    optionA: { text: "Thường xuyên và chủ động", typeValue: "E" },
    optionB: { text: "Hiếm khi, chờ người khác bắt chuyện", typeValue: "I" },
  },
  {
    question: "Bạn thích làm việc nhóm hay làm việc cá nhân?",
    dimension: "EI",
    optionA: { text: "Làm việc nhóm để trao đổi ý tưởng", typeValue: "E" },
    optionB: { text: "Làm việc cá nhân để tập trung sâu", typeValue: "I" },
  },
  {
    question: "Khi gặp một vấn đề khó khăn, bạn có xu hướng...",
    dimension: "EI",
    optionA: {
      text: "Thảo luận với nhiều người để tìm giải pháp",
      typeValue: "E",
    },
    optionB: {
      text: "Tự suy nghĩ và tìm cách giải quyết một mình",
      typeValue: "I",
    },
  },
  {
    question: "Trong một nhóm bạn, bạn thường là người...",
    dimension: "EI",
    optionA: {
      text: "Khuấy động không khí và dẫn dắt câu chuyện",
      typeValue: "E",
    },
    optionB: { text: "Quan sát và lắng nghe nhiều hơn là nói", typeValue: "I" },
  },
  {
    question: "Bạn cảm thấy mệt mỏi khi...",
    dimension: "EI",
    optionA: {
      text: "Phải ở một mình quá lâu mà không có ai tương tác",
      typeValue: "E",
    },
    optionB: { text: "Phải ở trong đám đông quá lâu", typeValue: "I" },
  },
  {
    question: "Khi làm quen với môi trường mới, bạn...",
    dimension: "EI",
    optionA: {
      text: "Nhanh chóng kết nối và làm quen với mọi người",
      typeValue: "E",
    },
    optionB: {
      text: "Cần thời gian để quan sát trước khi hòa nhập",
      typeValue: "I",
    },
  },
  {
    question: "Bạn thích cách giao tiếp nào hơn?",
    dimension: "EI",
    optionA: { text: "Nói chuyện trực tiếp hoặc gọi điện", typeValue: "E" },
    optionB: { text: "Nhắn tin hoặc viết email", typeValue: "I" },
  },
  {
    question: "Khi kể về một sự kiện, bạn thường...",
    dimension: "EI",
    optionA: { text: "Kể một cách hào hứng và chi tiết", typeValue: "E" },
    optionB: { text: "Kể một cách ngắn gọn và súc tích", typeValue: "I" },
  },
  {
    question: "Bạn cảm thấy tự tin hơn khi...",
    dimension: "EI",
    optionA: { text: "Được đứng trước đám đông để trình bày", typeValue: "E" },
    optionB: { text: "Làm việc thầm lặng phía sau hậu trường", typeValue: "I" },
  },
  {
    question: "Khi ở trong một cuộc trò chuyện, bạn thường...",
    dimension: "EI",
    optionA: { text: "Nói nhiều hơn nghe", typeValue: "E" },
    optionB: { text: "Nghe nhiều hơn nói", typeValue: "I" },
  },
  {
    question: "Bạn thích được mọi người...",
    dimension: "EI",
    optionA: {
      text: "Nhận ra và chú ý đến sự hiện diện của mình",
      typeValue: "E",
    },
    optionB: {
      text: "Tôn trọng sự riêng tư và không làm phiền",
      typeValue: "I",
    },
  },

  // SN - Sensing vs Intuition
  {
    question: "Khi tiếp nhận thông tin mới, bạn quan tâm nhiều hơn đến...",
    dimension: "SN",
    optionA: { text: "Sự thật, dữ liệu cụ thể và chi tiết", typeValue: "S" },
    optionB: {
      text: "Ý tưởng, khái niệm và bức tranh tổng thể",
      typeValue: "N",
    },
  },
  {
    question: "Bạn thích làm việc với...",
    dimension: "SN",
    optionA: {
      text: "Những gì đang xảy ra ở hiện tại và có thể ứng dụng ngay",
      typeValue: "S",
    },
    optionB: {
      text: "Những gì có thể xảy ra trong tương lai và mang tính đổi mới",
      typeValue: "N",
    },
  },
  {
    question: "Bạn thường bị thu hút bởi...",
    dimension: "SN",
    optionA: { text: "Sự thực tế và logic rõ ràng", typeValue: "S" },
    optionB: { text: "Sự tưởng tượng và sáng tạo", typeValue: "N" },
  },
  {
    question: "Khi giải quyết vấn đề, bạn thường...",
    dimension: "SN",
    optionA: {
      text: "Dựa vào kinh nghiệm đã có và các phương pháp chuẩn",
      typeValue: "S",
    },
    optionB: {
      text: "Tìm kiếm những hướng đi mới, giải pháp đột phá",
      typeValue: "N",
    },
  },
  {
    question: "Trong mô tả một sự vật, bạn sẽ...",
    dimension: "SN",
    optionA: {
      text: "Trình bày chính xác, mạch lạc từng chi tiết",
      typeValue: "S",
    },
    optionB: { text: "Sử dụng hình ảnh ẩn dụ, khái quát", typeValue: "N" },
  },
  {
    question: "Bạn cảm thấy thoải mái hơn khi...",
    dimension: "SN",
    optionA: {
      text: "Làm những việc quen thuộc, cầm nắm được",
      typeValue: "S",
    },
    optionB: { text: "Khám phá những lý thuyết, ẩn ý sâu xa", typeValue: "N" },
  },
  {
    question: "Người khác thường nhận xét bạn là...",
    dimension: "SN",
    optionA: { text: "Người thực tế, nhạy bén", typeValue: "S" },
    optionB: { text: "Người mơ mộng, giàu trí tưởng tượng", typeValue: "N" },
  },
  {
    question: "Bạn thích đọc sách về...",
    dimension: "SN",
    optionA: { text: "Sách hướng dẫn, tài liệu kỹ thuật", typeValue: "S" },
    optionB: { text: "Sách triết học, tiểu thuyết giả tưởng", typeValue: "N" },
  },
  {
    question: "Bạn tập trung vào...",
    dimension: "SN",
    optionA: { text: "Những chi tiết nhỏ nhặt", typeValue: "S" },
    optionB: { text: "Bức tranh toàn cảnh", typeValue: "N" },
  },
  {
    question: "Khi học một kỹ năng mới, bạn thích...",
    dimension: "SN",
    optionA: { text: "Thực hành ngay lập tức để xem kết quả", typeValue: "S" },
    optionB: {
      text: "Tìm hiểu lý thuyết và nguyên lý vận hành trước",
      typeValue: "N",
    },
  },
  {
    question: "Bạn tin tưởng điều gì hơn?",
    dimension: "SN",
    optionA: {
      text: "Những gì có thể chứng minh được bằng thực tế",
      typeValue: "S",
    },
    optionB: { text: "Trực giác và linh cảm của bản thân", typeValue: "N" },
  },
  {
    question: "Khi nhìn một bức tranh, bạn thường...",
    dimension: "SN",
    optionA: {
      text: "Chú ý đến màu sắc, đường nét và chi tiết",
      typeValue: "S",
    },
    optionB: { text: "Cảm nhận ý nghĩa và thông điệp ẩn sau", typeValue: "N" },
  },
  {
    question: "Bạn thích những công việc...",
    dimension: "SN",
    optionA: { text: "Có quy trình rõ ràng, kết quả cụ thể", typeValue: "S" },
    optionB: {
      text: "Cho phép sáng tạo và thử nghiệm cái mới",
      typeValue: "N",
    },
  },
  {
    question: "Khi lập kế hoạch, bạn thường...",
    dimension: "SN",
    optionA: {
      text: "Liệt kê chi tiết từng bước cần thực hiện",
      typeValue: "S",
    },
    optionB: {
      text: "Xác định mục tiêu chính và phác thảo hướng đi",
      typeValue: "N",
    },
  },
  {
    question: "Bạn cảm thấy nhàm chán khi...",
    dimension: "SN",
    optionA: {
      text: "Phải đối mặt với những lý thuyết quá trừu tượng",
      typeValue: "S",
    },
    optionB: {
      text: "Phải làm những công việc lặp đi lặp lại",
      typeValue: "N",
    },
  },
  {
    question: "Bạn thường nhận ra điều gì trước?",
    dimension: "SN",
    optionA: {
      text: "Những thay đổi nhỏ trong môi trường xung quanh",
      typeValue: "S",
    },
    optionB: {
      text: "Những mối liên hệ tiềm ẩn giữa các sự việc",
      typeValue: "N",
    },
  },
  {
    question: "Khi giải thích một vấn đề, bạn...",
    dimension: "SN",
    optionA: { text: "Đi từ chi tiết đến tổng thể", typeValue: "S" },
    optionB: { text: "Đi từ tổng thể đến chi tiết", typeValue: "N" },
  },
  {
    question: "Bạn thích được khen là người...",
    dimension: "SN",
    optionA: { text: "Cẩn thận, tỉ mỉ và chính xác", typeValue: "S" },
    optionB: { text: "Sáng tạo, độc đáo và có tầm nhìn", typeValue: "N" },
  },

  // TF - Thinking vs Feeling
  {
    question: "Khi đưa ra quyết định quan trọng, bạn thường dựa vào...",
    dimension: "TF",
    optionA: {
      text: "Sự phân tích logic, công bằng, khách quan",
      typeValue: "T",
    },
    optionB: {
      text: "Cảm xúc cá nhân và ảnh hưởng đến người khác",
      typeValue: "F",
    },
  },
  {
    question: "Bạn cho rằng điều gì quan trọng hơn?",
    dimension: "TF",
    optionA: { text: "Tính nhất quán và sự công bằng", typeValue: "T" },
    optionB: { text: "Sự đồng cảm và lòng tốt", typeValue: "F" },
  },
  {
    question: "Trong một cuộc tranh luận, bạn muốn...",
    dimension: "TF",
    optionA: {
      text: "Tìm ra sự thật, dù người khác có mếch lòng",
      typeValue: "T",
    },
    optionB: { text: "Giữ hòa khí và không làm tổn thương ai", typeValue: "F" },
  },
  {
    question: "Bạn có xu hướng đánh giá người khác qua...",
    dimension: "TF",
    optionA: { text: "Năng lực và kết quả công việc", typeValue: "T" },
    optionB: { text: "Thái độ và sự nỗ lực của họ", typeValue: "F" },
  },
  {
    question: "Nếu phải phê bình một người sai lầm, bạn sẽ...",
    dimension: "TF",
    optionA: { text: "Chỉ rõ thẳng thắn vào vấn đề cốt lõi", typeValue: "T" },
    optionB: {
      text: "Tìm cách nói nhẹ nhàng, khéo léo để họ không buồn",
      typeValue: "F",
    },
  },
  {
    question: "Bạn tự thấy mình là người...",
    dimension: "TF",
    optionA: { text: "Lý trí, cái đầu lạnh", typeValue: "T" },
    optionB: { text: "Tình cảm, trái tim nóng", typeValue: "F" },
  },
  {
    question: "Động lực làm việc lớn nhất của bạn là...",
    dimension: "TF",
    optionA: {
      text: "Hoàn thành xuất sắc nhiệm vụ, đạt thành tích",
      typeValue: "T",
    },
    optionB: {
      text: "Được ghi nhận, được làm việc trong môi trường yêu thương",
      typeValue: "F",
    },
  },
  {
    question: "Bạn ưu tiên điều gì hơn?",
    dimension: "TF",
    optionA: { text: "Sự thật khách quan", typeValue: "T" },
    optionB: { text: "Sự hài hòa trong các mối quan hệ", typeValue: "F" },
  },
  {
    question: "Bạn thường đưa ra quyết định dựa trên?",
    dimension: "TF",
    optionA: { text: "Phân tích dữ liệu", typeValue: "T" },
    optionB: { text: "Giá trị cá nhân", typeValue: "F" },
  },
  {
    question: "Khi giúp đỡ người khác, bạn thường...",
    dimension: "TF",
    optionA: {
      text: "Đưa ra lời khuyên thực tế và giải pháp logic",
      typeValue: "T",
    },
    optionB: { text: "Lắng nghe, an ủi và chia sẻ cảm xúc", typeValue: "F" },
  },
  {
    question: "Bạn cảm thấy khó chịu hơn khi...",
    dimension: "TF",
    optionA: { text: "Một quyết định thiếu logic và phi lý", typeValue: "T" },
    optionB: {
      text: "Một quyết định thiếu nhân văn và vô tâm",
      typeValue: "F",
    },
  },
  {
    question: "Trong công việc, bạn muốn được đánh giá là...",
    dimension: "TF",
    optionA: { text: "Một người chuyên nghiệp, quyết đoán", typeValue: "T" },
    optionB: { text: "Một người tận tâm, biết quan tâm", typeValue: "F" },
  },
  {
    question: "Khi đối mặt với xung đột, bạn có xu hướng...",
    dimension: "TF",
    optionA: {
      text: "Phân tích đúng sai để giải quyết triệt để",
      typeValue: "T",
    },
    optionB: { text: "Tìm điểm chung để xoa dịu căng thẳng", typeValue: "F" },
  },
  {
    question: "Bạn tin rằng sự công bằng nghĩa là...",
    dimension: "TF",
    optionA: {
      text: "Áp dụng cùng một quy tắc cho tất cả mọi người",
      typeValue: "T",
    },
    optionB: { text: "Xem xét hoàn cảnh riêng của mỗi người", typeValue: "F" },
  },
  {
    question: "Khi đọc một câu chuyện, bạn thường bị thu hút bởi...",
    dimension: "TF",
    optionA: {
      text: "Cốt truyện logic và những lập luận sắc bén",
      typeValue: "T",
    },
    optionB: {
      text: "Sự phát triển tâm lý và cảm xúc của nhân vật",
      typeValue: "F",
    },
  },
  {
    question: "Bạn thường đưa ra lời khen...",
    dimension: "TF",
    optionA: { text: "Khi họ thực sự đạt được kết quả tốt", typeValue: "T" },
    optionB: { text: "Để khích lệ tinh thần và tạo niềm vui", typeValue: "F" },
  },
  {
    question: "Bạn cảm thấy tự tin hơn khi quyết định dựa trên...",
    dimension: "TF",
    optionA: { text: "Các tiêu chuẩn khách quan", typeValue: "T" },
    optionB: { text: "Giá trị đạo đức và tình cảm", typeValue: "F" },
  },
  {
    question: "Bạn thích một người lãnh đạo...",
    dimension: "TF",
    optionA: { text: "Công minh, rõ ràng và quyết liệt", typeValue: "T" },
    optionB: { text: "Thấu hiểu, bao dung và truyền cảm hứng", typeValue: "F" },
  },

  // JP - Judging vs Perceiving
  {
    question: "Trong cuộc sống hàng ngày, bạn thích...",
    dimension: "JP",
    optionA: {
      text: "Mọi thứ được lên kế hoạch và có tổ chức rõ ràng",
      typeValue: "J",
    },
    optionB: {
      text: "Sự tự do, linh hoạt và ứng biến theo hoàn cảnh",
      typeValue: "P",
    },
  },
  {
    question: "Trước một chuyến du lịch, bạn sẽ...",
    dimension: "JP",
    optionA: {
      text: "Đặt trước vé, khách sạn, lập lịch trình chi tiết từng ngày",
      typeValue: "J",
    },
    optionB: {
      text: "Chỉ chọn điểm đến, đến đó rồi tính tiếp",
      typeValue: "P",
    },
  },
  {
    question: "Bàn làm việc hoặc không gian sống của bạn...",
    dimension: "JP",
    optionA: { text: "Thường rất ngăn nắp, gọn gàng", typeValue: "J" },
    optionB: {
      text: "Thường khá bừa bộn nhưng bạn biết đồ đạc để đâu",
      typeValue: "P",
    },
  },
  {
    question: "Khi làm việc, bạn...",
    dimension: "JP",
    optionA: { text: "Muốn hoàn thành dứt điểm từng việc một", typeValue: "J" },
    optionB: {
      text: "Thường xen kẽ nhiều việc cùng lúc và thích deadline gấp",
      typeValue: "P",
    },
  },
  {
    question: "Quy định và luật lệ đối với bạn là...",
    dimension: "JP",
    optionA: {
      text: "Những thứ cần tuân thủ nghiêm ngặt để tạo trật tự",
      typeValue: "J",
    },
    optionB: {
      text: "Những hướng dẫn mềm dẻo có thể thay đổi tùy tình hình",
      typeValue: "P",
    },
  },
  {
    question: "Cảm giác của bạn khi một kế hoạch bị thay đổi bất ngờ là...",
    dimension: "JP",
    optionA: {
      text: "Khó chịu và cần thời gian để sắp xếp lại",
      typeValue: "J",
    },
    optionB: {
      text: "Hào hứng vì có sự mới mẻ, dễ dàng thích nghi",
      typeValue: "P",
    },
  },
  {
    question: "Bạn cảm thấy thoải mái với...",
    dimension: "JP",
    optionA: { text: "Sự chắc chắn, quyết định rõ ràng", typeValue: "J" },
    optionB: {
      text: "Sự lựa chọn mở, tìm hiểu thêm thông tin",
      typeValue: "P",
    },
  },
  {
    question: "Bạn thường hoàn thành công việc?",
    dimension: "JP",
    optionA: { text: "Trước thời hạn", typeValue: "J" },
    optionB: { text: "Vào phút chót", typeValue: "P" },
  },
  {
    question: "Bạn thích làm việc theo?",
    dimension: "JP",
    optionA: { text: "Thời gian biểu cố định", typeValue: "J" },
    optionB: { text: "Sự linh hoạt tùy hứng", typeValue: "P" },
  },
  {
    question: "Khi bắt đầu một dự án, bạn thường...",
    dimension: "JP",
    optionA: {
      text: "Lập danh sách các việc cần làm (to-do list)",
      typeValue: "J",
    },
    optionB: { text: "Bắt tay vào làm và điều chỉnh dần", typeValue: "P" },
  },
  {
    question: "Bạn cảm thấy hài lòng hơn khi...",
    dimension: "JP",
    optionA: { text: "Đã đưa ra quyết định cuối cùng", typeValue: "J" },
    optionB: { text: "Vẫn còn nhiều lựa chọn để cân nhắc", typeValue: "P" },
  },
  {
    question: "Cách bạn quản lý thời gian thường là...",
    dimension: "JP",
    optionA: { text: "Chia nhỏ thời gian cho từng hoạt động", typeValue: "J" },
    optionB: {
      text: "Làm việc theo cảm hứng và mức độ ưu tiên tức thời",
      typeValue: "P",
    },
  },
  {
    question: "Bạn thích một môi trường...",
    dimension: "JP",
    optionA: { text: "Có cấu trúc, kỷ luật và ổn định", typeValue: "J" },
    optionB: { text: "Mở, linh hoạt và không gò bó", typeValue: "P" },
  },
  {
    question: "Khi đối mặt với một deadline, bạn...",
    dimension: "JP",
    optionA: { text: "Hoàn thành sớm để tránh áp lực", typeValue: "J" },
    optionB: {
      text: "Làm việc hiệu quả nhất khi áp lực thời gian tăng cao",
      typeValue: "P",
    },
  },
  {
    question: "Bạn thường cảm thấy...",
    dimension: "JP",
    optionA: { text: "Yên tâm khi mọi thứ đã được chốt", typeValue: "J" },
    optionB: { text: "Bị gò bó khi mọi thứ quá cứng nhắc", typeValue: "P" },
  },
  {
    question: "Trong một cuộc thảo luận, bạn thích...",
    dimension: "JP",
    optionA: { text: "Đi thẳng đến kết luận", typeValue: "J" },
    optionB: { text: "Khám phá mọi khía cạnh của vấn đề", typeValue: "P" },
  },
  {
    question: "Bạn có xu hướng...",
    dimension: "JP",
    optionA: { text: "Chuẩn bị kỹ lưỡng cho mọi tình huống", typeValue: "J" },
    optionB: { text: "Tin vào khả năng ứng biến của bản thân", typeValue: "P" },
  },
  {
    question: "Bạn thích cách làm việc nào hơn?",
    dimension: "JP",
    optionA: { text: "Hoàn thành từng bước theo trình tự", typeValue: "J" },
    optionB: {
      text: "Nhảy từ việc này sang việc khác tùy theo sự hứng thú",
      typeValue: "P",
    },
  },
];

const seedMbtiQuestions = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/cazup";
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB");

    await MbtiQuestion.deleteMany({});
    console.log("Cleared MBTI questions");

    await MbtiQuestion.insertMany(mbtiQuestions);
    console.log(`Successfully seeded ${mbtiQuestions.length} MBTI questions`);

    mongoose.disconnect();
  } catch (error) {
    console.error("Error seeding MBTI questions:", error);
    process.exit(1);
  }
};

seedMbtiQuestions();
