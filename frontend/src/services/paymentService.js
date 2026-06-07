import axios from "axios";
import { getAuthHeader } from "../utils/auth";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

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

export const createPayment = async (planType) => {
  const response = await axios.post(
    `${API_URL}/payments/create`,
    { planType },
    { headers: getAuthHeader() },
  );
  return response.data;
};
