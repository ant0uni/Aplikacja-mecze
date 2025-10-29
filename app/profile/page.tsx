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
  matchData?: {
    homeTeam: string;
    awayTeam: string;
    homeScore: number | null;
    awayScore: number | null;
    status: string;
  };
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [checkingPredictions, setCheckingPredictions] = useState<{ [key: number]: boolean }>({});

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
        const predictions = data.predictions || [];
        setPredictions(predictions);
        
        // Auto-check all predictions after fetching
        await autoCheckAllPredictions(predictions);
      }
    } catch (error) {
      console.error("Failed to fetch predictions:", error);
    }
  };

  const autoCheckAllPredictions = async (predictionsToCheck: Prediction[]) => {
    console.log("Auto-checking all predictions...");
    
    for (const prediction of predictionsToCheck) {
      try {
        // Fetch match data from SofaScore
        const response = await fetch(`https://www.sofascore.com/api/v1/event/${prediction.fixtureApiId}`);
        
        if (!response.ok) {
          console.log(`Could not fetch data for match ${prediction.fixtureApiId}`);
          continue;
        }
        
        const data = await response.json();
        const event = data.event;
        
        const homeScore = event.homeScore?.current ?? event.homeScore?.display ?? null;
        const awayScore = event.awayScore?.current ?? event.awayScore?.display ?? null;
        const status = event.status?.description || event.status?.type || 'Unknown';
        
        // Update prediction with match data
        const updatedPrediction = {
          ...prediction,
          matchData: {
            homeTeam: event.homeTeam?.name || 'Home',
            awayTeam: event.awayTeam?.name || 'Away',
            homeScore,
            awayScore,
            status,
          }
        };
        
        // Update in state
        setPredictions(prev => prev.map(p => p.id === prediction.id ? updatedPrediction : p));
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.error(`Failed to check prediction ${prediction.id}:`, error);
      }
    }
    
    console.log("Auto-check completed for all predictions");
  };

  const checkPredictionResult = async (prediction: Prediction) => {
    setCheckingPredictions(prev => ({ ...prev, [prediction.id]: true }));
    
    try {
      // Fetch match data from SofaScore
      const response = await fetch(`https://www.sofascore.com/api/v1/event/${prediction.fixtureApiId}`);
      
      if (!response.ok) {
        alert("Could not fetch match data. The match might not be available.");
        return;
      }
      
      const data = await response.json();
      const event = data.event;
      
      const homeScore = event.homeScore?.current ?? event.homeScore?.display ?? null;
      const awayScore = event.awayScore?.current ?? event.awayScore?.display ?? null;
      const status = event.status?.description || event.status?.type || 'Unknown';
      const isFinished = event.status?.code === 100 || status.toLowerCase().includes('finished') || status.toLowerCase().includes('ft');
      
      // Update prediction with match data
      const updatedPrediction = {
        ...prediction,
        matchData: {
          homeTeam: event.homeTeam?.name || 'Home',
          awayTeam: event.awayTeam?.name || 'Away',
          homeScore,
          awayScore,
          status,
        }
      };
      
      // Update in state
      setPredictions(prev => prev.map(p => p.id === prediction.id ? updatedPrediction : p));
      
      if (!isFinished) {
        alert(`Match Status: ${status}\nThis match is not finished yet. Current score: ${homeScore ?? '-'} - ${awayScore ?? '-'}`);
        return;
      }
      
      if (homeScore === null || awayScore === null) {
        alert("Match is finished but scores are not available.");
        return;
      }
      
      // Check if prediction was correct
      const predictionCorrect = prediction.predictedHomeScore === homeScore && 
                                prediction.predictedAwayScore === awayScore;
      
      const resultMessage = predictionCorrect 
        ? `🎉 YOU WON!\n\nYour Prediction: ${prediction.predictedHomeScore} - ${prediction.predictedAwayScore}\nActual Score: ${homeScore} - ${awayScore}\n\nYou should have won ${prediction.coinsWagered * 2} coins!`
        : `😔 YOU LOST\n\nYour Prediction: ${prediction.predictedHomeScore} - ${prediction.predictedAwayScore}\nActual Score: ${homeScore} - ${awayScore}\n\nBetter luck next time!`;
      
      alert(resultMessage);
      
      // If prediction is not settled but should be, suggest updating
      if (!prediction.isSettled && predictionCorrect) {
        const shouldSettle = window.confirm("This prediction is not marked as settled in the database. Would you like to try settling it now?");
        if (shouldSettle) {
          // Here you would call an API to settle the prediction
          // For now, just show a message
          alert("Please contact an administrator to settle this prediction manually.");
        }
      }
      
    } catch (error) {
      console.error("Failed to check prediction:", error);
      alert("Failed to check prediction result. Please try again.");
    } finally {
      setCheckingPredictions(prev => ({ ...prev, [prediction.id]: false }));
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
          <Button variant="outline" size="icon" onClick={() => router.push('/auth/dashboard')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
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
                    className="border rounded-lg p-3 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-semibold">
                          Prediction: {prediction.predictedHomeScore} - {prediction.predictedAwayScore}
                        </p>
                        {prediction.matchData && (
                          <p className="text-sm text-muted-foreground">
                            {prediction.matchData.homeTeam} vs {prediction.matchData.awayTeam}
                          </p>
                        )}
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
                    
                    {/* Match Result Display */}
                    {prediction.matchData && (
                      <div className="pt-2 border-t">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Match Result:</span>
                          <span className="font-semibold">
                            {prediction.matchData.homeScore !== null && prediction.matchData.awayScore !== null
                              ? `${prediction.matchData.homeScore} - ${prediction.matchData.awayScore}`
                              : prediction.matchData.status}
                          </span>
                        </div>
                        {prediction.matchData.homeScore !== null && prediction.matchData.awayScore !== null && (
                          <div className="mt-1">
                            {prediction.predictedHomeScore === prediction.matchData.homeScore && 
                             prediction.predictedAwayScore === prediction.matchData.awayScore ? (
                              <Badge variant="default" className="text-xs">✓ Correct Prediction!</Badge>
                            ) : (
                              <Badge variant="destructive" className="text-xs">✗ Incorrect</Badge>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Check Result Button */}
                    {!prediction.isSettled && (
                      <div className="pt-2 border-t">
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full"
                          onClick={() => checkPredictionResult(prediction)}
                          disabled={checkingPredictions[prediction.id]}
                        >
                          {checkingPredictions[prediction.id] ? (
                            <>
                              <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                              Checking...
                            </>
                          ) : (
                            <>
                              🔍 Check Result Manually
                            </>
                          )}
                        </Button>
                      </div>
                    )}
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
