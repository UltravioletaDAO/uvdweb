
"use client";

import { useState, useEffect, useCallback } from "react";
import { useWalletClient } from "wagmi";
import { useMiniKit } from "@coinbase/onchainkit/minikit";
import { EAS, SchemaEncoder } from "@ethereum-attestation-service/eas-sdk";
import { viemToEthersSigner } from "../../lib/viemToEthers";
import { getAttestations } from "@coinbase/onchainkit/identity";
import { base } from "viem/chains";

const easContractAddress = "0x4200000000000000000000000000000000000021";
const schemaUID = "0x85500e806cf1e74844d51a20a6d893fe1ed6f6b0738b50e43d774827d08eca61";
const recipient = "0x5eE0B317B807E6430407c73E7507ed60b7c1C61F";

export default function GM() {
    const [isAttesting, setIsAttesting] = useState(false);
    const [attestationUID, setAttestationUID] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [attestations, setAttestations] = useState<any[]>([]);
    const [isLoadingAttestations, setIsLoadingAttestations] = useState(false);
    const { data: walletClient } = useWalletClient();
    const { context, isFrameReady, setFrameReady } = useMiniKit();

    useEffect(() => {
        if (!isFrameReady) {
            setFrameReady();
        }
    }, [setFrameReady, isFrameReady]);

    // Determine if running in Farcaster or web
    const isFarcaster = isFrameReady;

    const refreshAttestations = useCallback(async () => {
        if (!walletClient?.account?.address) return;
        try {
            setIsLoadingAttestations(true);
            const options = { schemas: [schemaUID as `0x${string}`] };
            const list = await getAttestations(walletClient.account.address as `0x${string}`, base, options);
            setAttestations(list ?? []);
        } catch (err) {
            console.error("Fetching attestations failed:", err);
        } finally {
            setIsLoadingAttestations(false);
        }
    }, [walletClient?.account?.address]);

    useEffect(() => {
        refreshAttestations();
    }, [refreshAttestations]);

    const handleGMAttest = async () => {
        if (!walletClient) {
            setError("Please connect your wallet first");
            return;
        }

        setIsAttesting(true);
        setError(null);

        try {
            // Convert viem wallet client to ethers signer
            const signer = await viemToEthersSigner(walletClient);
            if (!signer) {
                throw new Error("Failed to create signer");
            }

            // Initialize EAS
            const eas = new EAS(easContractAddress);
            await eas.connect(signer);

            // Initialize SchemaEncoder with the schema string
            const schemaEncoder = new SchemaEncoder("bool gm");
            const encodedData = schemaEncoder.encodeData([
                { name: "gm", value: true, type: "bool" }
            ]);

            // Create attestation
            const tx = await eas.attest({
                schema: schemaUID,
                data: {
                    recipient: recipient,
                    expirationTime: 0 as any,
                    revocable: true,
                    data: encodedData,
                },
            });

            const newAttestationUID = await tx.wait();
            setAttestationUID(newAttestationUID);
            console.log("New attestation UID:", newAttestationUID);
            // Refresh list after successful attest
            await refreshAttestations();
        } catch (err) {
            console.error("Attestation failed:", err);
            setError(err instanceof Error ? err.message : "Attestation failed");
        } finally {
            setIsAttesting(false);
        }
    };

    return (
        <div className="gm-component">
            <h2 className="text-xl font-semibold text-[var(--app-foreground)] mb-4">
                GM
            </h2>

            <div className="mb-3 p-2 bg-gray-100 border border-gray-300 text-gray-700 rounded text-sm">
                {isFarcaster ? "Running in Farcaster" : "Running in browser"}
            </div>

            <button
                onClick={handleGMAttest}
                disabled={isAttesting || !walletClient}
                className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
            >
                {isAttesting ? "Attesting..." : "GM Attest"}
            </button>

            {error && (
                <div className="mt-3 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                    {error}
                </div>
            )}

            {attestationUID && (
                <div className="mt-3 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
                    <p className="font-medium">Attestation created!</p>
                    <p className="text-sm break-all">UID: {attestationUID}</p>
                </div>
            )}

            <div className="mt-4 text-left">
                <h3 className="font-semibold mb-2">Attestations</h3>
                {isLoadingAttestations ? (
                    <p className="text-sm text-gray-600">Loading attestations...</p>
                ) : attestations.length === 0 ? (
                    <p className="text-sm text-gray-600">No attestations found.</p>
                ) : (
                    <ul className="space-y-2">
                        {attestations.map((a: any) => (
                            <li key={a.id} className="text-sm break-all p-2 border rounded">
                                {JSON.stringify(a)}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
