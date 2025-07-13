// useAuth.js
import { useState, useEffect, useCallback } from 'react';

// Supabase mock/client will be passed or imported from a central config
// For this immersive, we assume `supabase` client is available globally or passed.
import { supabase } from '../../lib/supabaseClient';

const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [session, setSession] = useState(null); // Keep session state if needed

  const fetchUserProfile = useCallback(async (authUser) => {
    try {
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id, username, email, role")
        .eq("id", authUser.id)
        .single();

      if (profileError) {
        console.warn("Profile not found or RLS error:", profileError.message);
        return { ...authUser, profile: null };
      }
      return { ...authUser, profile };
    } catch (err) {
      console.error("Failed to fetch profile:", err.message);
      return { ...authUser, profile: null };
    }
  }, [supabase]); // Dependency on supabaseClient if it changes

  const handleLogout = useCallback(async () => {
    setLoadingAuth(true);
    setAuthError(null);
    try {
      const { error: logoutError } = await supabase.auth.signOut();
      if (logoutError) {
        throw logoutError;
      }
      setUser(null);
      setSession(null);
      // window.location.href = "/auth/login"; // In real app, handle redirection
      console.log("Simulated redirect to /auth/login after logout.");
    } catch (err) {
      console.error("An error occurred during logout:", err.message);
      setAuthError("An unexpected error occurred during logout.");
    } finally {
      setLoadingAuth(false);
    }
  }, [supabase]);

  useEffect(() => {
    let isMounted = true;
    let authSubscription = null;

    const initializeAuthStatus = async () => {
      setLoadingAuth(true);
      setAuthError(null);

      try {
        const {
          data: { session: initialSession },
          error: sessionError,
        } = await supabase.auth.getSession();
        setSession(initialSession);

        if (sessionError) {
          throw sessionError;
        }

        if (initialSession?.user) {
          const userWithProfile = await fetchUserProfile(initialSession.user);
          if (isMounted) {
            setUser(userWithProfile);
            // Example redirection logic (adjust as per your app's actual routing)
            if (userWithProfile?.profile?.role === "admin") {
                console.log("User is admin, consider redirecting to /admin-dashboard.");
            } else {
                console.log("User is regular user, consider redirecting to /vocaboostAI-home.");
            }
          }
        } else {
          if (isMounted) setUser(null);
          console.log("No active session, consider redirecting to /auth/login.");
        }
      } catch (err) {
        if (isMounted) {
          console.error("Auth initialization error:", err.message);
          setAuthError(`Failed to load user data: ${err.message}`);
          console.log("Auth error, redirecting to /auth/login.");
        }
      } finally {
        if (isMounted) {
          setLoadingAuth(false);
        }
      }
    };

    initializeAuthStatus();

    // Set up a listener for future auth state changes
    authSubscription = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      if (!isMounted) return;
      setSession(currentSession);
      if (currentSession?.user) {
        const userWithProfile = await fetchUserProfile(currentSession.user);
        if (isMounted) {
          setUser(userWithProfile);
          setAuthError(null);
        }
      } else if (event === "SIGNED_OUT") {
        if (isMounted) {
          setUser(null);
          setAuthError("You have been logged out. Please log in again.");
          console.log("User signed out, redirecting to /auth/login.");
        }
      }
    });

    return () => {
      isMounted = false;
      if (authSubscription) {
        // authSubscription.subscription.unsubscribe(); // Uncomment in real app
      }
    };
  }, [supabase, fetchUserProfile]);

  return { user, session, loadingAuth, authError, handleLogout };
};

export default useAuth;
