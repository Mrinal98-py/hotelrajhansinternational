"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Plus, Trash2, RefreshCw, X } from "lucide-react";
import { adminFetch } from "@/lib/admin-fetch";

export default function AdminGalleryPage() {
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [isAdding, setIsAdding] = useState(false);

  const [formData, setFormData] = useState({
    url: "",
    alt: "",
    category: "reception",
    size: "square",
    displayOrder: "0",
  });

  const fetchGallery = () => {
    setLoading(true);
    const query = activeCategory !== "all" ? `?category=${activeCategory}` : "";
    adminFetch(`/api/gallery${query}`)
      .then((res) => res.json())
      .then((d) => {
        if (d.success) setImages(d.images);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchGallery();
  }, [activeCategory]);

  const handleAddImage = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await adminFetch("/api/gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        setIsAdding(false);
        setFormData({ url: "", alt: "", category: "reception", size: "square", displayOrder: "0" });
        fetchGallery();
      }
    } catch (err) {
      console.error("Failed to add image:", err);
    }
  };

  const handleDeleteImage = async (id: string) => {
    if (!confirm("Are you sure you want to delete this photo?")) return;
    try {
      const res = await adminFetch(`/api/gallery?id=${id}`, { method: "DELETE" });
      if (res.ok) fetchGallery();
    } catch (err) {
      console.error("Delete photo error:", err);
    }
  };

  const categories = [
    { id: "all", label: "All Photos" },
    { id: "reception", label: "Lobby & Reception" },
    { id: "rooms", label: "Suites & Rooms" },
    { id: "restaurant", label: "Takshshila Restaurant" },
    { id: "services", label: "Parlour & Saloon" },
    { id: "icecream", label: "Ice Cream Parlour" },
    { id: "dormitory", label: "Dormitory" },
  ];

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-slate-900">
            Photo Gallery Management
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Upload, categorize, and organize high-resolution hotel media.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setIsAdding(true)}
            className="bg-slate-900 hover:bg-slate-800 text-white font-bold uppercase tracking-widest text-xs py-2.5 px-4 rounded-xl flex items-center gap-1.5 shadow-lg cursor-pointer"
          >
            <Plus className="h-4 w-4" /> Add Photo
          </button>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-4">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-3.5 py-1.5 rounded-full text-xs uppercase tracking-wider transition-all cursor-pointer font-bold ${
              activeCategory === cat.id
                ? "bg-amber-400 text-stone-950 shadow-md"
                : "bg-white text-slate-500 hover:text-slate-900 border border-slate-200"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {loading ? (
          <div className="col-span-full py-16 text-center text-slate-700 font-bold">
            <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
            Loading photo gallery...
          </div>
        ) : images.length > 0 ? (
          images.map((img) => (
            <div
              key={img.id}
              className="group relative rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-xl flex flex-col justify-between"
            >
              <div className="relative h-48 w-full overflow-hidden bg-slate-50">
                <Image src={img.url} alt={img.alt || "Hotel Photo"} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-3 flex items-center justify-between bg-slate-50 border-t border-slate-200 text-xs">
                <div>
                  <span className="font-mono text-[9px] uppercase tracking-widest text-slate-500 font-bold block">{img.category}</span>
                  <span className="text-slate-900 font-medium truncate block max-w-[150px]">{img.alt}</span>
                </div>
                <button
                  onClick={() => handleDeleteImage(img.id)}
                  className="p-1.5 rounded-lg border border-red-500/40 text-red-300 hover:bg-red-900/30 cursor-pointer"
                  title="Delete Photo"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-16 text-center text-slate-500 text-xs">
            No gallery photos found for this category.
          </div>
        )}
      </div>

      {/* Add Photo Modal */}
      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-white border border-slate-300 rounded-2xl max-w-md w-full p-6 space-y-6 shadow-2xl relative">
            <button onClick={() => setIsAdding(false)} className="absolute top-4 right-4 p-2 text-slate-500 hover:text-slate-900">
              <X className="h-5 w-5" />
            </button>

            <h2 className="font-serif text-xl text-slate-900 font-bold">Add Photo to Gallery</h2>

            <form onSubmit={handleAddImage} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-widest text-slate-700 font-bold mb-1">Photo Image URL</label>
                <input
                  type="text"
                  required
                  placeholder="/images/reception/Reception001.jpg"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 placeholder-amber-200/30 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest text-slate-700 font-bold mb-1">Caption / Alt Text</label>
                <input
                  type="text"
                  required
                  placeholder="Lobby Seating Area"
                  value={formData.alt}
                  onChange={(e) => setFormData({ ...formData, alt: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-slate-700 font-bold mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 font-medium"
                  >
                    <option value="reception">Reception & Lobby</option>
                    <option value="rooms">Rooms & Suites</option>
                    <option value="restaurant">Restaurant</option>
                    <option value="services">Services</option>
                    <option value="icecream">Ice Cream</option>
                    <option value="dormitory">Dormitory</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-widest text-slate-700 font-bold mb-1">Grid Aspect</label>
                  <select
                    value={formData.size}
                    onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 font-medium"
                  >
                    <option value="square">Square</option>
                    <option value="tall">Tall</option>
                    <option value="wide">Wide</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-200">
                <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-500 font-bold">
                  Cancel
                </button>
                <button type="submit" className="px-6 py-2 bg-amber-400 text-stone-950 font-bold uppercase tracking-widest text-xs rounded-xl shadow-md cursor-pointer">
                  Save Photo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
