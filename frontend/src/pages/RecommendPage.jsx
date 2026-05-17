import { useState } from "react";
import { recommendByScore } from "../services/recommendService";

const RecommendPage = () => {
  // score input
  const [score, setScore] = useState("");

  // fake result
  const [majors, setMajors] = useState([]);

  // loading
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // handle recommend
  const handleRecommend = async () => {
    try {
      setError("");
      setMajors([]);
      if (!score) {
        return setError("Please enter your score");
      }

      setLoading(true);

      // call API
      const response = await recommendByScore(score);

      console.log(response);

      // update majors
      setMajors(response.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black px-6 py-20 text-white">
      {/* Hero */}
      <div className="mx-auto max-w-4xl text-center">
        <p className="mb-4 text-sm uppercase tracking-[0.3em] text-purple-400">
          AI Career Recommendation
        </p>

        <h1 className="mb-6 text-5xl font-bold leading-tight">
          Discover Your Perfect Major
        </h1>

        <p className="mx-auto max-w-2xl text-lg text-gray-400">
          Enter your academic score and let our intelligent recommendation
          system suggest the best majors for your future.
        </p>
      </div>

      {/* Input Section */}
      <div className="mx-auto mt-14 max-w-2xl rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-lg">
        <div className="space-y-6">
          <div>
            <label className="mb-2 block text-sm text-gray-300">
              Your Score
            </label>

            <input
              type="number"
              placeholder="Enter your score..."
              value={score}
              onChange={(e) => setScore(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-4 text-white outline-none transition focus:border-purple-500"
            />
          </div>
          {/* 
      No Score
      */}
          {error && (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
              {error}
            </div>
          )}
          <button
            onClick={handleRecommend}
            disabled={loading}
            className="w-full rounded-2xl bg-white py-4 font-semibold text-black transition hover:scale-[1.02] disabled:opacity-70"
          >
            {loading ? "Analyzing..." : "Get Recommendation"}
          </button>
        </div>
      </div>

      {/* Result */}
      <div className="mx-auto mt-14 grid max-w-6xl gap-6 md:grid-cols-2">
        {majors.map((major) => (
          <div
            key={major._id}
            className="rounded-3xl border border-white/10 bg-white/5 p-8 transition hover:-translate-y-1 hover:border-purple-500/30"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold">{major.name}</h2>

              <span className="rounded-full bg-purple-500/20 px-4 py-1 text-sm text-purple-300">
                {major.benchmarkScore}
              </span>
            </div>

            <p className="leading-relaxed text-gray-400">{major.description}</p>
          </div>
        ))}
      </div>
      {!loading && majors.length === 0 && (
        <div className="mt-14 text-center text-gray-500">
          No recommendations yet.
        </div>
      )}
    </div>
  );
};

export default RecommendPage;
