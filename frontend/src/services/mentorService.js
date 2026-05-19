import axiosClient from "../api/axios";

export const sendChatMessage = async (sessionId, message) => {
  const response = await axiosClient.post("/mentor/send", { sessionId, message });
  return response.data;
};

export const getChatSessions = async () => {
  const response = await axiosClient.get("/mentor/sessions");
  return response.data;
};

export const getSessionMessages = async (sessionId) => {
  const response = await axiosClient.get(`/mentor/sessions/${sessionId}`);
  return response.data;
};
