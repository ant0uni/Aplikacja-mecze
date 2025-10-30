"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2, Calendar, MapPin, Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    console.log("Match page params:", params);
    console.log("Match ID:", params.id);
    if (params.id) {
      fetchMatchDetails();
    } else {
      console.error("No match ID in params!");
    }
  }, [params.id]);

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
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">Match Details</h1>
            <p className="text-muted-foreground">View match information and statistics</p>
          </div>
          <Badge variant={getStatusBadgeVariant()}>{getMatchStatus()}</Badge>
        </div>

        {/* Match Score Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {match.league.logo && (
                  <img src={match.league.logo} alt={match.league.name} width={24} height={24} className="object-contain" />
                )}
                <span className="text-sm text-muted-foreground">{match.league.name}</span>
                <Link href={`/league/${match.league.id}`}>
                  <Badge variant="outline" className="text-xs cursor-pointer hover:bg-muted">
                    📊 Standings
                  </Badge>
                </Link>
                <Link href={`/league/${match.league.id}/top-scorers`}>
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
              <div className="text-center">
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
              <div className="text-center">
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

        {/* Head to Head */}
        {match.h2h && (
          <Card>
            <CardHeader>
              <CardTitle>Head to Head</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-4 border rounded-lg">
                  <div className="text-3xl font-bold text-green-600">{match.h2h.homeWins}</div>
                  <div className="text-sm text-muted-foreground mt-2">{match.home_team.name} Wins</div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="text-3xl font-bold text-gray-600">{match.h2h.draws}</div>
                  <div className="text-sm text-muted-foreground mt-2">Draws</div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="text-3xl font-bold text-blue-600">{match.h2h.awayWins}</div>
                  <div className="text-sm text-muted-foreground mt-2">{match.away_team.name} Wins</div>
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

        {/* Action Buttons */}
        <div className="flex gap-2 justify-center flex-wrap">
          {match.league.id && (
            <Link href={`/league/${match.league.id}`}>
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
      </div>
    </div>
  );
}
