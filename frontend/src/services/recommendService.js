import axiosClient from "../api/axios";

// recommend majors by score (old)
export const recommendByScore = async (score) => {
  const response = await axiosClient.post("/recommend/score", { score });
  return response.data;
};

// recommend majors by subject combination scores
// year: "all" | 2023 | 2024 | 2025 ...  — countUsage=false khi chỉ đổi năm để xem (không trừ lượt)
export const recommendBySubjects = async (
  scores,
  filters,
  pagination,
  year = "all",
  countUsage = true,
) => {
  const response = await axiosClient.post("/recommend/subjects", {
    scores,
    filters,
    pagination,
    year,
    countUsage,
  });
  return response.data;
};

// get available admission years (for the year selector)
export const getRecommendYears = async () => {
  const response = await axiosClient.get("/recommend/years");
  return response.data;
};

// get user score analysis history (summary list, no heavy populate)
export const getScoreAnalysisHistory = async () => {
  const response = await axiosClient.get("/recommend/history");
  return response.data;
};

// get a single score analysis record with full populated details
export const getScoreAnalysisById = async (id) => {
  const response = await axiosClient.get(`/recommend/history/${id}`);
  return response.data;
};

// get current recommendation quota
export const getRecommendQuota = async () => {
  const response = await axiosClient.get("/recommend/quota");
  return response.data;
};
