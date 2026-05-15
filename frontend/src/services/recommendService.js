import axiosClient from "../api/axios";

// recommend majors by score
export const recommendByScore = async (score) => {
  const response = await axiosClient.post("/recommend/score", {
    score,
  });

  return response.data;
};
