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
    logo: string;
    score: number | null;
  };
  away_team: {
    id: number;
    name: string;
    logo: string;
    score: number | null;
  };
  league: {
    id: number;
    name: string;
    logo: string;
  };
  venue: {
    id: number;
    name: string;
    city: string;
  };
  statistics: any[];
  events: any[];
  lineups: any[];
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
      const response = await fetch(`/api/fixtures/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setMatch(data.fixture);
      } else if (response.status === 404) {
        setError("Match not found");
      } else {
        setError("Failed to load match details");
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
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/auth/dashboard">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
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
              <div className="flex items-center gap-2">
                {match.league.logo && (
                  <Image src={match.league.logo} alt={match.league.name} width={24} height={24} />
                )}
                <span className="text-sm text-muted-foreground">{match.league.name}</span>
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
                {match.home_team.logo && (
                  <div className="relative w-20 h-20 mx-auto mb-2">
                    <Image src={match.home_team.logo} alt={match.home_team.name} fill className="object-contain" />
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
                {match.away_team.logo && (
                  <div className="relative w-20 h-20 mx-auto mb-2">
                    <Image src={match.away_team.logo} alt={match.away_team.name} fill className="object-contain" />
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

        {/* Match Statistics */}
        {match.statistics && match.statistics.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Match Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {match.statistics.map((stat: any, index: number) => (
                  <div key={index} className="grid grid-cols-3 gap-4 items-center">
                    <div className="text-right font-semibold">{stat.data?.home || "-"}</div>
                    <div className="text-center text-sm text-muted-foreground">{stat.type?.name}</div>
                    <div className="text-left font-semibold">{stat.data?.away || "-"}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Match Events */}
        {match.events && match.events.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Match Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {match.events.map((event: any, index: number) => (
                  <div key={index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                    <Badge variant="outline">{event.minute}'</Badge>
                    <span className="text-sm">{event.type?.name}</span>
                    <span className="text-sm font-semibold">{event.player?.display_name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 justify-center">
          <Link href="/auth/dashboard">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
