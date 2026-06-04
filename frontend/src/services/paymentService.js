import axios from "axios";
import { getAuthHeader } from "../utils/auth";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const getPaymentHistory = async () => {
  const response = await axios.get(`${API_URL}/payments/history`, {
    headers: getAuthHeader(),
  });
  return response.data;
};

export const getPaymentStatus = async (paymentId) => {
  const response = await axios.get(`${API_URL}/payments/status/${paymentId}`, {
    headers: getAuthHeader(),
  });
  return response.data;
};
