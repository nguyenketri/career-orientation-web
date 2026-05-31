import { useEffect } from "react";
import AppRoutes from "./routes";
import axiosClient from "./api/axios";

function App() {
  useEffect(() => {
    const fetchFreshUser = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const res = await axiosClient.get("/users/me");
          if (res.data && res.data.data) {
            localStorage.setItem("user", JSON.stringify(res.data.data));
            window.dispatchEvent(new Event("userUpdate"));
          }
        } catch (e) {
          console.error("Error fetching fresh user profile on App mount", e);
        }
      }
    };
    fetchFreshUser();
  }, []);

  return <AppRoutes />;
}

export default App;
