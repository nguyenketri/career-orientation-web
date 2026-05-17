import axiosClient from "../api/axios";

export const getMyHollandResults = async () => {
  const res = await axiosClient.get("/holland-results/me");
  return res.data;
};
