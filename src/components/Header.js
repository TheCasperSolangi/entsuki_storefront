// components/layout/Header.jsx
"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/cartContext";
import NotificationDropdown from "./ui/notificationDropdownComponent";
import {
  MagnifyingGlassIcon,
  UserIcon,
  HeartIcon,
  ShoppingCartIcon,
  Bars3Icon,
  XMarkIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import Cookies from "js-cookie";

// 社交媒體圖標組件 (保持與之前相同)
const FacebookIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const InstagramIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1112.324 0 6.162 6.162 0 01-12.324 0zM12 16a4 4 0 110-8 4 4 0 010 8zm4.965-10.405a1.44 1.44 0 112.881.001 1.44 1.44 0 01-2.881-.001z" />
  </svg>
);

const YouTubeIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

const LinkedInIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

const TwitterIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
  </svg>
);

const PinterestIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.410 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.097.118.111.221.082.343-.090.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.920-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.748-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001.012.001z"/>
  </svg>
);

const socialIconMap = {
  facebook: FacebookIcon,
  instagram: InstagramIcon,
  youtube: YouTubeIcon,
  linkedin: LinkedInIcon,
  twitter: TwitterIcon,
  pinterest: PinterestIcon,
};

// 預設網站設定
const FALLBACK_SITE_SETTINGS = {
  appName: "展示 IME",
  currency: "港幣",
  language: "繁體中文",
  socialLinks: [
    {
      id: "1",
      name: "Facebook",
      url: "https://facebook.com/entsuki",
      icon: "facebook",
    },
    {
      id: "2",
      name: "Instagram",
      url: "https://instagram.com/entsuki",
      icon: "instagram",
    },
    {
      id: "3",
      name: "YouTube",
      url: "https://youtube.com/entsuki",
      icon: "youtube",
    },
  ],
  navigation: [
    {
      id: "1",
      name: "所有產品",
      nameEn: "",
      href: "/products",
    },
  ],
};

