"use client";
import { googleCallback } from "@/components/actions/login-action";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";

export default function CallbackPage() {
  useEffect(() => {
    const handleGoogleCallback = async () => {
      const queryParams = new URLSearchParams(window.location.search);
      const code = queryParams.get("code") || "";
      const state = queryParams.get("state") || "";

      const response = await googleCallback(code, state);

      if (response.success) {
        window.location.href = "/workspace";
      } else {
        window.location.href = "/login";
      }
    };

    handleGoogleCallback();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-lg font-medium">Logged in, redirecting...</p>
    </div>
  );
}
