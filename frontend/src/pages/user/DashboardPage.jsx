import { useEffect, useState } from "react";
import { getMyHollandResults } from "../../services/hollandResult.service";
import { hollandMaps } from "../../utils/hollandMap";

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

  return (
    <div className="min-h-screen bg-black px-6 py-20 text-white">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-10 text-4xl font-bold">Your Career Dashboard</h1>

        {/* Loading */}
        {loading && <p>Loading...</p>}

        {/* Latest Result */}
        {latest && (
          <div className="mb-12 rounded-3xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 p-10">
            <p className="text-sm text-purple-300 mb-2">
              Your Personality Type
            </p>

            <h2 className="text-5xl font-bold mb-2">
              {latest.hollandType} - {hollandMaps[latest.hollandType].name}
            </h2>

            <p className="text-gray-300">
              {hollandMaps[latest.hollandType].desc}
            </p>
          </div>
        )}

        {/* Top 3 Types */}
        {latest && (
          <div className="mb-12">
            <h3 className="mb-6 text-2xl font-bold">Your Top Traits</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Object.entries(latest.hollandScores)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 3)
                .map(([type, score]) => (
                  <div key={type} className="rounded-2xl bg-white/5 p-6">
                    <h4 className="text-xl font-bold">
                      {type} - {hollandMaps[type].name}
                    </h4>

                    <p className="text-sm text-gray-400">Score: {score}</p>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* History */}
        <div>
          <h3 className="mb-6 text-2xl font-bold">History</h3>

          <div className="space-y-4">
            {results.map((r) => (
              <div key={r._id} className="rounded-xl bg-white/5 p-5">
                <div className="flex justify-between">
                  <span className="font-semibold">
                    {r.hollandType} - {hollandMaps[r.hollandType].name}
                  </span>

                  <span className="text-gray-400 text-sm">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
