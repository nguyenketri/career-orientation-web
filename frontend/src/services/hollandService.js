import axiosClient from "../api/axios";

// recommend majors by holland type
export const recommendByHolland = async (type) => {
  const response = await axiosClient.post("/recommend/holland", {
    type,
  });
  console.log(response);
  return response.data;
};
