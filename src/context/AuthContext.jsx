import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [partner, setPartner] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch partner record for the authenticated user
  const fetchPartnerProfile = useCallback(async (userId) => {
    const { data: partnerData } = await supabase
      .from("partners")
      .select("*")
      .eq("user_id", userId)
      .single();

    setPartner(partnerData || null);
    return partnerData;
  }, []);

  // Fetch profile record
  const fetchProfile = useCallback(async (userId) => {
    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    setProfile(profileData || null);
    return profileData;
  }, []);

  // Bootstrap user data (profile + partner)
  const bootstrapUser = useCallback(async (authUser) => {
    if (!authUser) {
      setUser(null);
      setProfile(null);
      setPartner(null);
      return;
    }

    setUser(authUser);
    const [profileData, partnerData] = await Promise.all([
      fetchProfile(authUser.id),
      fetchPartnerProfile(authUser.id),
    ]);

    return { profile: profileData, partner: partnerData };
  }, [fetchProfile, fetchPartnerProfile]);

  // Initialize session on mount
  useEffect(() => {
    const init = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);

      if (currentSession?.user) {
        await bootstrapUser(currentSession.user);
      }
      setIsLoading(false);
    };

    init();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        setSession(newSession);

        if (event === "SIGNED_IN" && newSession?.user) {
          await bootstrapUser(newSession.user);
        } else if (event === "SIGNED_OUT") {
          setUser(null);
          setProfile(null);
          setPartner(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [bootstrapUser]);

  // Sign up a new partner
  const signUp = async (email, password, metadata) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: metadata.contactFullName?.split(" ")[0] || "",
          last_name: metadata.contactFullName?.split(" ").slice(1).join(" ") || "",
          phone: metadata.contactPhone || "",
          user_type: "partner",
        },
      },
    });

    if (error) throw error;
    return data;
  };

  // Verify OTP (email confirmation)
  const verifyOtp = async (email, token) => {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: "signup",
    });

    if (error) throw error;
    return data;
  };

  // Create partner record after OTP verification
  const createPartnerRecord = async (partnerData) => {
    const { data, error } = await supabase
      .from("partners")
      .insert({
        user_id: user.id,
        company_name: partnerData.companyName,
        legal_name: partnerData.legalName || null,
        tax_id: partnerData.inn || null,
        address: partnerData.address ? { raw: partnerData.address } : null,
        business_email: partnerData.businessEmail || user.email,
        business_phone: partnerData.contactPhone || null,
        status: "pending_approval",
      })
      .select()
      .single();

    if (error) throw error;
    setPartner(data);
    return data;
  };

  // Sign in with email/password
  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  };

  // Sign out
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
    setProfile(null);
    setPartner(null);
    setSession(null);
  };

  // Refresh partner data (useful after admin approval)
  const refreshPartner = async () => {
    if (user) {
      return fetchPartnerProfile(user.id);
    }
  };

  // Derived state
  const isAuthenticated = !!session && !!user;
  const isPendingApproval = partner?.status === "pending_approval";
  const isApproved = partner?.status === "active";
  const hasPartnerRecord = !!partner;

  const value = {
    // State
    user,
    session,
    profile,
    partner,
    isLoading,
    isAuthenticated,
    isPendingApproval,
    isApproved,
    hasPartnerRecord,

    // Actions
    signUp,
    verifyOtp,
    createPartnerRecord,
    signIn,
    signOut,
    refreshPartner,
    logout: signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
