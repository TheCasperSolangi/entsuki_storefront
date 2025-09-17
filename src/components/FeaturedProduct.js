import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Star, ShoppingCart, Heart, ChevronLeft, ChevronRight, Sparkles, Zap, Award, Eye } from "lucide-react";
import { useAuth } from "../context/authContext";
import Cookies from "js-cookie";
export default function FeaturedProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoveredProduct, setHoveredProduct] = useState(null);
  const [favorites, setFavorites] = useState(new Set());
  const sliderRef = useRef(null);
  const { isAuthenticated, requireAuth } = useAuth();
  const handleAddToCart = async (productId, quantity = 1) => {
  requireAuth(async () => {
    try {
      const cartCode = Cookies.get("cart_code");
      if (!cartCode) throw new Error("No cart found");

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/carts/${cartCode}/add-product`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          product_id: productId,
          quantity,
        }),
      });

      if (!res.ok) throw new Error("Failed to add product to cart");

      alert("Product added to cart!");
    } catch (err) {
      console.error(err);
      alert(err.message || "Something went wrong");
    }
  });
};
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/products/featured');
        if (!response.ok) {
          throw new Error('Failed to fetch products');
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

  const getRandomBadge = () => {
    const badges = [
      { icon: Award, text: "Featured", className: "bg-gradient-to-r from-yellow-400 to-orange-500" },
      { icon: Sparkles, text: "Popular", className: "bg-gradient-to-r from-green-400 to-emerald-500" },
      { icon: Zap, text: "Premium", className: "bg-gradient-to-r from-purple-400 to-pink-500" },
      { icon: Eye, text: "Best Seller", className: "bg-gradient-to-r from-blue-400 to-indigo-500" }
    ];
    return badges[Math.floor(Math.random() * badges.length)];
  };

  if (error) {
    return (
      <section className="py-20 container mx-auto px-6 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-red-400 to-red-600 rounded-full flex items-center justify-center">
            <Heart className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-2xl font-bold mb-4 text-gray-800">Oops! Something went wrong</h3>
          <p className="text-gray-600 mb-6">We couldn't load our amazing products right now.</p>
          <Button 
            onClick={() => window.location.reload()} 
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Try Again
          </Button>
        </div>
      </section>
    );
  }

  if (loading) {
    return (
      <section className="py-20 container mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            <Sparkles className="h-8 w-8 text-blue-500 animate-pulse" />
            <h3 className="text-4xl md:text-5xl font-bold">Featured Products</h3>
            <Sparkles className="h-8 w-8 text-pink-500 animate-pulse" />
          </div>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Loading our handpicked selection of premium products...
          </p>
        </div>
        
        <div className="flex space-x-6 overflow-hidden px-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="min-w-[320px]">
              <Card className="h-[520px] bg-gradient-to-br from-gray-50 to-gray-100 border-0 shadow-xl">
                <CardHeader className="p-0">
                  <div className="h-72 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse rounded-t-xl" />
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full animate-pulse" />
                  <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full animate-pulse w-3/4" />
                  <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full animate-pulse w-1/2" />
                  <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full animate-pulse w-2/3" />
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section id="featured" className="py-20 bg-gradient-to-br from-slate-50 via-white to-blue-50 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full -translate-x-36 -translate-y-36 blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-pink-400/10 to-orange-400/10 rounded-full translate-x-48 translate-y-48 blur-3xl" />
      
      <div className="container mx-auto px-6 relative">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full" />
            <span className="text-blue-600 font-semibold tracking-wider uppercase text-sm">Featured Collection</span>
            <div className="w-1 h-8 bg-gradient-to-b from-purple-600 to-pink-500 rounded-full" />
          </div>
          
          <h3 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent leading-tight">
            Discover Premium
            <br />
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Products
            </span>
          </h3>
          
          <p className="text-gray-600 text-lg max-w-3xl mx-auto leading-relaxed">
            Handpicked selection of premium products crafted for those who demand excellence. 
            Each item represents the perfect blend of innovation, quality, and style.
          </p>
        </div>

        <div className="relative group">
          <button 
            onClick={scrollLeft}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:scale-110 border border-gray-200/50"
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-5 w-5 text-gray-700" />
          </button>

          <div 
            ref={sliderRef}
            className="flex overflow-x-auto scrollbar-hide space-x-6 py-4 px-4 scroll-smooth"
            style={{ scrollSnapType: 'x mandatory' }}
          >
            {products.map((product, index) => {
              const badgeConfig = getRandomBadge();
              const rating = (Math.random() * 1.5 + 3.5).toFixed(1); // Random rating between 3.5-5.0
              const reviews = Math.floor(Math.random() * 200 + 10); // Random reviews 10-210
              
              return (
                <div 
                  key={product._id} 
                  className="flex-shrink-0 w-[320px]"
                  style={{ scrollSnapAlign: 'start' }}
                  onMouseEnter={() => setHoveredProduct(product._id)}
                  onMouseLeave={() => setHoveredProduct(null)}
                >
                  <Card className={`group h-[520px] transition-all duration-500 border-0 shadow-lg hover:shadow-2xl bg-white/80 backdrop-blur-sm overflow-hidden ${
                    hoveredProduct === product._id ? 'transform scale-105 rotate-1' : ''
                  }`}>
                    <div className="relative overflow-hidden">
                      <CardHeader className="p-0">
                        <img
                          src={product.productImages[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=350&fit=crop'}
                          alt={product.product_name}
                          className={`w-full h-72 object-cover transition-all duration-700 ${
                            hoveredProduct === product._id ? 'scale-110 brightness-110' : 'scale-100'
                          }`}
                        />
                        
                        {/* Gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        
                        {/* Favorite button */}
                        <div className="absolute top-4 right-4">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className={`w-10 h-10 rounded-full backdrop-blur-md transition-all duration-300 ${
                              favorites.has(product._id)
                                ? 'bg-red-500 text-white hover:bg-red-600 shadow-lg'
                                : 'bg-white/80 text-gray-600 hover:bg-white hover:text-red-500 shadow-md'
                            }`}
                            onClick={() => toggleFavorite(product._id)}
                          >
                            <Heart className={`h-4 w-4 transition-transform duration-300 ${
                              favorites.has(product._id) ? 'fill-current scale-110' : ''
                            }`} />
                          </Button>
                        </div>

                        {/* Badge */}
                        {badgeConfig && (
                          <div className="absolute top-4 left-4">
                            <div className={`${badgeConfig.className} text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5`}>
                              <badgeConfig.icon className="h-3 w-3" />
                              {badgeConfig.text}
                            </div>
                          </div>
                        )}

                        {/* Low stock indicator */}
                        {product.stock < 100 && (
                          <div className="absolute bottom-4 left-4 bg-red-500 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg animate-pulse">
                            Only {product.stock} left!
                          </div>
                        )}
                      </CardHeader>
                    </div>

                    <CardContent className="p-6 flex-1 flex flex-col">
                      <CardTitle className="mb-3 text-lg font-bold text-gray-800 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors duration-300">
                        {product.product_name}
                      </CardTitle>
                      
                      <div className="flex items-center mb-3">
                        <div className="flex text-yellow-400">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`h-4 w-4 ${i < Math.floor(rating) ? 'fill-current' : ''}`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-500 ml-2">
                          {rating} ({reviews} reviews)
                        </span>
                      </div>
                      
                      <p className="text-gray-600 text-sm line-clamp-3 mb-6 leading-relaxed flex-1">
                        {product.short_description}
                      </p>
                      
                      <div className="mt-auto">
                        <div className="flex items-center justify-between mb-4">
                          <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            ${product.price.toFixed(2)}
                          </p>
                          <div className="text-right">
                            <p className="text-xs text-gray-500">SKU: {product.product_sku}</p>
                            <p className="text-xs text-green-600 font-medium">In Stock ({product.stock})</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>

                    <CardFooter className="p-6 pt-0">
                      <Button  onClick={() => handleAddToCart(product._id, 2)} className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Add to Cart
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              );
            })}
          </div>

          <button 
            onClick={scrollRight}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:scale-110 border border-gray-200/50"
            aria-label="Scroll right"
          >
            <ChevronRight className="h-5 w-5 text-gray-700" />
          </button>
        </div>

        <div className="text-center mt-16">
          <Button 
            variant="outline" 
            className="px-12 py-4 rounded-full border-2 border-gray-200 hover:border-blue-500 hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:text-white transition-all duration-500 text-gray-700 font-semibold text-lg shadow-lg hover:shadow-xl group"
            onClick={() => {
              console.log("Show more products clicked");
            }}
          >
            <span className="group-hover:scale-105 transition-transform duration-300 flex items-center gap-2">
              Explore All Products
              <Sparkles className="h-5 w-5 group-hover:animate-pulse" />
            </span>
          </Button>
        </div>
      </div>
    </section>
  );
}