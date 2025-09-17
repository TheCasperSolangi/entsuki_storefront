// app/page.jsx
import React from "react";
import Link from "next/link";
import Image from "next/image";
import ProductCard from "@/components/ui/productCard";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// API base URL - adjust this to match your environment
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

// Function to fetch banners
async function fetchBanners() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/banners`, {
      cache: 'no-store' // Ensures fresh data on each request
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch banners');
    }
    
    const banners = await response.json();
    return banners;
  } catch (error) {
    console.error('Error fetching banners:', error);
    return [];
  }
}

// Function to transform API data to match component format
function transformProductData(products) {
  return products?.map(product => ({
    // Use product_code as the primary identifier instead of id
    id: product.product_code, // Changed: now using product_code as id
    product_code: product.product_code, // Keep original product_code
    name: product.product_name,
    price: product.price,
    description: product.short_description,
    category: product.category_code?.toLowerCase() || 'general',
    images: product.productImages || [],
    stock: product.stock,
    rating: 4.5, // Default rating since API doesn't provide it
    reviewCount: Math.floor(Math.random() * 200) + 1, // Placeholder since API doesn't provide it
    badge: product.is_featured ? "featured" : null,
    createdAt: new Date(product.createdAt),
    updatedAt: new Date(product.updatedAt),
    sku: product.product_sku,
    features: product.features || [],
    _id: product._id, // Keep original _id if needed for other purposes
    // Add metrics if available (for best sellers)
    totalQuantitySold: product.metrics?.totalQuantitySold || 0,
    totalRevenue: product.metrics?.totalRevenue || 0,
    totalOrders: product.metrics?.totalOrders || 0,
  })) || [];
}

// Function to fetch featured products
async function fetchFeaturedProducts() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/products/featured`, {
      cache: 'no-store' // Ensures fresh data on each request
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch featured products');
    }
    
    const result = await response.json();
    return transformProductData(result.data);
  } catch (error) {
    console.error('Error fetching featured products:', error);
    return [];
  }
}

