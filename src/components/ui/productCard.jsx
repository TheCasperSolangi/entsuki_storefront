"use client";

import React, { useState } from "react";
import { Star, Plus } from "lucide-react";
import { useCart } from "../../context/cartContext";

export default function ProductCard({ product, onFavoriteToggle }) {
  const [isFavorite, setIsFavorite] = useState(product.isFavorite || false);
  
  // Use cart context
  const { addToCart, updating: cartUpdating, user } = useCart();

  const handleFavoriteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorite(!isFavorite);
    if (onFavoriteToggle) onFavoriteToggle(product.id);
  };

  // Handle view details
  const handleViewDetails = (productCode) => {
    window.location.href = `/products/${productCode || product.id}`;
  };

  // Handle add to cart - matches the catalogue version exactly
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

  return (
    <div
      onClick={() => handleViewDetails(product.product_code || product.id)}
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer"
    >
      <div className="relative">
        <img
          src={product.productImages?.[0] || product.images?.[0] || '/api/placeholder/300/300'}
          alt={product.product_name || product.name}
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
          {product.product_name || product.name}
        </h3>

        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {product.short_description || product.description}
        </p>

        <div className="flex items-center mb-3">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i < Math.floor(product.ratings || product.rating || 0)
                    ? 'text-yellow-400 fill-current'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-gray-600 ml-2">({product.ratings || product.rating || 0})</span>
        </div>

        <div className="flex items-center justify-between mb-3">
          <span className="text-2xl font-bold text-[#b8935f]">
            HKD {product.price}
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
              handleAddToCart(product.product_code || product.id); // use product_code or id
            }}
            disabled={product.stock === 0 || cartUpdating || !user}
            className="flex-1 bg-[#b8935f] text-white px-4 py-2 rounded-md hover:bg-[#a8834f] disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center gap-2"
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
}