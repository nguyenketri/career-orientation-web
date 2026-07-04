import { Link } from "react-router-dom";

const features = [
  {
    title: "Gợi ý ngành theo điểm",
    description:
      "Nhập điểm thi hoặc học bạ để AI phân tích và đưa ra danh sách các ngành học có khả năng đỗ cao nhất.",
    icon: (
      <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      </div>
    ),
    link: "/recommend",
    actionText: "Thử ngay →",
    variant: "light",
  },
  {
    title: "AI Mentor 24/7",
    description:
      "Trò chuyện cùng trợ lý ảo thông minh để giải đáp mọi thắc mắc về hướng ngành học và trường học phù hợp.",
    icon: (
      <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center text-white">
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
          />
        </svg>
      </div>
    ),
    link: "/mentor",
    actionText: "Bắt đầu chat",
    variant: "dark",
    badge:
      "Trò chuyện cùng AI để khám phá bản thân, đội ngũ học thuật luôn sẵn sàng hỗ trợ bạn...",
  },
  {
    title: "So sánh trường học",
    description:
      "Nâng cao hơn với các chỉ số học phí, điểm chuẩn, cơ sở vật chất và đánh giá thực tế các ngành trên trường đại học.",
    icon: (
      <div className="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center text-teal-600">
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
          />
        </svg>
      </div>
    ),
    link: "/comparison",
    actionText: "Xem so sánh →",
    variant: "light",
  },
];

const FeatureSection = () => {
  return (
    <section className="bg-slate-50 px-6 py-24 text-slate-900">
      <div className="mx-auto max-w-7xl">
        {/* Heading */}
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-black text-slate-900">
            Công cụ mạnh mẽ cho tương lai
          </h2>
          <p className="mx-auto max-w-2xl text-slate-500 font-medium text-sm">
            Sử dụng sức mạnh của trí tuệ nhân tạo để cá nhân hóa hành trình chọn
            trường và chọn ngành của bạn.
          </p>
        </div>

        {/* Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          {features.map((feature, index) => (
            <Link
              key={index}
              to={feature.link}
              className={`group relative flex flex-col rounded-[32px] p-8 transition-all duration-300 hover:-translate-y-2 ${
                feature.variant === "dark"
                  ? "bg-slate-900 text-white shadow-2xl shadow-slate-900/20"
                  : "bg-white border border-slate-100 text-slate-900 shadow-xl shadow-slate-200/50"
              }`}
            >
              {/* Icon */}
              <div className="mb-6">{feature.icon}</div>

              {/* Title */}
              <h3
                className={`mb-4 text-xl font-black ${feature.variant === "dark" ? "text-white" : "text-slate-900"}`}
              >
                {feature.title}
              </h3>

              {/* Description */}
              <p
                className={`mb-8 text-sm leading-relaxed font-medium ${feature.variant === "dark" ? "text-slate-400" : "text-slate-500"}`}
              >
                {feature.description}
              </p>

              {/* Special Badge for AI Mentor */}
              {feature.badge && (
                <div className="mb-8 rounded-xl bg-slate-800 p-4 border border-slate-700">
                  <p className="text-[10px] leading-relaxed text-slate-300 italic">
                    "{feature.badge}"
                  </p>
                </div>
              )}

              {/* Action */}
              <div className="mt-auto">
                {feature.variant === "dark" ? (
                  <span className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-slate-900 transition group-hover:bg-orange-500 group-hover:text-white">
                    {feature.actionText}
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-sm font-bold text-slate-400 group-hover:text-blue-600">
                    {feature.actionText}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureSection;
