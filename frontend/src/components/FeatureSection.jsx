import { Link } from "react-router-dom";

const features = [
  {
    title: "Cố vấn Nghề nghiệp AI",
    description:
      "Trò chuyện với cố vấn AI thông minh để nhận câu trả lời tức thì về trường đại học, ngành học và định hướng nghề nghiệp.",
    icon: "🤖",
    link: "/mentor",
  },
  {
    title: "Trắc nghiệm Holland & MBTI",
    description:
      "Khám phá sâu hơn về tính cách của bạn với các bài đánh giá Holland và MBTI chuyên nghiệp, kết nối trực tiếp với các nghề nghiệp thực tế.",
    icon: "🧠",
    links: ["/holland", "/mbti"],
  },
  {
    title: "Gợi ý Trường Đại học",
    description:
      "Tính toán điểm tổ hợp môn và tìm kiếm trường đại học phù hợp nhất trong hàng trăm lựa chọn.",
    icon: "🎓",
    link: "/recommend",
  },
];

const FeatureSection = () => {
  return (
    <section className="bg-slate-50 px-6 py-24 text-slate-900">
      <div className="mx-auto max-w-7xl">
        {/* Heading */}
        <div className="mb-16 text-center">
          <p className="mb-3 text-sm uppercase tracking-[0.3em] text-blue-600 font-bold">
            Tính năng
          </p>

          <h2 className="mb-4 text-4xl font-black md:text-5xl text-slate-900">
            Mọi thứ bạn cần để
            <span className="bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
              {" "}
              Chọn lựa Tương lai
            </span>
          </h2>

          <p className="mx-auto max-w-2xl text-slate-600 font-medium">
            Nền tảng của chúng tôi giúp học sinh khám phá các ngành học, trường
            đại học, và con đường sự nghiệp phù hợp với sự hướng dẫn từ AI.
          </p>
        </div>

        {/* Cards */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => {
            const links = feature.links || [feature.link];
            return (
              <Link
                key={index}
                to={links[0]}
                className="group rounded-[40px] border border-slate-100 bg-white p-8 shadow-xl shadow-slate-200/50 transition hover:-translate-y-2 hover:border-blue-500/30 cursor-pointer"
              >
                {/* Icon */}
                <div className="mb-6 text-5xl">{feature.icon}</div>

                {/* Title */}
                <h3 className="mb-4 text-2xl font-bold text-slate-900">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="leading-relaxed text-slate-600 font-medium">
                  {feature.description}
                </p>

                {/* Hover line */}
                <div className="mt-6 h-1 w-0 bg-gradient-to-r from-blue-600 to-indigo-500 transition-all duration-300 group-hover:w-full"></div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeatureSection;
