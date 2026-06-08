import { Link } from "react-router-dom";

const CTASection = () => {
  return (
    <section className="px-6 py-20">
      <div className="mx-auto max-w-7xl">
        <div className="relative overflow-hidden rounded-[40px] bg-slate-900 px-8 py-16 text-white shadow-2xl lg:px-16 lg:py-20">
          <div className="relative z-10 flex flex-col items-center gap-12 lg:flex-row">
            {/* Text Content */}
            <div className="flex-1 text-center lg:text-left">
              <h2 className="mb-6 text-3xl font-black leading-tight md:text-5xl">
                Sẵn sàng định hướng cho <br className="hidden lg:block" />
                tương lai của bạn?
              </h2>
              <p className="mb-10 text-lg text-slate-400 font-medium max-w-xl mx-auto lg:mx-0">
                Đừng để những quyết định quan trọng trở nên khó khăn. Hãy để AI
                đồng hành cùng bạn trong hành trình khám phá bản thân và chọn
                lựa ngành nghề.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link
                  to="/recommend"
                  className="w-full sm:w-auto px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-2xl transition-all shadow-lg shadow-orange-500/20 text-center"
                >
                  Bắt đầu ngay
                </Link>
                <Link
                  to="/mentor"
                  className="w-full sm:w-auto px-8 py-4 bg-transparent border border-slate-700 hover:border-slate-500 text-white font-bold rounded-2xl transition-all text-center"
                >
                  Liên hệ tư vấn
                </Link>
              </div>
            </div>

            {/* Image/Mockup */}
            <div className="relative w-full max-w-sm lg:max-w-md">
              <div className="relative z-10 transform rotate-6 transition-transform hover:rotate-0 duration-500">
                <img
                  src="https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?q=80&w=2070&auto=format&fit=crop"
                  alt="App Mockup"
                  className="rounded-[3rem] border-[8px] border-slate-800 shadow-2xl w-full h-auto object-cover aspect-[9/19]"
                />
              </div>
              {/* Decorative Glow */}
              <div className="absolute -inset-4 bg-blue-500/20 blur-3xl rounded-full"></div>
            </div>
          </div>

          {/* Background Decoration */}
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-96 h-96 bg-blue-600/10 blur-[100px] rounded-full"></div>
          <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-96 h-96 bg-indigo-600/10 blur-[100px] rounded-full"></div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
