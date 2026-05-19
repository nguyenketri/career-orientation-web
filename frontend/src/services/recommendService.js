import axiosClient from "../api/axios";

// recommend majors by score (old)
export const recommendByScore = async (score) => {
  const response = await axiosClient.post("/recommend/score", { score });
  return response.data;
};

// recommend majors by subject combination scores
export const recommendBySubjects = async (scores) => {
  const response = await axiosClient.post("/recommend/subjects", { scores });
  return response.data;
};

// get user score analysis history
export const getScoreAnalysisHistory = async () => {
  const response = await axiosClient.get("/recommend/history");
  return response.data;
};
