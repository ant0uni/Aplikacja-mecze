"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2, Trophy, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ApiCache } from "@/lib/cache";

interface TopScorer {
  player: {
    id: number;
    name: string;
    shortName: string;
    position: string;
  };
  team: {
    id: number;
    name: string;
    shortName: string;
  };
  statistics: {
    goals?: number;
    assists?: number;
    rating?: number;
    appearances: number;
    goalsAssistsSum?: number;
  };
}

interface LeagueInfo {
  id: number;
  name: string;
  seasonName: string;
}

export default function TopScorersPage() {
  const params = useParams();
  const router = useRouter();
  const [topScorers, setTopScorers] = useState<TopScorer[]>([]);
  const [leagueInfo, setLeagueInfo] = useState<LeagueInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [liveMatches, setLiveMatches] = useState<any[]>([]);

  useEffect(() => {
    if (params.id) {
      fetchTopScorers();
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

  useEffect(() => {
    if (params.id) {
      fetchTopScorers();
    }
  }, [params.id]);

  const fetchTopScorers = async () => {
    try {
      const tournamentId = params.id;
      
      // First, fetch the current season
      const seasonsResponse = await fetch(`https://api.sofascore.com/api/v1/unique-tournament/${tournamentId}/seasons`);
      const seasonsData = await seasonsResponse.json();
      const currentSeason = seasonsData.seasons[0];
      const seasonId = currentSeason.id;
      
      const topPlayersUrl = `https://api.sofascore.com/api/v1/unique-tournament/${tournamentId}/season/${seasonId}/top-players/overall`;
      
      console.log("Fetching top scorers from:", topPlayersUrl);
      
      const response = await fetch(topPlayersUrl);
      
      if (!response.ok) {
        setError("Failed to load top scorers");
        setIsLoading(false);
        return;
      }
      
      const data = await response.json();
      console.log("Top players data:", data);
      
      // Extract players with goals
      const scorers = data.topPlayers?.goals || [];
      setTopScorers(scorers.slice(0, 20)); // Top 20 scorers
      
      setLeagueInfo({
        id: typeof tournamentId === 'string' ? parseInt(tournamentId) : Array.isArray(tournamentId) ? parseInt(tournamentId[0]) : 0,
        name: currentSeason.name || "League",
        seasonName: currentSeason.year || "",
      });
    } catch (err) {
      console.error("Failed to fetch top scorers:", err);
      setError("Failed to load top scorers");
    } finally {
      setIsLoading(false);
    }
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
          <Link href={`/auth/league/${params.id}`}>
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <Trophy className="h-8 w-8 text-yellow-500" />
              <div>
                <h1 className="text-3xl font-bold">{leagueInfo.name}</h1>
                <p className="text-muted-foreground">Top Scorers - {leagueInfo.seasonName}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Top Scorers Table */}
        <Card>
          <CardHeader>
            <CardTitle>Top Scorers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Player</TableHead>
                    <TableHead>Team</TableHead>
                    <TableHead className="text-center">Apps</TableHead>
                    <TableHead className="text-center">Goals</TableHead>
                    <TableHead className="text-center">Assists</TableHead>
                    <TableHead className="text-center">G+A</TableHead>
                    <TableHead className="text-center">Rating</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topScorers.map((scorer, index) => (
                    <TableRow key={scorer.player.id}>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell>
                        <Link href={`/auth/player/${scorer.player.id}`}>
                          <div className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer">
                            <div className="w-10 h-10 flex-shrink-0 rounded-full overflow-hidden bg-muted flex items-center justify-center">
                              <img
                                src={`https://api.sofascore.com/api/v1/player/${scorer.player.id}/image`}
                                alt={scorer.player.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  const parent = target.parentElement;
                                  if (parent) {
                                    parent.innerHTML = `<span class="text-xs font-bold">${scorer.player.name.substring(0, 2).toUpperCase()}</span>`;
                                  }
                                }}
                              />
                            </div>
                            <div>
                              <div className="font-medium">{scorer.player.name}</div>
                              <div className="text-xs text-muted-foreground">{scorer.player.position}</div>
                            </div>
                          </div>
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Link href={`/auth/team/${scorer.team.id}`}>
                          <div className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer">
                            <div className="w-6 h-6 flex-shrink-0 flex items-center justify-center">
                              <img
                                src={`https://api.sofascore.com/api/v1/team/${scorer.team.id}/image`}
                                alt={scorer.team.name}
                                className="max-w-full max-h-full object-contain"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                }}
                              />
                            </div>
                            <span className="text-sm font-medium">{scorer.team.name}</span>
                          </div>
                        </Link>
                      </TableCell>
                      <TableCell className="text-center">{scorer.statistics.appearances}</TableCell>
                      <TableCell className="text-center font-bold text-green-600">
                        {scorer.statistics.goals || 0}
                      </TableCell>
                      <TableCell className="text-center">
                        {scorer.statistics.assists || 0}
                      </TableCell>
                      <TableCell className="text-center font-semibold">
                        {scorer.statistics.goalsAssistsSum || (scorer.statistics.goals || 0) + (scorer.statistics.assists || 0)}
                      </TableCell>
                      <TableCell className="text-center">
                        {scorer.statistics.rating?.toFixed(2) || "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

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
              <h3 className="text-xl font-bold mb-2">Explore More Leagues</h3>
              <p className="text-muted-foreground mb-4">
                Check out top scorers from leagues worldwide!
              </p>
              <Link href="/auth/leagues">
                <Button className="bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-white font-bold shadow-lg hover:shadow-[0_0_20px_rgba(234,179,8,0.6)]">
                  Browse All Leagues →
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4">
          <Link href={`/auth/league/${params.id}`}>
            <Button variant="outline">View Standings</Button>
          </Link>
          <Button variant="outline" onClick={() => router.back()}>
            Back
          </Button>
        </div>
      </div>
    </div>
  );
}
