"use client";

import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { CheckCircleIcon } from "@heroicons/react/24/solid";

export default function Page() {
  const systems = [
    { name: "Web Application", description: "Main customer-facing platform" },
    { name: "API Services", description: "Backend services and integrations" },
    { name: "Database", description: "Primary data storage systems" },
    { name: "Payment Processing", description: "Transaction and billing systems" },
    { name: "Email Services", description: "Transactional and marketing emails" },
  ];

  return (
    <>
      <Header />
      <main className="max-w-6xl mx-auto px-6 py-16 space-y-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold">System Status</h1>
          <p className="mt-2 text-lg text-gray-600">
            Last updated: {new Date().toLocaleString()}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6 bg-green-50 border-b border-green-100">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircleIcon className="h-8 w-8 text-green-500" />
              </div>
              <div className="ml-3">
                <h2 className="text-2xl font-semibold text-green-800">
                  All Systems Operational
                </h2>
                <p className="mt-1 text-green-600">
                  Our services are running normally with no known issues.
                </p>
              </div>
            </div>
          </div>

          <ul className="divide-y divide-gray-200">
            {systems.map((system) => (
              <li key={system.name} className="p-6 hover:bg-gray-50">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <CheckCircleIcon className="h-6 w-6 text-green-500" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      {system.name}
                    </h3>
                    <p className="text-gray-500">{system.description}</p>
                  </div>
                  <div className="ml-auto">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      Operational
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="text-center text-sm text-gray-500">
          <p>
            Need help? Contact our support team at{" "}
            <a href="mailto:support@example.com" className="text-primary hover:underline">
              support@example.com
            </a>
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}