// Function to fetch new arrivals (most recent products)
async function fetchNewArrivals() {
  try {
    // You might need to adjust this endpoint based on your API
    // This assumes you have an endpoint that returns recent products
    const response = await fetch(`${API_BASE_URL}/api/products?sort=createdAt&order=desc&limit=8`, {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch new arrivals');
    }
    
    const result = await response.json();
    return transformProductData(result.data);
  } catch (error) {
    console.error('Error fetching new arrivals:', error);
    // Fallback: filter featured products by recent date (within last 30 days)
    const featuredProducts = await fetchFeaturedProducts();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    return featuredProducts.filter(product => 
      product.createdAt > thirtyDaysAgo
    ).slice(0, 8);
  }
}

// Function to fetch best sellers
async function fetchBestSellers() {
  try {
    // This assumes you have an endpoint that returns products with sales metrics
    // Based on your third document, some products have metrics
    const response = await fetch(`${API_BASE_URL}/api/products/bestsellers`, {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch best sellers');
    }
    
    const result = await response.json();
    return transformProductData(result.data);
  } catch (error) {
    console.error('Error fetching best sellers:', error);
    // Fallback: use the products from document 3 which have metrics
    // You can also sort featured products by some sales indicator
    const featuredProducts = await fetchFeaturedProducts();
    return featuredProducts
      .filter(product => product.totalQuantitySold > 0)
      .sort((a, b) => b.totalQuantitySold - a.totalQuantitySold)
      .slice(0, 8);
  }
}

// Static categories (these seem to be fixed, but you can also make them dynamic if needed)
const categories = [
  { id: "1", name: "咖啡豆", nameEn: "Coffee Beans", icon: "☕", slug: "coffee-beans" },
  { id: "2", name: "咖啡器具", nameEn: "Equipment", icon: "⚙️", slug: "equipment" },
  { id: "3", name: "禮品套裝", nameEn: "Gift Sets", icon: "🎁", slug: "gift-sets" },
  { id: "4", name: "即飲咖啡", nameEn: "Ready to Drink", icon: "🥤", slug: "ready-to-drink" },
  { id: "5", name: "咖啡點心", nameEn: "Coffee Snacks", icon: "🍪", slug: "snacks" },
  { id: "6", name: "訂閱計劃", nameEn: "Subscription", icon: "📦", slug: "subscription" },
];

export default async function HomePage() {
  // Fetch data in parallel
  const [banners, featuredProducts, newArrivals, bestSellers] = await Promise.all([
    fetchBanners(),
    fetchFeaturedProducts(),
    fetchNewArrivals(),
    fetchBestSellers()
  ]);

  // Get the first banner for hero section (or use default)
  const heroBanner = banners.data?.[0] || {};

  return (
    <>
      <Header />
      
      {/* Hero Section - Dynamic with fallback */}
      <section className="relative h-[500px] lg:h-[600px] bg-gradient-to-b from-gray-900 to-gray-700 flex items-center justify-center overflow-hidden">
        {heroBanner.banner_image && (
          <div className="absolute inset-0">
            <Image 
              src={heroBanner.banner_image} 
              alt={heroBanner.banner_title || "Hero background"}
              width={1920}   // set according to your layout
              height={600}  // set according to your layout
              className="object-cover opacity-50" 
              priority 
            />
          </div>
        )}
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-4xl lg:text-6xl font-bold mb-4 tracking-tight">
            {heroBanner.banner_title || "歡迎來到我們的咖啡店"}
          </h1>
          <p className="text-lg lg:text-xl mb-8 max-w-2xl mx-auto">
            {heroBanner.banner_name || "發現最優質的咖啡豆和器材"}
          </p>
          <Link 
            href="/products" 
            className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-full text-white bg-amber-600 hover:bg-amber-700 transition-colors duration-200"
          >
            立即購買
          </Link>
        </div>
      </section>

      {/* Promo Section */}
      <section className="py-12 lg:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-50 rounded-xl p-8 text-center relative overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer">
            <span className="absolute top-4 right-4 bg-amber-600 text-white px-3 py-1 text-xs font-semibold rounded-full">
              限時優惠
            </span>
            <h3 className="text-2xl font-bold mb-2">首次購買享九折優惠</h3>
            <p className="text-gray-600">新會員專屬優惠。</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-8 text-center relative overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer">
            <span className="absolute top-4 right-4 bg-amber-600 text-white px-3 py-1 text-xs font-semibold rounded-full">
              免費送貨
            </span>
            <h3 className="text-2xl font-bold mb-2">滿HK$300免運費</h3>
            <p className="text-gray-600">香港全境免費配送。</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-8 text-center relative overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer">
            <span className="absolute top-4 right-4 bg-amber-600 text-white px-3 py-1 text-xs font-semibold rounded-full">
              雙倍積分
            </span>
            <h3 className="text-2xl font-bold mb-2">雙倍積分獎勵</h3>
            <p className="text-gray-600">僅限本週。</p>
          </div>
        </div>
      </section>

      {/* Featured Products Section - Dynamic */}
      <section className="py-12 lg:py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-3xl font-bold">精選商品</h2>
            <Link 
              href="/products?filter=featured" 
              className="text-amber-600 hover:text-amber-700 font-medium flex items-center"
            >
              查看全部
              <ChevronRightIcon className="h-4 w-4 ml-1" />
            </Link>
          </div>
          <div className="relative">
            {/* Desktop Carousel Controls */}
            <button className="hidden lg:flex absolute -left-12 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50 transition-colors duration-200">
              <ChevronLeftIcon className="h-6 w-6" />
            </button>
            <button className="hidden lg:flex absolute -right-12 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50 transition-colors duration-200">
              <ChevronRightIcon className="h-6 w-6" />
            </button>

            {/* Products Grid/Carousel - Dynamic */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
              {featuredProducts.length > 0 ? (
                featuredProducts.slice(0, 8).map((product) => (
                  <ProductCard key={product.product_code} product={product} />
                ))
              ) : (
                // Loading state or empty state
                <div className="col-span-full text-center py-8 text-gray-500">
                  載入中...
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* New Arrivals Section - Dynamic */}
      <section className="py-12 lg:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-3xl font-bold">最新商品</h2>
            <Link 
              href="/products?filter=new" 
              className="text-amber-600 hover:text-amber-700 font-medium flex items-center"
            >
              查看全部
              <ChevronRightIcon className="h-4 w-4 ml-1" />
            </Link>
          </div>
          <div className="relative">
            {/* Desktop Carousel Controls */}
            <button className="hidden lg:flex absolute -left-12 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50 transition-colors duration-200">
              <ChevronLeftIcon className="h-6 w-6" />
            </button>
            <button className="hidden lg:flex absolute -right-12 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50 transition-colors duration-200">
              <ChevronRightIcon className="h-6 w-6" />
            </button>

            {/* Products Grid/Carousel - Dynamic */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
              {newArrivals.length > 0 ? (
                newArrivals.slice(0, 8).map((product) => (
                  <ProductCard key={product.product_code} product={{...product, badge: "new"}} />
                ))
              ) : (
                // Loading state or empty state
                <div className="col-span-full text-center py-8 text-gray-500">
                  載入中...
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Best Sellers Section - Dynamic */}
      <section className="py-12 lg:py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-3xl font-bold">熱銷商品</h2>
            <Link 
              href="/products?filter=bestsellers" 
              className="text-amber-600 hover:text-amber-700 font-medium flex items-center"
            >
              查看全部
              <ChevronRightIcon className="h-4 w-4 ml-1" />
            </Link>
          </div>
          <div className="relative">
            {/* Desktop Carousel Controls */}
            <button className="hidden lg:flex absolute -left-12 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50 transition-colors duration-200">
              <ChevronLeftIcon className="h-6 w-6" />
            </button>
            <button className="hidden lg:flex absolute -right-12 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50 transition-colors duration-200">
              <ChevronRightIcon className="h-6 w-6" />
            </button>

            {/* Products Grid/Carousel - Dynamic */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
              {bestSellers.length > 0 ? (
                bestSellers.slice(0, 8).map((product) => (
                  <ProductCard key={product.product_code} product={{...product, badge: "bestseller"}} />
                ))
              ) : (
                // Loading state or empty state
                <div className="col-span-full text-center py-8 text-gray-500">
                  載入中...
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}