"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Search, Trophy, TrendingUp, Globe } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ApiCache } from "@/lib/cache";

interface League {
  id: number;
  name: string;
  slug: string;
  category: {
    id: number;
    name: string;
    slug: string;
    flag?: string;
  };
  hasStandingsGroups?: boolean;
}

export default function LeaguesPage() {
  const router = useRouter();
  const [allLeagues, setAllLeagues] = useState<League[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('selectedRegion');
      return (saved === "poland" || saved === "europe" || saved === "world") ? saved : "world";
    }
    return "world";
  });

  // Popular leagues by region
  const popularLeagues = {
    world: [
      { id: 17, name: "Premier League", country: "England" },
      { id: 8, name: "LaLiga", country: "Spain" },
      { id: 35, name: "Serie A", country: "Italy" },
      { id: 34, name: "Bundesliga", country: "Germany" },
      { id: 53, name: "Ligue 1", country: "France" },
      { id: 679, name: "Champions League", country: "Europe" },
    ],
    europe: [
      { id: 17, name: "Premier League", country: "England" },
      { id: 8, name: "LaLiga", country: "Spain" },
      { id: 35, name: "Serie A", country: "Italy" },
      { id: 34, name: "Bundesliga", country: "Germany" },
      { id: 53, name: "Ligue 1", country: "France" },
      { id: 37, name: "Eredivisie", country: "Netherlands" },
      { id: 52, name: "Primeira Liga", country: "Portugal" },
    ],
    poland: [
      { id: 103, name: "Ekstraklasa", country: "Poland" },
      { id: 17, name: "Premier League", country: "England" },
      { id: 8, name: "LaLiga", country: "Spain" },
      { id: 679, name: "Champions League", country: "Europe" },
    ],
  };

  useEffect(() => {
    fetchLeagues();
  }, []);

  const fetchLeagues = async () => {
    try {
      const cacheKey = 'all-leagues';
      
      const leagues = await ApiCache.getOrFetch(
        cacheKey,
        async () => {
          // Fetch from multiple major countries
          const countries = ['england', 'spain', 'italy', 'germany', 'france', 'netherlands', 'portugal', 'poland', 'brazil', 'argentina'];
          const allLeaguesData: League[] = [];
          
          for (const country of countries) {
            try {
              const response = await fetch(`https://www.sofascore.com/api/v1/config/unique-tournament-order/football/${country}`);
              if (response.ok) {
                const data = await response.json();
                if (data.uniqueTournaments) {
                  allLeaguesData.push(...data.uniqueTournaments);
                }
              }
            } catch (err) {
              console.error(`Failed to fetch ${country} leagues:`, err);
            }
          }
          
          return allLeaguesData;
        },
        ApiCache.DURATIONS.VERY_LONG,
        true
      );
      
      setAllLeagues(leagues);
    } catch (error) {
      console.error("Failed to fetch leagues:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredLeagues = useMemo(() => {
    if (!searchQuery) return [];
    
    const query = searchQuery.toLowerCase();
    return allLeagues
      .filter(league => 
        league.name.toLowerCase().includes(query) || 
        league.category.name.toLowerCase().includes(query)
      )
      .slice(0, 20);
  }, [allLeagues, searchQuery]);

  const handleRegionChange = (region: string) => {
    setSelectedRegion(region);
    if (typeof window !== 'undefined') {
      localStorage.setItem('selectedRegion', region);
    }
  };

  return (
    <div className="min-h-screen football-bg p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
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
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Trophy className="h-8 w-8 text-yellow-500" />
              Explore Leagues
            </h1>
            <p className="text-muted-foreground">Search and discover football leagues worldwide</p>
          </div>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search for leagues or countries..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              {/* Search Results */}
              {searchQuery && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-4 space-y-2 max-h-96 overflow-y-auto"
                >
                  {filteredLeagues.length > 0 ? (
                    filteredLeagues.map((league, index) => (
                      <motion.div
                        key={league.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Link href={`/auth/league/${league.id}`}>
                          <Card className="p-3 hover:bg-muted/50 transition-all cursor-pointer group border hover:border-primary/50">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <img
                                  src={`https://api.sofascore.com/api/v1/unique-tournament/${league.id}/image`}
                                  alt={league.name}
                                  className="w-8 h-8 object-contain"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                  }}
                                />
                                <div>
                                  <div className="font-medium group-hover:text-primary transition-colors">
                                    {league.name}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {league.category.name}
                                  </div>
                                </div>
                              </div>
                              <Badge variant="outline">View →</Badge>
                            </div>
                          </Card>
                        </Link>
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No leagues found matching "{searchQuery}"
                    </div>
                  )}
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Region Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex gap-2 justify-center">
            <Button
              variant={selectedRegion === "world" ? "default" : "outline"}
              onClick={() => handleRegionChange("world")}
              className="gap-2"
            >
              <Globe className="h-4 w-4" />
              World
            </Button>
            <Button
              variant={selectedRegion === "europe" ? "default" : "outline"}
              onClick={() => handleRegionChange("europe")}
            >
              Europe
            </Button>
            <Button
              variant={selectedRegion === "poland" ? "default" : "outline"}
              onClick={() => handleRegionChange("poland")}
            >
              Poland
            </Button>
          </div>
        </motion.div>

        {/* Popular Leagues */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Popular Leagues in {selectedRegion === "world" ? "the World" : selectedRegion === "europe" ? "Europe" : "Poland"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                {popularLeagues[selectedRegion as keyof typeof popularLeagues].map((league, index) => (
                  <motion.div
                    key={league.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link href={`/auth/league/${league.id}`}>
                      <Card className="p-4 hover:bg-muted/50 transition-all cursor-pointer group border hover:border-primary/50 will-change-transform">
                        <motion.div
                          whileHover={{ scale: 1.05, y: -4 }}
                          transition={{ duration: 0.15, type: "spring", stiffness: 400, damping: 25 }}
                        >
                          <div className="flex items-center gap-3 mb-3">
                            <img
                              src={`https://api.sofascore.com/api/v1/unique-tournament/${league.id}/image`}
                              alt={league.name}
                              className="w-12 h-12 object-contain"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                              }}
                            />
                            <div className="flex-1">
                              <div className="font-bold group-hover:text-primary transition-colors">
                                {league.name}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {league.country}
                              </div>
                            </div>
                          </div>
                          <div className="text-xs text-muted-foreground text-center">
                            Click to view standings
                          </div>
                        </motion.div>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Trending Now CTA */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
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
              <h3 className="text-xl font-bold mb-2">Discover Trending Matches</h3>
              <p className="text-muted-foreground mb-4">
                See what's happening right now across all leagues!
              </p>
              <Link href="/auth/dashboard">
                <Button className="bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-black font-bold shadow-lg hover:shadow-yellow-500">
                  View Live Matches →
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>

        {/* Explore More CTA */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="bg-gradient-to-r from-green-500/5 via-green-500/10 to-green-500/5 border-green-500/20">
            <CardContent className="p-6 text-center">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="inline-block mb-3"
              >
                <Trophy className="h-8 w-8 text-yellow-500" />
              </motion.div>
              <h3 className="text-xl font-bold mb-2">Make Your Predictions</h3>
              <p className="text-muted-foreground mb-4">
                Pick your favorite league and start predicting match outcomes!
              </p>
              <div className="text-sm text-muted-foreground">
                Earn coins and climb the leaderboard 🏆
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
