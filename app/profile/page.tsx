"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, Loader2, Trophy, TrendingUp, TrendingDown, LogOut } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/theme-toggle";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BADGE_DEFINITIONS } from "@/lib/badges";
import { AVATARS, BACKGROUNDS, FRAMES, VICTORY_EFFECTS } from "@/lib/shop-items";
import { SHOP_ITEMS } from "@/lib/shop-items";
import Image from "next/image";

interface User {
  id: number;
  email: string;
  nickname: string;
  coins: number;
  badges: string[];
  avatar: string;
  profileBackground: string;
  avatarFrame: string;
  victoryEffect: string;
  profileTitle: string | null;
  ownedItems: string[];
  createdAt: string;
}

interface Prediction {
  id: number;
  predictionType: string;
  // Match prediction fields
  fixtureId?: number;
  fixtureApiId?: number;
  predictedHomeScore?: number;
  predictedAwayScore?: number;
  // League prediction fields
  leagueId?: number;
  leagueName?: string;
  predictedWinnerId?: number;
  predictedWinnerName?: string;
  predictedWinnerLogo?: string;
  // Common fields
  coinsWagered: number;
  coinsWon: number;
  verdict: string;
  isSettled: boolean;
  createdAt: string;
  fixture?: {
    homeTeamName: string | null;
    awayTeamName: string | null;
    homeTeamLogo: string | null;
    awayTeamLogo: string | null;
    homeScore: number | null;
    awayScore: number | null;
    stateName: string | null;
    startingAt: string | null;
  } | null;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSettling, setIsSettling] = useState(false);
  const [coinsToAdd, setCoinsToAdd] = useState("");
  const [isAddingCoins, setIsAddingCoins] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState("");
  const [isAddingBadge, setIsAddingBadge] = useState(false);
  const [isEquipping, setIsEquipping] = useState(false);

  useEffect(() => {
    const initializeProfile = async () => {
      await fetchUser();
      await fetchPredictions();
      await settlePendingPredictions();
    };
    initializeProfile();
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
        console.log("Fetched predictions:", predictions);
        console.log("Sample prediction fixture data:", predictions[0]?.fixture);
        setPredictions(predictions);
      }
    } catch (error) {
      console.error("Failed to fetch predictions:", error);
    }
  };

  const settlePendingPredictions = async () => {
    setIsSettling(true);
    try {
      const response = await fetch("/api/predictions/settle", {
        method: "POST",
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.settledCount > 0) {
          toast.success(
            `Settled ${data.settledCount} prediction${data.settledCount > 1 ? 's' : ''}! ${
              data.totalCoinsWon > 0 ? `You won ${data.totalCoinsWon} coins!` : ''
            }`
          );
          
          // Refresh user data and predictions after settlement
          await fetchUser();
          await fetchPredictions();
        }
      }
    } catch (error) {
      console.error("Failed to settle predictions:", error);
    } finally {
      setIsSettling(false);
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleAddCoins = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseInt(coinsToAdd);

    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    setIsAddingCoins(true);
    try {
      const response = await fetch("/api/user/coins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setCoinsToAdd("");
        toast.success(`Successfully added ${amount} coins!`);
      } else {
        toast.error("Failed to add coins");
      }
    } catch (error) {
      console.error("Failed to add coins:", error);
      toast.error("Failed to add coins");
    } finally {
      setIsAddingCoins(false);
    }
  };

  const handleAddBadge = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedBadge) {
      toast.error("Please select a badge");
      return;
    }

    setIsAddingBadge(true);
    try {
      const response = await fetch("/api/user/badges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ badgeId: selectedBadge }),
      });

      if (response.ok) {
        toast.success("Badge added successfully!");
        setSelectedBadge("");
        await fetchUser(); // Refresh user data
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to add badge");
      }
    } catch (error) {
      console.error("Failed to add badge:", error);
      toast.error("Failed to add badge");
    } finally {
      setIsAddingBadge(false);
    }
  };

  const handleEquipItem = async (itemId: string, category: string) => {
    setIsEquipping(true);
    try {
      const response = await fetch("/api/shop/equip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId, category }),
      });

      if (response.ok) {
        toast.success("Item equipped!");
        await fetchUser(); // Refresh user data
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to equip item");
      }
    } catch (error) {
      console.error("Failed to equip item:", error);
      toast.error("Failed to equip item");
    } finally {
      setIsEquipping(false);
    }
  };

  const totalWagered = predictions.reduce((sum, p) => sum + p.coinsWagered, 0);
  const totalWon = predictions.reduce((sum, p) => sum + p.coinsWon, 0);
  const settledPredictions = predictions.filter(p => p.isSettled);
  const pendingPredictions = predictions.filter(p => !p.isSettled);
  const successfulPredictions = predictions.filter(p => p.isSettled && p.coinsWon > 0);

  // Get customization
  const avatarStyle = AVATARS[user?.avatar || 'default'] || AVATARS.default;
  const backgroundStyle = BACKGROUNDS[user?.profileBackground || 'default'] || BACKGROUNDS.default;
  const frameStyle = FRAMES[user?.avatarFrame || 'none'] || FRAMES.none;
  const victoryEffectStyle = VICTORY_EFFECTS[user?.victoryEffect || 'none'] || VICTORY_EFFECTS.none;
  const profileTitleData = user?.profileTitle 
    ? SHOP_ITEMS.find(item => item.id === user.profileTitle) 
    : null;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          {isSettling && (
            <p className="text-muted-foreground">Checking prediction results...</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen football-bg p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => router.push('/auth/dashboard')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Profile</h1>
              <p className="text-muted-foreground">View your stats and predictions</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => router.push('/ranking')}>
              🏆 Ranking
            </Button>
            <Button variant="outline" onClick={() => router.push('/auth/shop')}>
              🛒 Shop
            </Button>
            <ThemeToggle />
            <Button onClick={handleLogout} variant="outline" size="icon" title="Logout">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Profile Banner */}
        <Card className={`bg-gradient-to-r ${backgroundStyle.gradient} text-white`}>
          <CardContent className="p-8">
            <div className="flex items-center gap-6">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${avatarStyle.gradient} backdrop-blur-sm ${frameStyle.border} ${frameStyle.shadow} ${victoryEffectStyle.animation} ${victoryEffectStyle.glow} flex items-center justify-center text-4xl font-bold`}>
                  {avatarStyle.icon || (user?.nickname ? user.nickname.substring(0, 2).toUpperCase() : "??")}
                </div>
              </div>
              
              {/* User Info */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h2 className="text-3xl font-bold">{user?.nickname || "Player"}</h2>
                  {profileTitleData && (
                    <Badge variant="secondary" className="text-xs">
                      {profileTitleData.icon} {profileTitleData.namePolish}
                    </Badge>
                  )}
                </div>
                <p className="text-white/90 mb-4">{user?.email}</p>
                <div className="flex items-center gap-6">
                  <div>
                    <p className="text-white/80 text-sm">Balance</p>
                    <p className="text-2xl font-bold">{user?.coins} 🪙</p>
                  </div>
                  <div>
                    <p className="text-white/80 text-sm">Member Since</p>
                    <p className="text-lg font-semibold">
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-white/80 text-sm">Total Predictions</p>
                    <p className="text-lg font-semibold">{predictions.length}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Badges Section */}
        {user && user.badges && user.badges.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Badges</CardTitle>
              <CardDescription>Your earned achievements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {user.badges.map((badgeId) => {
                  const badge = BADGE_DEFINITIONS[badgeId];
                  if (!badge) return null;
                  return (
                    <motion.div
                      key={badgeId}
                      whileHover={{ scale: 1.05, y: -2 }}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${badge.color}`}
                    >
                      <span className="text-2xl">{badge.icon}</span>
                      <div>
                        <p className="font-semibold text-sm">{badge.name}</p>
                        <p className="text-xs opacity-80">{badge.description}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Inventory Section */}
        {user && user.ownedItems && user.ownedItems.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>My Inventory</CardTitle>
                  <CardDescription>Items you own - click to equip</CardDescription>
                </div>
                <Button variant="outline" onClick={() => router.push('/auth/shop')}>
                  🛒 Visit Shop
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {user.ownedItems.map((itemId) => {
                  const item = SHOP_ITEMS.find((i) => i.id === itemId);
                  if (!item) return null;
                  
                  // Skip badges - they're shown in the badges section
                  if (item.category === 'badge') return null;

                  const isEquipped = 
                    (item.category === 'avatar' && user.avatar === itemId) ||
                    (item.category === 'background' && user.profileBackground === itemId) ||
                    (item.category === 'frame' && user.avatarFrame === itemId) ||
                    (item.category === 'effect' && user.victoryEffect === itemId) ||
                    (item.category === 'title' && user.profileTitle === itemId);

                  return (
                    <motion.div
                      key={itemId}
                      whileHover={{ scale: 1.02 }}
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        isEquipped ? 'border-primary bg-primary/5' : 'hover:border-primary/50'
                      }`}
                      onClick={() => !isEquipping && handleEquipItem(itemId, item.category)}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-3xl">{item.icon}</span>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-semibold text-sm">{item.namePolish}</h4>
                            {isEquipped && (
                              <Badge variant="default" className="text-xs">
                                Equipped
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">{item.description}</p>
                          <Badge variant="outline" className="text-xs">
                            {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                          </Badge>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
              
              {/* Unequip Options */}
              <div className="mt-4 pt-4 border-t space-y-2">
                <p className="text-sm font-semibold mb-2">Quick Actions:</p>
                <div className="flex flex-wrap gap-2">
                  {user.avatar !== 'default' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEquipItem('default', 'avatar')}
                      disabled={isEquipping}
                    >
                      Reset Avatar
                    </Button>
                  )}
                  {user.profileBackground !== 'default' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEquipItem('default', 'background')}
                      disabled={isEquipping}
                    >
                      Reset Background
                    </Button>
                  )}
                  {user.avatarFrame !== 'none' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEquipItem('none', 'frame')}
                      disabled={isEquipping}
                    >
                      Remove Frame
                    </Button>
                  )}
                  {user.profileTitle && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEquipItem('none', 'title')}
                      disabled={isEquipping}
                    >
                      Remove Title
                    </Button>
                  )}
                  {user.victoryEffect && user.victoryEffect !== 'none' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEquipItem('none', 'effect')}
                      disabled={isEquipping}
                    >
                      Remove Effect
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Account Info */}
        <Card className="hidden">
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
              <motion.div 
                className="text-center p-4 border rounded-lg"
                whileHover={{ scale: 1.05, y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Trophy className="h-6 w-6 mx-auto mb-2 text-yellow-500" />
                </motion.div>
                <p className="text-2xl font-bold">{successfulPredictions.length}</p>
                <p className="text-sm text-muted-foreground">Won</p>
              </motion.div>
              <motion.div 
                className="text-center p-4 border rounded-lg"
                whileHover={{ scale: 1.05, y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <TrendingDown className="h-6 w-6 mx-auto mb-2 text-red-500" />
                <p className="text-2xl font-bold">
                  {settledPredictions.length - successfulPredictions.length}
                </p>
                <p className="text-sm text-muted-foreground">Lost</p>
              </motion.div>
              <motion.div 
                className="text-center p-4 border rounded-lg"
                whileHover={{ scale: 1.05, y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <TrendingUp className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                </motion.div>
                <p className="text-2xl font-bold">{totalWon}</p>
                <p className="text-sm text-muted-foreground">Coins Won</p>
              </motion.div>
              <motion.div 
                className="text-center p-4 border rounded-lg"
                whileHover={{ scale: 1.05, y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                >
                  <div className="h-6 w-6 mx-auto mb-2 text-muted-foreground">⏳</div>
                </motion.div>
                <p className="text-2xl font-bold">{pendingPredictions.length}</p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </motion.div>
            </div>

            <motion.div 
              className="mt-6 p-4 bg-muted rounded-lg"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">Win Rate</p>
                  <motion.p 
                    className="text-2xl font-bold"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {settledPredictions.length > 0
                      ? ((successfulPredictions.length / settledPredictions.length) * 100).toFixed(1)
                      : 0}%
                  </motion.p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Net Profit</p>
                  <p className={`text-2xl font-bold ${totalWon - totalWagered >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {totalWon - totalWagered >= 0 ? '+' : ''}{totalWon - totalWagered}
                  </p>
                </div>
              </div>
            </motion.div>
          </CardContent>
        </Card>

        {/* Recent Predictions */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Predictions</CardTitle>
                <CardDescription>Your latest betting activity</CardDescription>
              </div>
              {pendingPredictions.length > 0 && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={async () => {
                    await settlePendingPredictions();
                  }}
                  disabled={isSettling}
                >
                  {isSettling ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Checking...
                    </>
                  ) : (
                    '🔄 Check Pending'
                  )}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {predictions.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No predictions yet. Start predicting matches to see your history here!
              </p>
            ) : (
              <div className="space-y-3">
                {predictions.slice(0, 10).map((prediction) => {
                  // League prediction display
                  if (prediction.predictionType === "league") {
                    return (
                      <motion.div
                        key={prediction.id}
                        className="border rounded-lg p-4 space-y-3 hover:shadow-lg hover:border-primary/50 transition-all"
                        whileHover={{ scale: 1.01 }}
                      >
                        {/* League Header */}
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3 flex-1">
                            <div className="text-2xl">🏆</div>
                            <div>
                              <div className="font-semibold">{prediction.leagueName || "League"} Winner</div>
                              <div className="text-sm text-muted-foreground">League Prediction</div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Predicted Winner */}
                        <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                          {prediction.predictedWinnerLogo ? (
                            <Image 
                              src={prediction.predictedWinnerLogo} 
                              alt={prediction.predictedWinnerName || 'Team'}
                              width={40}
                              height={40}
                              className="rounded-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold">
                              {prediction.predictedWinnerName?.substring(0, 2) || 'T'}
                            </div>
                          )}
                          <div>
                            <div className="text-xs text-muted-foreground">Your Prediction</div>
                            <div className="font-bold">{prediction.predictedWinnerName || 'Team'}</div>
                          </div>
                        </div>

                        {/* Info Row */}
                        <div className="flex items-center justify-between text-sm text-muted-foreground border-t pt-2">
                          <div className="flex items-center gap-4">
                            <span>📅 {new Date(prediction.createdAt).toLocaleDateString()}</span>
                            <span>💰 Wagered: {prediction.coinsWagered} coins</span>
                          </div>
                          <div>
                            {prediction.isSettled ? (
                              <Badge variant={prediction.coinsWon > 0 ? "default" : "destructive"}>
                                {prediction.coinsWon > 0 ? `Won ${prediction.coinsWon} coins` : 'Lost'}
                              </Badge>
                            ) : (
                              <Badge variant="secondary">⏳ Pending</Badge>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  }

                  // Match prediction display
                  return (
                    <motion.div
                      key={prediction.id}
                      className="border rounded-lg p-4 space-y-3 cursor-pointer hover:shadow-lg hover:border-primary/50 transition-all"
                      onClick={() => prediction.fixtureApiId && router.push(`/match/${prediction.fixtureApiId}`)}
                      whileHover={{ scale: 1.01 }}
                    >
                      {/* Match Header with Teams */}
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1 flex items-center gap-3">
                          {/* Home Team */}
                          <div className="flex items-center gap-2 flex-1">
                            {prediction.fixture?.homeTeamLogo ? (
                              <Image 
                                src={prediction.fixture.homeTeamLogo} 
                                alt={prediction.fixture.homeTeamName || 'Home'}
                                width={32}
                                height={32}
                                className="rounded-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
                                {prediction.fixture?.homeTeamName?.substring(0, 1) || 'H'}
                              </div>
                            )}
                            <span className="font-semibold text-sm">
                              {prediction.fixture?.homeTeamName || 'Home Team'}
                            </span>
                          </div>
                          
                          {/* Score Display */}
                          <div className="flex flex-col items-center px-4 py-2 bg-muted rounded-lg min-w-[120px]">
                            <div className="text-xs text-muted-foreground mb-1">Your Prediction</div>
                            <div className="text-2xl font-bold">
                              {prediction.predictedHomeScore ?? 0} - {prediction.predictedAwayScore ?? 0}
                            </div>
                          </div>
                          
                          {/* Away Team */}
                          <div className="flex items-center gap-2 flex-1 justify-end">
                            <span className="font-semibold text-sm">
                              {prediction.fixture?.awayTeamName || 'Away Team'}
                            </span>
                            {prediction.fixture?.awayTeamLogo ? (
                              <Image 
                                src={prediction.fixture.awayTeamLogo} 
                                alt={prediction.fixture.awayTeamName || 'Away'}
                                width={32}
                                height={32}
                                className="rounded-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
                                {prediction.fixture?.awayTeamName?.substring(0, 1) || 'A'}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Match Info Row */}
                      <div className="flex items-center justify-between text-sm text-muted-foreground border-t pt-2">
                        <div className="flex items-center gap-4">
                          <span>
                            📅 {prediction.fixture?.startingAt 
                              ? new Date(prediction.fixture.startingAt).toLocaleDateString('en-US', { 
                                  month: 'short', 
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })
                              : new Date(prediction.createdAt).toLocaleDateString()}
                          </span>
                          <span>💰 Wagered: {prediction.coinsWagered} coins</span>
                        </div>
                        <div>
                          {prediction.isSettled ? (
                            <Badge variant={prediction.coinsWon > 0 ? "default" : "destructive"}>
                              {prediction.coinsWon > 0 ? `Won ${prediction.coinsWon} coins` : 'Lost'}
                            </Badge>
                          ) : (
                            <Badge variant="secondary">⏳ Pending</Badge>
                          )}
                        </div>
                      </div>
                      
                      {/* Match Result Display */}
                      {prediction.fixture && prediction.fixture.homeScore !== null && prediction.fixture.awayScore !== null && (
                        <div className="pt-2 border-t">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-muted-foreground">Actual Result:</span>
                              <span className="font-bold text-lg">
                                {prediction.fixture.homeScore} - {prediction.fixture.awayScore}
                              </span>
                            </div>
                            <div>
                              {prediction.predictedHomeScore === prediction.fixture.homeScore && 
                               prediction.predictedAwayScore === prediction.fixture.awayScore ? (
                                <Badge variant="default" className="text-xs">✓ Perfect Prediction!</Badge>
                              ) : (
                                <Badge variant="destructive" className="text-xs">✗ Incorrect</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
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

        {/* Developer Tools */}
        <Card>
          <CardHeader>
            <CardTitle>Developer Tools</CardTitle>
            <CardDescription>Testing features</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Add Coins */}
            <div>
              <h3 className="font-semibold mb-2">Add Coins</h3>
              <form onSubmit={handleAddCoins} className="flex gap-2">
                <div className="flex-1">
                  <Label htmlFor="coins" className="sr-only">
                    Add Coins
                  </Label>
                  <Input
                    id="coins"
                    type="number"
                    placeholder="Enter amount to add"
                    value={coinsToAdd}
                    onChange={(e) => setCoinsToAdd(e.target.value)}
                    disabled={isAddingCoins}
                    min="1"
                  />
                </div>
                <Button type="submit" disabled={isAddingCoins}>
                  {isAddingCoins ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Add Coins
                </Button>
              </form>
              <p className="text-xs text-muted-foreground mt-2">
                Temporary feature: Add coins manually for testing
              </p>
            </div>

            {/* Add Badge */}
            <div className="pt-4 border-t">
              <h3 className="font-semibold mb-2">Add Badge</h3>
              <form onSubmit={handleAddBadge} className="flex gap-2">
                <div className="flex-1">
                  <Label htmlFor="badge" className="sr-only">
                    Select Badge
                  </Label>
                  <select
                    id="badge"
                    value={selectedBadge}
                    onChange={(e) => setSelectedBadge(e.target.value)}
                    disabled={isAddingBadge}
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="">Select a badge...</option>
                    {Object.entries(BADGE_DEFINITIONS).map(([id, badge]) => (
                      <option key={id} value={id}>
                        {badge.icon} {badge.name}
                      </option>
                    ))}
                  </select>
                </div>
                <Button type="submit" disabled={isAddingBadge || !selectedBadge}>
                  {isAddingBadge ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Add Badge
                </Button>
              </form>
              <p className="text-xs text-muted-foreground mt-2">
                Test feature: Add badges to your profile (in future, users can earn or buy badges)
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
