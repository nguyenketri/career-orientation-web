import { useEffect, useState, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { getPaymentHistory } from "../../services/paymentService";
import { getProfile } from "../../services/userService";
import SkeletonLoader from "../../components/SkeletonLoader";
import { motion } from "framer-motion";

// Nhãn theo đúng enum thực tế của hệ thống (models/payment.model.js)
const STATUS_META = {
  SUCCESS: { label: "Thành công", cls: "bg-emerald-100 text-emerald-700" },
  PENDING: { label: "Đang xử lý", cls: "bg-amber-100 text-amber-700" },
  FAILED: { label: "Thất bại", cls: "bg-rose-100 text-rose-700" },
};

const METHOD_LABEL = {
  QR: "payOS (Quét mã QR)",
  CARD: "Thẻ ngân hàng",
  WALLET: "Ví điện tử",
  BANK_TRANSFER: "Chuyển khoản",
};

const PLAN_LABEL = {
  FREE: "Gói CƠ BẢN",
  PAID: "Gói TIÊU CHUẨN",
  PREMIUM: "Gói CAO CẤP",
};

const fmtVND = (n) => `${Number(n || 0).toLocaleString("vi-VN")}đ`;
const fmtDate = (d) =>
  d && !isNaN(new Date(d).getTime())
    ? new Date(d).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "—";

const PaymentHistoryPage = () => {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [dateFilter, setDateFilter] = useState("");
  const [invoicePayment, setInvoicePayment] = useState(null);
  const [toast, setToast] = useState("");
  const invoiceRef = useRef(null);
  const reportRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const [payRes, profRes] = await Promise.all([
          getPaymentHistory().catch(() => ({ data: [] })),
          getProfile().catch(() => ({ data: null })),
        ]);
        setPayments(payRes.data || []);
        setProfile(profRes.data || null);
      } catch (err) {
        console.error("Error fetching payment history:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const showToast = (m) => {
    setToast(m);
    setTimeout(() => setToast(""), 2600);
  };

  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      const matchesSearch =
        !searchTerm ||
        String(p.transactionCode || "")
          .toLowerCase()
          .includes(searchTerm.trim().toLowerCase());
      const matchesStatus = statusFilter === "ALL" || p.status === statusFilter;
      const matchesDate =
        !dateFilter ||
        (p.createdAt &&
          new Date(p.createdAt).toISOString().slice(0, 10) === dateFilter);
      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [payments, searchTerm, statusFilter, dateFilter]);

  const totalSpent = useMemo(
    () =>
      payments
        .filter((p) => p.status === "SUCCESS")
        .reduce((sum, p) => sum + (p.amount || 0), 0),
    [payments],
  );

  const currentPlan = profile?.subscriptionPlan || "FREE";
  const isActivePlan = currentPlan !== "FREE" && profile?.subscriptionExpiry;

  const handleDownloadInvoice = async (payment) => {
    setInvoicePayment(payment);
    // Chờ React render xong DOM ẩn với dữ liệu mới rồi mới xuất PDF
    setTimeout(async () => {
      if (!invoiceRef.current) return;
      try {
        setToast("Đang tạo hóa đơn...");
        const html2pdf = (await import("html2pdf.js")).default;
        await html2pdf()
          .set({
            margin: 0,
            filename: `caZup-HoaDon-${payment.transactionCode}.pdf`,
            image: { type: "jpeg", quality: 0.95 },
            html2canvas: { scale: 2, backgroundColor: "#ffffff" },
            jsPDF: { unit: "mm", format: "a5", orientation: "portrait" },
          })
          .from(invoiceRef.current)
          .save();
        setToast("");
      } catch (err) {
        console.error(err);
        showToast("Không tạo được hóa đơn, vui lòng thử lại.");
      }
    }, 50);
  };

  const handleExportReport = async () => {
    if (!reportRef.current) return;
    if (filteredPayments.length === 0) {
      showToast("Không có giao dịch nào để xuất báo cáo.");
      return;
    }
    try {
      setToast("Đang tạo báo cáo...");
      const html2pdf = (await import("html2pdf.js")).default;
      await html2pdf()
        .set({
          margin: 0,
          filename: "caZup-Lich-su-giao-dich.pdf",
          image: { type: "jpeg", quality: 0.95 },
          html2canvas: { scale: 2, backgroundColor: "#ffffff" },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        })
        .from(reportRef.current)
        .save();
      setToast("");
    } catch (err) {
      console.error(err);
      showToast("Không tạo được báo cáo, vui lòng thử lại.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 px-4 md:px-8 pt-24 pb-20">
      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-sm font-medium px-5 py-2.5 rounded-full shadow-lg">
          {toast}
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mx-auto max-w-6xl"
      >
        {/* Breadcrumb (không mũi tên) */}
        <div className="flex items-center gap-2 text-sm mb-3">
          <button
            onClick={() => navigate("/profile")}
            className="text-slate-400 hover:text-blue-600 font-medium transition"
          >
            Trang cá nhân
          </button>
          <span className="text-slate-300">›</span>
          <span className="font-bold text-slate-700">Lịch sử giao dịch</span>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-900">
            Lịch sử giao dịch
          </h1>
          <p className="text-slate-500">
            Theo dõi và quản lý các giao dịch thanh toán của bạn trên caZup.
          </p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-1">
              Tổng chi tiêu
            </div>
            <div className="text-2xl font-black text-slate-900">
              {fmtVND(totalSpent)}
            </div>
          </div>

          <div className="bg-slate-900 rounded-2xl p-5 text-white relative overflow-hidden">
            <div className="absolute -right-8 -top-8 w-28 h-28 bg-blue-500/20 rounded-full blur-2xl" />
            <div className="relative z-10">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-1">
                Gói hiện tại
              </div>
              <div className="text-xl font-black">
                {PLAN_LABEL[currentPlan] || currentPlan}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-1">
              Ngày hết hạn
            </div>
            <div className="text-2xl font-black text-slate-900">
              {isActivePlan ? fmtDate(profile.subscriptionExpiry) : "—"}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-wrap items-center gap-3 mb-6">
          <div className="relative flex-1 min-w-[200px]">
            <svg
              className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
              />
            </svg>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm mã giao dịch..."
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium text-slate-600 outline-none focus:border-blue-400 transition"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="SUCCESS">Thành công</option>
            <option value="PENDING">Đang xử lý</option>
            <option value="FAILED">Thất bại</option>
          </select>

          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-600 outline-none focus:border-blue-400 transition"
          />

          <button
            onClick={handleExportReport}
            className="ml-auto inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold transition whitespace-nowrap"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            Xuất báo cáo PDF
          </button>
        </div>

        {/* Table */}
        {loading ? (
          <SkeletonLoader type="card" count={3} />
        ) : (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wide">
                    <th className="px-6 py-4">Mã giao dịch</th>
                    <th className="px-6 py-4">Ngày thực hiện</th>
                    <th className="px-6 py-4">Gói dịch vụ</th>
                    <th className="px-6 py-4">Số tiền</th>
                    <th className="px-6 py-4">Phương thức</th>
                    <th className="px-6 py-4">Trạng thái</th>
                    <th className="px-6 py-4 text-right">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredPayments.length > 0 ? (
                    filteredPayments.map((p) => {
                      const status =
                        STATUS_META[p.status] || STATUS_META.PENDING;
                      return (
                        <tr
                          key={p._id}
                          className="hover:bg-slate-50/60 transition-colors"
                        >
                          <td className="px-6 py-4 text-sm font-mono font-bold text-blue-600">
                            #{p.transactionCode}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600">
                            {fmtDate(p.createdAt)}
                          </td>
                          <td className="px-6 py-4 text-sm font-bold text-slate-900">
                            {PLAN_LABEL[p.planType] || p.planType}
                          </td>
                          <td className="px-6 py-4 text-sm font-bold text-slate-900">
                            {fmtVND(p.amount)}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600">
                            {METHOD_LABEL[p.paymentMethod] || "payOS"}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-3 py-1 rounded-full text-[11px] font-bold ${status.cls}`}
                            >
                              {status.label}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            {p.status === "SUCCESS" ? (
                              <button
                                onClick={() => handleDownloadInvoice(p)}
                                className="inline-flex items-center gap-1.5 text-slate-600 hover:text-blue-600 font-bold text-sm transition"
                              >
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                  />
                                </svg>
                                Hóa đơn
                              </button>
                            ) : (
                              <span className="text-slate-300 text-sm">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-6 py-16 text-center text-slate-400"
                      >
                        Không tìm thấy giao dịch nào phù hợp.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </motion.div>

      {/* ===== Hóa đơn ẩn để xuất PDF ===== */}
      <div style={{ position: "fixed", left: "-10000px", top: 0 }} aria-hidden="true">
        <div
          ref={invoiceRef}
          style={{
            width: "420px",
            fontFamily: "Arial, sans-serif",
            background: "#fff",
            color: "#0f172a",
          }}
        >
          <div
            style={{
              background: "#0f172a",
              padding: "22px 28px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div style={{ fontSize: "22px", fontWeight: 800, color: "#fff" }}>
              caZup
            </div>
            <div
              style={{
                fontSize: "11px",
                letterSpacing: "2px",
                color: "#f97316",
                fontWeight: 700,
              }}
            >
              HÓA ĐƠN
            </div>
          </div>
          <div style={{ padding: "26px 28px" }}>
            <div style={{ fontSize: "12px", color: "#94a3b8", fontWeight: 700 }}>
              MÃ GIAO DỊCH
            </div>
            <div style={{ fontSize: "20px", fontWeight: 800, marginBottom: "16px" }}>
              #{invoicePayment?.transactionCode}
            </div>
            {[
              ["Ngày giao dịch", fmtDate(invoicePayment?.createdAt)],
              ["Gói dịch vụ", PLAN_LABEL[invoicePayment?.planType] || invoicePayment?.planType],
              ["Phương thức", METHOD_LABEL[invoicePayment?.paymentMethod] || "payOS"],
              ["Trạng thái", STATUS_META[invoicePayment?.status]?.label || ""],
            ].map(([label, value]) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "8px 0",
                  borderBottom: "1px solid #f1f5f9",
                  fontSize: "13px",
                }}
              >
                <span style={{ color: "#64748b" }}>{label}</span>
                <span style={{ fontWeight: 700 }}>{value}</span>
              </div>
            ))}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: "16px",
                padding: "14px 16px",
                background: "#f8fafc",
                borderRadius: "10px",
              }}
            >
              <span style={{ fontWeight: 700 }}>Tổng thanh toán</span>
              <span style={{ fontSize: "18px", fontWeight: 800, color: "#f97316" }}>
                {fmtVND(invoicePayment?.amount)}
              </span>
            </div>
          </div>
          <div
            style={{
              background: "#f8fafc",
              padding: "12px 28px",
              fontSize: "10px",
              color: "#94a3b8",
              borderTop: "1px solid #e2e8f0",
              textAlign: "center",
            }}
          >
            Cảm ơn bạn đã sử dụng dịch vụ của caZup · cazup.io.vn
          </div>
        </div>
      </div>

      {/* ===== Báo cáo tổng hợp ẩn để xuất PDF ===== */}
      <div style={{ position: "fixed", left: "-10000px", top: 0 }} aria-hidden="true">
        <div
          ref={reportRef}
          style={{
            width: "760px",
            fontFamily: "Arial, sans-serif",
            background: "#fff",
            color: "#0f172a",
          }}
        >
          <div
            style={{
              background: "#0f172a",
              padding: "26px 36px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div style={{ fontSize: "26px", fontWeight: 800, color: "#fff" }}>
              caZup
            </div>
            <div
              style={{
                fontSize: "12px",
                letterSpacing: "2px",
                color: "#f97316",
                fontWeight: 700,
              }}
            >
              LỊCH SỬ GIAO DỊCH
            </div>
          </div>
          <div style={{ padding: "30px 36px" }}>
            <div style={{ fontSize: "13px", color: "#64748b", marginBottom: "16px" }}>
              Tổng chi tiêu: <b style={{ color: "#0f172a" }}>{fmtVND(totalSpent)}</b> ·
              Gói hiện tại: <b style={{ color: "#0f172a" }}>{PLAN_LABEL[currentPlan]}</b>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
              <thead>
                <tr style={{ color: "#94a3b8", textAlign: "left" }}>
                  <th style={{ padding: "6px 4px" }}>Mã GD</th>
                  <th style={{ padding: "6px 4px" }}>Ngày</th>
                  <th style={{ padding: "6px 4px" }}>Gói</th>
                  <th style={{ padding: "6px 4px" }}>Số tiền</th>
                  <th style={{ padding: "6px 4px" }}>Phương thức</th>
                  <th style={{ padding: "6px 4px" }}>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((p) => (
                  <tr key={p._id} style={{ borderTop: "1px solid #e2e8f0" }}>
                    <td style={{ padding: "6px 4px" }}>#{p.transactionCode}</td>
                    <td style={{ padding: "6px 4px" }}>{fmtDate(p.createdAt)}</td>
                    <td style={{ padding: "6px 4px" }}>{PLAN_LABEL[p.planType] || p.planType}</td>
                    <td style={{ padding: "6px 4px" }}>{fmtVND(p.amount)}</td>
                    <td style={{ padding: "6px 4px" }}>{METHOD_LABEL[p.paymentMethod] || "payOS"}</td>
                    <td style={{ padding: "6px 4px" }}>{STATUS_META[p.status]?.label || p.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div
            style={{
              background: "#f8fafc",
              padding: "14px 36px",
              fontSize: "11px",
              color: "#94a3b8",
              borderTop: "1px solid #e2e8f0",
            }}
          >
            Tạo bởi caZup · cazup.io.vn
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentHistoryPage;
