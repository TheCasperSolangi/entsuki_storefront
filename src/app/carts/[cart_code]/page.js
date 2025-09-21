"use client"
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
// Using js-cookie
import Cookies from 'js-cookie';

import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  Tag, 
  Percent, 
  ArrowLeft,
  CheckCircle,
  Gift,
  Star,
  AlertTriangle
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';

const CartScreen = () => {
  // For demo purposes, we'll use a sample cart_code
  // In a real Next.js app, you'd get this from useRouter() or props
  const cart_code = Cookies.get('cart_code');
  
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingItems, setUpdatingItems] = useState({});
  const [deliveryChargesLoaded, setDeliveryChargesLoaded] = useState(false);
  const [locationPermissionDenied, setLocationPermissionDenied] = useState(false);
 
  const API_BASE_URL = `https://api.entsuki.com/api`;

  // Fetch cart data
  useEffect(() => {
    fetchCart();
  }, []);

  // Add this useEffect after your existing fetchCart useEffect
  useEffect(() => {
    // Only fetch delivery charges after cart is loaded and if not already loaded
    if (cart && !deliveryChargesLoaded && !locationPermissionDenied) {
      // Check if delivery charges already exist in cart
      const hasDeliveryCharges = cart.subtotal?.some(item => 
        item.name.toLowerCase().includes('delivery')
      );
      
      if (!hasDeliveryCharges) {
        fetchDeliveryCharges();
      } else {
        setDeliveryChargesLoaded(true);
      }
    }
  }, [cart, deliveryChargesLoaded, locationPermissionDenied]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/carts/code/${cart_code}`);
      const data = await response.json();
      
      if (data.success) {
        setCart(data.data);
      } else {
        setError(data.message || 'Failed to fetch cart');
      }
    } catch (err) {
      setError('Failed to load cart. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchDeliveryCharges = async () => {
    try {
      // Don't show full loading state for delivery charges
      
      // Get store coordinates from settings API
      const storeResponse = await fetch(`https://api.entsuki.com/api/store/settings`);
      const storeData = await storeResponse.json();
      
      if (storeResponse.status == 304) {
        throw new Error('Failed to get store coordinates');
      }

      // Get user's current location
      const getUserLocation = () => {
        return new Promise((resolve, reject) => {
          if (!navigator.geolocation) {
            reject(new Error('Geolocation is not supported by this browser'));
          } else {
            navigator.geolocation.getCurrentPosition(
              (position) => {
                resolve({
                  lat: position.coords.latitude.toString(),
                  lng: position.coords.longitude.toString()
                });
              },
              (error) => {
                // Handle different geolocation errors
                let errorMessage = 'Failed to get location';
                switch(error.code) {
                  case error.PERMISSION_DENIED:
                    errorMessage = 'Location access denied by user';
                    setLocationPermissionDenied(true);
                    break;
                  case error.POSITION_UNAVAILABLE:
                    errorMessage = 'Location information unavailable';
                    break;
                  case error.TIMEOUT:
                    errorMessage = 'Location request timed out';
                    break;
                }
                reject(new Error(errorMessage));
              },
              {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 60000
              }
            );
          }
        });
      };

      const userLocation = await getUserLocation();
      const storeCoordinates = storeData.cordinates;

      // fallback sandbox cordinates to be used are here
      const store_lat = "1.45556"
      const store_lon = "103.76111"

      const user_lat = "1.4920"
      const user_lon = "103.7410"

      // to be used in product

      const lat = storeCoordinates[0].lat;
      const lon = storeCoordinates[0].lon;
      console.log(`FETCHED CORDINATES: ${lat} and ${lon}`)
      // Prepare delivery request body
      const deliveryRequestBody = {
        serviceType: "MOTORCYCLE",
        language: "en_MY",
        stops: [
          {
            coordinates: {
              lat: store_lat,
              lng: store_lon
            },
            address: "Sender"
          },
          {
            coordinates: {
              lat: user_lat,
              lng: user_lon
            },
            address: "Receiver"
          }
        ]
      };

      // Fetch delivery charges from Bajgo API
      const deliveryResponse = await fetch('http://localhost:5000/api/lalamove/quotation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(deliveryRequestBody)
      });

      if (!deliveryResponse.ok) {
        throw new Error(`Delivery API error: ${deliveryResponse.status}`);
      }

      const deliveryData = await deliveryResponse.json();

      if (!deliveryData.data || !deliveryData.data.priceBreakdown) {
        throw new Error('Invalid delivery response format');
      }

      const deliveryCharge = parseFloat(deliveryData.data.priceBreakdown.total);
      const currency = deliveryData.data.priceBreakdown.currency;
      Cookies.set('quotation_id', deliveryData.data.quotationId)
       Cookies.set("temp_sender_code", deliveryData.data.stops[0].stopId)
      Cookies.set("temp_receiver_code", deliveryData.data.stops[1].stopId)
      console.log(`Fetched and Saved StopIds: ${deliveryData.data.stops[0].stopId} and ${deliveryData.data.stops[1].stopId} and Quotation ID is ${deliveryData.data.quotationId}`)

      // Update cart with delivery charges
      const cartUpdateResponse = await fetch(`${API_BASE_URL}/carts/${cart_code}/add-subtotal`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: `Delivery Charges (${currency})`,
          value: deliveryCharge
        })
      });

     
      if (!cartUpdateResponse.ok) {
        throw new Error(`Cart update error: ${cartUpdateResponse.status}`);
      }

      const cartUpdateData = await cartUpdateResponse.json();
      
      if (cartUpdateData.success) {
        setCart(cartUpdateData.data);
        setDeliveryChargesLoaded(true);
        
        // Store delivery info for checkout
        const deliveryInfo = {
          quotationId: deliveryData.data.quotationId,
          scheduleAt: deliveryData.data.scheduleAt,
          expiresAt: deliveryData.data.expiresAt,
          serviceType: deliveryData.data.serviceType,
          deliveryCharge: deliveryCharge,
          currency: currency,
          distance: deliveryData.data.distance,
          stops: deliveryData.data.stops
        };
        
        // Store in cookie for checkout process (expires in 1 day)
        Cookies.set('delivery_info', JSON.stringify(deliveryInfo), { expires: 1 });
        
      } else {
        throw new Error(cartUpdateData.message || 'Failed to update cart with delivery charges');
      }

    } catch (err) {
      console.error('Delivery charges error:', err);
      
      // Don't show error for location permission denied - just continue without delivery
      if (!err.message.includes('Location access denied')) {
        setError(`Delivery charges: ${err.message}`);
      }
    }
  };

  // Add this function to manually retry fetching delivery charges
  const retryDeliveryCharges = () => {
    setLocationPermissionDenied(false);
    setDeliveryChargesLoaded(false);
    setError(null);
    fetchDeliveryCharges();
  };

  const updateQuantity = async (productId, newQuantity) => {
    if (newQuantity <= 0) {
      await removeProduct(productId);
      return;
    }

    setUpdatingItems(prev => ({ ...prev, [productId]: true }));
    
    try {
      const response = await fetch(`${API_BASE_URL}/carts/${cart_code}/update-quantity`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product_id: productId,
          quantity: newQuantity,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setCart(data.data);
      }
    } catch (err) {
      console.error('Failed to update quantity:', err);
    } finally {
      setUpdatingItems(prev => ({ ...prev, [productId]: false }));
    }
  };

  const removeProduct = async (productId) => {
    setUpdatingItems(prev => ({ ...prev, [productId]: true }));
    
    try {
      const response = await fetch(`${API_BASE_URL}/carts/${cart_code}/remove-product`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product_id: productId,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setCart(data.data);
      }
    } catch (err) {
      console.error('Failed to remove product:', err);
    } finally {
      setUpdatingItems(prev => ({ ...prev, [productId]: false }));
    }
  };

  if (loading) {
    return <CartSkeleton />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <Alert className="max-w-md">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!cart || !cart.products || cart.products.length === 0) {
    return <EmptyCart />;
  }

  return (
    <>
    <Header />
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
     
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {/* Delivery Status Card */}
            <DeliveryStatusCard 
              deliveryChargesLoaded={deliveryChargesLoaded}
              locationPermissionDenied={locationPermissionDenied}
              onRetry={retryDeliveryCharges}
            />

            {cart.discountInfo?.hasDiscounts && (
              <Card className="border-green-200 bg-green-50/50">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Gift className="w-5 h-5 text-green-600" />
                    <span className="text-green-800 font-medium">
                      You're saving ${cart.discountInfo.totalDiscountAmount.toFixed(2)} with active discounts!
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="space-y-4">
              {cart.products.map((item) => (
                <ProductCard
                  key={item.product_id}
                  item={item}
                  onUpdateQuantity={updateQuantity}
                  onRemove={removeProduct}
                  isUpdating={updatingItems[item.product_id]}
                />
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <OrderSummary cart={cart} />
          </div>
        </div>
      </div>
    </div>
    <Footer />
    </>
  );
};

const DeliveryStatusCard = ({ 
  deliveryChargesLoaded, 
  locationPermissionDenied, 
  onRetry 
}) => {
  if (deliveryChargesLoaded) {
    return (
      <Card className="border-green-200 bg-green-50/50">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-green-800 font-medium">
              Delivery charges calculated and added to your cart
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (locationPermissionDenied) {
    return (
      <Card className="border-yellow-200 bg-yellow-50/50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              <span className="text-yellow-800 font-medium">
                Location access needed for delivery charges
              </span>
            </div>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={onRetry}
              className="border-yellow-300 text-yellow-700 hover:bg-yellow-100"
            >
              Enable Location
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
};

const ProductCard = ({ item, onUpdateQuantity, onRemove, isUpdating }) => {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group">
      <CardContent className="p-6">
        <div className="flex space-x-4">
          {/* Product Image */}
          <div className="relative flex-shrink-0">
            <div className="w-24 h-24 rounded-lg overflow-hidden bg-slate-100">
              {item.product_image ? (
                <img
                  src={item.product_image}
                  alt="Product"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
                  <ShoppingCart className="w-8 h-8 text-slate-400" />
                </div>
              )}
            </div>
            {item.discountApplied && (
              <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs">
                -{item.appliedDiscount?.value}%
              </Badge>
            )}
          </div>

          {/* Product Details */}
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-slate-900 truncate">
                  Product #{item.product_id.slice(-6)}
                </h3>
                
                {/* Price Information */}
                <div className="mt-2 space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xl font-bold text-slate-900">
                      ${item.finalPrice.toFixed(2)}
                    </span>
                    {item.discountApplied && (
                      <span className="text-sm text-slate-500 line-through">
                        ${item.price.toFixed(2)}
                      </span>
                    )}
                  </div>
                  {item.discountApplied && (
                    <div className="flex items-center space-x-1">
                      <Percent className="w-3 h-3 text-green-600" />
                      <span className="text-sm text-green-600 font-medium">
                        Save ${item.discountAmount.toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Discount Badge */}
                {item.appliedDiscount && (
                  <Badge variant="outline" className="mt-2 border-green-200 text-green-700">
                    <Tag className="w-3 h-3 mr-1" />
                    {item.appliedDiscount.type} discount
                  </Badge>
                )}
              </div>

              {/* Remove Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemove(item.product_id)}
                disabled={isUpdating}
                className="text-slate-400 hover:text-red-500 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>

            {/* Quantity Controls */}
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center space-x-3 bg-slate-100 rounded-lg p-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onUpdateQuantity(item.product_id, item.quantity - 1)}
                  disabled={isUpdating || item.quantity <= 1}
                  className="h-8 w-8 rounded-md hover:bg-white"
                >
                  <Minus className="w-3 h-3" />
                </Button>
                <span className="w-8 text-center font-medium text-slate-900">
                  {item.quantity}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onUpdateQuantity(item.product_id, item.quantity + 1)}
                  disabled={isUpdating}
                  className="h-8 w-8 rounded-md hover:bg-white"
                >
                  <Plus className="w-3 h-3" />
                </Button>
              </div>

              <div className="text-right">
                <div className="text-lg font-bold text-slate-900">
                  ${(item.finalPrice * item.quantity).toFixed(2)}
                </div>
                {item.discountApplied && (
                  <div className="text-sm text-green-600">
                    Total saved: ${(item.discountAmount * item.quantity).toFixed(2)}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const OrderSummary = ({ cart }) => {
  const subtotal = cart.discountInfo?.totalOriginalAmount || 0;
  const discountAmount = cart.discountInfo?.totalDiscountAmount || 0;
  const total = cart.total || 0;
  const cart_code = Cookies.get('cart_code');
  const href=`/carts/${cart_code}/checkout`;
  
  return (
    <Card className="sticky top-24">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <span>Order Summary</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Pricing Breakdown */}
        <div className="space-y-3">
          <div className="flex justify-between text-slate-600">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          
          {discountAmount > 0 && (
            <div className="flex justify-between text-green-600 font-medium">
              <span className="flex items-center space-x-1">
                <Gift className="w-4 h-4" />
                <span>Discounts</span>
              </span>
              <span>-${discountAmount.toFixed(2)}</span>
            </div>
          )}

          {cart.subtotal?.map((adjustment, index) => (
            <div key={index} className="flex justify-between text-slate-600">
              <span>{adjustment.name}</span>
              <span>${adjustment.value.toFixed(2)}</span>
            </div>
          ))}
        </div>

        <Separator />

        {/* Total */}
        <div className="flex justify-between items-center text-xl font-bold text-slate-900">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>

        {/* Savings Summary */}
        {discountAmount > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span className="text-green-800 font-medium">You saved</span>
              <span className="text-green-800 font-bold">${discountAmount.toFixed(2)}</span>
            </div>
            <div className="text-sm text-green-600 mt-1">
              {cart.savingsPercentage}% off your order
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3 pt-4">
          <Link href={href}>
            <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3">
              Proceed to Checkout
            </Button>
          </Link>
          <Link href="/">
            <Button variant="outline" className="w-full">
              Continue Shopping
            </Button>
          </Link>
        </div>

        {/* Security Badge */}
        <div className="flex items-center justify-center space-x-2 text-sm text-slate-500 pt-4">
          <Star className="w-4 h-4" />
          <span>Secure checkout guaranteed</span>
        </div>
      </CardContent>
    </Card>
  );
};

const EmptyCart = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <Card className="max-w-md w-full text-center">
        <CardContent className="p-8">
          <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingCart className="w-12 h-12 text-slate-400" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Your cart is empty</h2>
          <p className="text-slate-600 mb-6">Add some products to get started</p>
          <Link href="/">
            <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
              Start Shopping
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
};

const CartSkeleton = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="flex space-x-4">
                    <Skeleton className="w-24 h-24 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-6 w-2/3" />
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-4 w-1/3" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6 space-y-4">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-12 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartScreen;