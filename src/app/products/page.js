"use client"
import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { ShoppingCart, Plus, Eye, Star, Filter, Search, ArrowUpDown, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { useCart } from '../../context/cartContext'; // Import the cart context

// Separate component for the main product catalogue logic
const ProductCatalogueContent = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [minRating, setMinRating] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  
  // Next.js hooks for URL handling
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  
  // Use cart context instead of local state
  const { addToCart, updating: cartUpdating, user } = useCart();

  // Initialize search term from URL parameters
  useEffect(() => {
    const urlSearchTerm = searchParams.get('search');
    if (urlSearchTerm) {
      setSearchTerm(decodeURIComponent(urlSearchTerm));
    }
  }, [searchParams]);

  // Update URL when search term changes
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    
    if (searchTerm.trim()) {
      params.set('search', encodeURIComponent(searchTerm.trim()));
    } else {
      params.delete('search');
    }
    
    // Update URL without triggering navigation
    const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    router.replace(newUrl, { scroll: false });
  }, [searchTerm, searchParams, pathname, router]);

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch(`https://api.entsuki.com/api/products`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.success && result.data) {
          setProducts(result.data);
          setFilteredProducts(result.data);
        } else {
          throw new Error('Invalid API response format');
        }
      } catch (err) {
        console.error('Error fetching products:', err);
        setError(err.message);
        toast.error('Failed to load products', {
          description: 'Please check your connection and try again',
          duration: 5000,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Get unique categories from fetched products
  const categories = ['all', ...new Set(products.map(product => product.category_code))];

  // Apply filters and sorting
  useEffect(() => {
    let filtered = [...products];

    // Search filter
    if (searchTerm) {
      const searchTermLower = searchTerm.toLowerCase();
      filtered = filtered.filter(product =>
        product.product_name.toLowerCase().includes(searchTermLower) ||
        product.short_description.toLowerCase().includes(searchTermLower) ||
        product.long_description.toLowerCase().includes(searchTermLower) ||
        product.category_code.toLowerCase().includes(searchTermLower)
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category_code === selectedCategory);
    }

    // Price range filter
    if (priceRange.min !== '') {
      filtered = filtered.filter(product => product.price >= parseFloat(priceRange.min));
    }
    if (priceRange.max !== '') {
      filtered = filtered.filter(product => product.price <= parseFloat(priceRange.max));
    }

    // Rating filter
    if (minRating > 0) {
      filtered = filtered.filter(product => product.ratings >= minRating);
    }

    // Sorting
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'price':
          aValue = a.price;
          bValue = b.price;
          break;
        case 'rating':
          aValue = a.ratings || 0;
          bValue = b.ratings || 0;
          break;
        case 'stock':
          aValue = a.stock;
          bValue = b.stock;
          break;
        case 'name':
        default:
          aValue = a.product_name.toLowerCase();
          bValue = b.product_name.toLowerCase();
          break;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredProducts(filtered);
  }, [products, searchTerm, selectedCategory, sortBy, sortOrder, priceRange, minRating]);

  // Handle view details
  const handleViewDetails = (productCode) => {
    window.location.href = `/products/${productCode}`;
  };

  // Handle add to cart - now uses context
  const handleAddToCart = async (productId) => {
    if (!user) {
      toast.error('Please login to add items to your cart');
      return;
    }

    const result = await addToCart(productId, 1);
    
    if (!result.success) {
      // Error handling is already done in the context
      console.error('Failed to add to cart:', result.error);
    }
    // Success handling is also done in the context
  };

  // Reset filters
  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSortBy('name');
    setSortOrder('asc');
    setPriceRange({ min: '', max: '' });
    setMinRating(0);
    
    // Clear URL parameters as well
    router.replace(pathname, { scroll: false });
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle search form submission (for better UX)
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    // The search is already handled by the useEffect above
    // This is just for form submission UX
  };

const ProductCard = ({ product }) => (
  <div
    onClick={() => handleViewDetails(product.product_code)}
    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer"
  >
    <div className="relative">
      <img
        src={product.productImages?.[0] || '/api/placeholder/300/300'}
        alt={product.product_name}
        className="w-full h-48 object-cover"
      />
      {product.stock === 0 && (
        <div className="absolute inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center">
          <span className="text-white font-semibold">Out of Stock</span>
        </div>
      )}
      {product.is_featured && (
        <div className="absolute top-2 left-2 bg-blue-600 text-white px-2 py-1 rounded text-xs font-semibold">
          Featured
        </div>
      )}
    </div>

    <div className="p-4">
      <h3 className="font-semibold text-lg text-gray-800 mb-2 line-clamp-2">
        {product.product_name}
      </h3>

      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
        {product.short_description}
      </p>

      <div className="flex items-center mb-3">
        <div className="flex items-center">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`h-4 w-4 ${
                i < Math.floor(product.ratings || 0)
                  ? 'text-yellow-400 fill-current'
                  : 'text-gray-300'
              }`}
            />
          ))}
        </div>
        <span className="text-sm text-gray-600 ml-2">({product.ratings || 0})</span>
      </div>

      <div className="flex items-center justify-between mb-3">
        <span className="text-2xl font-bold text-blue-600">
          ${product.price}
        </span>
        <span className="text-sm text-gray-500">
          Stock: {product.stock}
        </span>
      </div>

      <div className="flex flex-wrap gap-1 mb-3">
        {product.features?.slice(0, 4).map((feature, index) => (
          <span
            key={index}
            className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
          >
            {feature.feature_name}: {feature.feature_value}
          </span>
        ))}
      </div>

      <div className="flex gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation(); // Prevent card click
            handleAddToCart(product.product_code); // use product_code here
          }}
          disabled={product.stock === 0 || cartUpdating || !user}
          className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center gap-2"
        >
          {cartUpdating ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : (
            <>
              <Plus className="h-4 w-4" />
              Add to Cart
            </>
          )}
        </button>
      </div>
    </div>
  </div>
);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading products</h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Search and Sort Bar - Fixed */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Form */}
            <form onSubmit={handleSearchSubmit} className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </form>

            {/* Sort */}
            <div className="flex gap-2">
              <div className="relative">
                <ArrowUpDown className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="pl-10 pr-8 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white min-w-40"
                >
                  <option value="name">Sort by Name</option>
                  <option value="price">Sort by Price</option>
                  <option value="rating">Sort by Rating</option>
                  <option value="stock">Sort by Stock</option>
                </select>
              </div>

              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-2"
                title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                Filters
                <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>

          {/* Advanced Filters - Collapsible */}
          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category === 'all' ? 'All Categories' : category}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price Range</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={priceRange.min}
                      onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                      className="w-1/2 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={priceRange.max}
                      onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                      className="w-1/2 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Rating Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Rating</label>
                  <select
                    value={minRating}
                    onChange={(e) => setMinRating(parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value={0}>All Ratings</option>
                    <option value={1}>1+ Stars</option>
                    <option value={2}>2+ Stars</option>
                    <option value={3}>3+ Stars</option>
                    <option value={4}>4+ Stars</option>
                    <option value={5}>5 Stars</option>
                  </select>
                </div>

                {/* Reset Filters */}
                <div className="flex items-end">
                  <button
                    onClick={resetFilters}
                    className="w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors duration-200"
                  >
                    Reset Filters
                  </button>
                </div>
              </div>

              {/* Quick Filter Chips */}
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  onClick={() => setMinRating(4)}
                  className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm hover:bg-yellow-200"
                >
                  High Rated (4+)
                </button>
                <button
                  onClick={() => setPriceRange({ min: '', max: '50' })}
                  className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm hover:bg-green-200"
                >
                  Under $50
                </button>
                <button
                  onClick={() => { setSortBy('price'); setSortOrder('asc'); }}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm hover:bg-blue-200"
                >
                  Lowest Price
                </button>
                <button
                  onClick={() => setSelectedCategory(categories.find(cat => cat !== 'all') || 'all')}
                  className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm hover:bg-purple-200"
                >
                  Featured Only
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Product Grid - Scrollable */}
      <div className="flex-1 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 h-full">
          {/* Active Filters Display */}
          {(searchTerm || selectedCategory !== 'all' || priceRange.min || priceRange.max || minRating > 0) && (
            <div className="mb-4 flex flex-wrap gap-2">
              <span className="text-sm text-gray-600">Active filters:</span>
              {searchTerm && (
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                  Search: "{searchTerm}"
                </span>
              )}
              {selectedCategory !== 'all' && (
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                  Category: {selectedCategory}
                </span>
              )}
              {(priceRange.min || priceRange.max) && (
                <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm">
                  Price: ${priceRange.min || '0'} - ${priceRange.max || '∞'}
                </span>
              )}
              {minRating > 0 && (
                <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm">
                  Rating: {minRating}+ stars
                </span>
              )}
            </div>
          )}

          <div className="h-full overflow-y-auto">
            {filteredProducts.length === 0 ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="text-gray-400 text-6xl mb-4">📦</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                  <p className="text-gray-500 mb-4">Try adjusting your search or filter criteria</p>
                  <button
                    onClick={resetFilters}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                  >
                    Clear All Filters
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-6">
                {filteredProducts.map(product => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Loading fallback component
const ProductCatalogueLoading = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p className="text-gray-600">Loading products...</p>
    </div>
  </div>
);

// Main component wrapped with Suspense
const ProductCatalogue = () => {
  return (
    <>
      <Header />
      <Suspense fallback={<ProductCatalogueLoading />}>
        <ProductCatalogueContent />
      </Suspense>
      <Footer />
    </>
  );
};

export default ProductCatalogue;