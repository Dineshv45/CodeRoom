export const getJwtConfig = () => ({
  accessSecret: process.env.JWT_ACCESS_SECRET,
  refreshSecret: process.env.JWT_REFRESH_SECRET,
  accessExpiresIn: "15m",
  refreshExpiresIn: "7d",
});
