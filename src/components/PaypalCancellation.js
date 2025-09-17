"use client"
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../context/authContext";
import Cookies from "js-cookie";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  XCircle, 
  Loader2, 
  AlertCircle,
  ShoppingCart,
  Home,
  RefreshCw,
  ArrowLeft,
  Clock,
  Shield,
  CreditCard
} from "lucide-react";
import Link from 'next/link';

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api`;

export default function PayPalCancel() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [orderCode, setOrderCode] = useState(null);

  useEffect(() => {
    const paymentId = searchParams.get('token') || searchParams.get('paymentId');
    const orderCodeParam = searchParams.get('order_code');
    
    if (orderCodeParam) {
      setOrderCode(orderCodeParam);
    }
    
    if (paymentId) {
      cancelPayment(paymentId, orderCodeParam);
    } else {
      setSuccess("Payment was cancelled successfully. Your cart has been preserved.");
    }
  }, [searchParams]);

  const cancelPayment = async (paymentId, orderCode) => {
    try {
      setLoading(true);
      setError("");
      
      const token = Cookies.get('token');
      if (!token) {
        router.push("/auth");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/paypal/cancel-payment`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          payment_id: paymentId,
          order_code: orderCode
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to cancel payment');
      }

      const data = await response.json();
      setSuccess("Payment cancelled successfully. Your cart has been restored and no charges were made.");

    } catch (err) {
      setError(err.message);
      console.error('Payment cancellation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const retryPayment = () => {
    router.push("/checkout");
  };

  const continueShopping = () => {
    router.push("/");
  };

  const viewCart = () => {
    router.push("/cart");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="space-y-6">
          {/* Main Cancel Card */}
          <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm overflow-hidden">
            <div className="bg-gradient-to-r from-red-500 to-orange-500 p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <XCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold">Payment Cancelled</h1>
                    <p className="text-red-100">Your PayPal payment was not completed</p>
                  </div>
                </div>
                {orderCode && (
                  <div className="text-right">
                    <div className="text-sm text-red-100">Order Reference</div>
                    <div className="font-mono text-sm">{orderCode}</div>
                  </div>
                )}
              </div>
            </div>
            
            <CardContent className="p-8">
              {loading && (
                <div className="flex items-center justify-center mb-6">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-600 mr-2" />
                  <span className="text-gray-600">Processing cancellation...</span>
                </div>
              )}

              {error && (
                <Alert className="mb-6 border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="mb-6 border-green-200 bg-green-50">
                  <AlertCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">{success}</AlertDescription>
                </Alert>
              )}

              <div className="text-center mb-8">
                <p className="text-lg text-gray-700 mb-4">
                  Don't worry - no charges have been made to your account.
                </p>
                <p className="text-gray-600">
                  Your items are still saved in your shopping cart and you can complete your purchase whenever you're ready.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <Button 
                  onClick={retryPayment}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4 mr-2" />
                  )}
                  Try Again
                </Button>
                
                <Button 
                  onClick={viewCart}
                  variant="outline"
                  disabled={loading}
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  View Cart
                </Button>
                
                <Link href="/" className="w-full">
                  <Button 
                    variant="outline"
                    className="w-full"
                    disabled={loading}
                  >
                    <Home className="w-4 h-4 mr-2" />
                    Home
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Information Card */}
          <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-orange-600" />
                <span>What happened?</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Payment Status</h3>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                      <span>You chose to cancel the PayPal payment process</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                      <span>No payment has been processed or charged</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                      <span>Your cart items are still saved and available</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                      <span>You can retry the payment anytime</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Next Steps</h3>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li className="flex items-start space-x-2">
                      <Clock className="w-4 h-4 mt-0.5 text-blue-500 flex-shrink-0" />
                      <span>Review your cart and make any necessary changes</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CreditCard className="w-4 h-4 mt-0.5 text-green-500 flex-shrink-0" />
                      <span>Try a different payment method if needed</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <Shield className="w-4 h-4 mt-0.5 text-purple-500 flex-shrink-0" />
                      <span>Contact support if you need assistance</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Troubleshooting Card */}
          <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <RefreshCw className="w-5 h-5 text-blue-600" />
                <span>Need Help?</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-700">
                  If you're experiencing issues with PayPal payments, here are some common solutions:
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">Account Issues</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Check your PayPal account balance</li>
                      <li>• Verify your payment methods are active</li>
                      <li>• Ensure your account is not limited</li>
                      <li>• Check for any pending transactions</li>
                    </ul>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">Technical Issues</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Clear your browser cache and cookies</li>
                      <li>• Try using a different browser</li>
                      <li>• Disable browser extensions temporarily</li>
                      <li>• Check your internet connection</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-4 mt-6">
                  <div className="flex items-start space-x-3">
                    <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-blue-900 mb-1">Still need help?</h4>
                      <p className="text-sm text-blue-800 mb-3">
                        Our support team is here to help you complete your purchase.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <Button size="sm" variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50">
                          Contact Support
                        </Button>
                        <Button size="sm" variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50">
                          Live Chat
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="text-center">
            <Button 
              onClick={() => router.back()}
              variant="ghost"
              className="text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}