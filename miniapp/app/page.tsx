"use client";

import {
  useMiniKit,
} from "@coinbase/onchainkit/minikit";
import {
  Name,
  Identity,
  Address,
  Avatar,
  EthBalance,
} from "@coinbase/onchainkit/identity";
import {
  ConnectWallet,
  Wallet,
  WalletDropdown,
  WalletDropdownDisconnect,
} from "@coinbase/onchainkit/wallet";
import { useEffect } from "react";
import GM from "./components/GM";

export default function App() {
  const { setFrameReady, isFrameReady } = useMiniKit();

  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady();
    }
  }, [setFrameReady, isFrameReady]);

  const schemaId = "0x85500e806cf1e74844d51a20a6d893fe1ed6f6b0738b50e43d774827d08eca61";
  return (
    <div className="flex flex-col min-h-screen font-sans text-[var(--app-foreground)] mini-app-theme from-[var(--app-background)] to-[var(--app-gray)]">
      <div className="w-full max-w-md mx-auto px-4 py-3">
        <header className="flex justify-center items-center mb-6">
          <Wallet className="z-10">
            <ConnectWallet>
              <Name className="text-inherit" />
            </ConnectWallet>
            <WalletDropdown>
              <Identity className="px-4 pt-3 pb-2" hasCopyAddressOnClick schemaId={schemaId}>
                <Avatar />
                <Name />
                <Address />
                <EthBalance />
              </Identity>
              <WalletDropdownDisconnect />
            </WalletDropdown>
          </Wallet>
        </header>

        <main className="flex-1 text-center">
          <h1 className="text-2xl font-bold text-[var(--app-foreground)] mb-4">
            Ultravioleta DAO MiniApp
          </h1>
          <GM />
        </main>
      </div>
    </div>
  );
}
