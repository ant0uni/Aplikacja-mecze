"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2, Trophy } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
  const [topScorers, setTopScorers] = useState<TopScorer[]>([]);
  const [leagueInfo, setLeagueInfo] = useState<LeagueInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

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
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href={`/league/${params.id}`}>
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
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{scorer.player.name}</span>
                          <span className="text-xs text-muted-foreground">
                            ({scorer.player.position})
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 flex-shrink-0 flex items-center justify-center">
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
                          <span className="text-sm">{scorer.team.shortName}</span>
                        </div>
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

        {/* Back Button */}
        <div className="flex justify-center gap-4">
          <Link href={`/league/${params.id}`}>
            <Button variant="outline">View Standings</Button>
          </Link>
          <Link href="/auth/dashboard">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
