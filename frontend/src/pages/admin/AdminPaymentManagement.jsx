import { useEffect, useState, useCallback } from "react";
import axiosClient from "../../api/axios";
import { motion } from "framer-motion";

const AdminPaymentManagement = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchPayments = useCallback(async (page = 1) => {
    try {
      const res = await axiosClient.get(
        `/admin/payments?page=${page}&limit=10`,
      );
      setPayments(res.data.data.payments);
      setTotalPages(res.data.data.pages);
    } catch (err) {
      console.error("Error fetching payments:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const loadPayments = async () => {
      await fetchPayments(currentPage);
    };
    loadPayments();
  }, [currentPage, fetchPayments]);

  if (loading)
    return (
      <div className="flex items-center justify-center h-full text-slate-600">
        Đang tải...
      </div>
    );

  const filteredPayments = payments.filter((p) =>
    filter === "ALL" ? true : p.status === filter,
  );

  const totalRevenue = payments
    .filter((p) => p.status === "SUCCESS")
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-1">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900">
            Quản lý Thanh toán
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Theo dõi doanh thu và trạng thái giao dịch nâng cấp
          </p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm w-full md:w-auto">
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">
            Tổng doanh thu
          </p>
          <h3 className="text-2xl font-black text-green-600">
            {totalRevenue.toLocaleString()}đ
          </h3>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {["ALL", "PENDING", "SUCCESS", "FAILED"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
              filter === f
                ? "bg-slate-900 text-white shadow-lg"
                : "bg-white text-slate-600 border border-slate-100 hover:bg-slate-50"
            }`}
          >
            {f === "ALL"
              ? "Tất cả"
              : f === "PENDING"
                ? "Đang chờ"
                : f === "SUCCESS"
                  ? "Thành công"
                  : "Thất bại"}
          </button>
        ))}
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Mobile View */}
        <div className="lg:hidden p-4 space-y-4">
          {filteredPayments.length > 0 ? (
            filteredPayments.map((payment) => (
              <div
                key={payment._id}
                className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3"
              >
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <p className="text-sm font-mono font-bold text-blue-600">
                      #{payment.transactionCode}
                    </p>
                    <p className="text-xs text-slate-400">
                      {new Date(payment.createdAt).toLocaleString("vi-VN")}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold ${
                      payment.status === "SUCCESS"
                        ? "bg-green-100 text-green-700"
                        : payment.status === "FAILED"
                          ? "bg-red-100 text-red-700"
                          : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {payment.status === "PENDING"
                      ? "CHỜ"
                      : payment.status === "SUCCESS"
                        ? "OK"
                        : "LỖI"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-bold text-slate-900">
                      {payment.user?.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {payment.user?.email}
                    </p>
                  </div>
                  <p className="font-black text-slate-900">
                    {payment.amount.toLocaleString()}đ
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center py-10 text-slate-400">
              Không có dữ liệu thanh toán
            </p>
          )}
        </div>

        {/* Desktop View */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full min-w-[800px] text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-sm font-bold text-slate-600">
                  Giao dịch
                </th>
                <th className="px-6 py-4 text-sm font-bold text-slate-600">
                  Người dùng
                </th>
                <th className="px-6 py-4 text-sm font-bold text-slate-600">
                  Số tiền
                </th>
                <th className="px-6 py-4 text-sm font-bold text-slate-600">
                  Gói
                </th>
                <th className="px-6 py-4 text-sm font-bold text-slate-600">
                  Trạng thái
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredPayments.length > 0 ? (
                filteredPayments.map((payment) => (
                  <tr
                    key={payment._id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-mono font-bold text-blue-600">
                          #{payment.transactionCode}
                        </span>
                        <span className="text-xs text-slate-400">
                          {new Date(payment.createdAt).toLocaleString("vi-VN")}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-900">
                          {payment.user?.name}
                        </span>
                        <span className="text-xs text-slate-500">
                          {payment.user?.email}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-black text-slate-900">
                        {payment.amount.toLocaleString()}đ
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-purple-50 text-purple-600 rounded text-xs font-bold">
                        {payment.planType}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          payment.status === "SUCCESS"
                            ? "bg-green-100 text-green-700"
                            : payment.status === "FAILED"
                              ? "bg-red-100 text-red-700"
                              : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {payment.status === "PENDING"
                          ? "ĐANG CHỜ"
                          : payment.status === "SUCCESS"
                            ? "THÀNH CÔNG"
                            : "THẤT BẠI"}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-12 text-center text-slate-400"
                  >
                    Không có dữ liệu thanh toán
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-wrap items-center justify-center gap-2 py-6 border-t border-slate-100">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded-lg border border-slate-200 text-sm font-medium hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Trước
          </button>
          <div className="flex items-center gap-1">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-8 h-8 rounded-lg text-sm font-medium transition ${
                  currentPage === i + 1
                    ? "bg-blue-600 text-white"
                    : "hover:bg-slate-100 text-slate-600"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className="px-3 py-1 rounded-lg border border-slate-200 text-sm font-medium hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Sau
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default AdminPaymentManagement;
