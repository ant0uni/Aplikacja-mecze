"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/user/me");
        if (response.ok) {
          // User is logged in, redirect to dashboard
          router.push("/auth/dashboard");
        }
      } catch {
        // User is not logged in, stay on landing page
        console.log("User not authenticated, showing landing page");
      }
    };

    checkAuth();
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="text-center space-y-6">
        <h1 className="text-6xl font-bold">Football Predictions</h1>
        <p className="text-2xl">Predict. Win. Earn Coins.</p>
        <div className="flex gap-4 justify-center pt-8">
          <Link href="/register">
            <Button size="lg">Get Started</Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline">Sign In</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
