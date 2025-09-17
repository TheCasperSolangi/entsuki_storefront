"use client";

import React, { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function Page() {
  const [aboutUsBlocks, setAboutUsBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAboutUs = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/store/settings`);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        
        const responseData = await res.json();
        console.log("API Response:", responseData);
        
        // Try different access patterns
        const aboutUsData = responseData?.about_us || 
                          responseData.data?.about_us || 
                          [];
        
        console.log("Extracted About Us:", aboutUsData);
        setAboutUsBlocks(aboutUsData);
      } catch (error) {
        console.error("Fetch error:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAboutUs();
  }, []);

  if (loading) return <div className="text-center p-8">Loading...</div>;
  if (error) return <div className="text-center p-8 text-red-500">Error: {error}</div>;

  return (
    <>
      <Header />
      <main className="max-w-6xl mx-auto px-6 py-16 space-y-16">
        <h1 className="text-4xl font-bold text-center">About Us</h1>

        {aboutUsBlocks.length > 0 ? (
          aboutUsBlocks.map((block) => (
            <section key={block._id} className="space-y-4">
              <h2 className="text-2xl font-semibold text-primary">{block.title}</h2>
              {block.block_type === "Text" && (
                <p className="text-gray-700 text-lg">{block.value}</p>
              )}
              {block.block_type === "Media" && (
                <div className="w-full max-h-[500px] rounded-lg shadow-lg overflow-hidden">
                  <video
                    src={block.value}
                    controls
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </section>
          ))
        ) : (
          <div className="text-center p-8 border rounded-lg">
            <p>No about us content found</p>
            <p className="text-sm text-gray-500 mt-2">
              Check the API response structure in browser console
            </p>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}