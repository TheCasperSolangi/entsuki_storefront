"use client";

import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import Cookies from "js-cookie";
import { toast } from "sonner";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null); // Store profile

  const getCartCode = () => Cookies.get("cart_code");

  const computeCount = useCallback((cartData) => {
    return cartData?.products?.reduce((sum, p) => sum + (p.quantity || 0), 0) || 0;
  }, []);

  // ✅ Check auth with /auth/me
  const checkAuth = useCallback(async () => {
    const token = Cookies.get("token");
    if (!token) {
      setUser(null);
      return false;
    }

    try {
      const res = await fetch(`http://localhost:5000/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) {
        Cookies.remove("token");
        setUser(null);
        return false;
      }

      const json = await res.json();
      if (json?.username) {
        setUser(json);
        return true;
      } else {
        Cookies.remove("token");
        setUser(null);
        return false;
      }
    } catch (err) {
      console.error("Auth check failed:", err);
      Cookies.remove("token");
      setUser(null);
      return false;
    }
  }, []);

  const fetchCart = useCallback(async () => {
    const isAuth = await checkAuth();
    if (!isAuth) {
      setCart(null);
      setCartCount(0);
      setLoading(false);
      return;
    }

    const code = getCartCode();
    if (!code) {
      setCart(null);
      setCartCount(0);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(
        `http://localhost:5000/api/carts/code/${code}?_=${Date.now()}`,
        {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${Cookies.get("token")}`
          }
        }
      );

      if (res.status === 401) {
        Cookies.remove("token");
        setCart(null);
        setCartCount(0);
        return;
      }

      if (!res.ok) throw new Error(`Fetch cart failed (${res.status})`);

      const json = await res.json();
      setCart(json?.data || null);
      setCartCount(computeCount(json?.data));
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [computeCount, checkAuth]);

  const addToCart = useCallback(async (productId, quantity = 1) => {
    const isAuth = await checkAuth();
    if (!isAuth) {
      toast.error("Please login to add items to your cart");
      return { success: false, error: "Unauthorized" };
    }

    const code = getCartCode();
    if (!code) {
      toast.error("Cart not initialized");
      return { success: false, error: "No cart" };
    }

    try {
      setUpdating(true);
      setCartCount(prev => prev + quantity); // Optimistic update

      const res = await fetch(
        `http://localhost:5000/api/carts/${code}/add-product`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${Cookies.get("token")}`
          },
          body: JSON.stringify({ product_id: productId, quantity }),
        }
      );
      toast.success("Item Added Successfully");
      if (res.status === 401) {
        Cookies.remove("token");
        toast.error("Session expired. Please login again.");
        return { success: false, error: "Unauthorized" };
      }

      if (!res.ok) throw new Error(await res.text() || "Failed to add to cart");

      await fetchCart(); // Refresh cart data
      return { success: true };
    } catch (err) {
      console.error(err);
      setCartCount(prev => Math.max(0, prev - quantity)); // Rollback
      toast.error(err.message || "Failed to add to cart");
      return { success: false, error: err.message };
    } finally {
      setUpdating(false);
    }
  }, [fetchCart, checkAuth]);

  useEffect(() => {
    fetchCart();
    const onFocus = () => !updating && fetchCart();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [fetchCart, updating]);

  const value = useMemo(() => ({
    cart,
    cartCount,
    loading,
    updating,
    error,
    user,            // ✅ user profile
    refreshCart: fetchCart,
    addToCart,
  }), [cart, cartCount, loading, updating, error, user, fetchCart, addToCart]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
