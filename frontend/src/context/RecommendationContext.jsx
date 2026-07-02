import { createContext, useContext, useState, useEffect } from "react";

const RecommendationContext = createContext();

const INITIAL_SCORES = {
  math: "",
  literature: "",
  english: "",
  physics: "",
  chemistry: "",
  biology: "",
  history: "",
  geography: "",
  civicEducation: "",
};

const INITIAL_FILTERS = {
  location: "",
  maxTuition: 200,
  type: "",
};

const INITIAL_PAGINATION = {
  page: 1,
  limit: 5,
};

export const RecommendationProvider = ({ children }) => {
  const [scores, setScores] = useState(INITIAL_SCORES);
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [result, setResult] = useState(null);
  const [pagination, setPagination] = useState(INITIAL_PAGINATION);
  // Năm điểm chuẩn đang xem: "all" = tất cả các năm
  const [selectedYear, setSelectedYear] = useState("all");

  const resetRecommendation = () => {
    setScores(INITIAL_SCORES);
    setFilters(INITIAL_FILTERS);
    setResult(null);
    setPagination(INITIAL_PAGINATION);
    setSelectedYear("all");
  };

  useEffect(() => {
    const handleUserUpdate = () => {
      resetRecommendation();
    };
    window.addEventListener("userUpdate", handleUserUpdate);
    return () => window.removeEventListener("userUpdate", handleUserUpdate);
  }, []);

  return (
    <RecommendationContext.Provider
      value={{
        scores,
        setScores,
        filters,
        setFilters,
        result,
        setResult,
        pagination,
        setPagination,
        selectedYear,
        setSelectedYear,
        resetRecommendation,
      }}
    >
      {children}
    </RecommendationContext.Provider>
  );
};

export const useRecommendation = () => {
  const context = useContext(RecommendationContext);
  if (!context) {
    throw new Error(
      "useRecommendation must be used within a RecommendationProvider",
    );
  }
  return context;
};
