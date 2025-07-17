
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { FC, useCallback, useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { toast } from "sonner";

export const FaucetCard: FC = () => {
    const { connection } = useConnection();
    const { publicKey } = useWallet();
    const [balance, setBalance] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);

    const refreshBalance = useCallback(async () => {
        if (!publicKey) {
            setBalance(null);
            return;
        }
        try {
            const newBalance = await connection.getBalance(publicKey);
            setBalance(newBalance / LAMPORTS_PER_SOL);
        } catch (error) {
            console.error("Error fetching balance:", error);
            setBalance(null);
            toast.error("Could not fetch balance.");
        }
    }, [publicKey, connection]);

    useEffect(() => {
        refreshBalance();
    }, [refreshBalance]);

    const handleAirdrop = useCallback(async () => {
        if (!publicKey) {
            toast.error("Wallet not connected", {
                description: "Please connect your wallet to request an airdrop.",
            });
            return;
        }

        setLoading(true);
        try {
            const airdropSignature = await connection.requestAirdrop(
                publicKey,
                LAMPORTS_PER_SOL, // 1 SOL
            );

            const latestBlockhash = await connection.getLatestBlockhash();

            await connection.confirmTransaction({
                blockhash: latestBlockhash.blockhash,
                lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
                signature: airdropSignature,
            });

            toast.success("Airdrop Successful!", {
                description: "1 SOL has been airdropped to your wallet.",
                action: {
                    label: "View",
                    onClick: () => window.open(`https://explorer.solana.com/tx/${airdropSignature}?cluster=devnet`, "_blank")
                }
            });
            await refreshBalance();
        } catch (error) {
            console.error("Airdrop failed:", error);
            toast.error("Airdrop Failed", {
                description: "Something went wrong. Please try again.",
            });
        } finally {
            setLoading(false);
        }
    }, [publicKey, connection, toast, refreshBalance]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Solana Faucet</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
                {publicKey ? (
                    <>
                        <p>Balance: {balance !== null ? `${balance.toFixed(4)} SOL` : "Loading..."}</p>
                        <Button onClick={handleAirdrop} disabled={loading}>
                            {loading ? "Requesting..." : "Request 1 SOL"}
                        </Button>
                        <Button onClick={refreshBalance} variant="outline" disabled={loading}>
                            Refresh Balance
                        </Button>
                    </>
                ) : (
                    <p>Connect your wallet to use the faucet.</p>
                )}
            </CardContent>
        </Card>
    );
};
