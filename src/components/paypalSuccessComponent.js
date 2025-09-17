"use client"
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../context/authContext";
import Cookies from "js-cookie";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  CheckCircle, 
  Loader2, 
  AlertCircle,
  Download,
  ShoppingBag,
  Home,
  Receipt,
  Package,
  Truck,
  Clock,
  User,
  Mail,
  MapPin
} from "lucide-react";
import Link from 'next/link';

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api`;

export default function PayPalSuccess() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [order, setOrder] = useState(null);
  const [paymentExecuted, setPaymentExecuted] = useState(false);

  useEffect(() => {
    const paymentId = searchParams.get('paymentId') || searchParams.get('token');
    const PayerID = searchParams.get('PayerID');
    const orderCode = searchParams.get('order_code');

    if (paymentId && PayerID && !paymentExecuted) {
      executePayment(paymentId, PayerID, orderCode);
    } else if (!paymentId || !PayerID) {
      setError("Missing payment information. Please try again.");
      setLoading(false);
    }
  }, [searchParams, paymentExecuted]);

  const executePayment = async (paymentId, PayerID, orderCode) => {
    try {
      setLoading(true);
      setError("");
      
      const token = Cookies.get('token');
      if (!token) {
        router.push("/auth");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/paypal/execute-payment`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          payment_id: paymentId,
          payer_id: PayerID,
          order_code: orderCode
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to execute payment');
      }

      const data = await response.json();
      setOrder(data.data.order);
      setPaymentExecuted(true);

    } catch (err) {
      setError(err.message);
      console.error('Payment execution error:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateInvoice = async () => {
    if (!order) return;

    try {
      setLoading(true);
      const token = Cookies.get('token');
      
      const response = await fetch(`${API_BASE_URL}/orders/${order.order_code}/generate_invoice`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to generate invoice');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `invoice-${order.order_code}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);

    } catch (err) {
      setError("Failed to download invoice");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "paid": return "bg-green-100 text-green-800";
      case "processing": return "bg-blue-100 text-blue-800";
      case "shipped": return "bg-purple-100 text-purple-800";
      case "delivered": return "bg-emerald-100 text-emerald-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading && !order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardContent className="p-8 text-center">
            <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-blue-600" />
            <h2 className="text-xl font-semibold mb-2">Processing Payment</h2>
            <p className="text-gray-600">Please wait while we confirm your PayPal payment...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {error ? (
          <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
            <CardContent className="p-8 text-center">
              <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
              <h1 className="text-2xl font-bold text-red-600 mb-4">Payment Failed</h1>
              <Alert className="mb-6 border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">{error}</AlertDescription>
              </Alert>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={() => router.push("/cart")}
                  variant="outline"
                >
                  Return to Cart
                </Button>
                <Link href="/">
                  <Button className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
                    <Home className="w-4 h-4 mr-2" />
                    Go Home
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : order ? (
          <div className="space-y-6">
            {/* Success Header */}
            <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
              <CardContent className="p-8 text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-12 h-12 text-green-600" />
                </div>
                <h1 className="text-3xl font-bold text-green-600 mb-2">Payment Successful!</h1>
                <p className="text-lg text-gray-600 mb-4">
                  Your PayPal payment has been processed successfully.
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  <Badge className="text-base px-4 py-2 bg-blue-100 text-blue-800">
                    Order #{order.order_code}
                  </Badge>
                  <Badge className={`text-base px-4 py-2 ${getStatusColor(order.status)}`}>
                    <Package className="w-4 h-4 mr-1" />
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Order Details */}
            <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Receipt className="w-5 h-5 text-blue-600" />
                  <span>Order Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Customer & Payment Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <User className="w-4 h-4 mr-2 text-blue-600" />
                        Customer Information
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Name:</span>
                          <span className="font-medium">{order.user.full_name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Email:</span>
                          <span className="font-medium">{order.user.email}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Username:</span>
                          <span className="font-medium">@{order.user.username}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <Receipt className="w-4 h-4 mr-2 text-blue-600" />
                        Payment Information
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Method:</span>
                          <span className="font-medium">PayPal</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Amount:</span>
                          <span className="font-medium text-green-600">${order.total.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Status:</span>
                          <Badge className="bg-green-100 text-green-800 text-xs">
                            Paid
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Date:</span>
                          <span className="font-medium">{formatDate(order.createdAt)}</span>
                        </div>
                        {order.paypal_payment_details?.payment_id && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Transaction ID:</span>
                            <span className="font-medium text-xs">{order.paypal_payment_details.payment_id.slice(-8)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Shipping Information */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <MapPin className="w-4 h-4 mr-2 text-blue-600" />
                    Shipping Information
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Billing Address</h4>
                        <p className="text-sm text-gray-600">{order.billing_address}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Shipping Address</h4>
                        <p className="text-sm text-gray-600">{order.shipping_address}</p>
                      </div>
                    </div>
                    {order.special_instructions && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <h4 className="text-sm font-medium text-gray-700 mb-1">Special Instructions</h4>
                        <p className="text-sm text-gray-600">{order.special_instructions}</p>
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Order Items */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                    <Package className="w-4 h-4 mr-2 text-blue-600" />
                    Order Items ({order.items.length})
                  </h3>
                  <div className="space-y-3">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-16 h-16 bg-white rounded-lg border-2 border-gray-200 flex items-center justify-center overflow-hidden">
                            {item.product_image ? (
                              <img 
                                src={item.product_image} 
                                alt="Product" 
                                className="w-full h-full object-cover" 
                              />
                            ) : (
                              <Package className="w-6 h-6 text-gray-400" />
                            )}
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">
                              Product #{item.product_id.toString().slice(-8)}
                            </h4>
                            <div className="text-sm text-gray-600 space-y-1">
                              <div>Quantity: {item.quantity}</div>
                              <div>Unit Price: ${item.price.toFixed(2)}</div>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-lg text-gray-900">
                            ${(item.price * item.quantity).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Order Summary */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Order Total</h3>
                      <p className="text-sm text-gray-600">Including all taxes and fees</p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-blue-600">
                        ${order.total.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Status Timeline */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                    <Clock className="w-4 h-4 mr-2 text-blue-600" />
                    Order Status
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <div>
                        <div className="font-medium text-sm">Order Placed & Paid</div>
                        <div className="text-xs text-gray-600">{formatDate(order.createdAt)}</div>
                      </div>
                    </div>
                    
                    {order.status === 'processing' && (
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                        <div>
                          <div className="font-medium text-sm">Processing</div>
                          <div className="text-xs text-gray-600">We're preparing your order</div>
                        </div>
                      </div>
                    )}
                    
                    {order.shipped_at && (
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                        <div>
                          <div className="font-medium text-sm">Shipped</div>
                          <div className="text-xs text-gray-600">{formatDate(order.shipped_at)}</div>
                          {order.tracking_number && (
                            <div className="text-xs text-blue-600">
                              Tracking: {order.tracking_number}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {!order.shipped_at && order.status === 'paid' && (
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                        <div>
                          <div className="font-medium text-sm text-gray-500">Awaiting Shipment</div>
                          <div className="text-xs text-gray-500">We'll notify you when shipped</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Button 
                    onClick={generateInvoice}
                    disabled={loading}
                    variant="outline"
                    className="w-full"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4 mr-2" />
                    )}
                    Download Invoice
                  </Button>
                  
                  <Button 
                    onClick={() => router.push("/profile/orders")}
                    variant="outline"
                    className="w-full"
                  >
                    <ShoppingBag className="w-4 h-4 mr-2" />
                    My Orders
                  </Button>
                  
                  <Link href="/" className="w-full">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                      <Home className="w-4 h-4 mr-2" />
                      Continue Shopping
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Additional Information */}
            <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <h3 className="font-semibold text-gray-900">What happens next?</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                    <div className="flex flex-col items-center space-y-2">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <Package className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="text-center">
                        <div className="font-medium">Order Processing</div>
                        <div className="text-gray-600">We'll prepare your items for shipment</div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-center space-y-2">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                        <Truck className="w-6 h-6 text-purple-600" />
                      </div>
                      <div className="text-center">
                        <div className="font-medium">Shipping Notification</div>
                        <div className="text-gray-600">You'll receive tracking information</div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-center space-y-2">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      </div>
                      <div className="text-center">
                        <div className="font-medium">Delivery</div>
                        <div className="text-gray-600">Your order will be delivered</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-500">
                      A confirmation email has been sent to {order.user.email}. 
                      If you have any questions, please contact our support team.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : null}
      </div>
    </div>
  );
}