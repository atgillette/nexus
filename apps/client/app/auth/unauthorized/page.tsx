"use client";

import { Button } from "@nexus/ui";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full mb-6">
            <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Access Denied
          </h1>

          {/* Message */}
          <div className="space-y-3 mb-8">
            <p className="text-gray-600 dark:text-gray-400">
              You don&apos;t have permission to access this portal.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              This portal is for client users only. Please ensure:
            </p>
            <ul className="text-sm text-gray-500 dark:text-gray-500 space-y-1 text-left">
              <li>• You have a client role</li>
              <li>• Your account is associated with a company</li>
              <li>• You&apos;re using the correct login credentials</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Button
              onClick={() => router.push("/auth/login")}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Login
            </Button>
            
            <p className="text-xs text-gray-500 dark:text-gray-500">
              Need help? Contact your system administrator.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}