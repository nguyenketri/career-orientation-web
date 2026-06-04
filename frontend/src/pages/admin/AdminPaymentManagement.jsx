import { useEffect, useState } from "react";
import axiosClient from "../../api/axios";

const AdminPaymentManagement = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPayments = async () => {
    try {
      const res = await axiosClient.get("/admin/payments");
      setPayments(res.data.data);
    } catch (err) {
      console.error("Error fetching payments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleUpdateStatus = async (paymentId, newStatus) => {
    if (
      !window.confirm(
        `Xác nhận cập nhật trạng thái giao dịch thành ${newStatus}?`,
      )
    )
      return;

    try {
      await axiosClient.put("/admin/payments/status", {
        paymentId,
        status: newStatus,
      });
      fetchPayments();
    } catch (err) {
      alert("Lỗi khi cập nhật trạng thái");
    }
  };

  if (loading) return <div>Đang tải...</div>;

  return (
    <div>
      <h2 className="text-3xl font-black text-slate-900 mb-8">
        Quản lý thanh toán
      </h2>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-sm font-bold text-slate-600">
                  Ngày
                </th>
                <th className="px-6 py-4 text-sm font-bold text-slate-600">
                  Người dùng
                </th>
                <th className="px-6 py-4 text-sm font-bold text-slate-600">
                  Mã GD
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
                <th className="px-6 py-4 text-sm font-bold text-slate-600 text-right">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {payments.map((payment) => (
                <tr
                  key={payment._id}
                  className="hover:bg-slate-50/50 transition-colors"
                >
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {new Date(payment.date).toLocaleDateString("vi-VN")}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-900">
                        {payment.user?.name}
                      </span>
                      <span className="text-xs text-slate-500">
                        {payment.user?.email}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-mono text-blue-600">
                    {payment.transactionCode}
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-900">
                    {payment.amount.toLocaleString()}đ
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-600">
                    {payment.planType}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        payment.status === "SUCCESS"
                          ? "bg-green-100 text-green-700"
                          : payment.status === "FAILED"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {payment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    {payment.status === "PENDING" && (
                      <>
                        <button
                          onClick={() =>
                            handleUpdateStatus(payment._id, "SUCCESS")
                          }
                          className="text-green-600 hover:text-green-800 text-sm font-bold"
                        >
                          Duyệt
                        </button>
                        <button
                          onClick={() =>
                            handleUpdateStatus(payment._id, "FAILED")
                          }
                          className="text-red-600 hover:text-red-800 text-sm font-bold"
                        >
                          Từ chối
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPaymentManagement;
