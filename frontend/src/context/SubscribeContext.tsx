"use client";

import { erc1155Abi } from "@/abi/erc1155Abi";
import { subscriptionManagerAbi } from "@/abi/SubscriptionManager";
import { CONTRACT_ADDRESSES } from "@/config/contract";
import { useWallet } from "@/context/WalletContext";
import { fetchWithAuth } from "@/store/fetchWithAuth";
import { createPublicClient, decodeEventLog, http } from "viem";
import { baseSepolia } from "viem/chains";
import { useWriteContract } from "wagmi";
import { ethers } from "ethers";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AddressSubscribe,
  Subscribe,
  SubscribeContextType,
  SubscribePayload,
  TierData,
  TierInfo,
} from "@/types";

const SubscribeContext = createContext<SubscribeContextType | undefined>(
  undefined,
);

export function parseERC1155TransferSingleLog(log: any, userAddress: string) {
  try {
    const decoded = decodeEventLog({
      abi: erc1155Abi,
      data: log.data,
      topics: log.topics,
    });

    if (decoded.eventName === "TransferSingle") {
      const args = decoded.args as {
        from?: string;
        to?: string;
        id?: bigint;
        value?: bigint;
      };

      // cek dulu semua properti ada
      if (args.from && args.to && args.id !== undefined) {
        // mint = dari address(0)
        if (
          args.from === "0x0000000000000000000000000000000000000000" &&
          args.to.toLowerCase() === userAddress.toLowerCase()
        ) {
          return { tokenId: args.id, value: args.value };
        }
      }
    }
  } catch (e) {
    console.warn("⚠️ Log bukan TransferSingle ERC1155:", e);
  }

  return null;
}

