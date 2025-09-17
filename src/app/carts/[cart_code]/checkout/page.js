"use client"
import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
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
import { Progress } from '@/components/ui/progress';
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
  Calendar,
  Edit,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Cookies from 'js-cookie';

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_your_publishable_key_here');

// Add this near the top of your file, after your imports but before the CheckoutScreen component
const serializeAddress = (addressObj) => {
  if (!addressObj) return '';
  
  // If it's already a string, return as is
  if (typeof addressObj === 'string') return addressObj;
  
  // Convert object to formatted string
  const parts = [];
  if (addressObj.full_name) parts.push(addressObj.full_name);
  if (addressObj.address1) parts.push(addressObj.address1);
  if (addressObj.address2) parts.push(addressObj.address2);
  if (addressObj.city) parts.push(addressObj.city);
  if (addressObj.state) parts.push(addressObj.state);
  if (addressObj.postal_code) parts.push(addressObj.postal_code);
  if (addressObj.country) parts.push(addressObj.country);
  
  return parts.join(', ');
};

const CheckoutScreen = () => {
  const [cartCode, setCartCode] = useState('');
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [orderCode, setOrderCode] = useState(null);
  const [deliveryType, setDeliveryType] = useState('INSTANT');
  const [scheduledDate, setScheduledDate] = useState('');
  
  const [formData, setFormData] = useState({
    payment_method: 'CARD',
    billing_address: null,
    shipping_address: null,
    special_instructions: '',
    same_as_billing: true
  });

    const [manualAddresses, setManualAddresses] = useState({
    billing: {
      full_name: '',
      address1: '',
      address2: '',
      city: '',
      state: '',
      postal_code: '',
      country: 'US',
      phone: '',
      email: ''
    },
    shipping: {
      full_name: '',
      address1: '',
      address2: '',
      city: '',
      state: '',
      postal_code: '',
      country: 'US',
      phone: '',
      email: ''
    }
  });

  const [showManualEntry, setShowManualEntry] = useState({
    billing: false,
    shipping: false
  });


  // 1. Add this helper function to serialize addresses
const serializeAddress = (addressObj) => {
  if (!addressObj) return '';
  
  // If it's already a string, return as is
  if (typeof addressObj === 'string') return addressObj;
  
  // Convert object to formatted string
  const parts = [];
  if (addressObj.full_name) parts.push(addressObj.full_name);
  if (addressObj.address1) parts.push(addressObj.address1);
  if (addressObj.address2) parts.push(addressObj.address2);
  if (addressObj.city) parts.push(addressObj.city);
  if (addressObj.state) parts.push(addressObj.state);
  if (addressObj.postal_code) parts.push(addressObj.postal_code);
  if (addressObj.country) parts.push(addressObj.country);
  
  return parts.join(', ');
};

// 2. Alternative: Send as JSON string (if your backend can parse JSON)
const serializeAddressAsJSON = (addressObj) => {
  if (!addressObj) return '';
  if (typeof addressObj === 'string') return addressObj;
  return JSON.stringify(addressObj);
};




// 1. Fix the toggleManualEntry function (this exists in your code but may not be accessible)
const toggleManualEntry = (type) => {
  setShowManualEntry(prev => ({
    ...prev,
    [type]: !prev[type]
  }));

  if (!showManualEntry[type]) {
    // When enabling manual entry, set form data to manual address
    const addressType = type === 'billing' ? 'billing_address' : 'shipping_address';
    setFormData(prev => ({
      ...prev,
      [addressType]: manualAddresses[type]
    }));
  }
};
  const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/api`;

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
    const cartCodeFromCookie = document.cookie
      .split(';')
      .find(cookie => cookie.trim().startsWith('cart_code='))
      ?.split('=')[1];
    
    if (!cartCodeFromCookie) {
      setError('Cart not found. Please add items to your cart first.');
      setLoading(false);
      return;
    }
    
    setCartCode(cartCodeFromCookie);
    
    if (token) {
      Promise.all([fetchUserProfile(token), fetchCart(cartCodeFromCookie)]);
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
        
        // Set default addresses if available
        if (userData.addresses && userData.addresses.length > 0) {
          const defaultAddress = userData.addresses[0];
          setFormData(prev => ({
            ...prev,
            billing_address: defaultAddress,
            shipping_address: defaultAddress
          }));
        } else {
          // If no saved addresses, enable manual entry and prefill with user info
          setShowManualEntry({ billing: true, shipping: true });
          setManualAddresses(prev => ({
            billing: {
              ...prev.billing,
              full_name: userData.full_name || '',
              email: userData.email || '',
              phone: userData.phone || ''
            },
            shipping: {
              ...prev.shipping,
              full_name: userData.full_name || '',
              email: userData.email || '',
              phone: userData.phone || ''
            }
          }));
        }
      } else {
        setError('Failed to fetch user profile. Please login again.');
      }
    } catch (err) {
      setError('Failed to load user profile. Please try again.');
    }
  };

  const fetchCart = async (cartCode) => {
    try {
      const response = await fetch(`${API_BASE_URL}/carts/code/${cartCode}`);
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

  const generateOrderCode = () => {
    return 'ORD-' + Math.random().toString(36).substr(2, 9).toUpperCase();
  };

  const handlePaymentMethodChange = (method) => {
    setFormData(prev => ({
      ...prev,
      payment_method: method
    }));
  };

  
// 2. Fixed handleManualAddressChange function
const handleManualAddressChange = (type, field, value) => {
  setManualAddresses(prev => ({
    ...prev,
    [type]: {
      ...prev[type],
      [field]: value
    }
  }));

  // Update form data with manual address
  const addressType = type === 'billing' ? 'billing_address' : 'shipping_address';
  setFormData(prev => ({
    ...prev,
    [addressType]: {
      ...prev[addressType],
      ...manualAddresses[type],
      [field]: value
    }
  }));
};


// 3. Fixed validateManualAddress function
const validateManualAddress = (address) => {
  if (!address) return false;
  
  const required = ['full_name', 'address1', 'city', 'state', 'postal_code', 'email'];
  return required.every(field => address[field] && address[field].trim() !== '');
};


const getAddressForSubmission = (type) => {
  if (type === 'billing') {
    return showManualEntry.billing ? manualAddresses.billing : formData.billing_address;
  } else {
    return formData.same_as_billing 
      ? (showManualEntry.billing ? manualAddresses.billing : formData.billing_address)
      : (showManualEntry.shipping ? manualAddresses.shipping : formData.shipping_address);
  }
};
  const handleAddressSelect = (type, address) => {
    setFormData(prev => ({
      ...prev,
      [type]: address,
      ...(type === 'billing_address' && prev.same_as_billing ? { shipping_address: address } : {})
    }));
  };

  const handleSameAsBilling = (checked) => {
    setFormData(prev => ({
      ...prev,
      same_as_billing: checked,
      shipping_address: checked ? prev.billing_address : prev.shipping_address
    }));

    if (checked) {
      // Copy billing to shipping for manual addresses
      if (showManualEntry.billing) {
        setManualAddresses(prev => ({
          ...prev,
          shipping: { ...prev.billing }
        }));
        setShowManualEntry(prev => ({ ...prev, shipping: true }));
      } else {
        setShowManualEntry(prev => ({ ...prev, shipping: false }));
      }
    }
  };

const validateForm = () => {
    if (!cartCode) {
      setError('Cart code is required');
      return false;
    }

    // Validate billing address
    if (showManualEntry.billing) {
      if (!validateManualAddress(manualAddresses.billing)) {
        setError('Please fill in all required billing address fields');
        return false;
      }
    } else if (!formData.billing_address) {
      setError('Please select a billing address');
      return false;
    }

    // Validate shipping address
    if (!formData.same_as_billing) {
      if (showManualEntry.shipping) {
        if (!validateManualAddress(manualAddresses.shipping)) {
          setError('Please fill in all required shipping address fields');
          return false;
        }
      } else if (!formData.shipping_address) {
        setError('Please select a shipping address');
        return false;
      }
    }

    // Validate scheduled delivery date and time
    if (deliveryType === 'SCHEDULE_DELIVERY') {
      if (!scheduledDate) {
        setError('Please select a delivery date and time');
        return false;
      }
      
      const selectedDateTime = new Date(scheduledDate);
      const now = new Date();
      
      if (selectedDateTime <= now) {
        setError('Please select a future date and time for delivery');
        return false;
      }
    }

    // Check wallet balance if using wallet payment
    if (formData.payment_method === 'WALLET_BALANCE' && user.wallet_balance < cart.total) {
      setError('Insufficient wallet balance');
      return false;
    }

    return true;
  };


// 4. Update your handlePayPalPayment function
const handlePayPalPayment = async () => {
  setError(null);
  
  if (!validateForm()) {
    return;
  }

  setSubmitting(true);
  const newOrderCode = generateOrderCode();
  setOrderCode(newOrderCode);

  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication token not found');
    }

    const billingAddress = getAddressForSubmission('billing');
    const shippingAddress = getAddressForSubmission('shipping');

    const requestBody = {
      order_code: newOrderCode,
      amount: cart.total,
      items: cart.products.map(item => ({
        name: item.product_name || `Product #${item.product_id.slice(-6)}`,
        price: item.finalPrice,
        quantity: item.quantity,
        sku: item.product_id
      })),
      // Serialize addresses to strings
      billing_address: serializeAddress(billingAddress),
      shipping_address: serializeAddress(shippingAddress),
      cart_code: cartCode,
      return_url: "http://localhost:3000/",
      cancel_url: "http://localhost:3000/paypal/cancel",
      delivery_type: deliveryType
    };

    if (deliveryType === 'SCHEDULE_DELIVERY') {
      requestBody.schedule = scheduledDate;
    }

    const paypalResponse = await fetch(`${API_BASE_URL}/paypal/create-payment`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const paypalData = await paypalResponse.json();
    
    if (paypalData.success && paypalData.data.approval_url) {
      if (paypalData.new_cart_code) {
        Cookies.set("cart_code", paypalData.new_cart_code.cart_code, { expires: 7 });
      }
      window.location.href = paypalData.data.approval_url;
    } else {
      throw new Error(paypalData.message || 'Failed to create PayPal payment');
    }
  } catch (err) {
    setError(err.message || 'Failed to process PayPal payment. Please try again.');
    setSubmitting(false);
  }
};


