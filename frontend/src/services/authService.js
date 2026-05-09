import axiosClient from "../api/axios";

// login API
export const loginUser = async (data) => {
  const response = await axiosClient.post("/auth/login", data);

  return response.data;
};
