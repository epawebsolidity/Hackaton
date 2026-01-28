"use client";

import { subscriptionManagerAbi } from "@/abi/SubscriptionManager";
import { CONTRACT_ADDRESSES } from "@/config/contract";
import { useWallet } from "@/context/WalletContext";
import { fetchWithAuth } from "@/store/fetchWithAuth";
import {
  keccak256,
  encodePacked,
  signatureToCompactSignature,
  http,
  hashMessage,
  hexToBytes,
  createPublicClient,
} from "viem";

import { ethers } from "ethers";
import { useWalletClient, useAccount, useSignMessage } from "wagmi";
import { baseSepolia } from "viem/chains";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useWriteContract, useContractWrite, useTransaction } from "wagmi";

import { User, UsersContextType } from "@/types";

const UsersContext = createContext<UsersContextType | null>(null);

export function UsersProvider({ children }: { children: ReactNode }) {
  const { userId, accessToken, sendRefreshToken, setRole } = useWallet();
  const [user, setUser] = useState<User | null>(null);
  const [usersAll, setUsersAll] = useState<User[]>([]);
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const { writeContractAsync } = useWriteContract();
  //const [setChatGroups] = useChatGroup();
  // const { writeContractAsync } = useWriteContract();
  // const publicClient = createPublicClient({
  //   chain: baseSepolia, // Gunakan chain yang sesuai (baseSepolia di sini sebagai contoh)
  //   transport: http(baseSepolia.rpcUrls.default.http[0]), // URL RPC
  // });
  const fetchUserById = useCallback(
    async (userId: string) => {
      if (!userId) return null;

      try {
        const res = await fetchWithAuth(
          `${process.env.NEXT_PUBLIC_LINK}/api/users/${userId}`,
          {
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
              ...(accessToken
                ? { Authorization: `Bearer ${accessToken}` }
                : {}),
            },
          },
          accessToken,
          sendRefreshToken,
        );
        return res.data?.data ?? res.data ?? null;
      } catch (err) {
        console.error("fetchUserById error:", err);
        return null;
      }
    },
    [accessToken, sendRefreshToken],
  );

  const fetchUsersAll = useCallback(async () => {
    if (!accessToken) return [];
    try {
      const res = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_LINK}/api/users`,
        {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        },
        accessToken,
        sendRefreshToken,
      );
      return res.data ?? [];
    } catch (err) {
      console.error("fetchUsersAll error:", err);
      return [];
    }
  }, [accessToken, sendRefreshToken]);

  const updateProfileUsers = async (
    id: UUID,
    formData: FormData,
  ): Promise<User | null> => {
    if (!accessToken || !sendRefreshToken) return null;
    try {
      const fullName =
        formData.get("first_name") + " " + formData.get("last_name");
      const username = formData.get("username") as string;
      const fotoFile = formData.get("foto") as File; // Pastikan foto adalah File

      console.log(fotoFile?.name, "ini file"); // Debugging nama file
      if (!username || !fotoFile) {
        console.error("Missing required fields (username, foto)");
        return null;
      }
      const safeUsername = encodeURIComponent(
        username.trim().replace(/\/+$/, ""),
      );
      // Ambil data dari API Neynar
      const neynarUrl = `https://api.neynar.com/v2/farcaster/user/by_username?username=${safeUsername}`;
      const apiKey = process.env.NEXT_PUBLIC_NEYNAR_API_KEY;
      if (!apiKey) {
        throw new Error("API key is missing!");
      }

      // Lakukan request dengan API key yang valid
      const neynarResponse = await fetch(neynarUrl, {
        headers: {
          api_key: apiKey, // Menggunakan api_key dari env variabel
        },
      });

      // Log respons untuk debugging
      const response = await neynarResponse.json();
      const followerCount =
        response?.followersCount ?? response?.user?.follower_count ?? 0;
      console.log(followerCount);
      if (followerCount > 10000) {
        // console.log("lolos");
        // const res = await writeContractAsync({
        //   address: CONTRACT_ADDRESSES.SubscriptionManager,
        //   abi: subscriptionManagerAbi,
        //   functionName: "registerCreator",
        //   args: [fullName, username, fotoFile.name],
        // });

        // if (!res) return null;

        const data = await fetchWithAuth(
          `${process.env.NEXT_PUBLIC_LINK}/api/users/${id}`,
          {
            method: "PUT",
            body: formData,
            credentials: "include",
          },
          accessToken,
          sendRefreshToken,
        );
        const updatedUser = data?.data ?? null;
        console.log("updateProfileUsers: updatedUser", updatedUser);
        console.log("updateProfileUsers: role from response", data?.role);
        // Set role baru di WalletContext
        if (data?.role) {
          const normalizedRole =
            data.role.toLowerCase() === "creators" ? "Creators" : "Users";
          console.log("updateProfileUsers: setting role to", normalizedRole);
          setRole(normalizedRole);
        }
        setUser(updatedUser);
        return updatedUser;
      } else {
        console.log(
          "Follower count is not greater than 10,000. Aborting registration.",
        );
        return null;
      }
    } catch (err) {
      console.error("updateProfileUsers error:", err);
      return null;
    }
  };

  const getProfileUserById = useCallback(
    async (id: string) => {
      try {
        const data = await fetchWithAuth(
          `${process.env.NEXT_PUBLIC_LINK}/api/users/${id}`,
          {
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
              ...(accessToken
                ? { Authorization: `Bearer ${accessToken}` }
                : {}),
            },
          },
          accessToken,
          sendRefreshToken,
        );
        return data?.data ?? null;
      } catch (err) {
        console.error("getProfileUserById error:", err);
        return null;
      }
    },
    [accessToken, sendRefreshToken],
  );

  // Sync user on userId change
  useEffect(() => {
    if (!userId) return setUser(null);
    fetchUserById(userId).then(setUser);
  }, [userId, fetchUserById]);

  useEffect(() => {
    if (accessToken) fetchUsersAll().then(setUsersAll);
  }, [accessToken, fetchUsersAll]);

  return (
    <UsersContext.Provider
      value={{
        user,
        usersAll,
        setUser,
        setUsersAll,
        fetchUserById,
        fetchUsersAll,
        updateProfileUsers,
        profileUser,
        getProfileUserById,
        setProfileUser,
      }}
    >
      {children}
    </UsersContext.Provider>
  );
}

export const useUsers = () => {
  const ctx = useContext(UsersContext);
  if (!ctx) throw new Error("useUsers must be used within UsersProvider");
  return ctx;
};
