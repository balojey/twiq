import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { useWallet } from '@solana/wallet-adapter-react';
import { supabase } from '@/lib/supabase';
import { User } from '@/types';
import { toast } from 'sonner';
import { createOnchainProfile } from '@/lib/onchainProfile';

interface AuthContextType {
  user: User | null;
  supabaseUser: SupabaseUser | null;
  loading: boolean;
  onchainProfileCreated: boolean;
  signOut: () => Promise<void>;
  signInWithGitHub: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [onchainProfileCreated, setOnchainProfileCreated] = useState(false);

  const wallet = useWallet();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSupabaseUser(session?.user ?? null);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user && wallet.connected && !onchainProfileCreated) {
      // A simple check to prevent re-creating the profile every time.
      // In a real app, you'd check if the on-chain profile already exists.
      const hasCreatedProfile = sessionStorage.getItem(`onchain-profile-${user.id}`);
      if (!hasCreatedProfile) {
        createOnchainProfile(user, wallet).then(() => {
          setOnchainProfileCreated(true);
          sessionStorage.setItem(`onchain-profile-${user.id}`, 'true');
        });
      } else {
        setOnchainProfileCreated(true);
      }
    }
  }, [user, wallet.connected, onchainProfileCreated, wallet]);

  const fetchUserProfile = useCallback(async (userId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setUser(data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      toast.error('Failed to fetch user profile.');
    } finally {
      setLoading(false);
    }
  }, []);

  const signInWithGitHub = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}`,
        },
      });
      if (error) throw error;
    } catch (error) {
      console.error('Error signing in with GitHub:', error);
      toast.error('Failed to sign in with GitHub');
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success('Signed out successfully');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out');
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, supabaseUser, loading, onchainProfileCreated, signOut, signInWithGitHub }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
