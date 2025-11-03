"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2, Calendar, MapPin, Trophy, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PredictionDialog } from "@/components/prediction-dialog";
import { ApiCache } from "@/lib/cache";

interface Player {
  id: number;
  name: string;
  jerseyNumber?: string;
  position: string;
  substitute: boolean;
}

interface Lineup {
  homeTeam: {
    formation?: string;
    players: Player[];
  };
  awayTeam: {
    formation?: string;
    players: Player[];
  };
}

interface MatchDetails {
  id: number;
  name: string;
  starting_at: string;
  state: string;
  state_id: number;
  home_team: {
    id: number;
    name: string;
    logo: string | null;
    score: number | null;
  };
  away_team: {
    id: number;
    name: string;
    logo: string | null;
    score: number | null;
  };
  league: {
    id: number;
    name: string;
    logo: string | null;
  };
  season: {
    id: number;
    name: string;
  } | null;
  venue: {
    id: number | null;
    name: string | null;
    city: string | null;
  };
  h2h: {
    homeWins: number;
    awayWins: number;
    draws: number;
  } | null;
  votes: {
    vote1: number;  // Home team votes
    vote2: number;  // Away team votes
    voteX: number;  // Draw votes
  } | null;
  bothTeamsToScore: {
    voteYes: number;
    voteNo: number;
  } | null;
  firstToScore: {
    voteHome: number;
    voteAway: number;
    voteNoGoal: number;
  } | null;
  tournament: any;
}

