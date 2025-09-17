"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Star, ShoppingCart, Heart, ChevronLeft, ChevronRight, Percent, Clock, Tag, Zap, Gift } from "lucide-react";

export default function DiscountBanner() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoveredProduct, setHoveredProduct] = useState(null);
  const [favorites, setFavorites] = useState(new Set());
  const [timeLeft, setTimeLeft] = useState({ hours: 23, minutes: 45, seconds: 30 });
  const sliderRef = useRef(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/products/on-discount`);
        if (!response.ok) {
          throw new Error('Failed to fetch discount products');
        }
        const data = await response.json();
        setProducts(data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Countdown timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const scrollLeft = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: -320, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: 320, behavior: 'smooth' });
    }
  };

  const toggleFavorite = (productId) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(productId)) {
        newFavorites.delete(productId);
      } else {
        newFavorites.add(productId);
      }
      return newFavorites;
    });
  };

  const getDiscountBadge = (discountPercentage) => {
    const discount = parseInt(discountPercentage);
    if (discount >= 50) {
      return { text: "MEGA DEAL", className: "bg-gradient-to-r from-red-600 to-pink-600 animate-pulse" };
    } else if (discount >= 30) {
      return { text: "HOT SALE", className: "bg-gradient-to-r from-orange-500 to-red-500" };
    } else if (discount >= 20) {
      return { text: "GREAT DEAL", className: "bg-gradient-to-r from-yellow-500 to-orange-500" };
    } else {
      return { text: "ON SALE", className: "bg-gradient-to-r from-green-500 to-emerald-500" };
    }
  };

  if (error) {
    return (
      <section className="py-20 bg-gradient-to-r from-red-500 to-pink-600 text-white text-center">
        <div className="container mx-auto px-6">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 mx-auto mb-6 bg-white/20 rounded-full flex items-center justify-center">
              <Percent className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-4">Oops! Something went wrong</h3>
            <p className="mb-6 text-red-100">We couldn't load our amazing discount deals right now.</p>
            <Button 
              onClick={() => window.location.reload()} 
              className="bg-white text-red-600 hover:bg-red-50 px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Try Again
            </Button>
          </div>
        </div>
      </section>
    );
  }

  if (loading) {
    return (
      <section className="py-20 bg-gradient-to-br from-purple-600 via-pink-600 to-red-600 text-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 mb-4">
              <Percent className="h-8 w-8 animate-pulse" />
              <h3 className="text-4xl md:text-5xl font-bold">Loading Deals...</h3>
              <Gift className="h-8 w-8 animate-pulse" />
            </div>
            <p className="text-lg text-white/80 max-w-2xl mx-auto">
              Preparing amazing discounts just for you...
            </p>
          </div>
          
          <div className="flex space-x-6 overflow-hidden px-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="min-w-[300px]">
                <Card className="h-[400px] bg-white/10 backdrop-blur-sm border-0">
                  <CardHeader className="p-0">
                    <div className="h-48 bg-white/20 animate-pulse rounded-t-xl" />
                  </CardHeader>
                  <CardContent className="p-4 space-y-3">
                    <div className="h-4 bg-white/20 rounded-full animate-pulse" />
                    <div className="h-3 bg-white/20 rounded-full animate-pulse w-3/4" />
                    <div className="h-6 bg-white/20 rounded-full animate-pulse w-1/2" />
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="discount" className="py-20 bg-gradient-to-br from-purple-600 via-pink-600 to-red-600 text-white relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-yellow-400/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-0 w-72 h-72 bg-pink-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 mb-6 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3">
            <Zap className="h-6 w-6 text-yellow-300 animate-pulse" />
            <span className="font-bold tracking-wider uppercase text-sm">Limited Time Offers</span>
            <Gift className="h-6 w-6 text-yellow-300 animate-pulse" />
          </div>
          
          <h3 className="text-4xl md:text-7xl font-black mb-6 leading-tight">
            <span className="bg-gradient-to-r from-yellow-300 via-orange-300 to-pink-300 bg-clip-text text-transparent">
              MEGA SALE
            </span>
            <br />
            <span className="text-3xl md:text-5xl font-bold text-white/90">
              Up to 50% OFF!
            </span>
          </h3>
          
          <p className="text-xl text-white/80 mb-8 max-w-3xl mx-auto leading-relaxed">
            🎉 Don't miss out on these incredible deals! Limited quantities available.
          </p>

          {/* Countdown Timer */}
          <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-6 inline-block mb-8">
            <p className="text-sm text-white/80 mb-3 uppercase tracking-wider">⏰ Sale ends in:</p>
            <div className="flex items-center gap-4 text-center">
              <div className="bg-white/10 rounded-lg p-3 min-w-[60px]">
                <div className="text-2xl md:text-3xl font-bold text-yellow-300">{timeLeft.hours.toString().padStart(2, '0')}</div>
                <div className="text-xs text-white/70 uppercase">Hours</div>
              </div>
              <div className="text-2xl text-white/50">:</div>
              <div className="bg-white/10 rounded-lg p-3 min-w-[60px]">
                <div className="text-2xl md:text-3xl font-bold text-orange-300">{timeLeft.minutes.toString().padStart(2, '0')}</div>
                <div className="text-xs text-white/70 uppercase">Mins</div>
              </div>
              <div className="text-2xl text-white/50">:</div>
              <div className="bg-white/10 rounded-lg p-3 min-w-[60px]">
                <div className="text-2xl md:text-3xl font-bold text-pink-300">{timeLeft.seconds.toString().padStart(2, '0')}</div>
                <div className="text-xs text-white/70 uppercase">Secs</div>
              </div>
            </div>
          </div>
        </div>

        {/* Products Slider */}
        <div className="relative group">
          <button 
            onClick={scrollLeft}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:scale-110 border border-white/30"
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-5 w-5 text-white" />
          </button>

          <div 
            ref={sliderRef}
            className="flex overflow-x-auto scrollbar-hide space-x-6 py-4 px-4 scroll-smooth"
            style={{ scrollSnapType: 'x mandatory' }}
          >
            {products.slice(0, 8).map((product, index) => {
              const badgeConfig = getDiscountBadge(product.pricing?.discountPercentage || "0");
              const rating = (Math.random() * 1.5 + 3.5).toFixed(1);
              const reviews = Math.floor(Math.random() * 300 + 25);
              
              return (
                <div 
                  key={product._id} 
                  className="flex-shrink-0 w-[300px]"
                  style={{ scrollSnapAlign: 'start' }}
                  onMouseEnter={() => setHoveredProduct(product._id)}
                  onMouseLeave={() => setHoveredProduct(null)}
                >
                  <Card className={`group h-[450px] transition-all duration-500 border-0 shadow-2xl bg-white overflow-hidden ${
                    hoveredProduct === product._id ? 'transform scale-105 -rotate-1' : ''
                  }`}>
                    <div className="relative overflow-hidden">
                      <CardHeader className="p-0">
                        <img
                          src={product.productImages[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=200&fit=crop'}
                          alt={product.product_name}
                          className={`w-full h-48 object-cover transition-all duration-700 ${
                            hoveredProduct === product._id ? 'scale-110 brightness-110' : 'scale-100'
                          }`}
                        />
                        
                        {/* Discount Badge */}
                        <div className="absolute top-3 left-3">
                          <div className={`${badgeConfig.className} text-white text-xs font-black px-3 py-2 rounded-full shadow-lg flex items-center gap-1.5`}>
                            <Percent className="h-3 w-3" />
                            {product.pricing?.discountPercentage || 0}% OFF
                          </div>
                        </div>

                        {/* Sale Badge */}
                        <div className="absolute top-3 right-3">
                          <div className={`${badgeConfig.className} text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg`}>
                            {badgeConfig.text}
                          </div>
                        </div>

                        {/* Favorite button */}
                        <div className="absolute bottom-3 right-3">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className={`w-9 h-9 rounded-full backdrop-blur-md transition-all duration-300 ${
                              favorites.has(product._id)
                                ? 'bg-red-500 text-white hover:bg-red-600'
                                : 'bg-white/80 text-gray-600 hover:bg-white hover:text-red-500'
                            }`}
                            onClick={() => toggleFavorite(product._id)}
                          >
                            <Heart className={`h-3 w-3 transition-transform duration-300 ${
                              favorites.has(product._id) ? 'fill-current scale-110' : ''
                            }`} />
                          </Button>
                        </div>
                      </CardHeader>
                    </div>

                    <CardContent className="p-4 flex-1 flex flex-col text-gray-800">
                      <CardTitle className="mb-2 text-base font-bold line-clamp-2 leading-tight group-hover:text-purple-600 transition-colors duration-300">
                        {product.product_name}
                      </CardTitle>
                      
                      <div className="flex items-center mb-3">
                        <div className="flex text-yellow-400">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`h-3 w-3 ${i < Math.floor(rating) ? 'fill-current' : ''}`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-gray-500 ml-2">
                          ({reviews})
                        </span>
                      </div>
                      
                      <p className="text-gray-600 text-xs line-clamp-2 mb-4 leading-relaxed flex-1">
                        {product.short_description}
                      </p>
                      
                      {/* Pricing */}
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2">
                          <span className="text-xl font-bold text-purple-600">
                            ${product.pricing?.currentPrice?.toFixed(2) || product.price.toFixed(2)}
                          </span>
                          {product.pricing?.originalPrice && (
                            <span className="text-sm text-gray-400 line-through">
                              ${product.pricing.originalPrice.toFixed(2)}
                            </span>
                          )}
                        </div>
                        {product.pricing?.discountAmount && (
                          <div className="text-xs text-green-600 font-semibold">
                            You save ${product.pricing.discountAmount.toFixed(2)}!
                          </div>
                        )}
                      </div>
                    </CardContent>

                    <CardFooter className="p-4 pt-0">
                      <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-2.5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Grab Deal
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              );
            })}
          </div>

          <button 
            onClick={scrollRight}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:scale-110 border border-white/30"
            aria-label="Scroll right"
          >
            <ChevronRight className="h-5 w-5 text-white" />
          </button>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <Button 
            size="lg" 
            className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-bold px-12 py-4 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-500 text-lg group hover:scale-110"
            onClick={() => {
              console.log("View all deals clicked");
            }}
          >
            <span className="flex items-center gap-2">
              <Tag className="h-5 w-5 group-hover:animate-pulse" />
              View All Deals
              <Zap className="h-5 w-5 group-hover:animate-pulse" />
            </span>
          </Button>
        </div>
      </div>
    </section>
  );
}