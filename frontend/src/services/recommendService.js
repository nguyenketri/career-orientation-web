import axiosClient from "../api/axios";

// recommend majors by score (old)
export const recommendByScore = async (score) => {
  const response = await axiosClient.post("/recommend/score", { score });
  return response.data;
};

// recommend majors by subject combination scores
export const recommendBySubjects = async (scores, filters, pagination) => {
  const response = await axiosClient.post("/recommend/subjects", {
    scores,
    filters,
    pagination,
  });
  return response.data;
};

// get user score analysis history
export const getScoreAnalysisHistory = async () => {
  const response = await axiosClient.get("/recommend/history");
  return response.data;
};

// get current recommendation quota
export const getRecommendQuota = async () => {
  const response = await axiosClient.get("/recommend/quota");
  return response.data;
};
