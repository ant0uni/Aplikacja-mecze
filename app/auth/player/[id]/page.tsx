"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2, Calendar, Trophy, TrendingUp, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ApiCache } from "@/lib/cache";

interface PlayerDetails {
  id: number;
  name: string;
  firstName?: string;
  lastName?: string;
  slug?: string;
  shortName?: string;
  position?: string;
  jerseyNumber?: string;
  height?: number;
  dateOfBirth?: number;
  country?: {
    id: number;
    name: string;
  };
  team?: {
    id: number;
    name: string;
    slug?: string;
  };
  marketValue?: number;
  preferredFoot?: string;
}

interface PlayerStats {
  goals?: number;
  assists?: number;
  yellowCards?: number;
  redCards?: number;
  appearances?: number;
  rating?: number;
  minutesPlayed?: number;
  goalsPer90?: number;
  successfulDribbles?: number;
  successfulDribblesPercentage?: number;
  totalShots?: number;
  shotsOnTarget?: number;
  accuratePasses?: number;
  totalPasses?: number;
  accuratePassesPercentage?: number;
  tackles?: number;
  interceptions?: number;
  duelsWon?: number;
  duelsWonPercentage?: number;
  aerialDuelsWon?: number;
  aerialDuelsWonPercentage?: number;
}

