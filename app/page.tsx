import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
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
