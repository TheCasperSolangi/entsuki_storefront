// components/layout/Footer.jsx
"use client";
import React, { useState, useEffect } from "react";
import { Mail, Linkedin, Facebook, Instagram, Twitter } from "lucide-react";
import Link from "next/link";

const Footer = ({ apiEndpoint = `http://localhost:5000/api/store/settings` }) => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const currentYear = new Date().getFullYear();

  // 從 API 獲取設定
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const response = await fetch(apiEndpoint);
        if (!response.ok) {
          throw new Error(`HTTP 錯誤！狀態碼: ${response.status}`);
        }
        const data = await response.json();
        setSettings(data);
      } catch (err) {
        console.error("無法獲取設定:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [apiEndpoint]);

  // 顯示載入狀態
  if (loading) {
    return (
      <footer className="bg-black text-gray-400 px-6 sm:px-12 py-12 border-t border-gray-900">
        <div className="max-w-7xl mx-auto flex items-center justify-center">
          <div className="animate-pulse text-center">
            <div className="h-4 bg-gray-700 rounded w-48 mb-2"></div>
            <div className="h-3 bg-gray-800 rounded w-32"></div>
          </div>
        </div>
      </footer>
    );
  }

  // 顯示錯誤狀態並使用預設配置
  if (error && !settings) {
    return (
      <footer className="bg-black text-gray-400 px-6 sm:px-12 py-12 border-t border-gray-900">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-red-400 mb-2">無法載入頁腳設定</p>
          <p className="text-xs">使用預設配置</p>
        </div>
      </footer>
    );
  }

  // 提取首字母作為標誌後備
  const getLogoLetter = (name) => {
    return name ? name.charAt(0).toUpperCase() : 'A';
  };

  return (
    <footer className="bg-black text-gray-400 px-6 sm:px-12 py-12 border-t border-gray-900">
      {/* 頂部區域 */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
        
        {/* 標誌 + 公司文本 + 社交媒體 */}
        <div className="space-y-5">
          <div className="flex items-center gap-3">
            {settings.appLogo ? (
              <img 
                src={settings.appLogo} 
                alt={`${settings.appName} 標誌`}
                className="w-10 h-10 rounded-full object-cover"
                onError={(e) => {
                  // 如果圖片載入失敗，顯示首字母標誌
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div 
              className={`w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-300 rounded-full flex items-center justify-center ${settings.appLogo ? 'hidden' : 'flex'}`}
            >
              <span className="font-bold text-black text-lg">
                {getLogoLetter(settings.appName)}
              </span>
            </div>
            <span className="text-white font-semibold text-xl tracking-tight">
              {settings.appName || "展示 IME"}
            </span>
          </div>
          <p className="text-gray-400 text-sm max-w-xs leading-relaxed">
            {settings.company_text || "IME 科技的展示商店用於測試"}
          </p>
          <div className="flex gap-4">
            {settings.linkedin && (
              <a 
                href={settings.linkedin} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="hover:text-white transition-colors duration-200"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            )}
            {settings.facebook && (
              <a 
                href={settings.facebook} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="hover:text-white transition-colors duration-200"
              >
                <Facebook className="w-5 h-5" />
              </a>
            )}
            {settings.instagram && (
              <a 
                href={settings.instagram} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="hover:text-white transition-colors duration-200"
              >
                <Instagram className="w-5 h-5" />
              </a>
            )}
            {settings.twitter && (
              <a 
                href={settings.twitter} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="hover:text-white transition-colors duration-200"
              >
                <Twitter className="w-5 h-5" />
              </a>
            )}
          </div>
        </div>

        {/* 公司連結 */}
        <div>
          <h3 className="text-white font-medium mb-4 text-lg">公司</h3>
          <ul className="space-y-3 text-sm">
            <li><Link href="/about" className="hover:text-white transition-colors duration-200 block">關於我們</Link></li>
            <li><Link href="/careers" className="hover:text-white transition-colors duration-200 block">職業機會</Link></li>
            <li><Link href="/system" className="hover:text-white transition-colors duration-200 block">系統狀態</Link></li>
          </ul>
        </div>

        {/* 客戶連結 */}
        <div>
          <h3 className="text-white font-medium mb-4 text-lg">客戶</h3>
          <ul className="space-y-3 text-sm">
            <li><Link href="/tracking" className="hover:text-white transition-colors duration-200 block">追蹤訂單</Link></li>
            <li><Link href="/products" className="hover:text-white transition-colors duration-200 block">產品</Link></li>
            <li><Link href="/policy/shipping" className="hover:text-white transition-colors duration-200 block">運送政策</Link></li>
          </ul>
        </div>

        {/* 訂閱區域 */}
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-gray-700 to-gray-900 rounded-lg opacity-20 blur-sm"></div>
          <div className="relative bg-gray-900/50 p-5 rounded-lg border border-gray-800">
            <h3 className="text-white font-medium mb-4 text-lg">保持更新</h3>
            <p className="text-gray-300 text-sm mb-4 leading-relaxed">
              訂閱我們的電子報以獲取產品更新和新聞。
            </p>
            <form className="flex flex-col gap-3" onSubmit={(e) => {
              e.preventDefault();
              // 在此處理電子報訂閱
              const email = e.target.email.value;
              console.log('電子報訂閱:', email);
              // 您可以在此添加訂閱邏輯
            }}>
              <input 
                type="email" 
                name="email"
                placeholder="您的電子郵件地址" 
                className="px-4 py-2.5 rounded-md text-white placeholder-gray-400 text-sm w-full 
                          bg-gray-700/50 border border-gray-600 focus:border-blue-400 
                          focus:outline-none focus:ring-2 focus:ring-blue-900/50"
                required
              />
              <button 
                type="submit" 
                className="bg-gradient-to-r from-gray-100 to-gray-300 text-gray-900 px-5 py-2.5 
                          rounded-md text-sm font-medium hover:from-white hover:to-gray-100 
                          transition-all duration-200 shadow-sm"
              >
                訂閱
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* 底部頁腳文本 */}
      <div className="max-w-7xl mx-auto mt-12 border-t border-gray-800 pt-6 text-center text-xs text-gray-500">
        <div className="flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-4">
          <span>{settings.footer_text || `© ${currentYear} IME 展示商店。保留所有權利。`}</span>
          {settings.address && (
            <span className="hidden sm:inline">•</span>
          )}
          {settings.address && (
            <span>{settings.address}</span>
          )}
          {settings.phone && (
            <>
              <span className="hidden sm:inline">•</span>
              <a href={`tel:${settings.phone}`} className="hover:text-white transition-colors duration-200">
                {settings.phone}
              </a>
            </>
          )}
        </div>
      </div>
    </footer>
  );
};

export default Footer;