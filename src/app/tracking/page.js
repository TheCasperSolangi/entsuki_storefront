"use client";

import React, { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { 
  ClockIcon, 
  CheckCircleIcon, 
  TruckIcon, 
  HomeIcon,
  MagnifyingGlassIcon
} from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";

export default function TrackOrderPage() {
  const [orderCode, setOrderCode] = useState("");
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!orderCode.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const res = await fetch(`https://api.entsuki.com/api/orders/${orderCode}/track`);
      if (!res.ok) throw new Error(`Order not found (${res.status})`);
      
      const data = await res.json();
      if (!data.success) throw new Error("Failed to fetch order details");
      
      setOrder(data.data);
 
    } catch (err) {
      setError(err.message);
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const statusIcons = {
    pending: <ClockIcon className="h-6 w-6 text-yellow-500" />,
    processing: <ClockIcon className="h-6 w-6 text-blue-500" />,
    shipped: <TruckIcon className="h-6 w-6 text-blue-500" />,
    delivered: <CheckCircleIcon className="h-6 w-6 text-green-500" />,
    cancelled: <HomeIcon className="h-6 w-6 text-red-500" />
  };

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800",
    processing: "bg-blue-100 text-blue-800",
    shipped: "bg-blue-100 text-blue-800",
    delivered: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800"
  };

  return (
    <>
      <Header />
      <main className="max-w-6xl mx-auto px-6 py-16 space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold">Track Your Order</h1>
          <p className="mt-2 text-gray-600">
            Enter your order number to check the current status
          </p>
        </div>

        <div className="max-w-md mx-auto">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={orderCode}
                onChange={(e) => setOrderCode(e.target.value)}
                placeholder="Enter order number (e.g. S6MIU9FCVA)"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Tracking...
                </>
              ) : (
                "Track Order"
              )}
            </button>
          </form>
        </div>

        {error && (
          <div className="max-w-md mx-auto p-4 bg-red-50 text-red-700 rounded-lg text-center">
            {error}
          </div>
        )}

        {order && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className={`p-6 ${statusColors[order.status]} border-b`}>
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  {statusIcons[order.status] || statusIcons.pending}
                </div>
                <div className="ml-3">
                  <h2 className="text-xl font-semibold">
                    {order.status_message}
                  </h2>
                  <p className="mt-1 text-sm">
                    Order #{order.order_code} • Last updated: {new Date(order.last_updated).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <h3 className="text-lg font-medium mb-4">Order Status Timeline</h3>
              
              <div className="relative">
                <div className="absolute left-4 top-0 h-full w-0.5 bg-gray-200"></div>
                
                {['pending', 'processing', 'shipped', 'delivered'].map((step, index) => (
                  <div key={step} className="relative pl-8 pb-6 last:pb-0">
                    <div className={`absolute left-0 flex items-center justify-center w-8 h-8 rounded-full bg-white border-2 ${
                      order.status === step ? 'border-blue-500' : 'border-gray-300'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex items-center">
                      <h4 className={`text-sm font-medium ${
                        order.status === step ? 'text-blue-600' : 'text-gray-500'
                      }`}>
                        {step.charAt(0).toUpperCase() + step.slice(1)}
                      </h4>
                      {order.status === step && (
                        <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800">
                          Current
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="text-center text-sm text-gray-500">
          <p>
            Can't find your order? Contact us at{" "}
            <a href="mailto:support@example.com" className="text-primary hover:underline">
              support@bajgo.com
            </a>
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}