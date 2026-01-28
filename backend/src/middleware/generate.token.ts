import jwt from "jsonwebtoken";

export const generateTokens = (userId: string, addressId: string, role: string) => {
  const accessToken = jwt.sign(
    { userId, addressId, role },
    process.env.JWT_SECRET || "secret",
    { expiresIn: "15m" }
  );

  const refreshToken = jwt.sign(
    { userId, addressId, role },
    process.env.REFRESH_TOKEN_SECRET || "refresh_secret",
    { expiresIn: "7d" }
  );

  return { accessToken, refreshToken };
};
