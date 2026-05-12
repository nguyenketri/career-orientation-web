import { Navigate } from "react-router-dom";
import { getToken } from "../utils/auth";

const ProtectedRoute = ({ children }) => {
  const token = getToken();

  // not logged in
  if (!token) {
    return <Navigate to="/login" />;
  }

  // logged in
  return children;
};

export default ProtectedRoute;
