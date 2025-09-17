'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, XCircle, Shield, Clock, DollarSign, User, Hash, Phone, Sparkles } from 'lucide-react';

export default function TransactionVerifiedDisplay() {
  const [transactionData, setTransactionData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState(null);
  const params = useParams();

  useEffect(() => {
    const verifyTransaction = async () => {
      try {
        const response = await fetch(`http://10.183.205.105:5000/api/ledgers/transactions/by-code/${params.transaction_id}`);
        const data = await response.json();

        if (data.success) {
          setTransactionData(data.data);
          setVerificationStatus('verified');
        } else {
          setVerificationStatus('not_found');
        }
      } catch (err) {
        setVerificationStatus('error');
      } finally {
        setIsLoading(false);
      }
    };

    if (params.transaction_id) {
      verifyTransaction();
    }
  }, [params.transaction_id]);

  const LoadingScreen = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 flex items-center justify-center p-4">
      <div className="text-center animate-in fade-in-0 duration-500">
        <div className="relative mb-8">
          <div className="w-20 h-20 border-4 border-blue-200 rounded-full animate-spin border-t-blue-600 mx-auto"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Shield className="w-8 h-8 text-blue-600 animate-pulse" />
          </div>
        </div>
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">Verifying Transaction</h2>
        <p className="text-gray-600">Please wait while we confirm your payment...</p>
        <div className="flex justify-center mt-4">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
          </div>
        </div>
      </div>
    </div>
  );

  const VerifiedScreen = () => (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-emerald-200/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-48 h-48 bg-blue-200/20 rounded-full blur-xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-3/4 w-24 h-24 bg-purple-200/20 rounded-full blur-xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="max-w-lg w-full text-center">
          {/* Success Icon with Animation */}
          <div className="relative mb-8 animate-in zoom-in-0 duration-500">
            <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-2xl animate-in zoom-in-50 duration-700 delay-200">
              <CheckCircle2 className="w-12 h-12 text-white animate-in zoom-in-0 duration-500 delay-500" />
            </div>
            {/* Floating sparkles */}
            <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-yellow-400 animate-bounce" style={{animationDelay: '0.5s'}} />
            <Sparkles className="absolute -bottom-2 -left-2 w-4 h-4 text-yellow-400 animate-bounce" style={{animationDelay: '1s'}} />
            <Sparkles className="absolute top-1/2 -right-6 w-5 h-5 text-yellow-400 animate-bounce" style={{animationDelay: '1.5s'}} />
          </div>

          {/* Main Message */}
          <div className="animate-in fade-in-0 slide-in-from-bottom-4 duration-700 delay-300">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Transaction Verified! ✨
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Your transaction has been successfully confirmed
            </p>
          </div>

          {/* Transaction Details Card */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-2xl animate-in fade-in-0 slide-in-from-bottom-8 duration-700 delay-500">
            <CardContent className="p-8">
              {/* Transaction ID Badge */}
              <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 px-4 py-2 rounded-full text-sm font-medium mb-6 animate-in fade-in-0 duration-500 delay-700">
                <Shield className="w-4 h-4" />
                Transaction ID: {params.transaction_id}
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 gap-4 text-left">
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl transition-all duration-200 hover:bg-gray-100 animate-in fade-in-0 slide-in-from-left-4 duration-500 delay-800">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Customer</p>
                    <p className="text-lg font-semibold text-gray-900">{transactionData.full_name}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl transition-all duration-200 hover:bg-gray-100 animate-in fade-in-0 slide-in-from-right-4 duration-500 delay-900">
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Amount Paid</p>
                    <p className="text-2xl font-bold text-emerald-600">${transactionData.amount_paid}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl transition-all duration-200 hover:bg-gray-100 animate-in fade-in-0 slide-in-from-left-4 duration-500 delay-1000">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Payment Method</p>
                    <p className="text-lg font-semibold text-gray-900">{transactionData.paid_with}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl transition-all duration-200 hover:bg-gray-100 animate-in fade-in-0 slide-in-from-right-4 duration-500 delay-1100">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Phone className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Contact</p>
                    <p className="text-lg font-semibold text-gray-900">{transactionData.mobile_number}</p>
                  </div>
                </div>
              </div>

              {/* Security Badge */}
              <div className="mt-8 p-4 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-xl border border-emerald-200 animate-in fade-in-0 duration-500 delay-1200">
                <div className="flex items-center justify-center gap-2 text-emerald-700">
                  <Shield className="w-5 h-5" />
                  <span className="font-medium">Securely Verified</span>
                </div>
                <p className="text-sm text-emerald-600 mt-1 text-center">
                  This transaction has been authenticated and is valid
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Footer Message */}
          <div className="mt-8 animate-in fade-in-0 duration-500 delay-1300">
            <p className="text-gray-500 text-sm">
              Thank you for your payment. Keep this screen as proof of verification.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const NotFoundScreen = () => (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-in zoom-in-0 duration-500">
          <XCircle className="w-10 h-10 text-red-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4 animate-in fade-in-0 slide-in-from-bottom-4 duration-500 delay-200">
          Transaction Not Found
        </h1>
        <p className="text-gray-600 mb-6 animate-in fade-in-0 slide-in-from-bottom-4 duration-500 delay-300">
          We couldn't find a transaction with ID: <span className="font-mono font-semibold">{params.transaction_id}</span>
        </p>
        <Card className="bg-red-50 border-red-200 animate-in fade-in-0 slide-in-from-bottom-8 duration-500 delay-400">
          <CardContent className="p-6">
            <p className="text-red-700 text-sm">
              Please check the transaction ID and try again, or contact support if you believe this is an error.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const ErrorScreen = () => (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-red-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-in zoom-in-0 duration-500">
          <XCircle className="w-10 h-10 text-yellow-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4 animate-in fade-in-0 slide-in-from-bottom-4 duration-500 delay-200">
          Verification Error
        </h1>
        <p className="text-gray-600 mb-6 animate-in fade-in-0 slide-in-from-bottom-4 duration-500 delay-300">
          We encountered an error while verifying your transaction.
        </p>
        <Card className="bg-yellow-50 border-yellow-200 animate-in fade-in-0 slide-in-from-bottom-8 duration-500 delay-400">
          <CardContent className="p-6">
            <p className="text-yellow-700 text-sm">
              Please try again later or contact our support team for assistance.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (verificationStatus === 'verified') {
    return <VerifiedScreen />;
  }

  if (verificationStatus === 'not_found') {
    return <NotFoundScreen />;
  }

  return <ErrorScreen />;
}