import { useEffect, useState } from "react";
import { getMyHollandResults } from "../../services/hollandResult.service";
import { hollandMaps } from "../../utils/hollandMap";
import HollandChart from "../../components/HollandChart";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const DashboardPage = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getMyHollandResults();
        setResults(data.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const latest = results[0];

  return (
    <div className="min-h-screen bg-black text-white px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mx-auto max-w-6xl"
      >
        {/* Header */}
        <div className="mb-10 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="text-gray-400 hover:text-white transition"
          >
            ← Back
          </button>

          <h1 className="text-4xl font-bold">Your Career Dashboard</h1>
        </div>

        {/* Loading */}
        {loading && (
          <div className="animate-pulse space-y-4">
            <div className="h-6 w-40 bg-white/10 rounded"></div>
            <div className="h-40 bg-white/5 rounded-2xl"></div>
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && results.length === 0 && (
          <div className="text-center mt-20">
            <h2 className="text-2xl font-bold mb-2">No results yet</h2>
            <p className="text-gray-400 mb-6">
              Take your first Holland test to see insights
            </p>

            <motion.a
              href="/holland"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="rounded-xl bg-purple-500 px-6 py-3 font-semibold hover:bg-purple-600 inline-block"
            >
              Start Test
            </motion.a>
          </div>
        )}

        {/* MAIN CONTENT */}
        {!loading && latest && (
          <>
            {/* HERO */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-12 rounded-3xl bg-gradient-to-br from-purple-600/20 via-pink-500/10 to-transparent p-10 backdrop-blur-md border border-white/10"
            >
              <p className="text-sm uppercase tracking-widest text-purple-300">
                Nhóm Tính Cách Nổi Bật
              </p>

              <h2 className="mt-2 text-5xl font-bold">
                <span className="text-purple-400">
                  {hollandMaps[latest.hollandType]?.name || latest.hollandType}
                </span>
              </h2>

              <p className="mt-4 max-w-xl text-gray-300">
                {hollandMaps[latest.hollandType]?.desc}
              </p>
            </motion.div>

            {/* CHART */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-12 rounded-3xl bg-white/5 p-8 border border-white/10 backdrop-blur-sm"
            >
              <h3 className="mb-6 text-2xl font-semibold">
                Bản Biểu Điểm (Personality Breakdown)
              </h3>

              <HollandChart scores={latest.hollandScores} />
            </motion.div>

            {/* TOP TRAITS */}
            <div className="mb-12 grid grid-cols-1 md:grid-cols-3 gap-6">
              {(latest.topTypes?.length ? latest.topTypes : Object.entries(latest.hollandScores).sort((a,b)=>b[1]-a[1]).map(x=>x[0]).slice(0,3)).map((type, index) => {
                const score = latest.hollandScores[type];
                return (
                  <motion.div
                    key={type}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                    className={`rounded-2xl p-6 border border-white/10 backdrop-blur-sm ${
                      index === 0
                        ? "bg-purple-500/20 shadow-lg shadow-purple-500/20"
                        : "bg-white/5"
                    }`}
                  >
                    <h4 className="text-lg font-bold">
                      {hollandMaps[type]?.name || type}
                    </h4>

                    <p className="text-sm text-gray-400">Score: {score}</p>


                    {index === 0 && (
                      <span className="mt-2 inline-block text-xs text-purple-300">
                        Dominant Trait
                      </span>
                    )}
                  </motion.div>
                );
              })}
            </div>

            {/* HISTORY */}
            <div>
              <h3 className="mb-6 text-2xl font-semibold">History</h3>

              <div className="space-y-4">
                {results.map((r) => (
                  <motion.div
                    key={r._id}
                    whileHover={{ scale: 1.02 }}
                    className="flex items-center justify-between rounded-xl bg-white/5 p-5 border border-white/10"
                  >
                    <div>
                      <p className="font-semibold">
                        {hollandMaps[r.hollandType]?.name || r.hollandType}
                      </p>

                      <p className="text-sm text-gray-400">
                        {new Date(r.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <span className="text-lg font-bold text-purple-400">
                      {r.hollandType}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default DashboardPage;
