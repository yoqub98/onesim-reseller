import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [partner, setPartner] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Fetch partner record for the authenticated user
  const fetchPartnerProfile = useCallback(async (userId) => {
    const { data: partnerData, error } = await supabase
      .from("partners")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("Partner fetch error:", error);
      setPartner(null);
      return null;
    }

    setPartner(partnerData || null);
    return partnerData;
  }, []);

  // Fetch profile record
  const fetchProfile = useCallback(async (userId) => {
    const { data: profileData, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      console.error("Profile fetch error:", error);
      setProfile(null);
      return null;
    }

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
    setAuthError(null);

    return { profile: profileData, partner: partnerData };
  }, [fetchProfile, fetchPartnerProfile]);

  // Initialize session on mount
  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      try {
        setAuthError(null);
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        if (cancelled) return;
        setSession(currentSession);

        if (currentSession?.user) {
          await bootstrapUser(currentSession.user);
        }
      } catch (err) {
        if (err?.name === "AbortError") {
          console.warn("Auth init aborted");
          return;
        }
        setAuthError(err);
        console.error("Auth init error:", err);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    init();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        try {
          if (cancelled) return;
          const nextUser = newSession?.user || null;
          setSession(newSession);
          setUser(nextUser);
          setAuthError(null);

          if ((event === "SIGNED_IN" || event === "TOKEN_REFRESHED") && nextUser) {
            setIsLoading(true);
            await bootstrapUser(nextUser);
            if (!cancelled) setIsLoading(false);
          } else if (event === "SIGNED_OUT") {
            setUser(null);
            setProfile(null);
            setPartner(null);
          }
        } catch (err) {
          if (err?.name !== "AbortError") {
            setAuthError(err);
            console.error("Auth state change error:", err);
          }
          if (!cancelled) setIsLoading(false);
        }
      }
    );

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
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

  // Verify OTP and create partner record atomically
  // Combines both steps to avoid race condition where user state
  // isn't set yet when createPartnerRecord runs
  const verifyOtpAndCreatePartner = async (email, token, partnerFormData) => {
    // 1. Verify OTP — creates the session
    const { data: otpData, error: otpError } = await supabase.auth.verifyOtp({
      email,
      token,
      type: "signup",
    });
    if (otpError) throw otpError;

    const authUser = otpData.user;
    if (!authUser) throw new Error("Verification succeeded but no user returned");

    // 2. Update local state immediately
    setUser(authUser);
    setSession(otpData.session);

    // 3. Create partner record using authUser.id directly (not from state)
    const { data, error } = await supabase
      .from("partners")
      .insert({
        user_id: authUser.id,
        company_name: partnerFormData.companyName,
        legal_name: partnerFormData.legalName || null,
        tax_id: partnerFormData.inn || null,
        address: partnerFormData.address ? { raw: partnerFormData.address } : null,
        business_email: partnerFormData.businessEmail || authUser.email,
        business_phone: partnerFormData.contactPhone || null,
        status: "pending_approval",
      })
      .select()
      .single();
    if (error) throw error;

    setPartner(data);

    // 4. Fetch profile too
    await fetchProfile(authUser.id);

    return data;
  };

  // Sign in with email/password
  const signIn = async (email, password) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      setSession(data?.session || null);

      if (data?.user) {
        await bootstrapUser(data.user);
      } else {
        setUser(null);
        setProfile(null);
        setPartner(null);
      }

      setAuthError(null);
      return data;
    } finally {
      setIsLoading(false);
    }
  };

  // Sign out
  const signOut = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Sign out error:", error);
      }
    } finally {
      setUser(null);
      setProfile(null);
      setPartner(null);
      setSession(null);
      setAuthError(null);
      setIsLoading(false);
    }
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
    authError,
    isAuthenticated,
    isPendingApproval,
    isApproved,
    hasPartnerRecord,

    // Actions
    signUp,
    verifyOtpAndCreatePartner,
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
