"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Coins, LogOut, Plus, Loader2, Filter, User, Calendar, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ThemeToggle } from "@/components/theme-toggle";
import Image from "next/image";

interface User {
  id: number;
  email: string;
  coins: number;
}

interface League {
  id: number;
  name: string;
  active?: boolean;
}

interface Fixture {
  id: number;
  api_id: number;
  name: string;
  starting_at: string;
  result_info: string | null;
  state_id: number;
  state_name?: string;
  home_team_id?: number;
  home_team_name?: string;
  home_team_logo?: string;
  away_team_id?: number;
  away_team_name?: string;
  away_team_logo?: string;
  home_score?: number | null;
  away_score?: number | null;
  league_id?: number;
  league_name?: string;
  venue_id?: number;
  venue_name?: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [leagues, setLeagues] = useState<League[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingFixtures, setIsLoadingFixtures] = useState(false);
  const [coinsToAdd, setCoinsToAdd] = useState("");
  const [isAddingCoins, setIsAddingCoins] = useState(false);
  
  // Filter states
  const [selectedLeagues, setSelectedLeagues] = useState<string[]>([]);
  const [dateFrom, setDateFrom] = useState(new Date().toISOString().split('T')[0]);
  const [dateTo, setDateTo] = useState("");
  const [sortBy, setSortBy] = useState("starting_at");
  const [order, setOrder] = useState("asc");
  const [showFilters, setShowFilters] = useState(false);

  // Prediction modal states
  const [selectedFixture, setSelectedFixture] = useState<Fixture | null>(null);
  const [predictedHomeScore, setPredictedHomeScore] = useState("");
  const [predictedAwayScore, setPredictedAwayScore] = useState("");
  const [coinsWagered, setCoinsWagered] = useState("");
  const [isPredicting, setIsPredicting] = useState(false);

  useEffect(() => {
    fetchUser();
    fetchLeagues();
    fetchFixtures();
  }, []);

