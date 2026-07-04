import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  getNotifications,
  getUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../services/notificationService";

const TYPE_ICON = {
  WELCOME: "👋",
  PAYMENT_SUCCESS: "💳",
  SUBSCRIPTION_EXPIRED: "⚠️",
  ACCOUNT_STATUS: "👤",
};

// "5 phút trước" / "3 giờ trước" / "2 ngày trước" — quá 30 ngày thì hiện ngày cụ thể
const timeAgo = (dateStr) => {
  const date = new Date(dateStr);
  const diffSec = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diffSec < 60) return "Vừa xong";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} phút trước`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour} giờ trước`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 30) return `${diffDay} ngày trước`;
  return date.toLocaleDateString("vi-VN");
};

const NotificationBell = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [items, setItems] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const menuRef = useRef(null);

  // Đóng dropdown khi bấm ra ngoài
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Cập nhật số chưa đọc định kỳ để badge luôn mới, kể cả khi dropdown đang đóng
  useEffect(() => {
    let cancelled = false;
    const fetchCount = async () => {
      try {
        const res = await getUnreadCount();
        if (!cancelled) setUnreadCount(res.data?.count || 0);
      } catch (err) {
        console.error("Failed to fetch unread count:", err);
      }
    };
    fetchCount();
    const interval = setInterval(fetchCount, 60000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const loadNotifications = useCallback(async (targetPage, tab) => {
    setLoading(true);
    try {
      const res = await getNotifications(targetPage, 10, tab === "unread");
      const data = res.data;
      setItems((prev) =>
        targetPage === 1 ? data.items : [...prev, ...data.items],
      );
      setTotalPages(data.totalPages || 1);
      setUnreadCount(data.unreadCount || 0);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleToggle = () => {
    const next = !isOpen;
    setIsOpen(next);
    if (next) {
      setPage(1);
      loadNotifications(1, activeTab);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setPage(1);
    loadNotifications(1, tab);
  };

  const handleLoadMore = () => {
    const next = page + 1;
    setPage(next);
    loadNotifications(next, activeTab);
  };

  const handleItemClick = async (n) => {
    if (!n.isRead) {
      setItems((prev) =>
        prev.map((x) => (x._id === n._id ? { ...x, isRead: true } : x)),
      );
      setUnreadCount((c) => Math.max(0, c - 1));
      try {
        await markNotificationAsRead(n._id);
      } catch (err) {
        console.error("Failed to mark notification as read:", err);
      }
    }
    setIsOpen(false);
    if (n.link) navigate(n.link);
  };

  const handleMarkAllRead = async () => {
    setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
    try {
      await markAllNotificationsAsRead();
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={handleToggle}
        className="relative p-2 rounded-full text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition"
        title="Thông báo"
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-0.5 right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-orange-500 text-white text-[10px] font-bold flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="fixed inset-x-4 top-16 sm:absolute sm:inset-x-auto sm:right-0 sm:top-[calc(100%+10px)] sm:w-96 bg-white rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/60 overflow-hidden z-50 animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="flex items-center justify-between px-4 pt-4 pb-3">
            <h3 className="font-black text-slate-900 text-lg">Thông báo</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs font-bold text-blue-600 hover:underline"
              >
                Đánh dấu đã đọc tất cả
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 px-4 pb-3">
            {[
              { key: "all", label: "Tất cả" },
              { key: "unread", label: "Chưa đọc" },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => handleTabChange(t.key)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition ${
                  activeTab === t.key
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="max-h-[420px] overflow-y-auto divide-y divide-slate-50 border-t border-slate-100">
            {items.length === 0 && !loading && (
              <div className="px-4 py-10 text-center text-sm text-slate-400">
                {activeTab === "unread"
                  ? "Bạn không có thông báo chưa đọc."
                  : "Bạn chưa có thông báo nào."}
              </div>
            )}

            {items.map((n) => (
              <button
                key={n._id}
                onClick={() => handleItemClick(n)}
                className="w-full text-left flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition"
              >
                <span className="text-xl shrink-0 mt-0.5">
                  {TYPE_ICON[n.type] || "🔔"}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-slate-900 leading-snug">
                    {n.title}
                  </p>
                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 mt-0.5">
                    {n.message}
                  </p>
                  <p className="text-[11px] text-blue-600 font-bold mt-1">
                    {timeAgo(n.createdAt)}
                  </p>
                </div>
                {!n.isRead && (
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0 mt-1.5" />
                )}
              </button>
            ))}

            {loading && (
              <div className="px-4 py-6 text-center text-xs text-slate-400">
                Đang tải...
              </div>
            )}
          </div>

          {!loading && page < totalPages && items.length > 0 && (
            <div className="p-3 border-t border-slate-100 text-center">
              <button
                onClick={handleLoadMore}
                className="text-xs font-bold text-slate-500 hover:text-slate-800 transition"
              >
                Xem thông báo trước đó
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
