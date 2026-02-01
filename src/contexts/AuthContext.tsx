import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { User, UserTier, TIER_LIMITS, TierLimits } from '@/types/auth';
import { Session } from '@supabase/supabase-js';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    getTierLimits: () => TierLimits;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check active session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUserFromSession(session);
            setLoading(false);
        });

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setUserFromSession(session);
        });

        return () => subscription.unsubscribe();
    }, []);

    const setUserFromSession = (session: Session | null) => {
        if (session?.user) {
            // Get tier from user metadata (default to 'free')
            const tier = (session.user.user_metadata?.tier as UserTier) || 'free';

            setUser({
                id: session.user.id,
                email: session.user.email || '',
                tier,
                isAuthenticated: true,
            });
        } else {
            // Guest user (free tier)
            setUser({
                id: 'guest',
                email: '',
                tier: 'free',
                isAuthenticated: false,
            });
        }
    };

    const login = async (email: string, password: string) => {
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error) throw error;
    };

    const register = async (email: string, password: string) => {
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    tier: 'free', // New users start on free tier
                },
            },
        });
        if (error) throw error;
    };

    const logout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    };

    const getTierLimits = (): TierLimits => {
        return TIER_LIMITS[user?.tier || 'free'];
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                login,
                register,
                logout,
                getTierLimits,
            }}
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
