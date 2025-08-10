"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { Button } from "@nexus/ui";
import { AlertCircle, Loader2, Shield, Mail } from "lucide-react";

export default function ClientLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Get environment variables - Next.js replaces these at build time
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://epbtaunemgnbolxilrwg.supabase.co';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwYnRhdW5lbWduYm9seGlscndnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2OTY3MDYsImV4cCI6MjA3MDI3MjcwNn0.8rXX2_MDxTlKSQ3QGhN72gaBVuV0629O00h-0M1hFqQ';

  // Log environment variables on page load
  console.log('🔍 Client Login Page - Environment check:');
  console.log('URL:', supabaseUrl);
  console.log('Key:', supabaseAnonKey ? 'Set' : 'Missing');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const supabase = createBrowserClient(
        supabaseUrl,
        supabaseAnonKey
      );
      
      // Sign in with Supabase Auth
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        setIsLoading(false);
        return;
      }

      // Check if user has client role
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("role, companyId")
        .eq("email", email)
        .single();

      if (userError || !userData) {
        setError("Unable to verify user access");
        await supabase.auth.signOut();
        setIsLoading(false);
        return;
      }

      if (userData.role !== "client") {
        setError("Access denied. This portal is for clients only.");
        await supabase.auth.signOut();
        setIsLoading(false);
        return;
      }

      if (!userData.companyId) {
        setError("Your account is not associated with a company. Please contact support.");
        await supabase.auth.signOut();
        setIsLoading(false);
        return;
      }

      // Wait for session to be fully established
      console.log('Login successful, checking session...');
      const { data: session } = await supabase.auth.getSession();
      console.log('Session check:', session.session ? 'Session found' : 'No session');
      
      setIsLoading(false);
      
      // Give a brief moment for auth state to propagate, then redirect
      setTimeout(() => {
        console.log('Redirecting to dashboard...');
        router.push('/');
        router.refresh();
      }, 100);
    } catch {
      setError("An unexpected error occurred");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 dark:bg-emerald-900 rounded-full mb-4">
              <Shield className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Nexus Client Portal
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Sign in to access your automation dashboard
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="your@company.com"
                  required
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Password
              </label>
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          {/* Footer Links */}
          <div className="mt-6 text-center space-y-2">
            <a
              href="/auth/forgot-password"
              className="block text-sm text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              Forgot your password?
            </a>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Don&apos;t have an account?{" "}
              <a
                href="/auth/signup"
                className="text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                Contact your admin
              </a>
            </p>
          </div>

          {/* Test Credentials Info (Remove in production) */}
          <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-xs text-gray-600 dark:text-gray-400 font-medium mb-2">
              Test Credentials:
            </p>
            <div className="space-y-1 text-xs text-gray-500 dark:text-gray-500">
              <p>ACME Corp: john.doe@acmecorp.com</p>
              <p>TechFlow: jane.smith@techflow.io</p>
              <p className="text-xs text-gray-400 mt-2">
                (Password: Use your configured password)
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}