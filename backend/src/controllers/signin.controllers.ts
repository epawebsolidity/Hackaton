import { verifyMessage } from "ethers";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { generateTokens } from "../middleware/generate.token";
import db from "../models";
export const signIn = async (req: Request, res: Response) => {
  try {
    const { address, signature } = req.body;
    const nonce = (req.session as any).nonce;
    const uuid = uuidv4();

    if (!nonce) {
      return res.status(400).json({ message: "Nonce not found" });
    }

    const signer = verifyMessage(nonce, signature);

    if (signer.toLowerCase() !== address.toLowerCase()) {
      return res.status(401).json({ message: "Invalid signature" });
    }

    let addressRecord = await db.Address.findOne({ where: { address } });
    if (!addressRecord) {
      addressRecord = await db.Address.create({
        address,
        status_address: true,
      });
    }

    let user = await db.User.findOne({
      where: { id_address: addressRecord.id_address },
    });

    if (!user) {
      const role = await db.Role.findOne({ where: { role: "Users" } });
      if (!role) throw new Error("Role Users not found");

      user = await db.User.create({
        id_address: addressRecord.id_address,
        id_role: role.id_role,
        first_name: "",
        last_name: "",
        username: `user_${uuid.slice(0, 8)}`,
        foto: "",
      });
    }

    const userRole = await db.Role.findByPk(user.id_role);

    const { accessToken, refreshToken } = generateTokens(
      user.id_users,
      addressRecord.id_address,
      userRole!.role
    );

    (req.session as any).accessToken = accessToken;
    (req.session as any).refreshToken = refreshToken;
    (req.session as any).user = {
      userId: user.id_users,
      addressId: addressRecord.id_address,
      addressWallet: addressRecord.address,
      role: userRole!.role,
    };
    delete (req.session as any).nonce;

    return res.json({
      message: "Login success",
      accessToken,
      user: {
        userId: user.id_users,
        addressId: addressRecord.id_address,
        addressWallet: addressRecord.address,
        role: userRole!.role,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Login failed" });
  }
};

export const getNonce = (req: Request, res: Response) => {
  const nonce = crypto.randomUUID();
  (req.session as any).nonce = nonce;
  return res.json({ nonce });
};

export const getSession = (req: Request, res: Response) => {
  if (!req.session.user) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  res.json({
    ...req.session.user,
    accessToken: (req.session as any).accessToken,
    refreshToken: (req.session as any).refreshToken, 
  });
};

export const refreshToken = (req: Request, res: Response) => {
  const storedToken = (req.session as any).refreshToken;
  if (!storedToken) {
    return res.status(401).json({ message: "No refresh token" });
  }

  try {
    const payload = jwt.verify(
      storedToken,
      process.env.REFRESH_TOKEN_SECRET || "refresh_secret"
    ) as { userId: string; addressId: string; role?: string };

    const { accessToken, refreshToken } = generateTokens(
      payload.userId,
      payload.addressId,
      payload.role as string
    );

    (req.session as any).refreshToken = refreshToken;

    return res.json({ accessToken });
  } catch {
    return res.status(401).json({ message: "Invalid refresh token" });
  }
};

export const logout = (req: Request, res: Response) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Logout error:", err);
      return res.status(500).json({ message: "Logout failed" });
    }

    res.clearCookie("sid", {
      httpOnly: true, 
      sameSite: "lax", 
      secure: false, 
    });
    return res.json({ message: "Logout success" });
  });
};
