import axiosClient from "../api/axios";

export const getAllUniversities = async () => {
  const response = await axiosClient.get("/universities");
  return response.data;
};

export const getAllUniversityMajors = async () => {
  const response = await axiosClient.get("/universities/majors/all");
  return response.data;
};

export const getUniversityById = async (id) => {
  const response = await axiosClient.get(`/universities/${id}`);
  return response.data;
};

// Phân tích so sánh bằng AI (POST /comparison/analyze) — trả về { analysis }
export const analyzeComparison = async (selectedMajors) => {
  const response = await axiosClient.post("/comparison/analyze", {
    selectedMajors,
  });
  return response.data;
};
