"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { HeartIcon, StarIcon } from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";
import { useCart } from "../../context/cartContext"; // ✅ use your CartContext

export default function ProductCard({ product, onFavoriteToggle }) {
  const [isFavorite, setIsFavorite] = useState(product.isFavorite || false);
  const [loading, setLoading] = useState(false);

  const { addToCart } = useCart(); // ✅ grab from context

  const handleFavoriteClick = (e) => {
    e.preventDefault();
    setIsFavorite(!isFavorite);
    if (onFavoriteToggle) onFavoriteToggle(product.id);
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await addToCart(product.id, 1); // ✅ use context
      if (!result.success) {
        console.error(result.error);
      }
    } catch (err) {
      console.error("Error adding product:", err);
    } finally {
      setLoading(false);
    }
  };

  const getBadgeColor = (badge) => {
    switch (badge) {
      case "new":
        return "bg-green-500";
      case "hot":
        return "bg-red-500";
      case "sale":
        return "bg-amber-500";
      case "limited":
        return "bg-purple-500";
      default:
        return "bg-gray-500";
    }
  };

  const getBadgeText = (badge) => {
    switch (badge) {
      case "new":
        return "新品";
      case "hot":
        return "熱賣";
      case "sale":
        return "特價";
      case "limited":
        return "限量";
      default:
        return badge;
    }
  };

  return (
    <div className="group relative bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      <Link href={`/products/${product.id}`}>
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          {product.images[0] ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <span className="text-6xl">☕</span>
            </div>
          )}

          {product.badge && (
            <span
              className={`absolute top-2 left-2 px-3 py-1 text-xs font-semibold text-white rounded-full ${getBadgeColor(
                product.badge
              )}`}
            >
              {getBadgeText(product.badge)}
            </span>
          )}

          {/* Favorite Button */}
          <button
            onClick={handleFavoriteClick}
            className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-all duration-200"
          >
            {isFavorite ? (
              <HeartIconSolid className="h-5 w-5 text-red-500" />
            ) : (
              <HeartIcon className="h-5 w-5 text-gray-600 hover:text-red-500" />
            )}
          </button>

          {/* Add to Cart Button */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button
              onClick={handleAddToCart}
              disabled={loading}
              className="w-full py-2 bg-white text-gray-900 font-medium rounded-lg hover:bg-amber-50 transition-colors duration-200 disabled:opacity-50"
            >
              {loading ? "Adding..." : "Add To Cart"}
            </button>
          </div>
        </div>

        <div className="p-4">
          <h3 className="font-medium text-gray-900 mb-2 line-clamp-2 group-hover:text-amber-600 transition-colors duration-200">
            {product.name}
          </h3>

          <div className="flex items-center justify-between mb-2">
            <div>
              <span className="text-xl font-bold text-amber-600">
                HK${product.price}
              </span>
              {product.originalPrice &&
                product.originalPrice > product.price && (
                  <span className="ml-2 text-sm text-gray-500 line-through">
                    HK${product.originalPrice}
                  </span>
                )}
            </div>
          </div>

          {product.rating > 0 && (
            <div className="flex items-center text-sm text-gray-600">
              <div className="flex items-center mr-2">
                {[...Array(5)].map((_, i) => (
                  <StarIcon
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.floor(product.rating)
                        ? "text-yellow-400 fill-current"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span>({product.reviewCount})</span>
            </div>
          )}
        </div>
      </Link>
    </div>
  );
}
