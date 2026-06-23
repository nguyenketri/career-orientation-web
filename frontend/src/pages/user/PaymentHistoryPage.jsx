import { useEffect, useState } from "react";
import { getPaymentHistory } from "../../services/paymentService";
import SkeletonLoader from "../../components/SkeletonLoader";
import { motion } from "framer-motion";
import { jsPDF } from "jspdf";

const PaymentHistoryPage = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await getPaymentHistory();
        setPayments(res.data || []);
      } catch (err) {
        console.error("Error fetching payment history:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case "SUCCESS":
        return (
          <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold">
            Thành công
          </span>
        );
      case "FAILED":
        return (
          <span className="px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-bold">
            Không thành công
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-bold">
            Đang xử lý
          </span>
        );
    }
  };

  const getPaymentMethodLabel = (method) => {
    const methods = {
      QR: "payOS",
      CARD: "Thẻ ngân hàng",
      WALLET: "Ví điện tử",
      BANK_TRANSFER: "Chuyển khoản",
    };
    return methods[method] || method || "payOS";
  };

  const downloadInvoice = (payment) => {
    const doc = new jsPDF();

    // Add content to PDF
    doc.setFontSize(20);
    doc.text("HOA DON THANH TOAN", 105, 20, { align: "center" });

    doc.setFontSize(12);
    doc.text(`Ma giao dich: ${payment.transactionCode}`, 20, 40);
    doc.text(`Ngay: ${new Date(payment.createdAt).toLocaleString()}`, 20, 50);
    doc.text(`Goi dich vu: ${payment.planType}`, 20, 60);
    doc.text(`So tien: ${payment.amount.toLocaleString()} VND`, 20, 70);
    doc.text(
      `Phuong thuc: ${getPaymentMethodLabel(payment.paymentMethod)}`,
      20,
      80,
    );
    doc.text(
      `Trang thai: ${payment.status === "SUCCESS" ? "Thanh cong" : "Khong thanh cong"}`,
      20,
      90,
    );

    doc.text("Cam on ban da su dung dich vu cua caZup!", 105, 120, {
      align: "center",
    });

    // Save the PDF
    doc.save(`Invoice_${payment.transactionCode}.pdf`);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 px-6 pt-32 pb-32">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mx-auto max-w-5xl"
      >
        <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-900">
            Lịch sử thanh toán
          </h1>
          <p className="text-slate-500">
            Xem lại các giao dịch nâng cấp tài khoản của bạn
          </p>
        </div>

        {loading ? (
          <SkeletonLoader type="card" count={3} />
        ) : payments.length === 0 ? (
          <div className="text-center mt-20 border border-slate-200 rounded-3xl py-20 bg-white shadow-sm">
            <h2 className="text-2xl font-bold mb-2 text-slate-900">
              Chưa có lịch sử giao dịch
            </h2>
            <p className="text-slate-500 mb-6">
              Bạn chưa thực hiện giao dịch thanh toán nào.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-6 py-4 text-sm font-bold text-slate-600">
                      Ngày giao dịch
                    </th>
                    <th className="px-6 py-4 text-sm font-bold text-slate-600">
                      Mã GD
                    </th>
                    <th className="px-6 py-4 text-sm font-bold text-slate-600">
                      Số tiền
                    </th>
                    <th className="px-6 py-4 text-sm font-bold text-slate-600">
                      Phương thức
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
                        {new Date(payment.createdAt).toLocaleDateString(
                          "vi-VN",
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm font-mono font-medium text-blue-600">
                        {payment.transactionCode}
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-slate-900">
                        {payment.amount.toLocaleString()}đ
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {getPaymentMethodLabel(payment.paymentMethod)}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {getStatusBadge(payment.status)}
                      </td>
                      <td className="px-6 py-4 text-sm text-right">
                        {payment.status === "SUCCESS" && (
                          <button
                            onClick={() => downloadInvoice(payment)}
                            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-bold transition-colors"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="4 16v1a3 3 0 003 3h10a3 3 0 003-3v1m-4-4l-4 4m0 0l-4-4m4 4V4"
                              />
                            </svg>
                            Tải hóa đơn
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default PaymentHistoryPage;
