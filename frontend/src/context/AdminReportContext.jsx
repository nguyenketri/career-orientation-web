import { createContext, useContext } from "react";

// Cho phép bất kỳ trang admin nào cũng mở được modal "Generate Report" dùng
// chung (nút này nằm cố định ở sidebar AdminLayout, không thuộc riêng 1 trang).
export const AdminReportContext = createContext(() => {});

export const useAdminReport = () => useContext(AdminReportContext);
