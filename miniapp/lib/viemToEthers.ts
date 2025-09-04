import { ethers } from "ethers";
import type { WalletClient } from "viem";

/** Turn a viem WalletClient into an ethers v6 Signer */
export async function viemToEthersSigner(walletClient: WalletClient) {
    if (!walletClient) return null;

    // Prefer the injected EIP-1193 provider if present on transport
    const transportAny = walletClient.transport as any;

    const eip1193 =
        transportAny?.value /* injected provider (MetaMask, Coinbase, etc.) */ ??
        {
            // Fallback shim using viem's request method
            request: async ({ method, params }: { method: string; params?: any[] }) =>
                walletClient.request({ method, params } as any),
        };

    // Wrap it in ethers' BrowserProvider and fetch a signer for the active account
    const provider = new ethers.BrowserProvider(eip1193 as any);
    if (!walletClient.account) {
        throw new Error("walletClient.account is undefined");
    }
    const signer = await provider.getSigner(walletClient.account.address);
    return signer;
}
