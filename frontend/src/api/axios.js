import axios from "axios";

// create axios instance
const axiosClient = axios.create({
  baseURL: "http://localhost:3000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosClient;
