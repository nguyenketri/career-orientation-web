import axiosClient from "../api/axios";

// login API
export const loginUser = async (data) => {
  const response = await axiosClient.post("/auth/login", data);

  return response.data;
};

export const registerUser = async (data) => {
  const response = await axiosClient.post("/auth/register", data);

  return response.data;
};

export const googleLoginUser = async (idToken) => {
  const response = await axiosClient.post("/auth/google", { idToken });

  return response.data;
};
