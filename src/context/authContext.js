"use client";

import { createContext, useContext, useEffect, useState } from "react";
import Cookies from "js-cookie";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔹 Fetch user profile using token
  const fetchProfile = async () => {
    const token = Cookies.get("token");
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Not authenticated");
      const data = await res.json();
      setUser(data);
    } catch (err) {
      console.log("Auth fetch error:", err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Run on first load
  useEffect(() => {
    fetchProfile();
  }, []);

  // 🔹 Standard login or social login success
  const loginSuccess = async (token) => {
    Cookies.set("token", token, { expires: 7 }); // store for 7 days
    await fetchProfile();
  };

  // 🔹 For Google/Facebook login directly
  const socialLogin = async (providerToken, provider) => {
    try {
      const res = await fetch(`http://localhost:5000/api/auth/social-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, token: providerToken }),
      });

      if (!res.ok) throw new Error("Social login failed");
      const data = await res.json();

      // Save our backend JWT
      Cookies.set("token", data.token, { expires: 7 });
      setUser(data.user);
    } catch (err) {
      console.error("Social login error:", err);
      setUser(null);
    }
  };

  const requireAuth = (action) => {
    if (!user) {
      alert("Please login to perform this action!");
      return;
    }
    action();
  };

  const logout = () => {
    Cookies.remove("token");
    setUser(null);
    alert("Logged out successfully!");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        loginSuccess,
        socialLogin, // 🔹 new for Google/Facebook/etc.
        requireAuth,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
