"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Hero() {
  const [banners, setBanners] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API fetch with multiple banners
    const fetchBannerData = async () => {
      try {
        // Replace with actual API call
        // const response = await fetch('/api/banners');
        // const data = await response.json();
        
        // Mock data with multiple banners
        const mockData = [
          {
            banner_image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
            banner_title: 'Summer Collection',
            banner_text: 'Discover our new summer arrivals with up to 30% off'
          },
          {
            banner_image: 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
            banner_title: 'Limited Edition',
            banner_text: 'Exclusive items available for a limited time only'
          },
          {
            banner_image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
            banner_title: 'Weekend Sale',
            banner_text: 'Flash sale this weekend - up to 50% off selected items'
          }
        ];
        
        setBanners(mockData);
      } catch (error) {
        console.error('Error fetching banner data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBannerData();
  }, []);

  // Auto-rotate banners
  useEffect(() => {
    if (banners.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [banners.length]);

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  if (isLoading) {
    return (
      <section className="relative w-full h-[80vh] bg-gray-100 animate-pulse">
        <div className="container mx-auto px-6 h-full flex items-center">
          <div className="w-full md:w-1/2 space-y-6">
            <div className="h-12 bg-gray-200 rounded-full w-3/4"></div>
            <div className="h-6 bg-gray-200 rounded-full w-full"></div>
            <div className="h-6 bg-gray-200 rounded-full w-5/6"></div>
            <div className="h-12 bg-gray-200 rounded-full w-40"></div>
          </div>
        </div>
      </section>
    );
  }

  if (!banners.length) {
    return (
      <section className="relative w-full h-[60vh] bg-gradient-to-r from-primary to-secondary flex items-center justify-center">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Welcome to Our Store</h2>
          <Button size="lg" className="rounded-full px-8 bg-white text-primary hover:bg-white/90">
            Shop Now
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="relative w-full h-[80vh] max-h-[800px] overflow-hidden">
      {/* Background Images with fade transition */}
      {banners.map((banner, index) => (
        <div 
          key={index}
          className={`absolute inset-0 z-0 transition-opacity duration-1000 ${index === currentIndex ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        >
          <Image
            src={banner.banner_image}
            alt="Hero Banner"
            fill
            priority={index === 0}
            quality={100}
            className="object-cover object-center"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
        </div>
      ))}

      {/* Content */}
      <div className="container relative z-10 mx-auto px-6 h-full flex items-center">
        <div className="max-w-2xl text-white">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight drop-shadow-lg">
            {banners[currentIndex]?.banner_title}
          </h1>
          <p className="text-lg md:text-xl mb-8 drop-shadow-md max-w-lg">
            {banners[currentIndex]?.banner_text}
          </p>
          <div className="flex gap-4">
            <Button 
              size="lg" 
              className="rounded-full px-8 bg-white text-primary hover:bg-white/90 transition-all duration-300 hover:scale-105 shadow-lg"
            >
              Shop Now
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="rounded-full bg-transparent px-8 border-white text-white hover:bg-white/10 hover:text-white transition-all duration-300 hover:scale-105"
            >
              Learn More
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      {banners.length > 1 && (
        <>
          <button 
            onClick={goToPrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors"
            aria-label="Previous banner"
          >
            <ChevronLeft size={32} />
          </button>
          <button 
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors"
            aria-label="Next banner"
          >
            <ChevronRight size={32} />
          </button>
        </>
      )}

      {/* Indicator Dots */}
      {banners.length > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-3 h-3 rounded-full transition-all ${index === currentIndex ? 'bg-white w-6' : 'bg-white/50 hover:bg-white/70'}`}
              aria-label={`Go to banner ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Decorative bottom gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/10 to-transparent z-10" />
    </section>
  );
}