export default function MatchPage() {
  const params = useParams();
  const router = useRouter();
  const [match, setMatch] = useState<MatchDetails | null>(null);
  const [lineups, setLineups] = useState<Lineup | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isPredictionDialogOpen, setIsPredictionDialogOpen] = useState(false);
  const [leagueMatches, setLeagueMatches] = useState<any[]>([]);
  const [liveMatches, setLiveMatches] = useState<any[]>([]);
  const [hasUserPredicted, setHasUserPredicted] = useState(false);

  useEffect(() => {
    console.log("Match page params:", params);
    console.log("Match ID:", params.id);
    if (params.id) {
      fetchMatchDetails();
      checkUserPrediction();
    } else {
      console.error("No match ID in params!");
    }
  }, [params.id]);

  const checkUserPrediction = async () => {
    try {
      const response = await fetch("/api/predictions");
      if (response.ok) {
        const data = await response.json();
        const userPredictions = data.predictions || [];
        const hasPredicted = userPredictions.some(
          (p: any) => p.fixture?.api_id === parseInt(params.id as string)
        );
        setHasUserPredicted(hasPredicted);
      }
    } catch (error) {
      console.error("Failed to check user predictions:", error);
    }
  };

  const fetchMatchDetails = async () => {
    try {
      console.log("Fetching match details for ID:", params.id);
      
      // Fetch event details from SofaScore
      const eventResponse = await fetch(`https://www.sofascore.com/api/v1/event/${params.id}`);
      
      if (!eventResponse.ok) {
        if (eventResponse.status === 404) {
          setError("Match not found");
        } else {
          setError("Failed to load match details");
        }
        setIsLoading(false);
        return;
      }
      
      const eventData = await eventResponse.json();
      const event = eventData.event;
      
      console.log("Event data:", event);
      
      // Fetch head-to-head data
      let h2hData = null;
      try {
        const h2hResponse = await fetch(`https://www.sofascore.com/api/v1/event/${params.id}/h2h`);
        if (h2hResponse.ok) {
          const h2h = await h2hResponse.json();
          h2hData = h2h.teamDuel || null;
          console.log("H2H data:", h2hData);
        }
      } catch (h2hError) {
        console.error("Failed to fetch H2H data:", h2hError);
      }
      
      // Fetch voting data
      let votesData = null;
      let bothTeamsToScoreData = null;
      let firstToScoreData = null;
      try {
        const votesResponse = await fetch(`https://www.sofascore.com/api/v1/event/${params.id}/votes`);
        if (votesResponse.ok) {
          const votes = await votesResponse.json();
          console.log("Votes data:", votes);
          votesData = votes.vote || null;
          bothTeamsToScoreData = votes.bothTeamsToScoreVote || null;
          firstToScoreData = votes.firstTeamToScoreVote || null;
        }
      } catch (votesError) {
        console.error("Failed to fetch votes data:", votesError);
      }
      
      // Transform to our format with SofaScore image URLs
      const homeTeamId = event.homeTeam?.id;
      const awayTeamId = event.awayTeam?.id;
      const tournamentId = event.tournament?.uniqueTournament?.id || event.tournament?.id;
      
      const matchDetails: MatchDetails = {
        id: event.id,
        name: `${event.homeTeam?.name || 'Home'} - ${event.awayTeam?.name || 'Away'}`,
        starting_at: new Date(event.startTimestamp * 1000).toISOString(),
        state: event.status?.description || event.status?.type || 'Unknown',
        state_id: event.status?.code || 0,
        home_team: {
          id: event.homeTeam?.id || 0,
          name: event.homeTeam?.name || 'Home',
          logo: homeTeamId ? `https://api.sofascore.com/api/v1/team/${homeTeamId}/image` : null,
          score: event.homeScore?.current ?? event.homeScore?.display ?? null,
        },
        away_team: {
          id: event.awayTeam?.id || 0,
          name: event.awayTeam?.name || 'Away',
          logo: awayTeamId ? `https://api.sofascore.com/api/v1/team/${awayTeamId}/image` : null,
          score: event.awayScore?.current ?? event.awayScore?.display ?? null,
        },
        league: {
          id: tournamentId || 0,
          name: event.tournament?.uniqueTournament?.name || event.tournament?.name || 'Unknown',
          logo: tournamentId ? `https://api.sofascore.com/api/v1/unique-tournament/${tournamentId}/image` : null,
        },
        season: event.season ? {
          id: event.season.id,
          name: event.season.name || event.season.year || 'Unknown',
        } : null,
        venue: {
          id: event.venue?.id || null,
          name: event.venue?.name || null,
          city: event.venue?.city?.name || null,
        },
        h2h: h2hData,
        votes: votesData,
        bothTeamsToScore: bothTeamsToScoreData,
        firstToScore: firstToScoreData,
        tournament: event.tournament,
      };
      
      setMatch(matchDetails);
      
      // Fetch lineups
      try {
        const lineupsResponse = await fetch(`https://www.sofascore.com/api/v1/event/${params.id}/lineups`);
        if (lineupsResponse.ok) {
          const lineupsData = await lineupsResponse.json();
          console.log("Lineups data:", lineupsData);
          
          if (lineupsData.confirmed) {
            const lineup: Lineup = {
              homeTeam: {
                formation: lineupsData.home?.formation,
                players: [
                  ...(lineupsData.home?.players || []).map((p: any) => ({
                    id: p.player.id,
                    name: p.player.name,
                    jerseyNumber: p.jerseyNumber,
                    position: p.position,
                    substitute: p.substitute || false,
                  }))
                ]
              },
              awayTeam: {
                formation: lineupsData.away?.formation,
                players: [
                  ...(lineupsData.away?.players || []).map((p: any) => ({
                    id: p.player.id,
                    name: p.player.name,
                    jerseyNumber: p.jerseyNumber,
                    position: p.position,
                    substitute: p.substitute || false,
                  }))
                ]
              }
            };
            setLineups(lineup);
          }
        }
      } catch (lineupsError) {
        console.error("Failed to fetch lineups:", lineupsError);
      }
    } catch (err) {
      console.error("Failed to fetch match details:", err);
      setError("Failed to load match details");
    } finally {
      setIsLoading(false);
    }
  };

  const getMatchStatus = () => {
    if (!match) return "Unknown";
    return match.state;
  };

  const getStatusBadgeVariant = () => {
    const status = getMatchStatus();
    if (status.includes("FT") || status.includes("Finished")) {
      return "secondary";
    } else if (status.includes("LIVE") || status.includes("HT")) {
      return "destructive";
    } else if (status === "NS" || status.includes("Not Started")) {
      return "default";
    }
    return "outline";
  };

  const isMatchActive = (match: MatchDetails) => {
    const matchDate = new Date(match.starting_at);
    const now = new Date();
    const hoursDiff = (matchDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    return hoursDiff > 0 && hoursDiff <= 24 && !match.state.includes("FT") && !match.state.includes("Finished");
  };

  const handlePredictClick = () => {
    setIsPredictionDialogOpen(true);
  };

  const fetchLeagueMatches = async (leagueId: number) => {
    try {
      const cacheKey = `league-matches-${leagueId}`;
      const matches = await ApiCache.getOrFetch(
        cacheKey,
        async () => {
          const today = new Date().toISOString().split('T')[0];
          const response = await fetch(`https://www.sofascore.com/api/v1/sport/football/scheduled-events/${today}`);
          if (!response.ok) return [];
          
          const data = await response.json();
          const events = data.events || [];
          
          return events
            .filter((e: any) => (e.tournament?.uniqueTournament?.id === leagueId || e.tournament?.id === leagueId) && e.id !== parseInt(params.id as string))
            .slice(0, 5)
            .map((event: any) => ({
              id: event.id,
              home_team_id: event.homeTeam?.id || null,
              away_team_id: event.awayTeam?.id || null,
              home_team_name: event.homeTeam?.name || 'Home',
              away_team_name: event.awayTeam?.name || 'Away',
              home_score: event.homeScore?.current ?? null,
              away_score: event.awayScore?.current ?? null,
              starting_at: new Date(event.startTimestamp * 1000).toISOString(),
              state: event.status?.description || event.status?.type || 'Unknown',
            }));
        },
        ApiCache.DURATIONS.SHORT,
        true
      );
      setLeagueMatches(matches);
    } catch (error) {
      console.error("Failed to fetch league matches:", error);
    }
  };

  const fetchLiveMatches = async () => {
    try {
      const cacheKey = 'live-matches-marquee';
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
    } catch (error) {
      console.error("Failed to fetch live matches:", error);
    }
  };

  useEffect(() => {
    if (match?.league?.id) {
      fetchLeagueMatches(match.league.id);
    }
    fetchLiveMatches();
  }, [match?.league?.id]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !match) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">{error || "Match not found"}</p>
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
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-4"
        >
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">Match Details</h1>
            <p className="text-muted-foreground">View match information and statistics</p>
          </div>
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Badge variant={getStatusBadgeVariant()}>{getMatchStatus()}</Badge>
          </motion.div>
          {match && isMatchActive(match) && (
            <Button 
              onClick={handlePredictClick} 
              className="bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-white font-bold shadow-lg hover:shadow-[0_0_20px_rgba(234,179,8,0.6)] transition-all duration-150"
            >
              ⚡ Predict
            </Button>
          )}
        </motion.div>
        {/* Live Matches Marquee - Moved to Top */}
        {liveMatches.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="overflow-hidden bg-gradient-to-r from-red-500/10 via-orange-500/10 to-red-500/10 rounded-lg border border-red-500/20"
          >
            <div className="py-3">
              <motion.div
                animate={{ x: [0, -1000] }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                className="flex gap-6 whitespace-nowrap"
              >
                {[...liveMatches, ...liveMatches].map((match, index) => (
                  <Link key={`${match.id}-${index}`} href={`/auth/match/${match.id}`}>
                    <div className="inline-flex items-center gap-3 px-4 py-1 hover:bg-red-500/20 rounded transition-colors cursor-pointer">
                      <Badge variant="destructive" className="animate-pulse text-xs">LIVE</Badge>
                      <span className="text-sm font-medium">
                        {match.home_team_name} {match.home_score} - {match.away_score} {match.away_team_name}
                      </span>
                      <span className="text-xs text-muted-foreground">{match.league_name}</span>
                    </div>
                  </Link>
                ))}
              </motion.div>
            </div>
          </motion.div>
        )}


        {/* Match Score Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {match.league.logo && (
                    <motion.img
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.5 }}
                      src={match.league.logo}
                      alt={match.league.name}
                      width={24}
                      height={24}
                      className="object-contain"
                    />
                  )}
                  <span className="text-sm text-muted-foreground">{match.league.name}</span>
                  <Link href={`/auth/league/${match.league.id}`}>
                    <Badge variant="outline" className="text-xs cursor-pointer hover:bg-muted">
                      📊 Standings
                    </Badge>
                  </Link>
                  <Link href={`/auth/league/${match.league.id}/top-scorers`}>
                    <Badge variant="outline" className="text-xs cursor-pointer hover:bg-muted">
                      ⚽ Top Scorers
                    </Badge>
                  </Link>
                </div>
                <span className="text-sm text-muted-foreground">
                  {new Date(match.starting_at).toLocaleDateString()}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 items-center">
                {/* Home Team */}
                <Link href={`/auth/team/${match.home_team.id}`} className="text-center hover:opacity-70 transition-opacity">
                  <div>
                    {match.home_team.logo ? (
                      <div className="w-20 h-20 mx-auto mb-2 flex items-center justify-center">
                        <img src={match.home_team.logo} alt={match.home_team.name} className="max-w-full max-h-full object-contain" />
                      </div>
                    ) : (
                      <div className="w-20 h-20 mx-auto mb-2 bg-muted rounded flex items-center justify-center text-2xl font-bold">
                      {match.home_team.name.substring(0, 2).toUpperCase()}
                    </div>
                  )}
                  <h3 className="font-bold text-lg">{match.home_team.name}</h3>
                </div>
              </Link>

              {/* Score */}
              <div className="text-center">
                {match.home_team.score !== null && match.away_team.score !== null ? (
                  <div className="text-5xl font-bold">
                    {match.home_team.score} - {match.away_team.score}
                  </div>
                ) : (
                  <div className="text-2xl font-semibold text-muted-foreground">
                    {new Date(match.starting_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                )}
              </div>

              {/* Away Team */}
              <Link href={`/auth/team/${match.away_team.id}`} className="text-center hover:opacity-70 transition-opacity">
                <div>
                  {match.away_team.logo ? (
                    <div className="w-20 h-20 mx-auto mb-2 flex items-center justify-center">
                      <img src={match.away_team.logo} alt={match.away_team.name} className="max-w-full max-h-full object-contain" />
                    </div>
                  ) : (
                    <div className="w-20 h-20 mx-auto mb-2 bg-muted rounded flex items-center justify-center text-2xl font-bold">
                      {match.away_team.name.substring(0, 2).toUpperCase()}
                    </div>
                  )}
                  <h3 className="font-bold text-lg">{match.away_team.name}</h3>
                </div>
              </Link>
            </div>

            {/* Venue Info */}
            {match.venue.name && (
              <div className="mt-6 pt-6 border-t flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{match.venue.name}{match.venue.city ? `, ${match.venue.city}` : ""}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

        {/* Head to Head */}
        {match.h2h && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Head to Head
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="p-4 border rounded-lg"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.5, type: "spring" }}
                      className="text-3xl font-bold text-green-600"
                    >
                      {match.h2h.homeWins}
                    </motion.div>
                    <div className="text-sm text-muted-foreground mt-2">{match.home_team.name} Wins</div>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="p-4 border rounded-lg"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.6, type: "spring" }}
                      className="text-3xl font-bold text-gray-600"
                    >
                      {match.h2h.draws}
                    </motion.div>
                    <div className="text-sm text-muted-foreground mt-2">Draws</div>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="p-4 border rounded-lg"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.7, type: "spring" }}
                      className="text-3xl font-bold text-blue-600"
                    >
                      {match.h2h.awayWins}
                    </motion.div>
                    <div className="text-sm text-muted-foreground mt-2">{match.away_team.name} Wins</div>
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Lineups */}
        {lineups && (
          <Card>
            <CardHeader>
              <CardTitle>Lineups</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                {/* Home Team Lineup */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-lg">{match.home_team.name}</h3>
                    {lineups.homeTeam.formation && (
                      <Badge variant="outline">{lineups.homeTeam.formation}</Badge>
                    )}
                  </div>
                  
                  {/* Starting XI */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Starting XI</h4>
                    <div className="space-y-1">
                      {lineups.homeTeam.players
                        .filter(p => !p.substitute)
                        .map((player) => (
                          <Link key={player.id} href={`/auth/player/${player.id}`}>
                            <div className="flex items-center gap-2 p-2 rounded hover:bg-muted/50 transition-colors cursor-pointer">
                              <div className="w-8 h-8 flex-shrink-0 rounded-full overflow-hidden bg-muted flex items-center justify-center">
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
                              {player.jerseyNumber && (
                                <span className="w-6 h-6 flex items-center justify-center bg-primary text-primary-foreground rounded-full text-xs font-bold flex-shrink-0">
                                  {player.jerseyNumber}
                                </span>
                              )}
                              <span className="text-sm flex-1">{player.name}</span>
                              <Badge variant="secondary" className="text-xs">{player.position}</Badge>
                            </div>
                          </Link>
                        ))}
                    </div>
                  </div>

                  {/* Substitutes */}
                  {lineups.homeTeam.players.some(p => p.substitute) && (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">Substitutes</h4>
                      <div className="space-y-1">
                        {lineups.homeTeam.players
                          .filter(p => p.substitute)
                          .map((player) => (
                            <Link key={player.id} href={`/auth/player/${player.id}`}>
                              <div className="flex items-center gap-2 p-2 rounded hover:bg-muted/50 transition-colors opacity-75 cursor-pointer">
                                <div className="w-8 h-8 flex-shrink-0 rounded-full overflow-hidden bg-muted flex items-center justify-center">
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
                                {player.jerseyNumber && (
                                  <span className="w-6 h-6 flex items-center justify-center bg-muted text-muted-foreground rounded-full text-xs font-bold flex-shrink-0">
                                    {player.jerseyNumber}
                                  </span>
                                )}
                                <span className="text-sm flex-1">{player.name}</span>
                                <Badge variant="outline" className="text-xs">{player.position}</Badge>
                              </div>
                            </Link>
                          ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Away Team Lineup */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-lg">{match.away_team.name}</h3>
                    {lineups.awayTeam.formation && (
                      <Badge variant="outline">{lineups.awayTeam.formation}</Badge>
                    )}
                  </div>
                  
                  {/* Starting XI */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Starting XI</h4>
                    <div className="space-y-1">
                      {lineups.awayTeam.players
                        .filter(p => !p.substitute)
                        .map((player) => (
                          <Link key={player.id} href={`/auth/player/${player.id}`}>
                            <div className="flex items-center gap-2 p-2 rounded hover:bg-muted/50 transition-colors cursor-pointer">
                              <div className="w-8 h-8 flex-shrink-0 rounded-full overflow-hidden bg-muted flex items-center justify-center">
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
                              {player.jerseyNumber && (
                                <span className="w-6 h-6 flex items-center justify-center bg-primary text-primary-foreground rounded-full text-xs font-bold flex-shrink-0">
                                  {player.jerseyNumber}
                                </span>
                              )}
                              <span className="text-sm flex-1">{player.name}</span>
                              <Badge variant="secondary" className="text-xs">{player.position}</Badge>
                            </div>
                          </Link>
                        ))}
                    </div>
                  </div>

                  {/* Substitutes */}
                  {lineups.awayTeam.players.some(p => p.substitute) && (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">Substitutes</h4>
                      <div className="space-y-1">
                        {lineups.awayTeam.players
                          .filter(p => p.substitute)
                          .map((player) => (
                            <Link key={player.id} href={`/auth/player/${player.id}`}>
                              <div className="flex items-center gap-2 p-2 rounded hover:bg-muted/50 transition-colors opacity-75 cursor-pointer">
                                <div className="w-8 h-8 flex-shrink-0 rounded-full overflow-hidden bg-muted flex items-center justify-center">
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
                                {player.jerseyNumber && (
                                  <span className="w-6 h-6 flex items-center justify-center bg-muted text-muted-foreground rounded-full text-xs font-bold flex-shrink-0">
                                    {player.jerseyNumber}
                                  </span>
                                )}
                                <span className="text-sm flex-1">{player.name}</span>
                                <Badge variant="outline" className="text-xs">{player.position}</Badge>
                              </div>
                            </Link>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Fan Predictions */}
        {match.votes && (
          <Card>
            <CardHeader>
              <CardTitle>Fan Predictions</CardTitle>
              <p className="text-sm text-muted-foreground">What fans think will happen</p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Match Result Voting */}
              <div>
                <h3 className="font-semibold mb-3">Match Result</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="text-2xl font-bold text-green-600">
                      {((match.votes.vote1 / (match.votes.vote1 + match.votes.vote2 + match.votes.voteX)) * 100).toFixed(1)}%
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">{match.home_team.name} Win</div>
                    <div className="text-xs text-muted-foreground mt-1">{match.votes.vote1.toLocaleString()} votes</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="text-2xl font-bold text-gray-600">
                      {((match.votes.voteX / (match.votes.vote1 + match.votes.vote2 + match.votes.voteX)) * 100).toFixed(1)}%
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">Draw</div>
                    <div className="text-xs text-muted-foreground mt-1">{match.votes.voteX.toLocaleString()} votes</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="text-2xl font-bold text-red-600">
                      {((match.votes.vote2 / (match.votes.vote1 + match.votes.vote2 + match.votes.voteX)) * 100).toFixed(1)}%
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">{match.away_team.name} Win</div>
                    <div className="text-xs text-muted-foreground mt-1">{match.votes.vote2.toLocaleString()} votes</div>
                  </div>
                </div>
                {/* Visual Bar */}
                <div className="mt-4 h-3 rounded-full overflow-hidden flex">
                  <div 
                    className="bg-green-600" 
                    style={{ width: `${(match.votes.vote1 / (match.votes.vote1 + match.votes.vote2 + match.votes.voteX)) * 100}%` }}
                  ></div>
                  <div 
                    className="bg-gray-400" 
                    style={{ width: `${(match.votes.voteX / (match.votes.vote1 + match.votes.vote2 + match.votes.voteX)) * 100}%` }}
                  ></div>
                  <div 
                    className="bg-red-600" 
                    style={{ width: `${(match.votes.vote2 / (match.votes.vote1 + match.votes.vote2 + match.votes.voteX)) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Both Teams to Score */}
              {match.bothTeamsToScore && (
                <div>
                  <h3 className="font-semibold mb-3">Both Teams to Score?</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="text-2xl font-bold text-green-600">
                        {((match.bothTeamsToScore.voteYes / (match.bothTeamsToScore.voteYes + match.bothTeamsToScore.voteNo)) * 100).toFixed(1)}%
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">Yes</div>
                      <div className="text-xs text-muted-foreground mt-1">{match.bothTeamsToScore.voteYes.toLocaleString()} votes</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="text-2xl font-bold text-red-600">
                        {((match.bothTeamsToScore.voteNo / (match.bothTeamsToScore.voteYes + match.bothTeamsToScore.voteNo)) * 100).toFixed(1)}%
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">No</div>
                      <div className="text-xs text-muted-foreground mt-1">{match.bothTeamsToScore.voteNo.toLocaleString()} votes</div>
                    </div>
                  </div>
                  {/* Visual Bar */}
                  <div className="mt-4 h-3 rounded-full overflow-hidden flex">
                    <div 
                      className="bg-green-600" 
                      style={{ width: `${(match.bothTeamsToScore.voteYes / (match.bothTeamsToScore.voteYes + match.bothTeamsToScore.voteNo)) * 100}%` }}
                    ></div>
                    <div 
                      className="bg-red-600" 
                      style={{ width: `${(match.bothTeamsToScore.voteNo / (match.bothTeamsToScore.voteYes + match.bothTeamsToScore.voteNo)) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* First Team to Score */}
              {match.firstToScore && (
                <div>
                  <h3 className="font-semibold mb-3">First Team to Score</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="text-2xl font-bold text-green-600">
                        {((match.firstToScore.voteHome / (match.firstToScore.voteHome + match.firstToScore.voteAway + match.firstToScore.voteNoGoal)) * 100).toFixed(1)}%
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">{match.home_team.name}</div>
                      <div className="text-xs text-muted-foreground mt-1">{match.firstToScore.voteHome.toLocaleString()} votes</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="text-2xl font-bold text-red-600">
                        {((match.firstToScore.voteAway / (match.firstToScore.voteHome + match.firstToScore.voteAway + match.firstToScore.voteNoGoal)) * 100).toFixed(1)}%
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">{match.away_team.name}</div>
                      <div className="text-xs text-muted-foreground mt-1">{match.firstToScore.voteAway.toLocaleString()} votes</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="text-2xl font-bold text-gray-600">
                        {((match.firstToScore.voteNoGoal / (match.firstToScore.voteHome + match.firstToScore.voteAway + match.firstToScore.voteNoGoal)) * 100).toFixed(1)}%
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">No Goal</div>
                      <div className="text-xs text-muted-foreground mt-1">{match.firstToScore.voteNoGoal.toLocaleString()} votes</div>
                    </div>
                  </div>
                  {/* Visual Bar */}
                  <div className="mt-4 h-3 rounded-full overflow-hidden flex">
                    <div 
                      className="bg-green-600" 
                      style={{ width: `${(match.firstToScore.voteHome / (match.firstToScore.voteHome + match.firstToScore.voteAway + match.firstToScore.voteNoGoal)) * 100}%` }}
                    ></div>
                    <div 
                      className="bg-red-600" 
                      style={{ width: `${(match.firstToScore.voteAway / (match.firstToScore.voteHome + match.firstToScore.voteAway + match.firstToScore.voteNoGoal)) * 100}%` }}
                    ></div>
                    <div 
                      className="bg-gray-400" 
                      style={{ width: `${(match.firstToScore.voteNoGoal / (match.firstToScore.voteHome + match.firstToScore.voteAway + match.firstToScore.voteNoGoal)) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}

              <div className="text-xs text-muted-foreground text-center pt-4 border-t">
                Total votes: {(match.votes.vote1 + match.votes.vote2 + match.votes.voteX).toLocaleString()}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Other Matches in League */}
        {leagueMatches.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-primary" />
                    Other Matches in {match.league.name}
                  </CardTitle>
                  <Link href={`/auth/league/${match.league.id}`}>
                    <Button variant="ghost" size="sm">View All →</Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  {leagueMatches.slice(0, 3).map((m, index) => (
                    <motion.div
                      key={m.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Link href={`/auth/match/${m.id}`}>
                        <Card className="p-4 hover:bg-muted/50 transition-all cursor-pointer group border hover:border-primary/50">
                          <div className="space-y-3">
                            {/* Home Team */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3 flex-1">
                                {m.home_team_id && (
                                  <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center">
                                    <img
                                      src={`https://api.sofascore.com/api/v1/team/${m.home_team_id}/image`}
                                      alt={m.home_team_name}
                                      className="max-w-full max-h-full object-contain"
                                      onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.style.display = 'none';
                                      }}
                                    />
                                  </div>
                                )}
                                <span className="font-medium group-hover:text-primary transition-colors">
                                  {m.home_team_name}
                                </span>
                              </div>
                              <span className="text-lg font-bold ml-2">{m.home_score ?? '-'}</span>
                            </div>
                            
                            {/* Away Team */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3 flex-1">
                                {m.away_team_id && (
                                  <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center">
                                    <img
                                      src={`https://api.sofascore.com/api/v1/team/${m.away_team_id}/image`}
                                      alt={m.away_team_name}
                                      className="max-w-full max-h-full object-contain"
                                      onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.style.display = 'none';
                                      }}
                                    />
                                  </div>
                                )}
                                <span className="font-medium group-hover:text-primary transition-colors">
                                  {m.away_team_name}
                                </span>
                              </div>
                              <span className="text-lg font-bold ml-2">{m.away_score ?? '-'}</span>
                            </div>
                          </div>
                          
                          {/* Match Info */}
                          <div className="mt-3 pt-3 border-t flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">
                              {new Date(m.starting_at).toLocaleDateString([], { 
                                month: 'short', 
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                            <Badge variant="outline" className="text-xs">{m.state}</Badge>
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

        {/* Trending Predictions CTA */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border-primary/20">
            <CardContent className="p-6 text-center">
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="inline-block mb-3"
              >
                <TrendingUp className="h-8 w-8 text-primary" />
              </motion.div>
              <h3 className="text-xl font-bold mb-2">Want to see more predictions?</h3>
              <p className="text-muted-foreground mb-4">
                Explore trending predictions and join the community!
              </p>
              <Link href="/auth/dashboard">
                <Button className="bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-black font-bold shadow-lg hover:shadow-yellow-500">
                  View All Matches →
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>

        {/* Action Buttons */}
        <div className="flex gap-2 justify-center flex-wrap">
          {match && isMatchActive(match) && (
            hasUserPredicted ? (
              <Badge className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 text-base">
                ✓ Predicted
              </Badge>
            ) : (
              <Button onClick={handlePredictClick} size="lg" className="bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-white font-bold shadow-lg hover:shadow-[0_0_20px_rgba(234,179,8,0.6)] transition-all duration-150">
                ⚡ Make Prediction
              </Button>
            )
          )}
          {match.league.id && (
            <Link href={`/auth/league/${match.league.id}`}>
              <Button variant="default">
                <Trophy className="mr-2 h-4 w-4" />
                View League Standings
              </Button>
            </Link>
          )}
          <Button variant="outline" onClick={() => router.back()}>
            Back
          </Button>
        </div>

        {/* Prediction Dialog */}
        {match && (
          <PredictionDialog
            isOpen={isPredictionDialogOpen}
            onClose={() => setIsPredictionDialogOpen(false)}
            fixture={{
              id: match.id,
              name: match.name,
              starting_at: match.starting_at,
              home_team_name: match.home_team.name,
              away_team_name: match.away_team.name,
            }}
            onSuccess={() => {
              router.refresh();
              setHasUserPredicted(true);
              setIsPredictionDialogOpen(false);
            }}
          />
        )}
      </div>
    </div>
  );
}