export default function PlayerPage() {
  const params = useParams();
  const router = useRouter();
  const [player, setPlayer] = useState<PlayerDetails | null>(null);
  const [stats, setStats] = useState<PlayerStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [liveMatches, setLiveMatches] = useState<any[]>([]);

  useEffect(() => {
    if (params.id) {
      fetchPlayerDetails();
    }
    fetchLiveMatches();
  }, [params.id]);

  const fetchLiveMatches = async () => {
    try {
      const cacheKey = 'live-matches-scroll';
      const matches = await ApiCache.getOrFetch(
        cacheKey,
        async () => {
          const response = await fetch('https://www.sofascore.com/api/v1/sport/football/events/live');
          if (!response.ok) return [];
          const data = await response.json();
          const events = data.events || [];
          return events.slice(0, 10).map((event: any) => ({
            id: event.id,
            home_team_name: event.homeTeam?.name || 'Home',
            away_team_name: event.awayTeam?.name || 'Away',
            home_score: event.homeScore?.current ?? 0,
            away_score: event.awayScore?.current ?? 0,
            league_name: event.tournament?.name || 'Unknown',
          }));
        },
        ApiCache.DURATIONS.SHORT,
        true
      );
      setLiveMatches(matches);
    } catch (err) {
      console.error('Failed to fetch live matches:', err);
    }
  };

  const fetchPlayerDetails = async () => {
    try {
      const cacheKey = `player-details-${params.id}`;
      
      // Fetch player details from SofaScore with caching
      const playerData = await ApiCache.getOrFetch(
        cacheKey,
        async () => {
          const playerResponse = await fetch(`https://www.sofascore.com/api/v1/player/${params.id}`);
          if (!playerResponse.ok) throw new Error('Player not found');
          return await playerResponse.json();
        },
        ApiCache.DURATIONS.MEDIUM,
        true
      );
      
      if (!playerData || !playerData.player) {
        setError("Player not found");
        setIsLoading(false);
        return;
      }
      
      const playerInfo = playerData.player;
      
      const playerDetails: PlayerDetails = {
        id: playerInfo.id,
        name: playerInfo.name,
        firstName: playerInfo.firstName,
        lastName: playerInfo.lastName,
        slug: playerInfo.slug,
        shortName: playerInfo.shortName,
        position: playerInfo.position,
        jerseyNumber: playerInfo.jerseyNumber,
        height: playerInfo.height,
        dateOfBirth: playerInfo.dateOfBirthTimestamp,
        country: playerInfo.country,
        team: playerInfo.team,
        marketValue: playerInfo.proposedMarketValue,
        preferredFoot: playerInfo.preferredFoot,
      };
      
      setPlayer(playerDetails);

      // Fetch player statistics if available
      try {
        // Try to get the latest season statistics
        const statsResponse = await fetch(`https://api.sofascore.com/api/v1/player/${params.id}/statistics/seasons`);
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          console.log("Player statistics data:", statsData);
          
          // Get the most recent unique tournament statistics
          if (statsData.uniqueTournamentSeasons && statsData.uniqueTournamentSeasons.length > 0) {
            const latestTournament = statsData.uniqueTournamentSeasons[0];
            
            // Fetch detailed statistics for this season
            const detailStatsResponse = await fetch(
              `https://api.sofascore.com/api/v1/player/${params.id}/unique-tournament/${latestTournament.uniqueTournament.id}/season/${latestTournament.seasons[0].id}/statistics/overall`
            );
            
            if (detailStatsResponse.ok) {
              const detailStats = await detailStatsResponse.json();
              console.log("Detailed player statistics:", detailStats);
              
              const stats = detailStats.statistics;
              setStats({
                goals: stats?.goals,
                assists: stats?.assists,
                yellowCards: stats?.yellowCards,
                redCards: stats?.redCards,
                appearances: stats?.appearances,
                rating: stats?.rating,
                minutesPlayed: stats?.minutesPlayed,
                goalsPer90: stats?.goalsPer90,
                successfulDribbles: stats?.successfulDribbles,
                successfulDribblesPercentage: stats?.successfulDribblesPercentage,
                totalShots: stats?.shotsTotal,
                shotsOnTarget: stats?.shotsOnTarget,
                accuratePasses: stats?.accuratePasses,
                totalPasses: stats?.totalPasses,
                accuratePassesPercentage: stats?.accuratePassesPercentage,
                tackles: stats?.tackles,
                interceptions: stats?.interceptions,
                duelsWon: stats?.duelsWon,
                duelsWonPercentage: stats?.duelsWonPercentage,
                aerialDuelsWon: stats?.aerialDuelsWon,
                aerialDuelsWonPercentage: stats?.aerialDuelsWonPercentage,
              });
            }
          }
        }
      } catch (statsError) {
        console.error("Failed to fetch player stats:", statsError);
      }
      
    } catch (err) {
      console.error("Failed to fetch player details:", err);
      setError("Failed to load player details");
    } finally {
      setIsLoading(false);
    }
  };

  const getAge = (timestamp?: number) => {
    if (!timestamp) return null;
    const birthDate = new Date(timestamp * 1000);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !player) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">{error || "Player not found"}</p>
            <div className="flex justify-center mt-4">
              <Link href="/auth/dashboard">
                <Button>Back to Dashboard</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen football-bg p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4"
        >
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">⭐ Player Profile</h1>
            <p className="text-muted-foreground">Detailed player information and statistics</p>
          </div>
        </motion.div>

        {/* Player Info Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Player Image */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="flex-shrink-0"
                >
                  <div className="w-48 h-48 mx-auto md:mx-0 rounded-lg overflow-hidden bg-muted flex items-center justify-center border-4 border-primary/20">
                    <img
                      src={`https://api.sofascore.com/api/v1/player/${player.id}/image`}
                      alt={player.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '';
                        (e.target as HTMLImageElement).style.display = 'none';
                        const parent = (e.target as HTMLImageElement).parentElement;
                        if (parent) {
                          parent.innerHTML = `<div class="text-6xl font-bold">${player.name.substring(0, 2).toUpperCase()}</div>`;
                        }
                      }}
                    />
                  </div>
                </motion.div>

                {/* Player Details */}
                <div className="flex-1 space-y-4">
                  <div>
                    <motion.h2
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                      className="text-4xl font-bold"
                    >
                      {player.name}
                    </motion.h2>
                    {player.jerseyNumber && (
                      <div className="flex items-center gap-2 mt-2">
                        <motion.div
                          animate={{ rotate: [0, 5, -5, 0] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <Badge variant="secondary" className="text-lg px-3 py-1">
                            #{player.jerseyNumber}
                          </Badge>
                        </motion.div>
                        {player.position && (
                        <Badge variant="outline" className="text-lg px-3 py-1">
                          {player.position}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {player.team && (
                    <div>
                      <p className="text-sm text-muted-foreground">Current Team</p>
                      <p className="font-semibold">{player.team.name}</p>
                    </div>
                  )}
                  
                  {player.country && (
                    <div>
                      <p className="text-sm text-muted-foreground">Nationality</p>
                      <p className="font-semibold">{player.country.name}</p>
                    </div>
                  )}
                  
                  {player.dateOfBirth && (
                    <div>
                      <p className="text-sm text-muted-foreground">Age</p>
                      <p className="font-semibold">
                        {getAge(player.dateOfBirth)} years old
                      </p>
                    </div>
                  )}
                  
                  {player.height && (
                    <div>
                      <p className="text-sm text-muted-foreground">Height</p>
                      <p className="font-semibold">{player.height} cm</p>
                    </div>
                  )}
                  
                  {player.preferredFoot && (
                    <div>
                      <p className="text-sm text-muted-foreground">Preferred Foot</p>
                      <p className="font-semibold capitalize">{player.preferredFoot}</p>
                    </div>
                  )}
                  
                  {player.marketValue && (
                    <div>
                      <p className="text-sm text-muted-foreground">Market Value</p>
                      <p className="font-semibold">€{(player.marketValue / 1000000).toFixed(1)}M</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

        {/* Statistics Card */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    <TrendingUp className="h-5 w-5 text-primary" />
                  </motion.div>
                  Season Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Main Stats */}
                <div>
                  <h3 className="font-semibold text-lg mb-3">Performance</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {stats.appearances !== undefined && (
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="text-center p-4 border rounded-lg"
                      >
                        <motion.div
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <Users className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                        </motion.div>
                        <div className="text-3xl font-bold">{stats.appearances}</div>
                        <div className="text-sm text-muted-foreground mt-1">Appearances</div>
                      </motion.div>
                    )}
                    
                    {stats.minutesPlayed !== undefined && (
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="text-center p-4 border rounded-lg"
                      >
                        <Calendar className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                        <div className="text-3xl font-bold">{stats.minutesPlayed}</div>
                        <div className="text-sm text-muted-foreground mt-1">Minutes Played</div>
                      </motion.div>
                    )}
                    
                    {stats.goals !== undefined && (
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="text-center p-4 border rounded-lg"
                      >
                        <motion.div
                          animate={{ rotate: [0, 360] }}
                          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                          className="text-4xl mb-2"
                        >
                          ⚽
                        </motion.div>
                        <div className="text-3xl font-bold text-green-600">{stats.goals}</div>
                        <div className="text-sm text-muted-foreground mt-1">Goals</div>
                        {stats.goalsPer90 !== undefined && (
                          <div className="text-xs text-muted-foreground mt-1">({stats.goalsPer90.toFixed(2)} per 90)</div>
                        )}
                      </motion.div>
                    )}
                    
                    {stats.assists !== undefined && (
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="text-center p-4 border rounded-lg"
                      >
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="text-4xl mb-2"
                        >
                          🎯
                        </motion.div>
                        <div className="text-3xl font-bold text-blue-600">{stats.assists}</div>
                        <div className="text-sm text-muted-foreground mt-1">Assists</div>
                      </motion.div>
                    )}
                    
                    {stats.rating !== undefined && (
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="text-center p-4 border rounded-lg"
                      >
                        <motion.div
                          animate={{ rotate: [0, 15, -15, 0] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <Trophy className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
                        </motion.div>
                        <div className="text-3xl font-bold text-yellow-600">{stats.rating.toFixed(2)}</div>
                        <div className="text-sm text-muted-foreground mt-1">Average Rating</div>
                      </motion.div>
                    )}
                  
                  {stats.yellowCards !== undefined && (
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-4xl mb-2">🟨</div>
                      <div className="text-3xl font-bold text-yellow-600">{stats.yellowCards}</div>
                      <div className="text-sm text-muted-foreground mt-1">Yellow Cards</div>
                    </div>
                  )}
                  
                  {stats.redCards !== undefined && (
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-4xl mb-2">🟥</div>
                      <div className="text-3xl font-bold text-red-600">{stats.redCards}</div>
                      <div className="text-sm text-muted-foreground mt-1">Red Cards</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Attacking Stats */}
              {(stats.totalShots !== undefined || stats.successfulDribbles !== undefined) && (
                <div className="pt-6 border-t">
                  <h3 className="font-semibold text-lg mb-3">Attacking</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {stats.totalShots !== undefined && (
                      <div className="p-4 border rounded-lg">
                        <div className="text-sm text-muted-foreground">Total Shots</div>
                        <div className="text-2xl font-bold">{stats.totalShots}</div>
                        {stats.shotsOnTarget !== undefined && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {stats.shotsOnTarget} on target ({((stats.shotsOnTarget / stats.totalShots) * 100).toFixed(0)}%)
                          </div>
                        )}
                      </div>
                    )}
                    
                    {stats.successfulDribbles !== undefined && (
                      <div className="p-4 border rounded-lg">
                        <div className="text-sm text-muted-foreground">Successful Dribbles</div>
                        <div className="text-2xl font-bold">{stats.successfulDribbles}</div>
                        {stats.successfulDribblesPercentage !== undefined && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {stats.successfulDribblesPercentage.toFixed(0)}% success rate
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Passing Stats */}
              {(stats.accuratePasses !== undefined || stats.totalPasses !== undefined) && (
                <div className="pt-6 border-t">
                  <h3 className="font-semibold text-lg mb-3">Passing</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {stats.totalPasses !== undefined && (
                      <div className="p-4 border rounded-lg">
                        <div className="text-sm text-muted-foreground">Total Passes</div>
                        <div className="text-2xl font-bold">{stats.totalPasses}</div>
                        {stats.accuratePasses !== undefined && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {stats.accuratePasses} accurate
                          </div>
                        )}
                      </div>
                    )}
                    
                    {stats.accuratePassesPercentage !== undefined && (
                      <div className="p-4 border rounded-lg">
                        <div className="text-sm text-muted-foreground">Pass Accuracy</div>
                        <div className="text-2xl font-bold">{stats.accuratePassesPercentage.toFixed(0)}%</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Defensive Stats */}
              {(stats.tackles !== undefined || stats.interceptions !== undefined || stats.duelsWon !== undefined) && (
                <div className="pt-6 border-t">
                  <h3 className="font-semibold text-lg mb-3">Defensive</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {stats.tackles !== undefined && (
                      <div className="p-4 border rounded-lg">
                        <div className="text-sm text-muted-foreground">Tackles</div>
                        <div className="text-2xl font-bold">{stats.tackles}</div>
                      </div>
                    )}
                    
                    {stats.interceptions !== undefined && (
                      <div className="p-4 border rounded-lg">
                        <div className="text-sm text-muted-foreground">Interceptions</div>
                        <div className="text-2xl font-bold">{stats.interceptions}</div>
                      </div>
                    )}
                    
                    {stats.duelsWon !== undefined && (
                      <div className="p-4 border rounded-lg">
                        <div className="text-sm text-muted-foreground">Duels Won</div>
                        <div className="text-2xl font-bold">{stats.duelsWon}</div>
                        {stats.duelsWonPercentage !== undefined && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {stats.duelsWonPercentage.toFixed(0)}% success rate
                          </div>
                        )}
                      </div>
                    )}
                    
                    {stats.aerialDuelsWon !== undefined && (
                      <div className="p-4 border rounded-lg">
                        <div className="text-sm text-muted-foreground">Aerial Duels Won</div>
                        <div className="text-2xl font-bold">{stats.aerialDuelsWon}</div>
                        {stats.aerialDuelsWonPercentage !== undefined && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {stats.aerialDuelsWonPercentage.toFixed(0)}% success rate
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
        )}

        {/* Live Matches Scroll */}
        {liveMatches.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-red-500" />
                  Live Matches Now
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {liveMatches.map((match, index) => (
                    <motion.div
                      key={match.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Link href={`/auth/match/${match.id}`}>
                        <Card className="min-w-[200px] p-3 hover:bg-muted/50 transition-all cursor-pointer group border hover:border-primary/50">
                          <Badge variant="destructive" className="mb-2 text-xs animate-pulse">LIVE</Badge>
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                              <span className="font-medium truncate">{match.home_team_name}</span>
                              <span className="font-bold ml-2">{match.home_score}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="font-medium truncate">{match.away_team_name}</span>
                              <span className="font-bold ml-2">{match.away_score}</span>
                            </div>
                          </div>
                          <div className="mt-2 text-xs text-muted-foreground truncate">{match.league_name}</div>
                        </Card>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Explore More CTA */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border-primary/20">
            <CardContent className="p-6 text-center">
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="inline-block mb-3"
              >
                <Trophy className="h-8 w-8 text-yellow-500" />
              </motion.div>
              <h3 className="text-xl font-bold mb-2">Discover More Players</h3>
              <p className="text-muted-foreground mb-4">
                Explore stats from players worldwide!
              </p>
              <Link href="/auth/dashboard">
                <Button className="bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-white font-bold shadow-lg hover:shadow-[0_0_20px_rgba(234,179,8,0.6)]">
                  View All Matches →
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex gap-2 justify-center flex-wrap"
        >
          {player.team && (
            <Link href={`/auth/team/${player.team.id}`}>
              <Button variant="default">
                <Users className="mr-2 h-4 w-4" />
                View Team
              </Button>
            </Link>
          )}
          <Button variant="outline" onClick={() => router.back()}>
            Back
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
