import { Navigate, useLocation } from "react-router-dom";
import { getToken } from "../utils/auth";

const ProtectedRoute = ({ children }) => {
  const token = getToken();
  const location = useLocation();

  // not logged in — nhớ lại trang đang muốn vào để sau khi đăng nhập quay lại đúng chỗ
  // (vd: đang giữa luồng xác nhận thanh toán payOS thì không bị mất ngữ cảnh)
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // logged in
  return children;
};

export default ProtectedRoute;
