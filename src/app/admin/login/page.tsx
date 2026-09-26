"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, Hotel, ArrowRight, ShieldCheck } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      if (data.token) {
        try {
          sessionStorage.setItem("rajhans_admin_token", data.token);
        } catch {}
      }

      router.push("/admin/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0b08] text-[#f5ebd7] flex items-center justify-center p-4 relative overflow-hidden font-sans selection:bg-[#d4af37] selection:text-[#1a1005]">
      {/* Background ambient lighting */}
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-[#c89b3c]/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-[#9e7526]/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#d4af37]/5 rounded-full blur-[160px] pointer-events-none" />

      <div className="w-full max-w-md bg-[#1a130e]/95 backdrop-blur-xl border border-[#d4af37]/35 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] overflow-hidden relative z-10 p-8 sm:p-10">
        
        {/* Header Section */}
        <div className="text-center space-y-3 mb-8">
          <div className="inline-flex p-3.5 rounded-2xl bg-[#c89b3c]/15 border border-[#c89b3c]/40 text-[#f0d699] mb-1 shadow-inner">
            <Hotel className="h-9 w-9 text-[#eed8a1]" />
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#f3e5c8] font-bold tracking-wide drop-shadow-sm">
            Rajhans Admin
          </h1>
          <p className="text-xs text-[#d8c49e] font-semibold uppercase tracking-[0.25em]">
            Hotel Management System Portal
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 bg-red-950/60 border border-red-500/50 rounded-xl text-red-200 text-xs text-center font-medium shadow-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Input */}
          <div>
            <label className="block text-xs uppercase tracking-widest text-[#e8d5b5] mb-2 font-semibold">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#d4af37]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="rajhansinternational.info@gmail.com"
                className="w-full bg-[#120d09] border border-[#d4af37]/35 focus:border-[#f0d699] rounded-xl py-3.5 pl-11 pr-4 text-sm text-[#ffffff] font-medium placeholder-[#a89678] focus:outline-none focus:ring-2 focus:ring-[#d4af37]/30 transition-all shadow-inner"
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-xs uppercase tracking-widest text-[#e8d5b5] mb-2 font-semibold">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#d4af37]" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#120d09] border border-[#d4af37]/35 focus:border-[#f0d699] rounded-xl py-3.5 pl-11 pr-4 text-sm text-[#ffffff] font-medium placeholder-[#a89678] focus:outline-none focus:ring-2 focus:ring-[#d4af37]/30 transition-all shadow-inner"
              />
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between text-xs text-[#e8d5b5] pt-1 font-medium">
            <label className="flex items-center gap-2.5 cursor-pointer select-none group">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-[#d4af37]/50 text-[#c89b3c] bg-[#120d09] focus:ring-[#d4af37] focus:ring-offset-0 cursor-pointer accent-[#d4af37]"
              />
              <span className="group-hover:text-white transition-colors">Remember me</span>
            </label>
            <span className="flex items-center gap-1.5 text-xs text-[#d4af37] font-semibold">
              <ShieldCheck className="h-4 w-4 text-[#e0c478]" /> 256-bit Encrypted
            </span>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#d4af37] via-[#e5c573] to-[#c89b3c] hover:from-[#e5c573] hover:to-[#d4af37] text-[#1a1005] font-bold uppercase tracking-widest text-xs py-4 px-5 rounded-xl transition-all duration-300 shadow-[0_4px_20px_rgba(212,175,55,0.3)] hover:shadow-[0_6px_25px_rgba(212,175,55,0.45)] hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-70 mt-3"
          >
            {loading ? "Authenticating..." : "Login to Management Portal"}
            {!loading && <ArrowRight className="h-4 w-4 stroke-[2.5]" />}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-[#d4af37]/20 text-center text-[11px] text-[#c2b090] uppercase tracking-[0.2em] font-medium">
          Hotel Rajhans International Management System v1.0
        </div>
      </div>
    </div>
  );
}
