"use client";

import { LightProvider } from "@/context/LightContext";
import { WalletProvider } from "@/context/WalletContext";

import { SubscribeProvider } from "@/context/SubscribeContext";
import { UsersProvider } from "@/context/UsersContext";
import { getDefaultConfig, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { baseSepolia } from "wagmi/chains";
import ThemeWrapper from "./ThemeWrapper";
import { ChatPersonalProvider } from "@/context/ChatPersonalContext";
import { MessageChatProvider } from "@/context/MessageContext";
import { ChatGroupProvider } from "@/context/GroupChatContext";
import { ActiveTabProvider } from "@/context/ActiveTabContext";

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!;

const config = getDefaultConfig({
  appName: "Base Indonesia",
  projectId,
  chains: [baseSepolia],
  ssr: true,
});

const queryClient = new QueryClient();

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ActiveTabProvider>
      <LightProvider>
        <ThemeWrapper>
          <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
              <RainbowKitProvider>
                <WalletProvider>
                  <UsersProvider>
                    <SubscribeProvider>
                      <ChatPersonalProvider>
                        <MessageChatProvider>
                          <ChatGroupProvider>{children}</ChatGroupProvider>
                        </MessageChatProvider>
                      </ChatPersonalProvider>
                    </SubscribeProvider>
                  </UsersProvider>
                </WalletProvider>
              </RainbowKitProvider>
            </QueryClientProvider>
          </WagmiProvider>
        </ThemeWrapper>
      </LightProvider>
    </ActiveTabProvider>
  );
}
