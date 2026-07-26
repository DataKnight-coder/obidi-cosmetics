"use client";

import { signIn } from "next-auth/react";
import { useRef, useState } from "react";
import Image from "next/image";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const turnstileRef = useRef<TurnstileInstance>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!turnstileToken) {
      setError("Please complete the security check before signing in.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        redirect: false,
        redirectTo: "/admin",
        email,
        password,
        turnstileToken,
      });

      if (!res?.ok || res.error) {
        setError("Invalid email, password, or security check. Please try again.");
        setTurnstileToken("");
        turnstileRef.current?.reset();
      } else {
        // Force a full load so middleware and server components see the new cookie.
        window.location.assign(res.url ?? "/admin");
      }
    } catch {
      setError("Sign in could not be completed. Please check your connection and try again.");
      setTurnstileToken("");
      turnstileRef.current?.reset();
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-[#160516]">
      <div className="bg-bloom bloom-1" />
      <div className="bg-bloom bloom-2" />
      
      <div className="glass-card p-12 rounded-3xl w-full max-w-md relative z-10 flex flex-col items-center">
        <div className="flex justify-center mb-8">
          <div className="relative w-32 h-32 rounded-full overflow-hidden border border-white/10">
            <Image src="/assets/obidi logo.jpg" alt="OBIDI SEE MY HOUSE I STILL DEY WAKA COSMETICS" fill className="object-cover" sizes="128px" />
          </div>
        </div>

        <h1 className="font-display-lg text-3xl text-center mb-2">Admin Portal</h1>
        <p className="text-on-surface-variant text-center mb-8">Sign in to manage OBIDI SEE MY HOUSE I STILL DEY WAKA COSMETICS</p>

        {error && (
          <div className="bg-error/20 text-error p-4 rounded-xl mb-6 text-sm w-full">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6 w-full">
          <input 
            type="email" 
            required 
            placeholder="Email Address" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-on-surface focus:border-primary outline-none transition-colors"
          />
          <input 
            type="password" 
            required 
            placeholder="Password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-on-surface focus:border-primary outline-none transition-colors"
          />
          
          <div className="flex justify-center">
            <Turnstile 
              ref={turnstileRef}
              siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "1x00000000000000000000AA"} 
              onSuccess={(token) => setTurnstileToken(token)}
              onExpire={() => setTurnstileToken("")}
              onError={() => {
                setTurnstileToken("");
                setError("The security check could not load. Please refresh and try again.");
              }}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading || !turnstileToken}
            className="w-full bg-primary text-on-primary font-label-sm px-8 py-5 rounded-full uppercase tracking-widest hover:scale-105 transition-transform disabled:opacity-50"
          >
            {loading ? "Signing in..." : turnstileToken ? "Sign In" : "Waiting for security check..."}
          </button>
        </form>
      </div>
    </main>
  );
}
