import "express-session";

declare module "express-session" {
  interface SessionData {
    user?: {
      userId: number;
      addressId: number;
      addressWallet: string;
      role: string;
    };
    refreshToken?: string;
    nonce?: string;
  }
}
