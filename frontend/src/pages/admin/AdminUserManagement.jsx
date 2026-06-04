import { useEffect, useState } from "react";
import axios from "axios";
import { getAuthHeader } from "../../utils/auth";

const AdminUserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API_URL}/admin/users`, {
        headers: getAuthHeader(),
      });
      setUsers(res.data.data);
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

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
      fetchUsers();
    } catch (err) {
      alert("Lỗi khi cập nhật vai trò");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (
      !window.confirm(
        "Bạn có chắc muốn xóa người dùng này? Hành động này không thể hoàn tác.",
      )
    )
      return;

    try {
      await axios.delete(`${API_URL}/admin/users/${userId}`, {
        headers: getAuthHeader(),
      });
      fetchUsers();
    } catch (err) {
      alert("Lỗi khi xóa người dùng");
    }
  };

  if (loading) return <div>Đang tải...</div>;

  return (
    <div>
      <h2 className="text-3xl font-black text-slate-900 mb-8">
        Quản lý người dùng
      </h2>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
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
              {users.map((user) => (
                <tr
                  key={user._id}
                  className="hover:bg-slate-50/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-10 h-10 rounded-full border border-slate-200"
                      />
                      <span className="font-bold text-slate-900">
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
                      {user.role.toUpperCase()}
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
                      {user.subscriptionPlan}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => handleUpdateRole(user._id, user.role)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-bold"
                    >
                      Đổi vai trò
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user._id)}
                      className="text-red-600 hover:text-red-800 text-sm font-bold"
                    >
                      Xóa
                    </button>
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

export default AdminUserManagement;
