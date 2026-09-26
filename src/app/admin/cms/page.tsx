"use client";

import { useEffect, useState } from "react";
import { Save, RefreshCw, CheckCircle } from "lucide-react";
import { adminFetch } from "@/lib/admin-fetch";

export default function AdminCMSPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const fetchCMS = () => {
    setLoading(true);
    adminFetch("/api/cms")
      .then((res) => res.json())
      .then((d) => {
        if (d.success) setSettings(d.settings);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCMS();
  }, []);

  const handleChange = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg("");
    try {
      const res = await adminFetch("/api/cms", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings }),
      });

      const data = await res.json();
      if (data.success) {
        setSuccessMsg("CMS Content & Website Settings updated successfully!");
        fetchCMS();
        setTimeout(() => setSuccessMsg(""), 4000);
      }
    } catch (err) {
      console.error("Save CMS Error:", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-700 space-y-4 font-sans">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <p className="text-xs uppercase tracking-widest font-mono font-bold">Loading Dynamic CMS Controls...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-slate-900">
            Dynamic CMS & Website Content
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Edit live hero text, contact phones, email, property address, and hotel policies.
          </p>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-900/40 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs flex items-center gap-2 font-bold">
          <CheckCircle className="h-4 w-4 text-emerald-400" /> {successMsg}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Hotel Information */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xl space-y-4">
          <h3 className="font-serif text-lg text-slate-900 font-bold border-b border-slate-200 pb-2">
            General Branding & Tagline
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-widest text-slate-700 font-bold mb-1">Hotel Title</label>
              <input
                type="text"
                value={settings.hotel_name || "Hotel Rajhans International"}
                onChange={(e) => handleChange("hotel_name", e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest text-slate-700 font-bold mb-1">Operating Company Entity</label>
              <input
                type="text"
                value={settings.company_name || "Takshshila Regency Pvt. Ltd."}
                onChange={(e) => handleChange("company_name", e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest text-slate-700 font-bold mb-1">Hero Subtitle / Tagline</label>
            <input
              type="text"
              value={settings.hotel_subtitle || "On MG Road, Kachari Chowk — rooms, dining, and parking on-site."}
              onChange={(e) => handleChange("hotel_subtitle", e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 font-medium"
            />
          </div>
        </div>

        {/* Contact Information & Map */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xl space-y-4">
          <h3 className="font-serif text-lg text-slate-900 font-bold border-b border-slate-200 pb-2">
            Contact Details & Maps Embed
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-widest text-slate-700 font-bold mb-1">Primary Mobile Phone</label>
              <input
                type="text"
                value={settings.phone_primary || "+91 93081 89201"}
                onChange={(e) => handleChange("phone_primary", e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest text-slate-700 font-bold mb-1">Official Email Address</label>
              <input
                type="email"
                value={settings.email_official || "info@hotelrajhansinternational.com"}
                onChange={(e) => handleChange("email_official", e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 font-mono font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest text-slate-700 font-bold mb-1">Landline Numbers (PBX)</label>
            <input
              type="text"
              value={settings.phone_landline || "+91 641 240 9411 / 12 / 13 / 14 / 15"}
              onChange={(e) => handleChange("phone_landline", e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 font-mono font-bold"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest text-slate-700 font-bold mb-1">Full Property Address</label>
            <textarea
              rows={2}
              value={settings.address_full || "Kachari Chowk, MG Road, Bhagalpur, Bihar – 812001, India"}
              onChange={(e) => handleChange("address_full", e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 resize-none font-medium"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest text-slate-700 font-bold mb-1">Google Maps Embed iframe URL</label>
            <input
              type="text"
              value={settings.maps_iframe_url || ""}
              onChange={(e) => handleChange("maps_iframe_url", e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 font-mono text-[11px]"
            />
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="bg-slate-900 hover:bg-slate-800 text-white font-bold uppercase tracking-widest text-xs py-3 px-8 rounded-xl shadow-xl flex items-center gap-2 cursor-pointer"
          >
            <Save className="h-4 w-4" /> {saving ? "Saving CMS Content..." : "Publish CMS Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
