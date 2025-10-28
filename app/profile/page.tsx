"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, Loader2, Trophy, TrendingUp, TrendingDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface User {
  id: number;
  email: string;
  coins: number;
  createdAt: string;
}

interface Prediction {
  id: number;
  fixtureId: number;
  fixtureApiId: number;
  predictedHomeScore: number;
  predictedAwayScore: number;
  coinsWagered: number;
  coinsWon: number;
  isSettled: boolean;
  createdAt: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUser();
    fetchPredictions();
  }, []);

  const fetchUser = async () => {
    try {
      const response = await fetch("/api/user/me");
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      }
    } catch (error) {
      console.error("Failed to fetch user:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPredictions = async () => {
    try {
      const response = await fetch("/api/predictions");
      if (response.ok) {
        const data = await response.json();
        setPredictions(data.predictions || []);
      }
    } catch (error) {
      console.error("Failed to fetch predictions:", error);
    }
  };

  const totalWagered = predictions.reduce((sum, p) => sum + p.coinsWagered, 0);
  const totalWon = predictions.reduce((sum, p) => sum + p.coinsWon, 0);
  const settledPredictions = predictions.filter(p => p.isSettled);
  const pendingPredictions = predictions.filter(p => !p.isSettled);
  const successfulPredictions = predictions.filter(p => p.isSettled && p.coinsWon > 0);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Profile & Settings</h1>
            <p className="text-muted-foreground">Manage your account and view statistics</p>
          </div>
        </div>

        {/* Account Info */}
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>Your account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-semibold">{user?.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Current Balance</p>
                <p className="font-semibold text-2xl">{user?.coins} coins</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Member Since</p>
                <p className="font-semibold">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Predictions</p>
                <p className="font-semibold">{predictions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>Prediction Statistics</CardTitle>
            <CardDescription>Your betting performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <Trophy className="h-6 w-6 mx-auto mb-2 text-yellow-500" />
                <p className="text-2xl font-bold">{successfulPredictions.length}</p>
                <p className="text-sm text-muted-foreground">Won</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <TrendingDown className="h-6 w-6 mx-auto mb-2 text-red-500" />
                <p className="text-2xl font-bold">
                  {settledPredictions.length - successfulPredictions.length}
                </p>
                <p className="text-sm text-muted-foreground">Lost</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <TrendingUp className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                <p className="text-2xl font-bold">{totalWon}</p>
                <p className="text-sm text-muted-foreground">Coins Won</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="h-6 w-6 mx-auto mb-2 text-muted-foreground">⏳</div>
                <p className="text-2xl font-bold">{pendingPredictions.length}</p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
            </div>

            <div className="mt-6 p-4 bg-muted rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">Win Rate</p>
                  <p className="text-2xl font-bold">
                    {settledPredictions.length > 0
                      ? ((successfulPredictions.length / settledPredictions.length) * 100).toFixed(1)
                      : 0}%
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Net Profit</p>
                  <p className={`text-2xl font-bold ${totalWon - totalWagered >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {totalWon - totalWagered >= 0 ? '+' : ''}{totalWon - totalWagered}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Predictions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Predictions</CardTitle>
            <CardDescription>Your latest betting activity</CardDescription>
          </CardHeader>
          <CardContent>
            {predictions.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No predictions yet. Start predicting matches to see your history here!
              </p>
            ) : (
              <div className="space-y-3">
                {predictions.slice(0, 10).map((prediction) => (
                  <div
                    key={prediction.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="font-semibold">
                        Prediction: {prediction.predictedHomeScore} - {prediction.predictedAwayScore}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(prediction.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="text-sm font-semibold">
                        Wagered: {prediction.coinsWagered} coins
                      </p>
                      {prediction.isSettled ? (
                        <Badge variant={prediction.coinsWon > 0 ? "default" : "destructive"}>
                          {prediction.coinsWon > 0 ? `Won ${prediction.coinsWon}` : 'Lost'}
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Pending</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
            <CardDescription>Manage your preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-semibold">Notifications</h3>
              <p className="text-sm text-muted-foreground">
                Email notifications for match results (Coming soon)
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">Privacy</h3>
              <p className="text-sm text-muted-foreground">
                Control your data and privacy settings (Coming soon)
              </p>
            </div>
            <div className="pt-4 border-t">
              <Button variant="destructive" disabled>
                Delete Account
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                This action is irreversible (Feature disabled)
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
