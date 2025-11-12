"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2, Users, Trophy, Calendar, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ApiCache } from "@/lib/cache";
import { LiveMatchesCarousel } from "@/components/live-matches-carousel";

interface TeamDetails {
  id: number;
  name: string;
  slug: string;
  shortName?: string;
  country?: {
    id: number;
    name: string;
  };
  venue?: {
    id: number;
    name: string;
    city: string;
  };
  manager?: {
    id: number;
    name: string;
  };
}

interface Player {
  id: number;
  name: string;
  position: string;
  jerseyNumber?: string;
}

interface TeamStatistics {
  wins?: number;
  draws?: number;
  losses?: number;
  goalsScored?: number;
  goalsConceded?: number;
  cleanSheets?: number;
  averageGoalsScored?: number;
  averageGoalsConceded?: number;
  form?: string[];
}

export default function TeamPage() {
  const params = useParams();
  const router = useRouter();
  const [team, setTeam] = useState<TeamDetails | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [statistics, setStatistics] = useState<TeamStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [liveMatches, setLiveMatches] = useState<any[]>([]);

  useEffect(() => {
    if (params.id) {
      fetchTeamDetails();
      fetchLiveMatches();
    }
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
            home_team_logo: event.homeTeam?.id ? `https://api.sofascore.com/api/v1/team/${event.homeTeam.id}/image` : null,
            away_team_logo: event.awayTeam?.id ? `https://api.sofascore.com/api/v1/team/${event.awayTeam.id}/image` : null,
            home_score: event.homeScore?.current ?? 0,
            away_score: event.awayScore?.current ?? 0,
            league_name: event.tournament?.uniqueTournament?.name || event.tournament?.name || 'Unknown',
            league_id: event.tournament?.uniqueTournament?.id || event.tournament?.id,
          }));
        },
        ApiCache.DURATIONS.SHORT,
        true
      );
      setLiveMatches(matches);
    } catch (error) {
      console.error("Failed to fetch live matches:", error);
    }
  };

  const fetchTeamDetails = async () => {
    try {
      const cacheKey = `team-details-${params.id}`;
      
      // Fetch team details with caching
      const teamData = await ApiCache.getOrFetch(
        cacheKey,
        async () => {
          const teamResponse = await fetch(`https://www.sofascore.com/api/v1/team/${params.id}`);
          if (!teamResponse.ok) throw new Error('Team not found');
          return await teamResponse.json();
        },
        ApiCache.DURATIONS.LONG,
        true
      );
      
      const teamInfo = teamData.team;
      
      setTeam({
        id: teamInfo.id,
        name: teamInfo.name,
        slug: teamInfo.slug,
        shortName: teamInfo.shortName,
        country: teamInfo.country,
        venue: teamInfo.venue,
        manager: teamInfo.manager,
      });

      // Fetch team squad/players
      try {
        const playersResponse = await fetch(`https://www.sofascore.com/api/v1/team/${params.id}/players`);
        if (playersResponse.ok) {
          const playersData = await playersResponse.json();
          if (playersData.players && playersData.players.length > 0) {
            const formattedPlayers = playersData.players.map((p: any) => ({
              id: p.player.id,
              name: p.player.name,
              position: p.player.position || 'Unknown',
              jerseyNumber: p.player.jerseyNumber,
            }));
            setPlayers(formattedPlayers);
          }
        }
      } catch (playersError) {
        console.error("Failed to fetch players:", playersError);
      }

      // Fetch team statistics
      try {
        // First get the team's current tournaments to find active season
        const tournamentsResponse = await fetch(`https://api.sofascore.com/api/v1/team/${params.id}/tournaments`);
        if (tournamentsResponse.ok) {
          const tournamentsData = await tournamentsResponse.json();
          console.log("Team tournaments:", tournamentsData);
          
          // Get the first unique tournament with statistics
          if (tournamentsData.uniqueTournaments && tournamentsData.uniqueTournaments.length > 0) {
            const tournament = tournamentsData.uniqueTournaments[0];
            const tournamentId = tournament.uniqueTournament?.id;
            const seasonId = tournament.seasons?.[0]?.id;
            
            if (tournamentId && seasonId) {
              // Fetch team statistics for this season
              const statsResponse = await fetch(
                `https://api.sofascore.com/api/v1/team/${params.id}/unique-tournament/${tournamentId}/season/${seasonId}/statistics/overall`
              );
              
              if (statsResponse.ok) {
                const statsData = await statsResponse.json();
                console.log("Team statistics:", statsData);
                
                const stats = statsData.statistics;
                setStatistics({
                  wins: stats?.wins,
                  draws: stats?.draws,
                  losses: stats?.losses,
                  goalsScored: stats?.goalsScored,
                  goalsConceded: stats?.goalsConceded,
                  cleanSheets: stats?.cleanSheets,
                  averageGoalsScored: stats?.avgGoalsScored,
                  averageGoalsConceded: stats?.avgGoalsConceded,
                });
              }
            }
          }
        }
      } catch (statsError) {
        console.error("Failed to fetch team statistics:", statsError);
      }

    } catch (err) {
      console.error("Failed to fetch team details:", err);
      setError("Failed to load team details");
    } finally {
      setIsLoading(false);
    }
  };

  const groupPlayersByPosition = () => {
    const grouped: Record<string, Player[]> = {
      'Goalkeeper': [],
      'Defender': [],
      'Midfielder': [],
      'Forward': [],
      'Other': []
    };

    players.forEach(player => {
      const pos = player.position;
      if (pos.includes('Goalkeeper') || pos === 'G') {
        grouped['Goalkeeper'].push(player);
      } else if (pos.includes('Defender') || pos === 'D') {
        grouped['Defender'].push(player);
      } else if (pos.includes('Midfielder') || pos === 'M') {
        grouped['Midfielder'].push(player);
      } else if (pos.includes('Forward') || pos === 'F' || pos.includes('Attacker')) {
        grouped['Forward'].push(player);
      } else {
        grouped['Other'].push(player);
      }
    });

    return grouped;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !team) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">{error || "Team not found"}</p>
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

  const groupedPlayers = groupPlayersByPosition();

  return (
    <div className="min-h-screen football-bg p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">Team Profile</h1>
            <p className="text-muted-foreground">Squad, fixtures, and statistics</p>
          </div>
        </div>

        {/* Team Info Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              {/* Team Logo */}
              <div className="flex-shrink-0">
                <div className="w-32 h-32 mx-auto md:mx-0 rounded-lg overflow-hidden bg-muted flex items-center justify-center p-4">
                  <img
                    src={`https://api.sofascore.com/api/v1/team/${team.id}/image`}
                    alt={team.name}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '';
                      (e.target as HTMLImageElement).style.display = 'none';
                      const parent = (e.target as HTMLImageElement).parentElement;
                      if (parent) {
                        parent.innerHTML = `<div class="text-4xl font-bold">${team.name.substring(0, 2).toUpperCase()}</div>`;
                      }
                    }}
                  />
                </div>
              </div>

              {/* Team Details */}
              <div className="flex-1 space-y-4">
                <div>
                  <h2 className="text-4xl font-bold">{team.name}</h2>
                  {team.shortName && team.shortName !== team.name && (
                    <p className="text-lg text-muted-foreground mt-1">({team.shortName})</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {team.country && (
                    <div>
                      <p className="text-sm text-muted-foreground">Country</p>
                      <p className="font-semibold">{team.country.name}</p>
                    </div>
                  )}
                  
                  {team.venue && (
                    <div>
                      <p className="text-sm text-muted-foreground">Stadium</p>
                      <p className="font-semibold">
                        {team.venue.name}
                        {team.venue.city && `, ${team.venue.city}`}
                      </p>
                    </div>
                  )}
                  
                  {team.manager && (
                    <div>
                      <p className="text-sm text-muted-foreground">Manager</p>
                      <p className="font-semibold">{team.manager.name}</p>
                    </div>
                  )}
                  
                  <div>
                    <p className="text-sm text-muted-foreground">Squad Size</p>
                    <p className="font-semibold">{players.length} players</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Team Statistics */}
        {statistics && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Team Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {statistics.wins !== undefined && (
                  <div className="text-center p-4 border rounded-lg bg-green-50 dark:bg-green-950">
                    <div className="text-3xl font-bold text-green-600">{statistics.wins}</div>
                    <div className="text-sm text-muted-foreground mt-1">Wins</div>
                  </div>
                )}
                
                {statistics.draws !== undefined && (
                  <div className="text-center p-4 border rounded-lg bg-gray-50 dark:bg-gray-950">
                    <div className="text-3xl font-bold text-gray-600">{statistics.draws}</div>
                    <div className="text-sm text-muted-foreground mt-1">Draws</div>
                  </div>
                )}
                
                {statistics.losses !== undefined && (
                  <div className="text-center p-4 border rounded-lg bg-red-50 dark:bg-red-950">
                    <div className="text-3xl font-bold text-red-600">{statistics.losses}</div>
                    <div className="text-sm text-muted-foreground mt-1">Losses</div>
                  </div>
                )}
                
                {statistics.goalsScored !== undefined && (
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-3xl font-bold text-green-600">{statistics.goalsScored}</div>
                    <div className="text-sm text-muted-foreground mt-1">Goals Scored</div>
                    {statistics.averageGoalsScored !== undefined && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Avg: {statistics.averageGoalsScored.toFixed(2)}
                      </div>
                    )}
                  </div>
                )}
                
                {statistics.goalsConceded !== undefined && (
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-3xl font-bold text-red-600">{statistics.goalsConceded}</div>
                    <div className="text-sm text-muted-foreground mt-1">Goals Conceded</div>
                    {statistics.averageGoalsConceded !== undefined && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Avg: {statistics.averageGoalsConceded.toFixed(2)}
                      </div>
                    )}
                  </div>
                )}
                
                {statistics.cleanSheets !== undefined && (
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-3xl font-bold text-blue-600">{statistics.cleanSheets}</div>
                    <div className="text-sm text-muted-foreground mt-1">Clean Sheets</div>
                  </div>
                )}
                
                {(statistics.wins !== undefined && statistics.draws !== undefined && statistics.losses !== undefined) && (
                  <div className="text-center p-4 border rounded-lg col-span-2 md:col-span-1">
                    <div className="text-3xl font-bold text-primary">
                      {((statistics.wins / (statistics.wins + statistics.draws + statistics.losses)) * 100).toFixed(0)}%
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">Win Rate</div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Squad */}
        {players.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Current Squad
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {Object.entries(groupedPlayers).map(([position, posPlayers]) => (
                  posPlayers.length > 0 && (
                    <div key={position}>
                      <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                        <Badge variant="outline">{position}s</Badge>
                        <span className="text-sm text-muted-foreground">({posPlayers.length})</span>
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {posPlayers.map((player) => (
                          <Link key={player.id} href={`/auth/player/${player.id}`}>
                            <div className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                              <div className="w-12 h-12 flex-shrink-0 rounded-full overflow-hidden bg-muted flex items-center justify-center">
                                <img
                                  src={`https://api.sofascore.com/api/v1/player/${player.id}/image`}
                                  alt={player.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                    const parent = (e.target as HTMLImageElement).parentElement;
                                    if (parent) {
                                      parent.innerHTML = `<span class="text-xs font-bold">${player.name.substring(0, 2).toUpperCase()}</span>`;
                                    }
                                  }}
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold truncate">{player.name}</p>
                                {player.jerseyNumber && (
                                  <p className="text-sm text-muted-foreground">#{player.jerseyNumber}</p>
                                )}
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Live Matches Carousel */}
        {liveMatches.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <LiveMatchesCarousel matches={liveMatches} />
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
              <h3 className="text-xl font-bold mb-2">Discover More Teams</h3>
              <p className="text-muted-foreground mb-4">
                Explore squads and stats from teams worldwide!
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
        <div className="flex gap-2 justify-center flex-wrap">
          <Button variant="outline" onClick={() => router.back()}>
            Back
          </Button>
        </div>
      </div>
    </div>
  );
}
