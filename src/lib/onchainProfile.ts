
import { WalletContextState } from '@solana/wallet-adapter-react';
import { sendClientTransactions } from "@honeycomb-protocol/edge-client/client/walletHelpers";
import { toast } from 'sonner';
import { User } from '@/types';
import { client } from '@/lib/honeycomb';

/**
 * Creates a user profile on-chain using the Honeycomb protocol.
 *
 * @param user - The user object from Supabase.
 * @param wallet - The wallet object from the wallet adapter.
 * @returns A promise that resolves when the profile is created.
 */
export const createOnchainProfile = async (
  user: User,
  wallet: WalletContextState
) => {
  if (!wallet.publicKey || !wallet.sendTransaction) {
    toast.error('Wallet not connected. Please connect your wallet to continue.');
    return;
  }

  const toastId = toast.loading('Creating your on-chain profile...');

  try {
    // 1. Fetch the transaction from Honeycomb
    const {
      createNewUserWithProfileTransaction: txResponse
    } = await client.createNewUserWithProfileTransaction({
      project: import.meta.env.VITE_HONEYCOMB_PROJECT_ID || 'E1Naomgozn8eKNKoY9Fxkprn3VyMsDT17t5HioRkJHoi',
      wallet: wallet.publicKey.toString(),
      profileIdentity: 'main',
      userInfo: {
        name: user.username,
        bio: user.bio || '',
        pfp: user.avatar_url || '',
      }
    });

    await sendClientTransactions(client, wallet, txResponse);

    toast.success('On-chain profile created successfully!', {
      id: toastId,
      description: 'Your Twiq profile is now live on the blockchain.',
    });
  } catch (error) {
    console.error('Error creating on-chain profile:', error);
    toast.error('Failed to create on-chain profile.', {
      id: toastId,
      description:
        error instanceof Error ? error.message : 'An unknown error occurred.',
    });
  }
};