  const fetchUser = async () => {
    try {
      const response = await fetch("/api/user/me");
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        router.push("/login");
      }
    } catch (error) {
      console.error("Failed to fetch user:", error);
      router.push("/login");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLeagues = async () => {
    try {
      const response = await fetch("/api/leagues?per_page=50");
      if (response.ok) {
        const data = await response.json();
        setLeagues(data.leagues || []);
      }
    } catch (error) {
      console.error("Failed to fetch leagues:", error);
    }
  };

  const fetchFixtures = async () => {
    setIsLoadingFixtures(true);
    try {
      const params = new URLSearchParams();
      if (dateFrom) params.append("dateFrom", dateFrom);
      if (dateTo) params.append("dateTo", dateTo);
      if (selectedLeagues.length > 0) params.append("leagueIds", selectedLeagues.join(","));
      params.append("sortBy", sortBy);
      params.append("order", order);
      params.append("per_page", "25");
      
      const response = await fetch(`/api/fixtures?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        console.log("Fixtures API response:", data);
        console.log("First fixture:", data.fixtures?.[0]);
        setFixtures(data.fixtures || []);
      } else {
        console.error("Fixtures API error:", response.status, await response.text());
      }
    } catch (error) {
      console.error("Failed to fetch fixtures:", error);
    } finally {
      setIsLoadingFixtures(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleAddCoins = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseInt(coinsToAdd);

    if (isNaN(amount) || amount <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    setIsAddingCoins(true);
    try {
      const response = await fetch("/api/user/coins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setCoinsToAdd("");
        alert(`${amount} coins added successfully!`);
      } else {
        throw new Error("Failed to add coins");
      }
    } catch (error) {
      console.error("Failed to add coins:", error);
      alert("Failed to add coins");
    } finally {
      setIsAddingCoins(false);
    }
  };

  const handlePredict = async () => {
    if (!selectedFixture || !predictedHomeScore || !predictedAwayScore || !coinsWagered) {
      alert("Please fill in all fields");
      return;
    }

    const homeScore = parseInt(predictedHomeScore);
    const awayScore = parseInt(predictedAwayScore);
    const amount = parseInt(coinsWagered);
    
    if (isNaN(homeScore) || homeScore < 0 || isNaN(awayScore) || awayScore < 0) {
      alert("Please enter valid scores");
      return;
    }

    if (isNaN(amount) || amount <= 0) {
      alert("Please enter a valid coin amount");
      return;
    }

    if (user && amount > user.coins) {
      alert("Insufficient coins!");
      return;
    }

    setIsPredicting(true);
    try {
      const response = await fetch("/api/predictions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fixtureApiId: selectedFixture.api_id,
          predictedHomeScore: homeScore,
          predictedAwayScore: awayScore,
          coinsWagered: amount,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Prediction created successfully!");
        setSelectedFixture(null);
        setPredictedHomeScore("");
        setPredictedAwayScore("");
        setCoinsWagered("");
        fetchUser(); // Refresh user coins
      } else {
        alert(data.error || "Failed to create prediction");
      }
    } catch (error) {
      console.error("Failed to create prediction:", error);
      alert("Failed to create prediction");
    } finally {
      setIsPredicting(false);
    }
  };

  const isMatchActive = (fixture: Fixture) => {
    const matchDate = new Date(fixture.starting_at);
    const now = new Date();
    // Match is active if it hasn't started yet
    return matchDate > now;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold">Football Predictions</h1>
            <p className="text-muted-foreground">Welcome back, {user?.email}</p>
          </div>
          <div className="flex gap-2">
            <ThemeToggle />
            <Link href="/profile">
              <Button variant="outline">
                <User className="mr-2 h-4 w-4" />
                Profile
              </Button>
            </Link>
            <Button onClick={handleLogout} variant="outline">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>

        {/* Coins Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Coins className="h-5 w-5" />
              Your Coins: {user?.coins || 0}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddCoins} className="flex gap-2">
              <div className="flex-1">
                <Label htmlFor="coins" className="sr-only">
                  Add Coins
                </Label>
                <Input
                  id="coins"
                  type="number"
                  placeholder="Enter amount to add"
                  value={coinsToAdd}
                  onChange={(e) => setCoinsToAdd(e.target.value)}
                  disabled={isAddingCoins}
                  min="1"
                />
              </div>
              <Button type="submit" disabled={isAddingCoins}>
                {isAddingCoins ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="mr-2 h-4 w-4" />
                )}
                Add Coins
              </Button>
            </form>
            <p className="text-xs text-muted-foreground mt-2">
              Temporary feature: Add coins manually for testing
            </p>
          </CardContent>
        </Card>

        {/* Search and Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Filter Matches</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="mr-2 h-4 w-4" />
                {showFilters ? "Hide" : "Show"} Filters
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {showFilters && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Date From */}
                  <div className="space-y-2">
                    <Label htmlFor="dateFrom">
                      <Calendar className="inline h-4 w-4 mr-2" />
                      From Date
                    </Label>
                    <Input
                      id="dateFrom"
                      type="date"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                    />
                  </div>

                  {/* Date To */}
                  <div className="space-y-2">
                    <Label htmlFor="dateTo">
                      <Calendar className="inline h-4 w-4 mr-2" />
                      To Date
                    </Label>
                    <Input
                      id="dateTo"
                      type="date"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                    />
                  </div>

                  {/* League Filter */}
                  <div className="space-y-2">
                    <Label>Select Leagues</Label>
                    <Select
                      value={selectedLeagues.length > 0 ? selectedLeagues[0] : ""}
                      onValueChange={(value) => {
                        if (value && !selectedLeagues.includes(value)) {
                          setSelectedLeagues([...selectedLeagues, value]);
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select leagues..." />
                      </SelectTrigger>
                      <SelectContent>
                        {leagues.map((league) => (
                          <SelectItem key={league.id} value={league.id.toString()}>
                            {league.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {selectedLeagues.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {selectedLeagues.map((leagueId) => {
                          const league = leagues.find(l => l.id.toString() === leagueId);
                          return (
                            <Badge key={leagueId} variant="secondary">
                              {league?.name || leagueId}
                              <X
                                className="ml-1 h-3 w-3 cursor-pointer"
                                onClick={() => setSelectedLeagues(selectedLeagues.filter(id => id !== leagueId))}
                              />
                            </Badge>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Sort By */}
                  <div className="space-y-2">
                    <Label>Sort By</Label>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="starting_at">Starting Time</SelectItem>
                        <SelectItem value="id">Match ID</SelectItem>
                        <SelectItem value="name">Name</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Order */}
                  <div className="space-y-2">
                    <Label>Order</Label>
                    <Select value={order} onValueChange={setOrder}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="asc">Ascending</SelectItem>
                        <SelectItem value="desc">Descending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t">
                  <Button onClick={fetchFixtures} className="flex-1">
                    {isLoadingFixtures && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Apply Filters
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedLeagues([]);
                      setDateFrom(new Date().toISOString().split('T')[0]);
                      setDateTo("");
                      setSortBy("starting_at");
                      setOrder("asc");
                    }}
                  >
                    Clear All
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Fixtures List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Fixtures</span>
              <Badge variant="secondary">{fixtures.length} matches</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingFixtures ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : fixtures.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No fixtures found. Try adjusting your filters or check your API configuration.
              </p>
            ) : (
              <div className="space-y-3">
                {fixtures.map((fixture) => {
                  console.log("Rendering fixture:", { id: fixture.id, api_id: fixture.api_id, name: fixture.name });
                  
                  return (
                  <div
                    key={fixture.id}
                    className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="space-y-3">
                      {/* Match Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {fixture.league_name && (
                            <Badge variant="outline" className="text-xs">
                              {fixture.league_name}
                            </Badge>
                          )}
                          {fixture.state_name && (
                            <Badge variant="secondary" className="text-xs">
                              {fixture.state_name}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {new Date(fixture.starting_at).toLocaleDateString()}
                        </div>
                      </div>

                      {/* Teams and Score */}
                      <Link href={`/match/${fixture.api_id}`}>
                        <div className="grid grid-cols-7 gap-2 items-center py-2">
                          {/* Home Team */}
                          <div className="col-span-3 flex items-center gap-2">
                            {fixture.home_team_logo ? (
                              <div className="relative w-10 h-10 flex-shrink-0">
                                <Image
                                  src={fixture.home_team_logo}
                                  alt={fixture.home_team_name || "Home"}
                                  fill
                                  className="object-contain"
                                />
                              </div>
                            ) : (
                              <div className="w-10 h-10 flex-shrink-0 bg-muted rounded flex items-center justify-center text-xs">
                                H
                              </div>
                            )}
                            <span className="font-semibold text-sm truncate">
                              {fixture.home_team_name || "Home"}
                            </span>
                          </div>

                          {/* Score */}
                          <div className="col-span-1 text-center">
                            {fixture.home_score !== null && fixture.away_score !== null ? (
                              <div className="text-xl font-bold">
                                {fixture.home_score}:{fixture.away_score}
                              </div>
                            ) : (
                              <div className="text-sm text-muted-foreground">
                                {new Date(fixture.starting_at).toLocaleTimeString([], { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </div>
                            )}
                          </div>

                          {/* Away Team */}
                          <div className="col-span-3 flex items-center gap-2 justify-end">
                            <span className="font-semibold text-sm truncate">
                              {fixture.away_team_name || "Away"}
                            </span>
                            {fixture.away_team_logo ? (
                              <div className="relative w-10 h-10 flex-shrink-0">
                                <Image
                                  src={fixture.away_team_logo}
                                  alt={fixture.away_team_name || "Away"}
                                  fill
                                  className="object-contain"
                                />
                              </div>
                            ) : (
                              <div className="w-10 h-10 flex-shrink-0 bg-muted rounded flex items-center justify-center text-xs">
                                A
                              </div>
                            )}
                          </div>
                        </div>
                      </Link>

                      {/* Venue and Actions */}
                      <div className="flex items-center justify-between pt-2 border-t">
                        {fixture.venue_name ? (
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <span>📍</span>
                            {fixture.venue_name}
                          </p>
                        ) : (
                          <div></div>
                        )}
                        <div className="flex gap-2">
                          <Link href={`/match/${fixture.api_id}`}>
                            <Button size="sm" variant="outline">
                              Details
                            </Button>
                          </Link>
                          {isMatchActive(fixture) && (
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  size="sm"
                                  onClick={() => setSelectedFixture(fixture)}
                                >
                                  Predict
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Make Your Prediction</DialogTitle>
                                  <DialogDescription>
                                    Predict the score for: {fixture.name}
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                  <div className="space-y-2">
                                    <Label>Match Date</Label>
                                    <p className="text-sm text-muted-foreground">
                                      {new Date(fixture.starting_at).toLocaleString()}
                                    </p>
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Predicted Score</Label>
                                    <div className="grid grid-cols-3 gap-2 items-center">
                                      <div className="space-y-1">
                                        <Label htmlFor="homeScore" className="text-xs">
                                          {fixture.home_team_name || "Home"}
                                        </Label>
                                        <Input
                                          id="homeScore"
                                          type="number"
                                          placeholder="0"
                                          value={predictedHomeScore}
                                          onChange={(e) => setPredictedHomeScore(e.target.value)}
                                          min="0"
                                          max="20"
                                        />
                                      </div>
                                      <div className="text-center text-2xl font-bold">-</div>
                                      <div className="space-y-1">
                                        <Label htmlFor="awayScore" className="text-xs">
                                          {fixture.away_team_name || "Away"}
                                        </Label>
                                        <Input
                                          id="awayScore"
                                          type="number"
                                          placeholder="0"
                                          value={predictedAwayScore}
                                          onChange={(e) => setPredictedAwayScore(e.target.value)}
                                          min="0"
                                          max="20"
                                        />
                                      </div>
                                    </div>
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="wager">Coins to Wager</Label>
                                    <Input
                                      id="wager"
                                      type="number"
                                      placeholder="Enter amount"
                                      value={coinsWagered}
                                      onChange={(e) => setCoinsWagered(e.target.value)}
                                      min="1"
                                      max={user?.coins || 0}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                      Available: {user?.coins || 0} coins
                                    </p>
                                  </div>
                                </div>
                                <DialogFooter>
                                  <Button
                                    onClick={handlePredict}
                                    disabled={isPredicting || !predictedHomeScore || !predictedAwayScore || !coinsWagered}
                                  >
                                    {isPredicting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Confirm Prediction
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
