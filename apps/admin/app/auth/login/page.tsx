"use client";

import { useState } from "react";
import { Button } from "@nexus/ui";
import { AlertCircle, Loader2, Lock, Mail } from "lucide-react";
import { adminLogin } from "./actions";

// Type guard for Next.js redirect errors
function isNextRedirectError(error: unknown): error is { digest: string } {
  if (error === null || typeof error !== 'object') {
    return false;
  }
  
  if (!('digest' in error)) {
    return false;
  }
  
  const errorObj = error as Record<string, unknown>;
  const digest = errorObj.digest;
  
  return typeof digest === 'string' && digest.startsWith('NEXT_REDIRECT');
}

export default function AdminLoginPage() {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (formData: FormData) => {
    setError("");
    setIsLoading(true);

    try {
      const email = formData.get("email") as string;
      const password = formData.get("password") as string;
      
      const result = await adminLogin({ email, password });
      
      if (result?.error) {
        setError(result.error);
        setIsLoading(false);
        return;
      }
      
      // Success case - the server action will handle redirect
    } catch (err) {
      // Check if this is a Next.js redirect error (which is expected)
      if (isNextRedirectError(err)) {
        // This is a redirect, not an actual error - let it propagate
        throw err;
      }
      setError("An unexpected error occurred");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-md w-full mx-4">
        <div className="bg-card rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 dark:bg-indigo-900 rounded-full mb-4">
              <Lock className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">
              Admin Portal
            </h1>
            <p className="text-muted-foreground mt-2">
              Sign in to access the admin dashboard
            </p>
          </div>

          {/* Login Form */}
          <form action={handleLogin} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-foreground mb-2"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  className="w-full pl-10 pr-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent "
                  placeholder="admin@braintrust.com"
                  required
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-foreground mb-2"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  className="w-full pl-10 pr-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent "
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
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

          {/* Footer */}
          <div className="mt-6 text-center">
            <a
              href="/auth/forgot-password"
              className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Forgot your password?
            </a>
          </div>

          {/* Test Credentials Info (Remove in production) */}
          <div className="mt-8 p-4 bg-muted rounded-lg">
            <p className="text-xs text-muted-foreground font-medium mb-2">
              Test Credentials:
            </p>
            <div className="space-y-1 text-xs text-muted-foreground">
              <p>Admin: admin@braintrust.com</p>
              <p>SE: se@braintrust.com</p>
              <p className="text-xs text-muted-foreground mt-2">
                (Password: Use your configured password)
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}