"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2, Trophy, TrendingUp, TrendingDown, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ApiCache } from "@/lib/cache";
import { LeaguePredictionDialog } from "@/components/league-prediction-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Standing {
  position: number;
  team: {
    id: number;
    name: string;
    shortName: string;
  };
  matches: number;
  wins: number;
  draws: number;
  losses: number;
  scoresFor: number;
  scoresAgainst: number;
  points: number;
  scoreDiffFormatted: string;
  promotion?: {
    text: string;
    id: number;
  };
}

interface LeagueInfo {
  id: number;
  name: string;
  seasonId: number;
  seasonName: string;
}

export default function LeaguePage() {
  const params = useParams();
  const router = useRouter();
  const [standings, setStandings] = useState<Standing[]>([]);
  const [leagueInfo, setLeagueInfo] = useState<LeagueInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [upcomingMatches, setUpcomingMatches] = useState<any[]>([]);
  const [topScorers, setTopScorers] = useState<any[]>([]);
  const [liveMatches, setLiveMatches] = useState<any[]>([]);
  const [showLeaguePredictionDialog, setShowLeaguePredictionDialog] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchLeagueData();
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

  const fetchLeagueData = async () => {
    try {
      // First, we need to get the current season ID
      // For now, we'll use Premier League's season ID as example
      // You might need to fetch the tournament details first to get the current season
      
      const tournamentId = params.id;
      
      // First, fetch the current season
      const cacheKey = `league-seasons-${tournamentId}`;
      const seasonsData = await ApiCache.getOrFetch(
        cacheKey,
        async () => {
          const response = await fetch(`https://api.sofascore.com/api/v1/unique-tournament/${tournamentId}/seasons`);
          if (!response.ok) throw new Error('Failed to fetch seasons');
          return await response.json();
        },
        ApiCache.DURATIONS.VERY_LONG, // Cache for 24 hours - seasons rarely change
        false // Don't use stale-while-revalidate
      );
      
      const currentSeason = seasonsData.seasons[0]; // Most recent season
      const seasonId = currentSeason.id;
      
      const standingsUrl = `https://api.sofascore.com/api/v1/unique-tournament/${tournamentId}/season/${seasonId}/standings/total`;
      
      console.log("Fetching standings from:", standingsUrl);
      
      const standingsCacheKey = `league-standings-${tournamentId}-${seasonId}`;
      const data = await ApiCache.getOrFetch(
        standingsCacheKey,
        async () => {
          const response = await fetch(standingsUrl);
          if (!response.ok) throw new Error('Failed to fetch standings');
          return await response.json();
        },
        ApiCache.DURATIONS.LONG, // Cache for 1 hour
        false // Don't use stale-while-revalidate
      );
      
      console.log("Standings data:", data);
      
      if (data.standings && data.standings.length > 0) {
        const standingsData = data.standings[0];
        setStandings(standingsData.rows || []);
        
        // Set league info
        if (standingsData.tournament) {
          setLeagueInfo({
            id: standingsData.tournament.uniqueTournament?.id || standingsData.tournament.id,
            name: standingsData.tournament.uniqueTournament?.name || standingsData.tournament.name,
            seasonId: seasonId,
            seasonName: `Season ${seasonId}`,
          });
        }
      }
      
      // Fetch upcoming matches for this league
      fetchUpcomingMatches(tournamentId as string);
      
      // Fetch top scorers
      fetchTopScorers(tournamentId as string, seasonId);
    } catch (err) {
      console.error("Failed to fetch standings:", err);
      setError("Failed to load league standings");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUpcomingMatches = async (leagueId: string) => {
    try {
      const cacheKey = `upcoming-matches-${leagueId}`;
      const matches = await ApiCache.getOrFetch(
        cacheKey,
        async () => {
          const today = new Date().toISOString().split('T')[0];
          const response = await fetch(`https://www.sofascore.com/api/v1/sport/football/scheduled-events/${today}`);
          if (!response.ok) return [];
          
          const data = await response.json();
          const events = data.events || [];
          
          return events
            .filter((e: any) => (e.tournament?.uniqueTournament?.id?.toString() === leagueId || e.tournament?.id?.toString() === leagueId))
            .slice(0, 3)
            .map((event: any) => ({
              id: event.id,
              home_team_name: event.homeTeam?.name || 'Home',
              away_team_name: event.awayTeam?.name || 'Away',
              starting_at: new Date(event.startTimestamp * 1000).toISOString(),
              state: event.status?.description || event.status?.type || 'Unknown',
            }));
        },
        ApiCache.DURATIONS.SHORT, // Cache for 2 minutes
        false // Don't use stale-while-revalidate
      );
      setUpcomingMatches(matches);
    } catch (error) {
      console.error("Failed to fetch upcoming matches:", error);
    }
  };

  const fetchTopScorers = async (leagueId: string, seasonId: number) => {
    try {
      const cacheKey = `top-scorers-preview-${leagueId}-${seasonId}`;
      const scorers = await ApiCache.getOrFetch(
        cacheKey,
        async () => {
          const response = await fetch(`https://api.sofascore.com/api/v1/unique-tournament/${leagueId}/season/${seasonId}/top-players/overall`);
          if (!response.ok) return [];
          
          const data = await response.json();
          return (data.topPlayers?.goals || []).slice(0, 3);
        },
        ApiCache.DURATIONS.LONG, // Cache for 1 hour
        false // Don't use stale-while-revalidate
      );
      setTopScorers(scorers);
    } catch (error) {
      console.error("Failed to fetch top scorers:", error);
    }
  };

  const getPromotionColor = (promotion?: { text: string; id: number }) => {
    if (!promotion) return "";
    
    const text = promotion.text.toLowerCase();
    if (text.includes("champions league")) return "bg-blue-100 dark:bg-blue-900";
    if (text.includes("europa league")) return "bg-orange-100 dark:bg-orange-900";
    if (text.includes("conference")) return "bg-green-100 dark:bg-green-900";
    if (text.includes("relegation")) return "bg-red-100 dark:bg-red-900";
    
    return "";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !leagueInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">{error || "League not found"}</p>
            <div className="flex justify-center mt-4">
              <Button onClick={() => router.back()}>Go Back</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen football-bg p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <Trophy className="h-8 w-8 text-yellow-500" />
              <div>
                <h1 className="text-3xl font-bold">{leagueInfo.name}</h1>
                <p className="text-muted-foreground">League Standings</p>
              </div>
            </div>
          </div>
          <Button 
            variant="default" 
            onClick={() => setShowLeaguePredictionDialog(true)}
            className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
          >
            <Trophy className="h-4 w-4 mr-2" />
            Predict Winner
          </Button>
          <Link href={`/auth/league/${params.id}/top-scorers`}>
            <Button variant="outline">
              <Trophy className="h-4 w-4 mr-2" />
              Top Scorers
            </Button>
          </Link>
        </div>

        {/* League Prediction Dialog */}
        <LeaguePredictionDialog
          isOpen={showLeaguePredictionDialog}
          onClose={() => setShowLeaguePredictionDialog(false)}
          league={leagueInfo ? { id: leagueInfo.id, name: leagueInfo.name } : null}
          teams={standings.map(s => ({
            id: s.team.id,
            name: s.team.name,
            logo: `https://api.sofascore.com/api/v1/team/${s.team.id}/image`
          }))}
          onSuccess={() => {
            setShowLeaguePredictionDialog(false);
          }}
        />

        {/* Standings Table */}
        <Card>
          <CardHeader>
            <CardTitle>Current Standings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Team</TableHead>
                    <TableHead className="text-center">P</TableHead>
                    <TableHead className="text-center">W</TableHead>
                    <TableHead className="text-center">D</TableHead>
                    <TableHead className="text-center">L</TableHead>
                    <TableHead className="text-center">GF</TableHead>
                    <TableHead className="text-center">GA</TableHead>
                    <TableHead className="text-center">GD</TableHead>
                    <TableHead className="text-center font-bold">Pts</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {standings.map((standing) => (
                    <TableRow
                      key={standing.team.id}
                      className={`${getPromotionColor(standing.promotion)} cursor-pointer hover:bg-muted/50 transition-colors`}
                      onClick={() => window.location.href = `/auth/team/${standing.team.id}`}
                    >
                      <TableCell className="font-medium">{standing.position}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 flex-shrink-0 flex items-center justify-center">
                            <img
                              src={`https://api.sofascore.com/api/v1/team/${standing.team.id}/image`}
                              alt={standing.team.name}
                              className="max-w-full max-h-full object-contain"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                              }}
                            />
                          </div>
                          <span className="font-medium">{standing.team.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">{standing.matches}</TableCell>
                      <TableCell className="text-center text-green-600">{standing.wins}</TableCell>
                      <TableCell className="text-center text-gray-600">{standing.draws}</TableCell>
                      <TableCell className="text-center text-red-600">{standing.losses}</TableCell>
                      <TableCell className="text-center">{standing.scoresFor}</TableCell>
                      <TableCell className="text-center">{standing.scoresAgainst}</TableCell>
                      <TableCell className="text-center">{standing.scoreDiffFormatted}</TableCell>
                      <TableCell className="text-center font-bold">{standing.points}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Legend */}
            <div className="mt-6 pt-4 border-t space-y-2">
              <p className="text-sm font-semibold mb-2">Legend:</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-100 dark:bg-blue-900 border"></div>
                  <span>Champions League</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-orange-100 dark:bg-orange-900 border"></div>
                  <span>Europa League</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-100 dark:bg-green-900 border"></div>
                  <span>Conference League</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-100 dark:bg-red-900 border"></div>
                  <span>Relegation</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Matches */}
        {upcomingMatches.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    Upcoming Matches
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  {upcomingMatches.map((match, index) => (
                    <motion.div
                      key={match.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Link href={`/auth/match/${match.id}`}>
                        <Card className="p-3 hover:bg-muted/50 transition-all cursor-pointer group border hover:border-primary/50">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="text-sm font-medium mb-1 group-hover:text-primary transition-colors">
                                {match.home_team_name} vs {match.away_team_name}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {new Date(match.starting_at).toLocaleString([], { 
                                  month: 'short', 
                                  day: 'numeric',
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </div>
                            </div>
                            <Badge variant="outline">{match.state}</Badge>
                          </div>
                        </Card>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Top Scorers Preview */}
        {topScorers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                    Top Scorers
                  </CardTitle>
                  <Link href={`/auth/league/${params.id}/top-scorers`}>
                    <Button variant="ghost" size="sm">View All →</Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  {topScorers.map((scorer, index) => (
                    <motion.div
                      key={scorer.player.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Link href={`/auth/player/${scorer.player.id}`}>
                        <Card className="p-3 hover:bg-muted/50 transition-all cursor-pointer group border hover:border-primary/50">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full overflow-hidden bg-muted flex items-center justify-center flex-shrink-0">
                              <img
                                src={`https://api.sofascore.com/api/v1/player/${scorer.player.id}/image`}
                                alt={scorer.player.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  if (target.parentElement) {
                                    target.parentElement.innerHTML = `<span class="text-xs font-bold">${scorer.player.name.substring(0, 2).toUpperCase()}</span>`;
                                  }
                                }}
                              />
                            </div>
                            <div className="flex-1">
                              <div className="font-medium group-hover:text-primary transition-colors">
                                {scorer.player.name}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {scorer.team?.name || 'Unknown Team'}
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-xs">⚽</span>
                              <span className="text-lg font-bold text-primary">{scorer.statistics.goals}</span>
                            </div>
                          </div>
                        </Card>
                      </Link>
                    </motion.div>
                  ))}
                </div>
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
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border-primary/20">
            <CardContent className="p-6 text-center">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="inline-block mb-3"
              >
                <Trophy className="h-8 w-8 text-yellow-500" />
              </motion.div>
              <h3 className="text-xl font-bold mb-2">Explore More Leagues</h3>
              <p className="text-muted-foreground mb-4">
                Discover standings and matches from leagues around the world!
              </p>
              <Link href="/auth/dashboard">
                <Button className="bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-white font-bold shadow-lg hover:shadow-[0_0_20px_rgba(234,179,8,0.6)]">
                  View All Matches →
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>

        {/* Back Button */}
        <div className="flex justify-center">
          <Button variant="outline" onClick={() => router.back()}>
            Back
          </Button>
        </div>
      </div>
    </div>
  );
}
