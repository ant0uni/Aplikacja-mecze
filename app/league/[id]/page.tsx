"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2, Trophy, TrendingUp, TrendingDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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

  useEffect(() => {
    if (params.id) {
      fetchLeagueData();
    }
  }, [params.id]);

  const fetchLeagueData = async () => {
    try {
      // First, we need to get the current season ID
      // For now, we'll use Premier League's season ID as example
      // You might need to fetch the tournament details first to get the current season
      
      const tournamentId = params.id;
      
      // First, fetch the current season
      const seasonsResponse = await fetch(`https://api.sofascore.com/api/v1/unique-tournament/${tournamentId}/seasons`);
      const seasonsData = await seasonsResponse.json();
      const currentSeason = seasonsData.seasons[0]; // Most recent season
      const seasonId = currentSeason.id;
      
      const standingsUrl = `https://api.sofascore.com/api/v1/unique-tournament/${tournamentId}/season/${seasonId}/standings/total`;
      
      console.log("Fetching standings from:", standingsUrl);
      
      const response = await fetch(standingsUrl);
      
      if (!response.ok) {
        setError("Failed to load league standings");
        setIsLoading(false);
        return;
      }
      
      const data = await response.json();
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
    } catch (err) {
      console.error("Failed to fetch standings:", err);
      setError("Failed to load league standings");
    } finally {
      setIsLoading(false);
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
          <Link href={`/auth/league/${params.id}/top-scorers`}>
            <Button variant="outline">
              <Trophy className="h-4 w-4 mr-2" />
              Top Scorers
            </Button>
          </Link>
        </div>

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
                      onClick={() => window.location.href = `/team/${standing.team.id}`}
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
