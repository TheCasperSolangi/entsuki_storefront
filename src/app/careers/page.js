"use client";

import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function Page() {
  return (
    <>
      <Header />
      <main className="max-w-6xl mx-auto px-6 py-16 space-y-16">
        <h1 className="text-4xl font-bold text-center">Careers</h1>
        
        <section className="text-center py-12">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-semibold text-primary mb-4">
              Join Our Team
            </h2>
            <p className="text-gray-700 text-lg">
              We are currently not hiring, but please check back later for opportunities!
            </p>
            
            {/* Optional: Add a contact email for future reference */}
            <div className="mt-8">
              <p className="text-gray-600">
                For future inquiries, you can email us at:
              </p>
              <a 
                href="mailto:careers@example.com" 
                className="text-primary hover:underline"
              >
                careers@example.com
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}