export const SubscribeProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { writeContractAsync } = useWriteContract();
  const [subscribe, setSubscribe] = useState<Subscribe | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { accessToken, sendRefreshToken } = useWallet();
  const [subscribedata, setSubscribedata] = useState<Subscribe[]>([]);
  const [subUsersId, setSubUsersId] = useState<Subscribe[]>();
  const [tiers, setTiers] = useState<TierInfo[]>([]);
  const { userId } = useWallet();

  const publicClient = createPublicClient({
    chain: baseSepolia,
    transport: http(baseSepolia.rpcUrls.default.http[0]),
  });

  const createSubscribe = async (
    payload: SubscribePayload,
  ): Promise<Subscribe> => {
    setLoading(true);
    try {
      const bronzeTier = BigInt(Math.round(payload.bronze * 1e18));
      const silverTier = BigInt(Math.round(payload.silver * 1e18));
      const goldTier = BigInt(Math.round(payload.gold * 1e18));

      const res = await writeContractAsync({
        address: CONTRACT_ADDRESSES.SubscriptionManager,
        abi: subscriptionManagerAbi,
        functionName: "configureTiers",
        args: [bronzeTier, silverTier, goldTier],
      });

      // const data: Subscribe = {
      //   id_subscribe: crypto.randomUUID(),
      //   ...payload,
      // };
      console.log("Transaction hash:", res);

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const receipt = await provider.waitForTransaction(res);

      if (receipt.status === 1) {
        setSubscribe({ ...subscribe, status: "sukses" } as any); // atau buat type baru
      } else {
        setSubscribe({ ...subscribe, status: "gagal" } as any);
      }
    } catch (err) {
      console.error("Error creating subscription:", err);
      setSuccess(false);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const paySubscribe = async (
    payload: Subscribe,
  ): Promise<{ tokenId: bigint | null }> => {
    setLoading(true);
    // console.log("📦 PAY SUBSCRIBE PAYLOAD:", payload);
    try {
      const {
        id_creator,
        id_users,
        type_subscribe,
        tiersId,
        price,
        addressCreator,
        userAddress,
      } = payload;

      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESSES.SubscriptionManager,
        abi: subscriptionManagerAbi,
        functionName: "subscribe",
        args: [addressCreator, BigInt(tiersId)],
        value: BigInt(price),
      });

      console.log("TX HASH:", hash);

      // 2️⃣ Tunggu TX di-mine
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      console.log("TX RECEIPT:", receipt);

      // let tokenId: bigint | null = null;

      for (const log of receipt.logs) {
        const parsed = parseERC1155TransferSingleLog(log, userAddress);
        if (parsed) {
          tokenId = parsed.tokenId;
          console.log("🎉 TOKEN ID:", tokenId.toString());
          break;
        }
      }

      // 3️⃣ Simpan ke backend (SESUI DB KAMU)
      const response = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_LINK}/api/subscribe/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          },
          body: JSON.stringify({
            subscibe: {
              id_creator,
              id_users,
              type_subscribe,
            },
          }),
        },
        accessToken,
        sendRefreshToken,
      );

      console.log("Backend response:", response);

      //return { tokenId };
    } catch (err) {
      console.error("Error subscribing:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getSubscribeIdTier = useCallback(
    async (address: string): Promise<AddressSubscribe | null> => {
      console.log("getTiers:", address);
      try {
        const tierIds = [1n, 2n, 3n];

        // 🔥 Read tiers dari kontrak
        const tierData: TierData[] = await Promise.all(
          tierIds.map(async (id) => {
            const tier = await publicClient.readContract({
              address: CONTRACT_ADDRESSES.SubscriptionManager,
              abi: subscriptionManagerAbi,
              functionName: "getTierConfig",
              args: [address, id],
            });

            return {
              id,
              name: tier?.name,
              price: tier?.price,
              duration: tier?.duration,
              isActive: tier?.isActive,
            };
          }),
        );

        console.log(tierData);
        return {
          id_subscribe: crypto.randomUUID(),
          address: address,
          tiers: tierData,
        };
      } catch (err) {
        console.error("Error in getSubscribeIdTier:", err);
        return null;
      }
    },
    [accessToken, sendRefreshToken, publicClient],
  );

  const getSubscribeIdUsers = useCallback(
    async (id_users: string) => {
      console.log("getSubscribeIdUser useCallBack:", id_users);
      try {
        const respone = await fetchWithAuth(
          `${process.env.NEXT_PUBLIC_LINK}/api/subscribe/getSUb`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(accessToken
                ? { Authorization: `Bearer ${accessToken}` }
                : {}),
            },
            body: JSON.stringify({ id_users }),
          },
          accessToken,
          sendRefreshToken,
        );

        console.log(respone, "respone");
        const data = Array.isArray(respone.data) ? respone.data : [];
        setSubscribedata(data);
        return respone;
      } catch (err) {
        console.error("Error fetching chat group:", err);
        return [];
      }
    },
    [accessToken, sendRefreshToken],
  );

  const getSubscribeUserIdProfile = useCallback(
    async (id_users: string) => {
      const response = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_LINK}/api/subscribe/${id_users}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          },
        },
        accessToken,
        sendRefreshToken,
      );
      const data = Array.isArray(response.data) ? response.data : [];
      console.log(data);
      return data;
    },
    [accessToken, sendRefreshToken],
  );

  useEffect(() => {
    if (userId) {
      console.log("getSubscribeIdUsers called with:", userId);
      getSubscribeIdUsers(userId);
    }
  }, [userId, getSubscribeIdUsers]);

  useEffect(() => {
    if (!userId) return;

    const fetchData = async () => {
      try {
        const result = await getSubscribeUserIdProfile(userId);
        console.log(result);
        setSubUsersId(result);
      } catch (e) {
        console.error(e);
      }
    };

    fetchData();
  }, [userId, getSubscribeUserIdProfile]);

  const value = useMemo(
    () => ({
      subscribe,
      subUsersId,
      setSubUsersId,
      subscribedata,
      createSubscribe,
      success,
      loading,
      setSuccess,
      setSubscribe,
      getSubscribeIdTier,
      tiers,
      paySubscribe,
      setTiers,
      setSubscribedata,
      getSubscribeIdUsers,
      getSubscribeUserIdProfile,
    }),
    [
      subscribe,
      subscribedata,
      success,
      loading,
      tiers,
      subUsersId,
      setSubUsersId,
      setSubscribe,
      setSubscribedata,
      paySubscribe,
      getSubscribeIdTier,
      getSubscribeIdUsers,
      getSubscribeUserIdProfile,
    ],
  );

  return (
    <SubscribeContext.Provider value={value}>
      {children}
    </SubscribeContext.Provider>
  );
};

export const useSubscribe = () => {
  const context = useContext(SubscribeContext);
  if (!context)
    throw new Error("useSubscribe must be used within SubscribeProvider");
  return context;
};
