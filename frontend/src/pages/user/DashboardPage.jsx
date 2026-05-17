import { useEffect, useState } from "react";
import { getMyHollandResults } from "../../services/hollandResult.service";
import { hollandMaps } from "../../utils/hollandMap";
import HollandChart from "../../components/HollandChart";
import { useNavigate } from "react-router-dom";

const DashboardPage = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const data = await getMyHollandResults();
      setResults(data.data);
      setLoading(false);
    };

    fetchData();
  }, []);

  const latest = results[0];
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => navigate(-1)}>← Back</button>

          <h1 className="mb-10 text-4xl font-bold">Your Career Dashboard</h1>
        </div>
        {/* Loading */}
        {loading && <p>Loading...</p>}

        {/* Latest Result */}
        {latest && (
          <div className="mb-12 rounded-3xl bg-gradient-to-br from-purple-600/20 via-pink-500/10 to-transparent p-10 backdrop-blur-md border border-white/10">
            <p className="text-sm uppercase tracking-widest text-purple-300">
              Your Personality Type
            </p>

            <h2 className="mt-2 text-5xl font-bold">
              {latest.hollandType}
              <span className="ml-3 text-purple-400">
                {hollandMaps[latest.hollandType].name}
              </span>
            </h2>

            <p className="mt-4 max-w-xl text-gray-300">
              {hollandMaps[latest.hollandType].desc}
            </p>
          </div>
        )}
        {latest && (
          <div className="mb-12 rounded-3xl bg-white/5 p-8 border border-white/10 backdrop-blur-sm">
            <h3 className="mb-6 text-2xl font-semibold">
              Personality Breakdown
            </h3>

            <HollandChart scores={latest.hollandScores} />
          </div>
        )}
        {/* Top 3 Types */}
        {latest && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(latest.hollandScores)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 3)
              .map(([type, score], index) => (
                <div
                  key={type}
                  className={`rounded-2xl p-6 border border-white/10 backdrop-blur-sm ${
                    index === 0 ? "bg-purple-500/20 scale-105" : "bg-white/5"
                  }`}
                >
                  <h4 className="text-lg font-bold">
                    {hollandMaps[type].name}
                  </h4>

                  <p className="text-sm text-gray-400">Score: {score}</p>

                  {index === 0 && (
                    <span className="mt-2 inline-block text-xs text-purple-300">
                      Dominant Trait
                    </span>
                  )}
                </div>
              ))}
          </div>
        )}

        {/* History */}
        <div className="space-y-4 mt-6">
          {results.map((r) => (
            <div
              key={r._id}
              className="flex items-center justify-between rounded-xl bg-white/5 p-5 border border-white/10"
            >
              <div>
                <p className="font-semibold">
                  {hollandMaps[r.hollandType].name}
                </p>

                <p className="text-sm text-gray-400">
                  {new Date(r.createdAt).toLocaleDateString()}
                </p>
              </div>

              <span className="text-lg font-bold text-purple-400">
                {r.hollandType}
              </span>
            </div>
          ))}
        </div>
        {!loading && results.length === 0 && (
          <div className="text-center mt-20">
            <h2 className="text-2xl font-bold mb-2">No results yet</h2>
            <p className="text-gray-400 mb-6">
              Take your first Holland test to see insights
            </p>

            <a
              href="/holland"
              className="rounded-xl bg-purple-500 px-6 py-3 font-semibold hover:bg-purple-600"
            >
              Start Test
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