// 3. Update your handleSubmit function (for wallet/regular orders)
const handleSubmit = async () => {
  setError(null);
  
  if (!validateForm()) {
    return;
  }

  setSubmitting(true);
  const newOrderCode = generateOrderCode();
  setOrderCode(newOrderCode);

  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication token not found');
    }

    const billingAddress = getAddressForSubmission('billing');
    const shippingAddress = getAddressForSubmission('shipping');

    const orderData = {
      order_code: newOrderCode,
      cart_code: cartCode,
      payment_method: formData.payment_method,
      // Serialize addresses to strings
      billing_address: serializeAddress(billingAddress),
      shipping_address: serializeAddress(shippingAddress),
      special_instructions: formData.special_instructions || 'No special instructions',
      delivery_type: deliveryType
    };

    if (deliveryType === 'SCHEDULE_DELIVERY') {
      orderData.schedule = scheduledDate;
    }

    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });

    const data = await response.json();
    
    if (data.success) {
      if (data.new_cart_code) {
        Cookies.set("cart_code", data.new_cart_code, { expires: 7 }); 
      }

      setSuccess(true);
      
      if (formData.payment_method === 'WALLET_BALANCE') {
        await fetchUserProfile(token);
      }
    } else {
      setError(data.message || 'Failed to create order');
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
    return (
      <OrderSuccess 
        orderCode={orderCode} 
        deliveryType={deliveryType} 
        scheduledDate={scheduledDate}
      />
    );
  }

  if (!user) {
    return <AuthRequired />;
  }

  if (!cart || !cart.products || cart.products.length === 0) {
    return <EmptyCartCheckout />;
  }

  const canUseWallet = user.wallet_balance >= cart.total;

  return (
    <Elements stripe={stripePromise}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-50 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-20">
              <div className="flex items-center space-x-4">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => window.history.back()}
                  className="hover:bg-slate-100 text-slate-700"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Cart
                </Button>
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <Shield className="w-6 h-6 text-indigo-600" />
                  </div>
                  <h1 className="text-2xl font-bold text-slate-800">Secure Checkout</h1>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="text-sm font-medium px-3 py-1">
                  Welcome, {user.full_name}
                </Badge>
                <Badge variant="default" className="text-sm font-medium px-3 py-1 bg-indigo-600">
                  Cart #{cartCode.slice(0, 6)}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Checkout Form */}
            <div className="lg:col-span-2 space-y-6">
              <Progress value={66} className="h-2 bg-slate-200" indicatorClassName="bg-indigo-600" />
              
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

              {/* Delivery Options Section */}
              <DeliveryOptionsSection 
                deliveryType={deliveryType}
                setDeliveryType={setDeliveryType}
                scheduledDate={scheduledDate}
                setScheduledDate={setScheduledDate}
              />

              {/* Payment Method Section */}
              <PaymentMethodSection 
                selectedMethod={formData.payment_method}
                onMethodChange={handlePaymentMethodChange}
                user={user}
                canUseWallet={canUseWallet}
                orderTotal={cart.total}
                formData={formData}
                cart={cart}
                cartCode={cartCode}
                setError={setError}
                setSuccess={setSuccess}
                setOrderCode={setOrderCode}
                generateOrderCode={generateOrderCode}
                getAuthToken={getAuthToken}
                API_BASE_URL={API_BASE_URL}
                fetchUserProfile={fetchUserProfile}
                deliveryType={deliveryType}
                scheduledDate={scheduledDate}
              />

              {/* Billing Address Section */}
             <AddressSelection 
      addresses={user.addresses} 
      selectedAddress={formData.billing_address}
      onAddressSelect={(address) => handleAddressSelect('billing_address', address)}
      userInfo={user}
      showManualEntry={showManualEntry}
      toggleManualEntry={toggleManualEntry}
      manualAddress={manualAddresses.billing}
      onManualAddressChange={handleManualAddressChange}
      type="billing"
    />

              {/* Shipping Address Section */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2">
                      <Truck className="w-5 h-5 text-indigo-600" />
                      <span>Shipping Address</span>
                    </CardTitle>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.same_as_billing}
                        onChange={(e) => handleSameAsBilling(e.target.checked)}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-sm text-slate-600">Same as billing</span>
                    </label>
                  </div>
                </CardHeader>
                {!formData.same_as_billing && (
                  <CardContent>
                    <AddressSelection 
      addresses={user.addresses} 
      selectedAddress={formData.billing_address}
      onAddressSelect={(address) => handleAddressSelect('billing_address', address)}
      userInfo={user}
      showManualEntry={showManualEntry}
      toggleManualEntry={toggleManualEntry}
      manualAddress={manualAddresses.billing}
      onManualAddressChange={handleManualAddressChange}
      type="billing"
    />
                  </CardContent>
                )}
                {formData.same_as_billing && formData.billing_address && (
                  <CardContent>
                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="flex items-center space-x-2 text-sm text-slate-600 mb-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span>Using billing address for shipping</span>
                      </div>
                      <AddressDisplay address={formData.billing_address} />
                    </div>
                  </CardContent>
                )}
              </Card>

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
                    placeholder="Any special delivery instructions or notes for your order..."
                    value={formData.special_instructions}
                    onChange={(e) => setFormData(prev => ({ ...prev, special_instructions: e.target.value }))}
                    className="min-h-[100px]"
                  />
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <OrderSummaryCheckout 
                cart={cart} 
                paymentMethod={formData.payment_method}
                onSubmit={formData.payment_method === 'PAYPAL' ? handlePayPalPayment : handleSubmit}
                submitting={submitting}
                deliveryType={deliveryType}
                scheduledDate={scheduledDate}
              />
            </div>
          </div>
        </div>
      </div>
    </Elements>
  );
};

