"use client"
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardFooter 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  CreditCard, 
  Wallet, 
  MapPin, 
  User, 
  Mail, 
  Phone, 
  Building, 
  Truck,
  Shield,
  CheckCircle,
  AlertTriangle,
  ArrowLeft,
  Gift,
  Lock,
  Star,
  Package,
  Clock,
  Heart,
  ChevronDown,
  ChevronRight,
  Plus,
  Loader2,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Cookies from 'js-cookie';

const PayPalCheckoutScreen = () => {
  const router = useRouter();
  const cart_code = Cookies.get('cart_code');
  
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    payment_method: 'PAYPAL',
    billing_address: '',
    shipping_address: '',
    special_instructions: '',
    same_as_billing: true,
    use_saved_address: false,
    selected_address_index: 0
  });

  const [savedAddresses, setSavedAddresses] = useState([]);

  const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api`;

  // Get auth token from cookies
  const getAuthToken = () => {
    if (typeof document !== 'undefined') {
      const cookies = document.cookie.split(';');
      const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('token='));
      return tokenCookie ? tokenCookie.split('=')[1] : null;
    }
    return null;
  };

  // Fetch user profile and cart data
  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      Promise.all([fetchUserProfile(token), fetchCart()]);
    } else {
      setError('Please login to continue with checkout');
      setLoading(false);
    }
  }, []);

  const fetchUserProfile = async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        setSavedAddresses(userData.addresses || []);
        
        // Set default addresses if available
        if (userData.addresses && userData.addresses.length > 0) {
          const defaultAddress = userData.addresses[0];
          setFormData(prev => ({
            ...prev,
            billing_address: defaultAddress,
            shipping_address: defaultAddress,
            use_saved_address: true
          }));
        }
      } else {
        setError('Failed to fetch user profile. Please login again.');
      }
    } catch (err) {
      setError('Failed to place order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <CheckoutSkeleton />;
  }

  if (success) {
    return <OrderSuccess />;
  }

  if (!user) {
    return <AuthRequired />;
  }

  if (!cart || !cart.products || cart.products.length === 0) {
    return <EmptyCartCheckout />;
  }

  const canUseWallet = user.wallet_balance >= cart.total;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => router.back()}
                className="hover:bg-slate-100 text-slate-700"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <Shield className="w-6 h-6 text-indigo-600" />
                </div>
                <h1 className="text-2xl font-bold text-slate-800">PayPal Checkout</h1>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="text-sm font-medium px-3 py-1">
                {user.full_name}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <Alert variant="destructive" className="border-red-200 bg-red-50">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription className="text-red-800">{error}</AlertDescription>
                </Alert>
              </motion.div>
            )}

            {/* Payment Method Selection */}
            <PaymentMethodCard 
              selectedMethod={formData.payment_method}
              onMethodChange={(method) => setFormData(prev => ({ ...prev, payment_method: method }))}
              user={user}
              canUseWallet={canUseWallet}
              orderTotal={cart.total}
            />

            {/* Address Section */}
            <AddressCard
              savedAddresses={savedAddresses}
              formData={formData}
              onAddressSelection={handleAddressSelection}
              onInputChange={handleInputChange}
              onSameAsBilling={handleSameAsBilling}
              user={user}
            />

            {/* Special Instructions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Mail className="w-5 h-5 text-indigo-600" />
                  <span>Order Notes</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  name="special_instructions"
                  placeholder="Any special delivery instructions or notes for your order..."
                  value={formData.special_instructions}
                  onChange={handleInputChange}
                  className="min-h-[100px]"
                />
              </CardContent>
            </Card>
          </div>

          {/* Order Summary & Checkout */}
          <div className="lg:col-span-1">
            <OrderSummaryCard 
              cart={cart}
              paymentMethod={formData.payment_method}
              onPayPalSubmit={handlePayPalPayment}
              onWalletSubmit={handleWalletPayment}
              submitting={submitting}
              canUseWallet={canUseWallet}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const PaymentMethodCard = ({ selectedMethod, onMethodChange, user, canUseWallet, orderTotal }) => {
  const paymentMethods = [
    {
      id: 'PAYPAL',
      name: 'PayPal',
      icon: <Shield className="w-5 h-5" />,
      description: 'Pay securely with PayPal',
      available: true,
      badge: 'Recommended',
      badgeColor: 'bg-blue-100 text-blue-800'
    },
    {
      id: 'WALLET_BALANCE',
      name: 'Wallet Balance',
      icon: <Wallet className="w-5 h-5" />,
      description: `Available: ${user.wallet_balance.toFixed(2)}`,
      available: canUseWallet,
      badge: canUseWallet ? 'Instant' : 'Insufficient',
      badgeColor: canUseWallet ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <CreditCard className="w-5 h-5 text-indigo-600" />
          <span>Payment Method</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {paymentMethods.map((method) => (
            <div
              key={method.id}
              className={`border rounded-lg p-4 cursor-pointer transition-all ${
                selectedMethod === method.id
                  ? 'border-indigo-500 bg-indigo-50'
                  : method.available
                  ? 'border-slate-200 hover:border-slate-300'
                  : 'border-slate-100 bg-slate-50 cursor-not-allowed opacity-50'
              }`}
              onClick={() => method.available && onMethodChange(method.id)}
            >
              <div className="flex items-center space-x-3">
                <input
                  type="radio"
                  checked={selectedMethod === method.id}
                  onChange={() => method.available && onMethodChange(method.id)}
                  disabled={!method.available}
                  className="text-indigo-600 focus:ring-indigo-500"
                />
                <div className="text-indigo-600">{method.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-slate-900">{method.name}</span>
                    <Badge className={`text-xs ${method.badgeColor}`}>
                      {method.badge}
                    </Badge>
                  </div>
                  <div className="text-sm text-slate-600">{method.description}</div>
                  {method.id === 'WALLET_BALANCE' && !canUseWallet && (
                    <div className="text-sm text-red-600 mt-1">
                      Need ${(orderTotal - user.wallet_balance).toFixed(2)} more
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const AddressCard = ({ savedAddresses, formData, onAddressSelection, onInputChange, onSameAsBilling, user }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <MapPin className="w-5 h-5 text-indigo-600" />
          <span>Shipping Information</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Saved Addresses */}
        {savedAddresses.length > 0 && (
          <div className="space-y-3">
            <Label>Saved Addresses</Label>
            <div className="space-y-2">
              {savedAddresses.map((address, index) => (
                <div
                  key={index}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    formData.use_saved_address && formData.selected_address_index === index
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                  onClick={() => onAddressSelection(index)}
                >
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      checked={formData.use_saved_address && formData.selected_address_index === index}
                      onChange={() => onAddressSelection(index)}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    <div className="text-sm text-slate-700">{address}</div>
                  </div>
                  {index === 0 && (
                    <Badge variant="secondary" className="mt-1 text-xs">Default</Badge>
                  )}
                </div>
              ))}
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => onInputChange({ 
                target: { name: 'use_saved_address', type: 'checkbox', checked: false } 
              })}
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Enter New Address
            </Button>
          </div>
        )}

        {(!formData.use_saved_address || savedAddresses.length === 0) && (
          <>
            <div className="space-y-2">
              <Label htmlFor="billing_address">Billing Address *</Label>
              <Textarea
                id="billing_address"
                name="billing_address"
                value={formData.billing_address}
                onChange={onInputChange}
                placeholder="Enter your billing address..."
                required
                rows={3}
                className="resize-none"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="same_as_billing"
                checked={formData.same_as_billing}
                onChange={(e) => onSameAsBilling(e.target.checked)}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <Label htmlFor="same_as_billing" className="text-sm cursor-pointer">
                Shipping address is the same as billing address
              </Label>
            </div>

            {!formData.same_as_billing && (
              <div className="space-y-2">
                <Label htmlFor="shipping_address">Shipping Address *</Label>
                <Textarea
                  id="shipping_address"
                  name="shipping_address"
                  value={formData.shipping_address}
                  onChange={onInputChange}
                  placeholder="Enter your shipping address..."
                  required
                  rows={3}
                  className="resize-none"
                />
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

const OrderSummaryCard = ({ cart, paymentMethod, onPayPalSubmit, onWalletSubmit, submitting, canUseWallet }) => {
  const [showItems, setShowItems] = useState(true);

  return (
    <Card className="sticky top-24 border border-slate-200 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Package className="w-5 h-5 text-indigo-600" />
            <span>Order Summary</span>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShowItems(!showItems)}
            className="text-slate-500 hover:text-slate-700"
          >
            {showItems ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </Button>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <AnimatePresence>
          {showItems && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="space-y-3 pb-4">
                {cart.products.map((item, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
                      {item.product_image ? (
                        <img 
                          src={item.product_image} 
                          alt="Product" 
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <div className="w-full h-full bg-slate-200 flex items-center justify-center">
                          <Package className="w-5 h-5 text-slate-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-slate-900 truncate">
                        Product #{item.product_id.toString().slice(-6)}
                      </div>
                      <div className="text-sm text-slate-600">
                        Qty: {item.quantity} × ${(item.finalPrice || item.price).toFixed(2)}
                      </div>
                    </div>
                    <div className="text-sm font-medium">
                      ${((item.finalPrice || item.price) * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
              <Separator />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pricing Summary */}
        <div className="space-y-2">
          <div className="flex justify-between text-slate-600">
            <span>Subtotal ({cart.products.length} items)</span>
            <span>${cart.discountInfo?.totalOriginalAmount?.toFixed(2) || cart.total.toFixed(2)}</span>
          </div>
          
          {cart.discountInfo?.hasDiscounts && (
            <div className="flex justify-between text-green-600">
              <span className="flex items-center space-x-1">
                <Gift className="w-4 h-4" />
                <span>Savings</span>
              </span>
              <span>-${cart.discountInfo.totalDiscountAmount.toFixed(2)}</span>
            </div>
          )}

          <div className="flex justify-between text-slate-600">
            <span>Shipping</span>
            <span className="text-green-600">FREE</span>
          </div>
        </div>

        <Separator />

        <div className="flex justify-between items-center text-xl font-bold text-slate-900">
          <span>Total</span>
          <span>${cart.total.toFixed(2)}</span>
        </div>
      </CardContent>
      
      <CardFooter className="border-t px-6 py-6">
        {paymentMethod === 'PAYPAL' && (
          <Button
            onClick={onPayPalSubmit}
            disabled={submitting}
            className="w-full relative overflow-hidden bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-6 text-lg shadow-lg hover:shadow-blue-500/30 transition-all"
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Shield className="w-5 h-5 mr-2" />
                <span>Continue with PayPal</span>
                <ExternalLink className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        )}

        {paymentMethod === 'WALLET_BALANCE' && (
          <Button
            onClick={onWalletSubmit}
            disabled={submitting || !canUseWallet}
            className="w-full relative overflow-hidden bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium py-6 text-lg shadow-lg hover:shadow-green-500/30 transition-all disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Wallet className="w-5 h-5 mr-2" />
                <span>Pay with Wallet - ${cart.total.toFixed(2)}</span>
              </>
            )}
          </Button>
        )}

        <div className="flex items-center justify-center space-x-2 text-sm text-slate-500 pt-4">
          <Lock className="w-4 h-4 text-indigo-500" />
          <span>Secure checkout protected by SSL encryption</span>
        </div>
      </CardFooter>
    </Card>
  );
};

// Skeleton, Success, Auth Required, and Empty Cart components remain the same as in the original
const CheckoutSkeleton = () => (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
    <div className="text-center">
      <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-indigo-600" />
      <p className="text-slate-600">Loading checkout...</p>
    </div>
  </div>
);

const OrderSuccess = () => (
  <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
    <Card className="max-w-md w-full text-center">
      <CardContent className="p-8">
        <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-600" />
        <h2 className="text-2xl font-bold text-green-600 mb-2">Order Placed!</h2>
        <p className="text-slate-600 mb-6">Your order has been successfully processed.</p>
        <Button className="w-full bg-green-600 hover:bg-green-700">
          View Order Details
        </Button>
      </CardContent>
    </Card>
  </div>
);

const AuthRequired = () => (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
    <Card className="max-w-md w-full text-center">
      <CardContent className="p-8">
        <Lock className="w-16 h-16 mx-auto mb-4 text-indigo-600" />
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Login Required</h2>
        <p className="text-slate-600 mb-6">Please login to continue with checkout.</p>
        <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
          Login to Continue
        </Button>
      </CardContent>
    </Card>
  </div>
);

const EmptyCartCheckout = () => (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
    <Card className="max-w-md w-full text-center">
      <CardContent className="p-8">
        <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-slate-400" />
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Cart is Empty</h2>
        <p className="text-slate-600 mb-6">Add some items to your cart to continue.</p>
        <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
          Browse Products
        </Button>
      </CardContent>
    </Card>
  </div>
);

export default PayPalCheckoutScreen;