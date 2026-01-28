import { UUID } from "./uuid";

export type UserRole = "Creators" | "Users" | null;

export type WalletContextType = {
  address?: string;
  accessToken: string | null;
  refreshToken: string | null;
  isConnected: boolean;
  role: UserRole;
  userId: UUID | null;
  isLoading: boolean;
  logout: () => Promise<void>;
  sendRefreshToken: () => Promise<string | null>;
  setRole: (role: UserRole) => void;
  signature: string | null;                          // ✅ TAMBAH
  setSignature: React.Dispatch<
    React.SetStateAction<string | null>
  >;                              
};
