import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userRole: string | null;
  loading: boolean;
  signOut: () => Promise<void>;
  impersonate: (userId: string) => Promise<void>;
  stopImpersonation: () => void;
  isImpersonating: boolean;
  realUser: User | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [impersonatedUser, setImpersonatedUser] = useState<User | null>(null);
  const [impersonatedRole, setImpersonatedRole] = useState<string | null>(null);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          // Fetch user role
          setTimeout(async () => {
            try {
              const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('user_id', session.user.id)
                .single();

              setUserRole(profile?.role || 'cliente');
            } catch (error) {
              console.error('Error fetching user role:', error);
              setUserRole('cliente');
            }
          }, 0);
        } else {
          setUserRole(null);
          setImpersonatedUser(null);
          setImpersonatedRole(null);
        }

        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        // Fetch user role for existing session
        setTimeout(async () => {
          try {
            const { data: profile } = await supabase
              .from('profiles')
              .select('role')
              .eq('user_id', session.user.id)
              .single();

            setUserRole(profile?.role || 'cliente');
          } catch (error) {
            console.error('Error fetching user role:', error);
            setUserRole('cliente');
          }
          setLoading(false);
        }, 0);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const impersonate = async (userId: string) => {
    try {
      setLoading(true);
      // Fetch user profile from profiles table instead of auth.users (since we don't have admin privileges here)
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) throw error;

      // Create a mock user object based on profile data
      const mockUser = {
        id: userId,
        phone: profile.telefono,
        user_metadata: { telefono: profile.telefono },
        app_metadata: {},
        aud: 'authenticated',
        created_at: profile.created_at || new Date().toISOString(),
      } as unknown as User;

      setImpersonatedUser(mockUser);
      setImpersonatedRole(profile.role);
    } catch (error) {
      console.error('Error impersonating user:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const stopImpersonation = () => {
    setImpersonatedUser(null);
    setImpersonatedRole(null);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    stopImpersonation();
  };

  const value = {
    user: impersonatedUser || user,
    session,
    userRole: impersonatedRole || userRole,
    loading,
    signOut,
    impersonate,
    stopImpersonation,
    isImpersonating: !!impersonatedUser,
    realUser: user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};