// Fixed ManualAddressForm Component
const ManualAddressForm = ({ address, onAddressChange, title, required = [] }) => {
  // Add safety check for address object
  const safeAddress = address || {};
  
  const fields = [
    { name: 'full_name', label: 'Full Name', type: 'text', required: true },
    { name: 'email', label: 'Email', type: 'email', required: true },
    { name: 'phone', label: 'Phone Number', type: 'tel', required: false },
    { name: 'address1', label: 'Address Line 1', type: 'text', required: true },
    { name: 'address2', label: 'Address Line 2', type: 'text', required: false },
    { name: 'city', label: 'City', type: 'text', required: true },
    { name: 'state', label: 'State/Province', type: 'text', required: true },
    { name: 'postal_code', label: 'ZIP/Postal Code', type: 'text', required: true },
  ];

  return (
    <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-4">
      <div className="flex items-center space-x-2 mb-4">
        <Edit className="w-4 h-4 text-indigo-600" />
        <span className="font-medium text-slate-900">{title}</span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fields.map((field) => (
          <div key={field.name} className={field.name === 'address1' || field.name === 'address2' ? 'md:col-span-2' : ''}>
            <Label className="text-sm font-medium text-slate-700">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Input
              type={field.type}
              value={safeAddress[field.name] || ''}
              onChange={(e) => onAddressChange && onAddressChange(field.name, e.target.value)}
              placeholder={`Enter ${field.label.toLowerCase()}`}
              className="mt-1"
              required={field.required}
            />
          </div>
        ))}
        
        <div>
          <Label className="text-sm font-medium text-slate-700">Country</Label>
          <select
            value={safeAddress.country || 'US'}
            onChange={(e) => onAddressChange && onAddressChange('country', e.target.value)}
            className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="US">United States</option>
            <option value="CA">Canada</option>
            <option value="MX">Mexico</option>
            <option value="GB">United Kingdom</option>
            <option value="DE">Germany</option>
            <option value="FR">France</option>
          </select>
        </div>
      </div>
    </div>
  );
};
// New Delivery Options Component
const DeliveryOptionsSection = ({ deliveryType, setDeliveryType, scheduledDate, setScheduledDate }) => {
  // Get minimum date and time (tomorrow at current time)
  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    // Format for datetime-local input (YYYY-MM-DDTHH:MM)
    return tomorrow.toISOString().slice(0, 16);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Truck className="w-5 h-5 text-indigo-600" />
          <span>Delivery Options</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Instant Delivery Option */}
          <div
            className={`border rounded-lg p-4 cursor-pointer transition-all ${
              deliveryType === 'INSTANT'
                ? 'border-indigo-500 bg-indigo-50'
                : 'border-slate-200 hover:border-slate-300'
            }`}
            onClick={() => setDeliveryType('INSTANT')}
          >
            <div className="flex items-center space-x-3">
              <input
                type="radio"
                checked={deliveryType === 'INSTANT'}
                onChange={() => setDeliveryType('INSTANT')}
                className="text-indigo-600 focus:ring-indigo-500"
              />
              <div className="text-indigo-600">
                <Zap className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-slate-900">Standard Delivery</div>
                <div className="text-sm text-slate-600">Get your order delivered within 2-3 business days</div>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Standard
              </Badge>
            </div>
          </div>

          {/* Scheduled Delivery Option */}
          <div
            className={`border rounded-lg p-4 cursor-pointer transition-all ${
              deliveryType === 'SCHEDULE_DELIVERY'
                ? 'border-indigo-500 bg-indigo-50'
                : 'border-slate-200 hover:border-slate-300'
            }`}
            onClick={() => setDeliveryType('SCHEDULE_DELIVERY')}
          >
            <div className="flex items-center space-x-3">
              <input
                type="radio"
                checked={deliveryType === 'SCHEDULE_DELIVERY'}
                onChange={() => setDeliveryType('SCHEDULE_DELIVERY')}
                className="text-indigo-600 focus:ring-indigo-500"
              />
              <div className="text-indigo-600">
                <Calendar className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-slate-900">Schedule Delivery</div>
                <div className="text-sm text-slate-600">Choose a specific date for delivery</div>
              </div>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                Flexible
              </Badge>
            </div>
          </div>

          {/* Date and Time Picker for Scheduled Delivery */}
          {deliveryType === 'SCHEDULE_DELIVERY' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="mt-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                <Label className="text-sm font-medium text-slate-700 mb-2 block">
                  Select Delivery Date & Time
                </Label>
                <Input
                  type="datetime-local"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  min={getMinDate()}
                  className="w-full"
                  required
                />
                <p className="text-xs text-slate-500 mt-1">
                  Delivery will be scheduled for the selected date and time
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Stripe Payment Form Component (Updated without Lalamove)
const StripePaymentForm = ({ 
  formData, 
  cart, 
  cartCode, 
  setError, 
  setSuccess, 
  setOrderCode, 
  generateOrderCode, 
  getAuthToken, 
  API_BASE_URL,
  fetchUserProfile,
  deliveryType,
  scheduledDate
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [saveCard, setSaveCard] = useState(false);

// 5. Update the StripePaymentForm's handleStripePayment function
const handleStripePayment = async (e) => {
  e.preventDefault();
  setError(null);

  if (!stripe || !elements) {
    setError('Stripe has not loaded yet. Please try again.');
    return;
  }

  const cardElement = elements.getElement(CardElement);
  if (!cardElement) {
    setError('Card element not found. Please refresh the page.');
    return;
  }

  setProcessing(true);
  const newOrderCode = generateOrderCode();
  setOrderCode(newOrderCode);

  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication token not found');
    }

    const billingAddress = formData.billing_address;
    const shippingAddress = formData.same_as_billing 
      ? billingAddress
      : formData.shipping_address;

    const requestBody = {
      order_code: newOrderCode,
      cart_code: cartCode,
      // Serialize addresses to strings
      billing_address: serializeAddress(billingAddress),
      shipping_address: serializeAddress(shippingAddress),
      special_instructions: formData.special_instructions || 'No special instructions',
      delivery_type: deliveryType
    };

    if (deliveryType === 'SCHEDULE_DELIVERY') {
      requestBody.schedule = scheduledDate;
    }

    // Create payment intent
    const paymentIntentResponse = await fetch(`${API_BASE_URL}/stripe/create-payment-intent`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const paymentIntentData = await paymentIntentResponse.json();
    
    if (!paymentIntentData.success) {
      throw new Error(paymentIntentData.message || 'Failed to create payment intent');
    }

    // Confirm payment with Stripe
    const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
      paymentIntentData.data.client_secret,
      {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: formData.billing_address?.full_name || 'Customer',
            email: formData.billing_address?.email,
            phone: formData.billing_address?.phone,
            address: {
              line1: formData.billing_address?.address1,
              line2: formData.billing_address?.address2,
              city: formData.billing_address?.city,
              state: formData.billing_address?.state,
              postal_code: formData.billing_address?.postal_code,
              country: formData.billing_address?.country || 'US',
            },
          },
        },
        setup_future_usage: saveCard ? 'off_session' : undefined,
      }
    );

    if (stripeError) {
      throw new Error(stripeError.message);
    }

    if (paymentIntent.status === 'succeeded') {
      const confirmRequestBody = {
        payment_intent_id: paymentIntent.id,
        order_code: newOrderCode,
        cart_code: cartCode,
        // Serialize addresses to strings
        billing_address: serializeAddress(billingAddress),
        shipping_address: serializeAddress(shippingAddress),
        special_instructions: formData.special_instructions || 'No special instructions',
        delivery_type: deliveryType
      };

      if (deliveryType === 'SCHEDULE_DELIVERY') {
        confirmRequestBody.schedule = scheduledDate;
      }

      // Confirm payment with backend and create order
      const confirmResponse = await fetch(`${API_BASE_URL}/stripe/confirm-payment`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(confirmRequestBody),
      });

      const confirmData = await confirmResponse.json();
      
      if (confirmData.success) {
        if (confirmData.new_cart_code) {
          Cookies.set("cart_code", confirmData.new_cart_code.cart_code, { expires: 7 });
        }
        
        if (saveCard && paymentIntent.payment_method) {
          try {
            await fetch(`${API_BASE_URL}/stripe/save-payment-method`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                payment_method_id: paymentIntent.payment_method
              }),
            });
          } catch (saveError) {
            console.warn('Failed to save payment method:', saveError);
          }
        }

        setSuccess(true);
      } else {
        throw new Error(confirmData.message || 'Failed to create order');
      }
    } else {
      throw new Error('Payment was not completed successfully');
    }

  } catch (err) {
    setError(err.message || 'Failed to process payment. Please try again.');
  } finally {
    setProcessing(false);
  }
};

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#1e293b',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif',
        '::placeholder': {
          color: '#64748b',
        },
        iconColor: '#6366f1',
      },
      invalid: {
        color: '#dc2626',
        iconColor: '#dc2626',
      },
    },
    hidePostalCode: false,
  };

  return (
    <div className="mt-4 space-y-4">
      <div className="p-4 border border-slate-200 rounded-lg bg-white">
        <Label className="text-sm font-medium text-slate-700 mb-3 block">
          Card Information
        </Label>
        <div className="p-3 border border-slate-200 rounded-md bg-slate-50">
          <CardElement options={cardElementOptions} />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="save-card"
          checked={saveCard}
          onChange={(e) => setSaveCard(e.target.checked)}
          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
        />
        <label htmlFor="save-card" className="text-sm text-slate-600 cursor-pointer">
          Save this card for future purchases
        </label>
      </div>

      <Button
        onClick={handleStripePayment}
        disabled={!stripe || processing}
        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium py-3 text-lg"
      >
        {processing ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Processing Payment...
          </>
        ) : (
          <>
            <Lock className="w-5 h-5 mr-2" />
            Pay ${cart.total.toFixed(2)} Securely
          </>
        )}
      </Button>

      <div className="flex items-center justify-center space-x-2 text-xs text-slate-500 pt-2">
        <Shield className="w-4 h-4 text-indigo-500" />
        <span>Secured by Stripe • PCI DSS compliant</span>
      </div>
    </div>
  );
};

