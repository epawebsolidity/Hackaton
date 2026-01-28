"use client";

import { UserRole, UUID, WalletContextType } from "@/types";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useAccount, useAccountEffect, useSignMessage } from "wagmi";

const WalletContext = createContext<WalletContextType>({
  address: undefined,
  accessToken: null,
  refreshToken: null,
  isConnected: false,
  role: null,
  userId: null,
  signature: null,
  setSignature: () => {},
  isLoading: true,
  logout: async () => {},
  sendRefreshToken: async () => null,
  setRole: () => {},
});

export function WalletProvider({ children }: { children: ReactNode }) {
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();

  const [role, setRole] = useState<UserRole>(null);
  const [userId, setUserId] = useState<UUID | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [signature, setSignature] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const hasTriedLogin = useRef(false);

  const restoreSession = useCallback(async (): Promise<boolean> => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_LINK}/api/signin/session`,
        {
          credentials: "include",
        },
      );
      const data = await res.json();
      if (data?.role && data?.userId) {
        setRole(data.role);
        setUserId(data.userId);
        setAccessToken(data.accessToken);
        setRefreshToken(data.refreshToken);
        setSignature(data.signature);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, []);

  const autoLogin = useCallback(async () => {
    if (!isConnected || !address || !signMessageAsync || hasTriedLogin.current)
      return;
    hasTriedLogin.current = true;

    try {
      const nonceRes = await fetch(
        `${process.env.NEXT_PUBLIC_LINK}/api/signin/nonce`,
        {
          credentials: "include",
        },
      );
      const { nonce } = await nonceRes.json();
      if (!nonce) throw new Error("No nonce");

      const signature = await signMessageAsync({ message: nonce });

      const loginRes = await fetch(
        `https://hackatonbas-production.up.railway.app/api/signin`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" }, // 🔥 WAJIB
          credentials: "include",
          body: JSON.stringify({ address, signature }),
        },
      );

      console.log(loginRes);

      if (!loginRes.ok) throw new Error("Login failed");

      const loginData = await loginRes.json();
      setRole(loginData.user?.role ?? null);
      setUserId(loginData.user?.userId ?? null);
      setAccessToken(loginData?.accessToken ?? null);
      setRefreshToken(loginData?.refreshToken ?? null);
      setSignature(signature ?? null);
    } catch (err) {
      console.error("[WalletProvider] autoLogin failed", err);
      setRole(null);
      setUserId(null);
      hasTriedLogin.current = false;
    }
  }, [address, isConnected, signMessageAsync]);

  const logout = useCallback(async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_LINK}/api/signin/logout`, {
        method: "POST",
        credentials: "include",
      });
    } finally {
      setRole(null);
      setUserId(null);
      setAccessToken(null);
      setRefreshToken(null);
      setSignature(null);
      hasTriedLogin.current = false;
    }
  }, []);

  const sendRefreshToken = useCallback(async (): Promise<string | null> => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_LINK}/api/signin/refresh`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        },
      );
      if (!res.ok) throw new Error("Failed to refresh token");
      const data = await res.json();
      setAccessToken(data.accessToken ?? null);
      setRefreshToken(data.refreshToken ?? null);
      return data.accessToken;
    } catch (err) {
      console.error("Refresh token error:", err);
      return null;
    }
  }, []);

  useAccountEffect({ onDisconnect: logout });

  useEffect(() => {
    setIsLoading(true);
    (async () => {
      const hasSession = await restoreSession();
      if (!hasSession) await autoLogin();
      setIsLoading(false);
    })();
  }, [restoreSession, autoLogin]);

  return (
    <WalletContext.Provider
      value={{
        address,
        isConnected,
        role,
        signature,
        userId,
        accessToken,
        refreshToken,
        isLoading,
        logout,
        sendRefreshToken,
        setRole,
        setSignature,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export const useWallet = () => useContext(WalletContext);
