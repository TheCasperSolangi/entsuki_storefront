"use client";
import { Card, CardTitle } from "@/components/ui/card";
import { Tag } from "lucide-react";

export default function TrendingCategories() {
  return (
    <section id="categories" className="py-16 container mx-auto px-6">
      <h3 className="text-2xl font-bold mb-8 text-center">📦 Trending Categories</h3>
      <div className="grid md:grid-cols-3 gap-8">
        {["Fashion", "Electronics", "Home & Living"].map((cat, idx) => (
          <Card key={idx} className="p-6 flex flex-col items-center hover:shadow-lg transition">
            <Tag size={30} className="mb-4 text-primary" />
            <CardTitle>{cat}</CardTitle>
          </Card>
        ))}
      </div>
    </section>
  );
}