"use client";

import { useState } from "react";
import { Button } from "@nexus/ui";
import { AlertCircle, Loader2, Shield, Mail } from "lucide-react";
import { clientLogin } from "./actions";

export default function ClientLoginPage() {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (formData: FormData) => {
    setError("");
    setIsLoading(true);

    try {
      const email = formData.get("email") as string;
      const password = formData.get("password") as string;
      
      const result = await clientLogin({ email, password });
      
      if (result?.error) {
        setError(result.error);
        setIsLoading(false);
        return;
      }
      
      // Success case - the server action will handle redirect
    } catch (err) {
      // Check if this is a Next.js redirect error (which is expected)
      if (err && typeof err === 'object' && 'digest' in err && 
          typeof (err as any).digest === 'string' && 
          (err as any).digest.startsWith('NEXT_REDIRECT')) {
        // This is a redirect, not an actual error - let it propagate
        throw err;
      }
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
          <form action={handleLogin} className="space-y-6">
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
                  name="email"
                  type="email"
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
                  name="password"
                  type="password"
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