const PaymentMethodSection = ({ 
  selectedMethod, 
  onMethodChange, 
  user, 
  canUseWallet, 
  orderTotal,
  formData,
  cart,
  cartCode,
  setError,
  setSuccess,
  setOrderCode,
  generateOrderCode,
  getAuthToken,
  API_BASE_URL,
  fetchUserProfile,
  deliveryType,
  scheduledDate
}) => {
  const paymentMethods = [
    {
      id: 'CARD',
      name: 'Credit/Debit Card',
      icon: <CreditCard className="w-5 h-5" />,
      description: 'Visa, Mastercard, American Express',
      available: true,
      details: (
        <StripePaymentForm 
          formData={formData}
          cart={cart}
          cartCode={cartCode}
          setError={setError}
          setSuccess={setSuccess}
          setOrderCode={setOrderCode}
          generateOrderCode={generateOrderCode}
          getAuthToken={getAuthToken}
          API_BASE_URL={API_BASE_URL}
          fetchUserProfile={fetchUserProfile}
          deliveryType={deliveryType}
          scheduledDate={scheduledDate}
        />
      )
    },
    {
      id: 'PAYPAL',
      name: 'PayPal',
      icon: <Shield className="w-5 h-5" />,
      description: 'Pay with your PayPal account',
      available: true,
      details: (
        <div className="mt-4 p-4 bg-slate-50 rounded-lg text-center">
          <p className="text-sm text-slate-600 mb-2">You will be redirected to PayPal to complete your payment</p>
        </div>
      )
    },
    {
      id: 'WALLET_BALANCE',
      name: 'Wallet Balance',
      icon: <Wallet className="w-5 h-5" />,
      description: `Available: ${user.wallet_balance.toFixed(2)}`,
      available: canUseWallet,
      details: (
        <div className="mt-4 p-4 bg-green-50 rounded-lg text-sm text-green-800">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4" />
            <span>Your wallet balance covers this purchase</span>
          </div>
        </div>
      )
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Lock className="w-5 h-5 text-indigo-600" />
          <span>Payment Method</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {paymentMethods.map((method) => (
            <div key={method.id}>
              <div
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
                    <div className="font-medium text-slate-900">{method.name}</div>
                    <div className="text-sm text-slate-600">{method.description}</div>
                    {method.id === 'WALLET_BALANCE' && !canUseWallet && (
                      <div className="text-sm text-red-600 mt-1">
                        Insufficient funds (need ${(orderTotal - user.wallet_balance).toFixed(2)} more)
                      </div>
                    )}
                  </div>
                  <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${
                    selectedMethod === method.id ? 'rotate-180' : ''
                  }`} />
                </div>
              </div>
              
              {selectedMethod === method.id && method.details && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  {method.details}
                </motion.div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// 1. Update the AddressSelectionSection component to receive user as a prop
const AddressSelectionSection = ({ 
  title, 
  icon, 
  addresses, 
  selectedAddress, 
  onAddressSelect, 
  userInfo,  // This should be the user object
  showManualEntry, 
  toggleManualEntry, 
  manualAddress, 
  onManualAddressChange,
  type = 'billing'
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          {icon}
          <span>{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <AddressSelection 
          addresses={addresses} 
          selectedAddress={selectedAddress}
          onAddressSelect={onAddressSelect}
          userInfo={userInfo}  // Pass userInfo instead of user
          showManualEntry={showManualEntry}
          toggleManualEntry={toggleManualEntry}
          manualAddress={manualAddress}
          onManualAddressChange={onManualAddressChange}
          type={type}
        />
      </CardContent>
    </Card>
  );
};

// 2. Fix the AddressSelection component to use the correct variable names
const AddressSelection = ({ 
  addresses, 
  selectedAddress, 
  onAddressSelect, 
  userInfo,  // Use userInfo instead of user
  showManualEntry, 
  toggleManualEntry, 
  manualAddress, 
  onManualAddressChange,
  type = 'billing'
}) => {
  const hasAddresses = addresses && addresses.length > 0;

  return (
    <div className="space-y-4">
      {/* Saved Addresses */}
      {hasAddresses && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-slate-700 flex items-center space-x-2">
            <Building className="w-4 h-4 text-indigo-600" />
            <span>Saved Addresses</span>
          </h4>
          {addresses.map((address, index) => (
            <div
              key={index}
              className={`border rounded-lg p-4 cursor-pointer transition-all ${
                selectedAddress === address && !showManualEntry?.[type]
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
              onClick={() => onAddressSelect(address)}
            >
              <div className="flex items-start space-x-3">
                <input
                  type="radio"
                  checked={selectedAddress === address && !showManualEntry?.[type]}
                  onChange={() => onAddressSelect(address)}
                  className="mt-1 text-indigo-600 focus:ring-indigo-500"
                />
                <div className="flex-1">
                  <AddressDisplay address={address} />
                  {index === 0 && (
                    <Badge variant="secondary" className="mt-2 text-xs">Default</Badge>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Manual Address Entry Section */}
      <div className="space-y-3">
        {hasAddresses && <Separator />}
        
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-slate-700 flex items-center space-x-2">
            <Edit className="w-4 h-4 text-indigo-600" />
            <span>{hasAddresses ? 'Or Enter New Address' : 'Enter Address'}</span>
          </h4>
          {hasAddresses && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleManualEntry && toggleManualEntry(type)}
              className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
            >
              {showManualEntry?.[type] ? 'Use Saved Address' : 'Enter Manually'}
            </Button>
          )}
        </div>
        
        {(showManualEntry?.[type] || !hasAddresses) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <ManualAddressForm
              address={manualAddress}
              onAddressChange={(field, value) => onManualAddressChange && onManualAddressChange(type, field, value)}
              title="Address Details"
            />
          </motion.div>
        )}
      </div>
      
      {/* Add New Address Button for when addresses exist but manual entry is not shown */}
      {hasAddresses && !showManualEntry?.[type] && (
        <Button 
          variant="outline" 
          className="w-full" 
          onClick={() => toggleManualEntry && toggleManualEntry(type)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add New Address
        </Button>
      )}
    </div>
  );
};

const AddressDisplay = ({ address }) => {
  // Handle different address formats (string or object)
  if (typeof address === 'string') {
    return <div className="text-sm text-slate-700">{address}</div>;
  }

  return (
    <div className="text-sm">
      <div className="font-medium text-slate-900">{address.field || address.full_name}</div>
      <div className="text-slate-700">{address.address1}</div>
      {address.address2 && <div className="text-slate-700">{address.address2}</div>}
      <div className="text-slate-700">{address.city}, {address.state} {address.postal_code}</div>
      <div className="text-slate-700">{address.country}</div>
      {address.phone && <div className="text-slate-600">{address.phone}</div>}
    </div>
  );
};
const OrderSummaryCheckout = ({ cart, paymentMethod, onSubmit, submitting, deliveryType, scheduledDate }) => {
  const [showItems, setShowItems] = useState(true);

  // Don't show the place order button for Stripe payments (handled in StripePaymentForm)
  const showPlaceOrderButton = paymentMethod !== 'CARD';

  const getButtonText = () => {
    if (submitting) {
      return 'Processing...';
    }
    
    if (paymentMethod === 'PAYPAL') {
      return 'Continue with PayPal';
    }
    
    if (deliveryType === 'INSTANT') {
      return `Place Order - $${cart.total.toFixed(2)}`;
    } else {
      return `Schedule Delivery - $${cart.total.toFixed(2)}`;
    }
  };

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
            {showItems ? 'Hide' : 'Show'}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Delivery Info */}
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
          <div className="flex items-center space-x-2 text-sm">
            {deliveryType === 'INSTANT' ? (
              <>
                <Zap className="w-4 h-4 text-green-600" />
                <span className="font-medium text-slate-900">Standard Delivery</span>
              </>
            ) : (
              <>
                <Calendar className="w-4 h-4 text-blue-600" />
                <span className="font-medium text-slate-900">Scheduled for {scheduledDate}</span>
              </>
            )}
          </div>
        </div>

        {/* Items */}
        {showItems && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="space-y-3">
              {cart.products.map((item) => (
                <div key={item.product_id} className="flex items-center space-x-3">
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
                      {item.product_name || `Product #${item.product_id.slice(-6)}`}
                    </div>
                    <div className="text-sm text-slate-600">
                      Qty: {item.quantity} × ${item.finalPrice.toFixed(2)}
                    </div>
                  </div>
                  <div className="text-sm font-medium">
                    ${(item.finalPrice * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
            <Separator className="my-4" />
          </motion.div>
        )}

        {/* Pricing */}
        <div className="space-y-2">
          <div className="flex justify-between text-slate-600">
            <span>Subtotal</span>
            <span>${cart.discountInfo?.totalOriginalAmount?.toFixed(2) || '0.00'}</span>
          </div>
          
          {cart.discountInfo?.hasDiscounts && (
            <div className="flex justify-between text-green-600">
              <span className="flex items-center space-x-1">
                <Gift className="w-4 h-4" />
                <span>Discounts</span>
              </span>
              <span>-${cart.discountInfo.totalDiscountAmount.toFixed(2)}</span>
            </div>
          )}

          <div className="flex justify-between text-slate-600">
            <span>Shipping</span>
            <span>Calculated at delivery</span>
          </div>

          <div className="flex justify-between text-slate-600">
            <span>Tax</span>
            <span>Will be calculated</span>
          </div>
        </div>

        <Separator className="my-4" />

        <div className="flex justify-between items-center text-xl font-bold text-slate-900">
          <span>Estimated Total</span>
          <span>${cart.total.toFixed(2)}</span>
        </div>

        {/* Security */}
        <div className="flex items-center justify-center space-x-2 text-sm text-slate-500 pt-4">
          <Lock className="w-4 h-4 text-indigo-500" />
          <span>256-bit SSL encryption</span>
        </div>
      </CardContent>
      
      {/* Place Order Button - Only for non-Stripe payments */}
      {showPlaceOrderButton && (
        <CardFooter className="border-t px-6 py-6">
          <Button
            onClick={onSubmit}
            disabled={submitting}
            className="w-full relative overflow-hidden bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium py-6 text-lg shadow-lg hover:shadow-indigo-500/30 transition-all"
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                <span>Processing...</span>
                <span className="absolute inset-0 bg-white/10"></span>
              </>
            ) : (
              <>
                {deliveryType === 'INSTANT' ? (
                  <Package className="w-5 h-5 mr-2" />
                ) : paymentMethod === 'PAYPAL' ? (
                  <Shield className="w-5 h-5 mr-2" />
                ) : (
                  <Calendar className="w-5 h-5 mr-2" />
                )}
                <span>{getButtonText()}</span>
              </>
            )}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

const OrderSuccess = ({ orderCode, deliveryType, scheduledDate }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="max-w-md w-full text-center overflow-hidden border-0 shadow-xl">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white">
            <CheckCircle className="w-16 h-16 mx-auto mb-4" />
            <h2 className="text-2xl font-bold">Order Confirmed!</h2>
            {orderCode && (
              <Badge variant="secondary" className="mt-2 bg-white/20 text-white">
                Order #{orderCode}
              </Badge>
            )}
          </div>
          <CardContent className="p-8">
            <p className="text-slate-600 mb-4">
              Thank you for your purchase. A confirmation email with your order details has been sent to your email address.
            </p>
            
            {/* Delivery Information */}
            <div className="space-y-3 mb-6">
              <div className="p-4 bg-slate-50 rounded-lg">
                <div className="flex items-center justify-center space-x-2">
                  {deliveryType === 'INSTANT' ? (
                    <>
                      <Package className="w-5 h-5 text-green-600" />
                      <span className="font-medium text-slate-900">Standard Delivery</span>
                    </>
                  ) : (
                    <>
                      <Calendar className="w-5 h-5 text-blue-600" />
                      <span className="font-medium text-slate-900">Scheduled for {scheduledDate}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <Link href="/">
                <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

const AuthRequired = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="max-w-md w-full text-center overflow-hidden border-0 shadow-sm">
          <div className="bg-indigo-100 p-6">
            <Lock className="w-16 h-16 mx-auto text-indigo-600" />
          </div>
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Login Required</h2>
            <p className="text-slate-600 mb-6">
              Please login to your account to continue with the checkout process.
            </p>
            <div className="space-y-3">
              <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
                Login to Continue
              </Button>
              <Button variant="outline" className="w-full">
                Create Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

const EmptyCartCheckout = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="max-w-md w-full text-center overflow-hidden border-0 shadow-sm">
          <div className="bg-slate-100 p-6">
            <AlertTriangle className="w-16 h-16 mx-auto text-slate-400" />
          </div>
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Your Cart is Empty</h2>
            <p className="text-slate-600 mb-6">
              It looks like you haven't added any items to your cart yet. Start shopping to continue.
            </p>
            <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
              Browse Products
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

const CheckoutSkeleton = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-2 bg-slate-200 rounded-full w-full"></div>
            
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="animate-pulse space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="h-6 w-6 bg-slate-200 rounded-full"></div>
                      <div className="h-6 bg-slate-200 rounded w-1/3"></div>
                    </div>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="h-10 bg-slate-200 rounded"></div>
                        <div className="h-10 bg-slate-200 rounded"></div>
                      </div>
                      <div className="h-10 bg-slate-200 rounded"></div>
                      <div className="h-10 bg-slate-200 rounded"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-6">
                  <div className="flex items-center space-x-3">
                    <div className="h-6 w-6 bg-slate-200 rounded-full"></div>
                    <div className="h-6 bg-slate-200 rounded w-1/2"></div>
                  </div>
                  
                  <div className="space-y-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="flex justify-between">
                        <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                        <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="h-px bg-slate-200"></div>
                  
                  <div className="flex justify-between">
                    <div className="h-6 bg-slate-200 rounded w-1/3"></div>
                    <div className="h-6 bg-slate-200 rounded w-1/4"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutScreen;