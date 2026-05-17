import { useEffect, useState } from "react";
import { getMyHollandResults } from "../../services/hollandResult.service";

const DashboardPage = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const data = await getMyHollandResults();
        setResults(data.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load results");
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, []);

  const latest = results[0];

  return (
    <div className="min-h-screen bg-black px-6 py-20 text-white">
      <div className="mx-auto max-w-6xl">
        {/* Title */}
        <h1 className="mb-10 text-4xl font-bold">Dashboard</h1>

        {/* Loading */}
        {loading && <p className="text-gray-400">Loading...</p>}

        {/* Error */}
        {error && <p className="text-red-400">{error}</p>}

        {/* Empty */}
        {!loading && results.length === 0 && (
          <div className="rounded-2xl bg-white/5 p-8 text-center">
            <h2 className="mb-2 text-2xl font-bold">No Data Yet</h2>
            <p className="text-gray-400">Take a Holland test to see results.</p>
          </div>
        )}

        {/* Data */}
        {!loading && results.length > 0 && (
          <>
            {/* Latest */}
            <div className="mb-10 rounded-2xl bg-purple-500/10 p-6">
              <p className="text-sm text-purple-300">Latest Result</p>
              <h2 className="text-4xl font-bold">{latest.hollandType}</h2>
            </div>

            {/* History */}
            <div>
              <h3 className="mb-6 text-2xl font-bold">History</h3>

              <div className="space-y-4">
                {results.map((r) => (
                  <div key={r._id} className="rounded-xl bg-white/5 p-4">
                    <div className="flex justify-between">
                      <span className="font-semibold">{r.hollandType}</span>
                      <span className="text-sm text-gray-400">
                        {new Date(r.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="mt-2 flex flex-wrap gap-2">
                      {r.recommendedMajors.map((m) => (
                        <span
                          key={m._id}
                          className="rounded-full bg-purple-500/20 px-3 py-1 text-sm"
                        >
                          {m.name}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