export default function Header() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [siteSettings, setSiteSettings] = useState(FALLBACK_SITE_SETTINGS);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const { cartCount, updating } = useCart();
  const [cartCode, setCartCode] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [isGuestLoginLoading, setIsGuestLoginLoading] = useState(false);

  // 檢查用戶是否已登錄
  useEffect(() => {
    const token = Cookies.get("token");
    const email = Cookies.get("user_email");
    
    if (token) {
      setIsLoggedIn(true);
      if (email) {
        setUserEmail(email);
      }
    }
  }, []);

  // 獲取商店設定
  useEffect(() => {
    const fetchStoreSettings = async () => {
      try {
        const res = await fetch(`http://api.entsuki.com/api/store/settings`);
        if (!res.ok) throw new Error("無法獲取商店設定");

        const data = await res.json();
        
        if (res.status == 200) {
          const settings = data;
          console.log("已獲取設定:", settings);
          
          // 將 API 數據轉換為組件結構
          const transformedSettings = {
            appName: settings.appName || FALLBACK_SITE_SETTINGS.appName,
            appLogo: settings.appLogo,
            currency: "港幣",
            language: "繁體中文",
            primaryColor: settings.primaryColor,
            secondaryColor: settings.secondaryColor,
            socialLinks: [],
            navigation: [
              {
                id: "1",
                name: "所有產品",
                nameEn: "",
                href: "/products",
              },
            ],
          };

          // 從 API 數據構建社交連結
          const socialPlatforms = [
            { key: 'facebook', name: 'Facebook', icon: 'facebook' },
            { key: 'instagram', name: 'Instagram', icon: 'instagram' },
            { key: 'linkedin', name: 'LinkedIn', icon: 'linkedin' },
            { key: 'twitter', name: 'Twitter', icon: 'twitter' },
            { key: 'pinterest', name: 'Pinterest', icon: 'pinterest' },
          ];

          socialPlatforms.forEach((platform, index) => {
            if (settings[platform.key]) {
              transformedSettings.socialLinks.push({
                id: (index + 1).toString(),
                name: platform.name,
                url: settings[platform.key],
                icon: platform.icon,
              });
            }
          });

          setSiteSettings(transformedSettings);
        } else {
          console.warn("未找到設定數據，使用預設值");
        }
      } catch (err) {
        console.error("獲取商店設定時出錯:", err);
      } finally {
        setSettingsLoading(false);
      }
    };

    fetchStoreSettings();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery)}`);
      setMobileMenuOpen(false);
    }
  };

  const handleGuestLogin = async () => {
    setIsGuestLoginLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/auth/guest-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('訪客登錄失敗');
      }

      const data = await response.json();
      
      // 設置響應數據的 Cookies
      if (data.token) {
        Cookies.set("token", data.token, { expires: 7 });
        Cookies.set("user_email", data.email, { expires: 7 });
        Cookies.set("username", data.username, { expires: 7 });
        Cookies.set("user_type", data.user_type, { expires: 7 });
        
        // 如果有購物車代碼，設置購物車
        if (data.cart && data.cart.cart_code) {
          Cookies.set("cart_code", data.cart.cart_code, { expires: 7 });
          setCartCode(data.cart.cart_code);
        }

        // 更新狀態
        setIsLoggedIn(true);
        setUserEmail(data.email);
        
        // 如果行動選單開啟，關閉它
        setMobileMenuOpen(false);
        
        // 重定向到首頁或刷新
        router.refresh();
      }
    } catch (error) {
      console.error('訪客登錄時出錯:', error);
      alert('訪客登錄失敗。請重試。');
    } finally {
      setIsGuestLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      // 調用登出端點
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://192.168.1.13:5000'}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('登出時出錯:', error);
    } finally {
      // 清除所有可能的身份驗證相關 Cookies
      Cookies.remove("auth_token");
      Cookies.remove("token");
      Cookies.remove("jwt_token");
      Cookies.remove("user_email");
      Cookies.remove("username");
      Cookies.remove("user_type");
      setIsLoggedIn(false);
      setUserEmail("");
      router.push("/");
    }
  };

  useEffect(() => {
    const fetchCart = async () => {
      const cart_code = Cookies.get("cart_code");
      if (!cart_code) return;

      try {
        const res = await fetch(`http://localhost:5000/api/carts/code/${cart_code}`);
        if (!res.ok) throw new Error("無法獲取購物車");

        const data = await res.json();
        if (data.success && data.data) {
          const count = data.data.products.reduce((sum, item) => sum + item.quantity, 0);
        }
      } catch (err) {
        console.error("獲取購物車時出錯:", err);
      }
    };

    fetchCart();
  }, []);

  useEffect(() => {
    const code = Cookies.get("cart_code");
    if (code) setCartCode(code);
  }, []);

  const href = cartCode ? `/carts/${cartCode}` : "/carts/";

  // 應用來自設定的自訂顏色
  const headerStyle = siteSettings.primaryColor ? {
    '--primary-color': siteSettings.primaryColor,
    '--secondary-color': siteSettings.secondaryColor || siteSettings.primaryColor,
  } : {};

  return (
    <>
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200" style={headerStyle}>
        {/* 頂部欄 - 僅桌面版 */}
        <div className="hidden lg:block border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-3 text-sm text-gray-600">
              <div className="flex items-center space-x-4">
                <span>{siteSettings.language}</span>
                <span>{siteSettings.currency}</span>
              </div>
              <div className="flex items-center space-x-4">
                {siteSettings.socialLinks.map((social) => {
                  const IconComponent = socialIconMap[social.icon.toLowerCase()];
                  return (
                    <a
                      key={social.id}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-gray-900 transition-colors"
                      aria-label={social.name}
                    >
                      {IconComponent ? <IconComponent /> : social.name}
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* 主標頭 */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4 lg:py-5">
            {/* 行動選單按鈕 */}
            <button
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">開啟選單</span>
              {mobileMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>

            {/* 標誌 */}
            <Link href="/" className="flex-shrink-0">
              {siteSettings.appLogo ? (
                <img 
                  src={siteSettings.appLogo} 
                  alt={siteSettings.appName}
                  className="h-8 lg:h-10 w-auto"
                />
              ) : (
                <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">
                  {siteSettings.appName}
                </h1>
              )}
            </Link>

            {/* 搜尋欄 - 桌面版 */}
            <form
              onSubmit={handleSearch}
              className="hidden lg:flex flex-1 max-w-md mx-8"
            >
              <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-full text-sm placeholder-gray-500 focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                  placeholder="搜尋產品..."
                />
              </div>
            </form>

            {/* 標頭操作 */}
            <div className="flex items-center space-x-3 lg:space-x-5">
              {/* 帳戶下拉選單 */}
              <div className="relative group">
                <div className="p-2 text-gray-700 hover:text-gray-900 cursor-pointer flex items-center">
                  <UserIcon className="h-5 w-5 lg:h-6 lg:w-6" />
                  <ChevronDownIcon className="h-4 w-4 ml-1 transition-transform group-hover:rotate-180" />
                </div>
                
                {/* 下拉選單 */}
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-1 group-hover:translate-y-0">
                  <div className="p-4">
                    {isLoggedIn ? (
                      <>
                        {/* 已登錄用戶 */}
                        <div className="pb-3 mb-3 border-b border-gray-100">
                          <p className="text-sm text-gray-600">已登錄為</p>
                          <p className="font-medium text-gray-900 truncate">{userEmail}</p>
                        </div>
                        
                        <div className="space-y-2">
                          <Link 
                            href="/account"
                            className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                          >
                            我的個人資料
                          </Link>
                          <Link 
                            href="/account"
                            className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                          >
                            我的訂單
                          </Link>
                          <Link 
                            href="/tracking"
                            className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                          >
                            追蹤訂單
                          </Link>
                          <button 
                            onClick={handleLogout}
                            className="block w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          >
                            登出
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        {/* 未登錄 */}
                        <div className="pb-3 mb-3 border-b border-gray-100">
                          <p className="text-sm font-medium text-gray-900">歡迎！</p>
                          <p className="text-xs text-gray-600">登錄以存取您的帳戶</p>
                        </div>
                        
                        <div className="space-y-3">
                          <Link 
                            href="/tracking"
                            className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                          >
                            追蹤訂單
                          </Link>
                          
                          {/* ShadCN 風格按鈕 */}
                          <Link 
                            href="/auth"
                            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full"
                            style={{
                              backgroundColor: siteSettings.primaryColor || '#000',
                              color: '#fff'
                            }}
                          >
                            登錄
                          </Link>
                          
                          <button 
                            onClick={handleGuestLogin}
                            disabled={isGuestLoginLoading}
                            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 w-full"
                          >
                            {isGuestLoginLoading ? '正在登錄...' : '以訪客身份繼續'}
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* 通知下拉選單 */}
              <NotificationDropdown />

              <Link href={href} className="p-2 text-gray-700 hover:text-gray-900 relative">
                <span className="sr-only">購物車</span>
                <ShoppingCartIcon className="h-5 w-5 lg:h-6 lg:w-6" />
                {cartCount > 0 && (
                  <span
                    className="absolute -top-1 -right-1 bg-amber-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center"
                    aria-label={`購物車中有 ${cartCount} 件商品`}
                    title={`${cartCount} 件商品`}
                    style={{
                      backgroundColor: siteSettings.primaryColor || '#D97706'
                    }}
                  >
                    {updating ? "…" : cartCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>

        {/* 導航 - 桌面版 */}
        <nav className="hidden lg:block border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ul className="flex space-x-8">
              {siteSettings.navigation.map((item) => (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    className="relative block py-4 text-sm font-medium text-gray-700 hover:text-amber-600 transition-colors duration-200 group"
                    style={{
                      '--hover-color': siteSettings.primaryColor || '#D97706'
                    }}
                  >
                    {item.name}{" "}
                    {item.nameEn && (
                      <span className="text-xs text-gray-500">
                        {item.nameEn}
                      </span>
                    )}
                    <span 
                      className="absolute bottom-0 left-0 w-0 h-0.5 bg-amber-600 transition-all duration-200 group-hover:w-full"
                      style={{
                        backgroundColor: siteSettings.primaryColor || '#D97706'
                      }}
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      </header>

      {/* 行動選單 */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-white">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium">選單</h2>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-md text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">關閉選單</span>
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
          </div>
          
          {/* 行動搜尋 */}
          <div className="p-4 border-b border-gray-200">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-full text-sm placeholder-gray-500 focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                  placeholder="搜尋產品..."
                />
              </div>
            </form>
          </div>
          
          {/* 行動帳戶部分 */}
          <div className="px-4 py-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">帳戶</h3>
            {isLoggedIn ? (
              <div className="space-y-3">
                <p className="text-sm text-gray-600">已登錄為: <span className="font-medium">{userEmail}</span></p>
                <div className="space-y-3">
                  <Link 
                    href="/account"
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full mb-2"
                    style={{
                      backgroundColor: siteSettings.primaryColor || '#D97706',
                      color: '#fff'
                    }}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    我的個人資料
                  </Link>
                  <Link 
                    href="/account"
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 w-full mb-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    我的訂單
                  </Link>
                  <Link 
                    href="/tracking"
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 w-full mb-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    追蹤訂單
                  </Link>
                  <button 
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-red-300 bg-background hover:bg-red-50 hover:text-red-700 text-red-600 h-10 px-4 py-2 w-full"
                  >
                    登出
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <Link 
                  href="/track-order"
                  className="block py-2 text-base text-gray-700 hover:text-gray-900"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  追蹤訂單
                </Link>
                <Link 
                  href="/login"
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full mb-2"
                  style={{
                    backgroundColor: siteSettings.primaryColor || '#000',
                    color: '#fff'
                  }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  登錄
                </Link>
                
                <button 
                  onClick={() => {
                    handleGuestLogin();
                  }}
                  disabled={isGuestLoginLoading}
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 w-full"
                >
                  {isGuestLoginLoading ? '正在登錄...' : '以訪客身份繼續'}
                </button>
              </div>
            )}
          </div>
          
          <nav className="px-4 py-6">
            <ul className="space-y-4">
              {siteSettings.navigation.map((item) => (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    className="block py-2 text-base font-medium text-gray-900 hover:text-amber-600"
                    onClick={() => setMobileMenuOpen(false)}
                    style={{
                      '--hover-color': siteSettings.primaryColor || '#D97706'
                    }}
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* 行動社交連結 */}
          {siteSettings.socialLinks.length > 0 && (
            <div className="px-4 py-6 border-t border-gray-200">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-gray-700">關注我們:</span>
                {siteSettings.socialLinks.map((social) => {
                  const IconComponent = socialIconMap[social.icon.toLowerCase()];
                  return (
                    <a
                      key={social.id}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-600 hover:text-gray-900 transition-colors"
                      aria-label={social.name}
                    >
                      {IconComponent ? <IconComponent /> : social.name}
                    </a>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}