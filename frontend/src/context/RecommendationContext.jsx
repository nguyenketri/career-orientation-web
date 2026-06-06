import React, { createContext, useContext, useState } from "react";

const RecommendationContext = createContext();

export const RecommendationProvider = ({ children }) => {
  const [scores, setScores] = useState({
    math: "",
    literature: "",
    english: "",
    physics: "",
    chemistry: "",
    biology: "",
    history: "",
    geography: "",
    civicEducation: "",
  });

  const [filters, setFilters] = useState({
    location: "",
    maxTuition: 200,
    type: "",
  });

  const [result, setResult] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 5,
  });

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
