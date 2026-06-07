export const getToken = () => {
  return localStorage.getItem("token");
};

export const getUser = () => {
  const user = localStorage.getItem("user");

  return user ? JSON.parse(user) : null;
};

export const logoutUser = () => {
  const user = getUser();
  const userId = user?._id || user?.id;
  if (userId) {
    localStorage.removeItem(`comparison_selected_majors_${userId}`);
  }
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

export const getAuthHeader = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};
