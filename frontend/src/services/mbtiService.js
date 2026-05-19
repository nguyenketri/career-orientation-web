import axiosClient from "../api/axios";

// get 93 mbti questions
export const getMbtiQuestions = async () => {
  const response = await axiosClient.get("/mbti/questions");
  return response.data;
};

// submit test to calculate
export const submitMbtiTest = async (answers) => {
  const response = await axiosClient.post("/mbti/submit", { answers });
  return response.data;
};

// get user history
export const getMyMbtiResults = async () => {
  const response = await axiosClient.get("/mbti/history");
  return response.data;
};
