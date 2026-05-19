const SkeletonLoader = ({ type = "card", count = 1 }) => {
  const skeletons = Array.from({ length: count });

  if (type === "card") {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {skeletons.map((_, i) => (
          <div key={i} className="rounded-3xl border border-white/10 bg-white/5 p-8 animate-pulse">
            <div className="h-8 w-3/4 bg-white/10 rounded-lg mb-4"></div>
            <div className="h-4 w-1/2 bg-white/10 rounded-lg mb-6"></div>
            <div className="space-y-3">
              <div className="h-3 w-full bg-white/5 rounded"></div>
              <div className="h-3 w-full bg-white/5 rounded"></div>
              <div className="h-3 w-2/3 bg-white/5 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === "list") {
    return (
      <div className="space-y-4">
        {skeletons.map((_, i) => (
          <div key={i} className="flex items-center justify-between rounded-xl bg-white/5 p-5 border border-white/10 animate-pulse">
            <div className="space-y-2 w-1/2">
              <div className="h-4 w-3/4 bg-white/10 rounded"></div>
              <div className="h-3 w-1/2 bg-white/5 rounded"></div>
            </div>
            <div className="h-6 w-12 bg-white/10 rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="animate-pulse space-y-4">
      <div className="h-6 w-40 bg-white/10 rounded"></div>
      <div className="h-40 bg-white/5 rounded-2xl"></div>
    </div>
  );
};

export default SkeletonLoader;
