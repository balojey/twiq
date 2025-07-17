
import { useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useAuth } from '@/contexts/AuthContext';

const WalletObserver = () => {
    const { publicKey } = useWallet();
    const { user, updateUserWallet } = useAuth();

    useEffect(() => {
        if (publicKey && user && user.wallet_address !== publicKey.toBase58()) {
            updateUserWallet(publicKey.toBase58());
        }
    }, [publicKey, user, updateUserWallet]);

    return null;
};

export default WalletObserver;
