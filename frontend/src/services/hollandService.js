import axiosClient from "../api/axios";

// get 42 holland questions
export const getHollandQuestions = async () => {
  const response = await axiosClient.get("/holland/questions");
  return response.data;
};

// submit test to calculate
export const submitHollandTest = async (answers) => {
  const response = await axiosClient.post("/holland/submit", { answers });
  return response.data;
};

// save test result to profile
export const saveHollandResult = async (data) => {
  const response = await axiosClient.post("/holland-results/save", data);
  return response.data;
};

// get user history
export const getMyHollandResults = async () => {
  const response = await axiosClient.get("/holland-results/history");
  return response.data;
};

// detail fallback
export const recommendByHolland = async (type) => {
  const response = await axiosClient.post("/recommend/holland", { type });
  return response.data;
};
