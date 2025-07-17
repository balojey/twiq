
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { FC, useCallback, useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { toast } from "sonner";

const COOLDOWN_SECONDS = 60;

export const FaucetCard: FC = () => {
    const { connection } = useConnection();
    const { publicKey } = useWallet();
    const [balance, setBalance] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [cooldown, setCooldown] = useState(0);

    const getAirdropCooldownKey = (pubkey: string) => `airdrop_cooldown_${pubkey}`;

    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;
        if (cooldown > 0) {
            interval = setInterval(() => {
                setCooldown((prev) => prev - 1);
            }, 1000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [cooldown]);

    useEffect(() => {
        if (!publicKey) return;
        const key = getAirdropCooldownKey(publicKey.toBase58());
        const lastAirdrop = localStorage.getItem(key);
        if (lastAirdrop) {
            const remaining = COOLDOWN_SECONDS - (Date.now() - parseInt(lastAirdrop, 10)) / 1000;
            if (remaining > 0) {
                setCooldown(Math.ceil(remaining));
            }
        }
    }, [publicKey]);


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

        if (cooldown > 0) {
            toast.warning("Cooldown active", {
                description: `Please wait ${cooldown} seconds before requesting another airdrop.`,
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
            const key = getAirdropCooldownKey(publicKey.toBase58());
            localStorage.setItem(key, Date.now().toString());
            setCooldown(COOLDOWN_SECONDS);
            await refreshBalance();
        } catch (error) {
            console.error("Airdrop failed:", error);
            toast.error("Airdrop Failed", {
                description: "Something went wrong. Please try again.",
            });
        } finally {
            setLoading(false);
        }
    }, [publicKey, connection, toast, refreshBalance, cooldown]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Solana Faucet</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
                {publicKey ? (
                    <>
                        <p>Balance: {balance !== null ? `${balance.toFixed(4)} SOL` : "Loading..."}</p>
                        <Button onClick={handleAirdrop} disabled={loading || cooldown > 0}>
                            {loading ? "Requesting..." : cooldown > 0 ? `Cooldown (${cooldown}s)` : "Request 1 SOL"}
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
