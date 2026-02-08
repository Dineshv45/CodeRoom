export const requireAuth = (navigate) => {
  const token = localStorage.getItem("accessToken");

  if (!token) {
    navigate("/login");
    return false;
  }

  return true;
};
