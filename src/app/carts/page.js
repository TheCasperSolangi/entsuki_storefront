// app/page.tsx  (or any page where you want this check)
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const cartCode = Cookies.get("cart_code");

    if (cartCode) {
      router.replace(`/carts/${cartCode}`);
    } else {
      router.replace("/auth");
    }
  }, [router]);

  return (
    <div className="flex items-center justify-center h-screen">
      <p>Checking your session...</p>
    </div>
  );
}