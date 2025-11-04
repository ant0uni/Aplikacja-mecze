"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2, Trophy, Target, Coins, Calendar, Award, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { BADGE_DEFINITIONS } from "@/lib/badges";
import { AVATARS, BACKGROUNDS, FRAMES, VICTORY_EFFECTS, SHOP_ITEMS } from "@/lib/shop-items";

interface UserProfile {
  id: number;
  email: string;
  nickname: string;
  coins: number;
  badges: string[];
  avatar: string | null;
  profileBackground: string | null;
  avatarFrame: string | null;
  victoryEffect: string | null;
  profileTitle: string | null;
  createdAt: string;
  stats: {
    totalPredictions: number;
    settledPredictions: number;
    wonPredictions: number;
    lostPredictions: number;
    winRate: number;
    totalCoinsWagered: number;
    totalCoinsWon: number;
  };
}

export default function PublicUserProfile() {
  const params = useParams();
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchUserProfile(params.id as string);
    }
  }, [params.id]);

  const fetchUserProfile = async (userId: string) => {
    try {
      const response = await fetch(`/api/users/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        router.push("/ranking");
      }
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
      router.push("/ranking");
    } finally {
      setLoading(false);
    }
  };

  const getAvatarInitials = (nickname: string | null, email: string) => {
    if (nickname && nickname.length >= 2) {
      return nickname.substring(0, 2).toUpperCase();
    }
    return email.substring(0, 2).toUpperCase();
  };

  // Get customization styles
  const avatarStyle = AVATARS[user?.avatar || 'default'] || AVATARS.default;
  const backgroundStyle = BACKGROUNDS[user?.profileBackground || 'default'] || BACKGROUNDS.default;
  const frameStyle = FRAMES[user?.avatarFrame || 'none'] || FRAMES.none;
  const victoryEffectStyle = VICTORY_EFFECTS[user?.victoryEffect || 'none'] || VICTORY_EFFECTS.none;
  const profileTitleData = user?.profileTitle 
    ? SHOP_ITEMS.find(item => item.id === user.profileTitle) 
    : null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">User not found</p>
          <Button onClick={() => router.push("/ranking")}>Back to Ranking</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Back Button */}
      <div className="container mx-auto px-4 pt-4">
        <Button variant="ghost" onClick={() => router.push("/ranking")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Ranking
        </Button>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative"
        >
          {/* Profile Banner */}
          <div className={`bg-gradient-to-r ${backgroundStyle.gradient} h-48 rounded-t-2xl relative overflow-hidden`}>
            <div className="absolute inset-0 bg-black/20"></div>
          </div>

          {/* Avatar and Basic Info */}
          <div className="relative px-6 pb-6 bg-card rounded-b-2xl border-x border-b">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 -mt-16">
              {/* Avatar */}
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="relative"
              >
                <div className={`w-32 h-32 rounded-full bg-gradient-to-br ${avatarStyle.gradient} ${frameStyle.border} ${frameStyle.shadow} ${victoryEffectStyle.animation} ${victoryEffectStyle.glow} flex items-center justify-center text-white font-bold text-4xl border-4 border-card shadow-xl`}>
                  {avatarStyle.icon || getAvatarInitials(user.nickname, user.email)}
                </div>
              </motion.div>

              {/* User Info */}
              <div className="flex-1 text-center sm:text-left sm:mt-16">
                <div className="flex flex-col sm:flex-row items-center gap-2 mb-2">
                  <h1 className="text-3xl font-bold">{user.nickname || "Anonymous"}</h1>
                  {profileTitleData && (
                    <Badge variant="secondary" className="text-xs">
                      {profileTitleData.icon} {profileTitleData.namePolish}
                    </Badge>
                  )}
                </div>
                <p className="text-muted-foreground text-sm mb-3">{user.email}</p>
                <div className="flex items-center gap-2 justify-center sm:justify-start text-yellow-600">
                  <Coins className="h-5 w-5" />
                  <span className="font-bold text-xl">{user.coins.toLocaleString()} coins</span>
                </div>
              </div>

              {/* Member Since */}
              <div className="text-center sm:text-right text-sm text-muted-foreground sm:mt-16">
                <div className="flex items-center gap-1 justify-center sm:justify-end">
                  <Calendar className="h-4 w-4" />
                  <span>Member since {new Date(user.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Badges Section */}
        {user.badges && user.badges.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-6"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Badges
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4">
                  {user.badges.map((badgeId) => {
                    const badge = BADGE_DEFINITIONS[badgeId];
                    if (!badge) return null;
                    return (
                      <motion.div
                        key={badgeId}
                        whileHover={{ scale: 1.05 }}
                        className={`flex flex-col items-center gap-2 p-4 rounded-lg border ${badge.color}`}
                      >
                        <div className="text-4xl">{badge.icon}</div>
                        <div className="text-center">
                          <div className="font-semibold text-sm">{badge.name}</div>
                          <div className="text-xs text-muted-foreground">{badge.description}</div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Statistics Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {/* Total Predictions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Target className="h-4 w-4 text-blue-500" />
                Total Predictions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{user.stats.totalPredictions}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {user.stats.settledPredictions} settled
              </p>
            </CardContent>
          </Card>

          {/* Win Rate */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                Win Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{user.stats.winRate}%</div>
              <p className="text-xs text-muted-foreground mt-1">
                {user.stats.wonPredictions}W / {user.stats.lostPredictions}L
              </p>
            </CardContent>
          </Card>

          {/* Coins Wagered */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Coins className="h-4 w-4 text-yellow-500" />
                Total Wagered
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {user.stats.totalCoinsWagered.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">coins bet</p>
            </CardContent>
          </Card>

          {/* Coins Won */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Trophy className="h-4 w-4 text-yellow-600" />
                Total Won
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {user.stats.totalCoinsWon.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">coins earned</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Achievement Highlights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                Profile Highlights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="text-sm font-medium">Current Balance</span>
                <Badge className="bg-yellow-600 text-white">
                  {user.coins.toLocaleString()} coins
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="text-sm font-medium">Prediction Accuracy</span>
                <Badge variant={user.stats.winRate >= 50 ? "default" : "secondary"}>
                  {user.stats.winRate}%
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="text-sm font-medium">Total Earnings</span>
                <Badge variant="outline" className="text-green-600 border-green-600">
                  +{user.stats.totalCoinsWon.toLocaleString()} coins
                </Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
