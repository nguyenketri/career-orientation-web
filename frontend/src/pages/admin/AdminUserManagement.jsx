import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { getAuthHeader } from "../../utils/auth";
import { motion } from "framer-motion";

const AdminUserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsersCount, setTotalUsersCount] = useState(0);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

  const fetchUsers = useCallback(async (page = 1) => {
    try {
      const res = await axios.get(
        `${API_URL}/admin/users?page=${page}&limit=10`,
        {
          headers: getAuthHeader(),
        },
      );
      setUsers(res.data.data.users);
      setTotalPages(res.data.data.pages);
      setTotalUsersCount(res.data.data.total);
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const loadUsers = async () => {
      await fetchUsers(currentPage);
    };
    loadUsers();
  }, [currentPage, fetchUsers]);

  const handleUpdateRole = async (userId, currentRole) => {
    const newRole = currentRole === "admin" ? "user" : "admin";
    if (
      !window.confirm(
        `Bạn có chắc muốn đổi vai trò người dùng này thành ${newRole}?`,
      )
    )
      return;

    try {
      await axios.put(
        `${API_URL}/admin/users/role`,
        { userId, role: newRole },
        { headers: getAuthHeader() },
      );
      fetchUsers(currentPage);
    } catch {
      alert("Lỗi khi cập nhật vai trò");
    }
  };

  const handleToggleStatus = async (userId) => {
    try {
      await axios.patch(
        `${API_URL}/admin/users/${userId}/status`,
        {},
        { headers: getAuthHeader() },
      );
      fetchUsers(currentPage);
    } catch {
      alert("Lỗi khi cập nhật trạng thái");
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-full text-slate-600">
        Đang tải...
      </div>
    );

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-slate-900">Quản lý User</h1>
        <p className="text-slate-500 text-sm mt-1">
          Theo dõi và quản lý tất cả người dùng hệ thống
        </p>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <input
          type="text"
          placeholder="🔍 Tìm kiếm user (trên trang hiện tại)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Users List - Mobile (Cards) */}
      <div className="grid grid-cols-1 gap-4 lg:hidden">
        {filteredUsers.length > 0 ? (
          filteredUsers.map((user) => (
            <div
              key={user._id}
              className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                    {user.name?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{user.name}</p>
                    <p className="text-sm text-slate-500">{user.email}</p>
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    user.status === "ACTIVE"
                      ? "bg-green-100 text-green-600"
                      : "bg-red-100 text-red-600"
                  }`}
                >
                  {user.status === "ACTIVE" ? "Active" : "Inactive"}
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    user.role === "admin"
                      ? "bg-purple-100 text-purple-700"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {user.role?.toUpperCase() || "USER"}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    user.subscriptionPlan === "PREMIUM"
                      ? "bg-amber-100 text-amber-700"
                      : user.subscriptionPlan === "PAID"
                        ? "bg-green-100 text-green-700"
                        : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {user.subscriptionPlan || "FREE"}
                </span>
              </div>

              <div className="flex gap-3 pt-2 border-t border-slate-50">
                <button
                  onClick={() => handleUpdateRole(user._id, user.role)}
                  className="flex-1 px-3 py-2 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition"
                >
                  ✏️ Đổi vai trò
                </button>
                <button
                  onClick={() => handleToggleStatus(user._id)}
                  className={`flex-1 px-3 py-2 text-xs font-bold rounded-xl transition ${
                    user.status === "ACTIVE"
                      ? "bg-red-100 text-red-600 hover:bg-red-200"
                      : "bg-green-100 text-green-600 hover:bg-green-200"
                  }`}
                >
                  {user.status === "ACTIVE" ? "❌ Vô hiệu hóa" : "✅ Kích hoạt"}
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-10 text-slate-500">
            Không tìm thấy người dùng nào
          </div>
        )}
      </div>

      {/* Users Table - Desktop */}
      <div className="hidden lg:block bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-sm font-bold text-slate-600">
                  Người dùng
                </th>
                <th className="px-6 py-4 text-sm font-bold text-slate-600">
                  Email
                </th>
                <th className="px-6 py-4 text-sm font-bold text-slate-600">
                  Vai trò
                </th>
                <th className="px-6 py-4 text-sm font-bold text-slate-600">
                  Gói cước
                </th>
                <th className="px-6 py-4 text-sm font-bold text-slate-600 text-right">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr
                    key={user._id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                          {user.name?.charAt(0)?.toUpperCase() || "U"}
                        </div>
                        <span className="font-medium text-slate-900">
                          {user.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {user.email}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          user.role === "admin"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {user.role?.toUpperCase() || "USER"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          user.subscriptionPlan === "PREMIUM"
                            ? "bg-amber-100 text-amber-700"
                            : user.subscriptionPlan === "PAID"
                              ? "bg-green-100 text-green-700"
                              : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {user.subscriptionPlan || "FREE"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleUpdateRole(user._id, user.role)}
                          className="px-3 py-1 text-xs font-bold text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        >
                          ✏️ Đổi vai trò
                        </button>
                        <button
                          onClick={() => handleToggleStatus(user._id)}
                          className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                            user.status === "ACTIVE"
                              ? "bg-red-100 text-red-600 hover:bg-red-200"
                              : "bg-green-100 text-green-600 hover:bg-green-200"
                          }`}
                        >
                          {user.status === "ACTIVE"
                            ? "❌ Vô hiệu hóa"
                            : "✅ Kích hoạt"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-8 text-center text-slate-500"
                  >
                    Không tìm thấy người dùng nào
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

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-center">
          <p className="text-slate-500 text-sm mb-1">Tổng user</p>
          <h3 className="text-2xl font-black text-slate-900">
            {totalUsersCount}
          </h3>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-center">
          <p className="text-slate-500 text-sm mb-1">
            User Premium (trang này)
          </p>
          <h3 className="text-2xl font-black text-slate-900">
            {users.filter((u) => u.subscriptionPlan === "PREMIUM").length}
          </h3>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-center">
          <p className="text-slate-500 text-sm mb-1">Admin (trang này)</p>
          <h3 className="text-2xl font-black text-slate-900">
            {users.filter((u) => u.role === "admin").length}
          </h3>
        </div>
      </div>
    </motion.div>
  );
};

export default AdminUserManagement;
