import axiosClient from "../api/axios";

// Link guest result to user after login/register
export const linkGuestResult = async () => {
  const guestResult = localStorage.getItem("guestResult");
  if (!guestResult) return null;

  try {
    const { type, result } = JSON.parse(guestResult);
    if (result?._id) {
      const res = await axiosClient.post("/users/link-result", {
        resultId: result._id,
        type,
      });
      localStorage.removeItem("guestResult");
      return { type, result: res.data?.data || result };
    }
  } catch (err) {
    console.error("Failed to link guest result:", err);
  }
  return null;
};

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
