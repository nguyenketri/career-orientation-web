import axiosClient from "../api/axios";

export const getProfile = async () => {
  const response = await axiosClient.get("/users/me");
  return response.data;
};

export const updateProfile = async (data) => {
  const response = await axiosClient.put("/users/me", data);
  return response.data;
};
