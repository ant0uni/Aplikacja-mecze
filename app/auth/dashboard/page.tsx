"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Coins, LogOut, Loader2, User, Calendar, X, Trophy } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ThemeToggle } from "@/components/theme-toggle";
import { PredictionDialog } from "@/components/prediction-dialog";
import { ExitIntentPopup } from "@/components/exit-intent-popup";
import { LiveMatchesCarousel } from "@/components/live-matches-carousel";
import Image from "next/image";
import { toast } from "sonner";
import { ApiCache } from "@/lib/cache";

// Memoized Fixture Card Component for performance
const FixtureCard = React.memo(({ 
  fixture, 
  isMatchActive, 
  onPredictClick,
  onCountryClick,
}: { 
  fixture: Fixture; 
  isMatchActive: (fixture: Fixture) => boolean;
  onPredictClick: (fixture: Fixture) => void;
  onCountryClick: (country: string) => void;
}) => {
  return (
    <Link href={`/auth/match/${fixture.api_id}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.01, y: -1 }}
        transition={{ duration: 0.15, type: "spring", stiffness: 400, damping: 25 }}
        className={`border rounded-lg p-4 hover:shadow-lg hover:bg-muted/50 transition-shadow duration-150 cursor-pointer will-change-transform ${
          fixture.isPopular ? 'border-l-4 border-l-orange-500' : ''
        }`}
      >
        <div className="space-y-3">
          {/* Match Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-wrap">
              {fixture.isPopular && (
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <Badge className="text-xs bg-orange-500 hover:bg-orange-600">
                    🔥 POPULAR
                  </Badge>
                </motion.div>
              )}
              {fixture.country_name && (
                <Badge 
                  variant="default" 
                  className="text-xs cursor-pointer hover:opacity-80 transition-opacity flex items-center gap-1"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onCountryClick(fixture.country_name!);
                  }}
                  title="Click to filter by this country"
                >
                  {getCountryFlagUrl(fixture.country_name) && (
                    <img 
                      src={getCountryFlagUrl(fixture.country_name)} 
                      alt={fixture.country_name}
                      className="w-4 h-3 object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  )}
                  <span>{getCountryCode(fixture.country_name)}</span>
                </Badge>
              )}
              {fixture.league_name && fixture.league_id && (
                <Badge 
                  variant="outline" 
                  className="text-xs cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    window.location.href = `/auth/league/${fixture.league_id}`;
                  }}
                >
                  🏆 {fixture.league_name}
                </Badge>
              )}
              {!isMatchActive(fixture) && fixture.state_name && (
                <Badge variant="secondary" className="text-xs">
                  {fixture.state_name}
                </Badge>
              )}
              {fixture.league_id && (
                <>
                  {fixture.has_standings !== false && (
                    <Badge 
                      variant="outline" 
                      className="text-xs cursor-pointer hover:bg-muted"
                      onClick={(e) => {
                        e.preventDefault();
                        window.open(`/auth/league/${fixture.league_id}`, '_blank');
                      }}
                    >
                      📊 Standings
                    </Badge>
                  )}
                  {fixture.has_top_scorers !== false && (
                    <Badge 
                      variant="outline" 
                      className="text-xs cursor-pointer hover:bg-muted"
                      onClick={(e) => {
                        e.preventDefault();
                        window.open(`/auth/league/${fixture.league_id}/top-scorers`, '_blank');
                      }}
                    >
                      ⚽ Top Scorers
                    </Badge>
                  )}
                </>
              )}
            </div>
            <div className="flex items-center gap-2">
              {/* Time in top right */}
              {fixture.home_score === null && fixture.away_score === null && (
                <div className="text-sm font-semibold text-muted-foreground">
                  {new Date(fixture.starting_at).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
              )}
              {/* Date without year */}
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                {new Date(fixture.starting_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </div>
              {isMatchActive(fixture) && (
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-white font-bold shadow-lg hover:shadow-[0_0_20px_rgba(234,179,8,0.6)] transition-all duration-150"
                  onClick={(e) => {
                    e.preventDefault();
                    onPredictClick(fixture);
                  }}
                >
                  Predict
                </Button>
              )}
            </div>
          </div>

          {/* Teams and Score */}
          <div className="grid grid-cols-7 gap-2 items-center py-4">
            {/* Home Team */}
            <div className="col-span-3 flex items-center gap-3">
              {fixture.home_team_logo ? (
                <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center">
                  <img
                    src={fixture.home_team_logo}
                    alt={fixture.home_team_name || "Home"}
                    className="max-w-full max-h-full object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                </div>
              ) : (
                <div className="w-12 h-12 flex-shrink-0 bg-muted rounded flex items-center justify-center text-sm font-bold">
                  {fixture.home_team_name?.substring(0, 2).toUpperCase() || 'H'}
                </div>
              )}
              <span className="font-semibold text-base truncate">
                {fixture.home_team_name || "Home"}
              </span>
            </div>

            {/* Score */}
            <div className="col-span-1 text-center">
              {fixture.home_score !== null && fixture.away_score !== null ? (
                <div className="text-3xl font-bold text-primary">
                  {fixture.home_score}:{fixture.away_score}
                </div>
              ) : (
                <div className="text-xl font-semibold text-muted-foreground">
                  VS
                </div>
              )}
            </div>

            {/* Away Team */}
            <div className="col-span-3 flex items-center gap-3 justify-end">
              <span className="font-semibold text-base truncate">
                {fixture.away_team_name || "Away"}
              </span>
              {fixture.away_team_logo ? (
                <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center">
                  <img
                    src={fixture.away_team_logo}
                    alt={fixture.away_team_name || "Away"}
                    className="max-w-full max-h-full object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                </div>
              ) : (
                <div className="w-12 h-12 flex-shrink-0 bg-muted rounded flex items-center justify-center text-sm font-bold">
                  {fixture.away_team_name?.substring(0, 2).toUpperCase() || 'A'}
                </div>
              )}
            </div>
          </div>

          {/* Venue - no border */}
          {fixture.venue_name && (
            <div className="pt-1">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <span>📍</span>
                {fixture.venue_name}
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </Link>
  );
});

FixtureCard.displayName = 'FixtureCard';

// Helper function to get country flag image URL from flagcdn.com
const getCountryFlagUrl = (countryName: string): string => {
  const countryCodeMap: { [key: string]: string } = {
    'England': 'gb-eng',
    'Spain': 'es',
    'Italy': 'it',
    'Germany': 'de',
    'France': 'fr',
    'Poland': 'pl',
    'Portugal': 'pt',
    'Netherlands': 'nl',
    'Belgium': 'be',
    'Turkey': 'tr',
    'Brazil': 'br',
    'Argentina': 'ar',
    'USA': 'us',
    'Mexico': 'mx',
    'Scotland': 'gb-sct',
    'Wales': 'gb-wls',
    'Austria': 'at',
    'Switzerland': 'ch',
    'Sweden': 'se',
    'Norway': 'no',
    'Denmark': 'dk',
    'Greece': 'gr',
    'Russia': 'ru',
    'Ukraine': 'ua',
    'Croatia': 'hr',
    'Serbia': 'rs',
    'Czech Republic': 'cz',
    'Romania': 'ro',
    'Hungary': 'hu',
    'Japan': 'jp',
    'South Korea': 'kr',
    'Australia': 'au',
    'Canada': 'ca',
    'Chile': 'cl',
    'Colombia': 'co',
    'Uruguay': 'uy',
    'Ecuador': 'ec',
    'Peru': 'pe',
    'Venezuela': 've',
    'Paraguay': 'py',
    'Bolivia': 'bo',
    'Costa Rica': 'cr',
    'Panama': 'pa',
    'Jamaica': 'jm',
    'Honduras': 'hn',
    'El Salvador': 'sv',
    'Guatemala': 'gt',
    'Trinidad and Tobago': 'tt',
    'South Africa': 'za',
    'Nigeria': 'ng',
    'Egypt': 'eg',
    'Morocco': 'ma',
    'Algeria': 'dz',
    'Tunisia': 'tn',
    'Senegal': 'sn',
    'Ghana': 'gh',
    'Cameroon': 'cm',
    'Ivory Coast': 'ci',
    'Mali': 'ml',
    'Burkina Faso': 'bf',
    'Saudi Arabia': 'sa',
    'Iran': 'ir',
    'Iraq': 'iq',
    'United Arab Emirates': 'ae',
    'Qatar': 'qa',
    'Kuwait': 'kw',
    'Bahrain': 'bh',
    'Oman': 'om',
    'Jordan': 'jo',
    'Lebanon': 'lb',
    'Palestine': 'ps',
    'Syria': 'sy',
    'Yemen': 'ye',
    'China': 'cn',
    'India': 'in',
    'Indonesia': 'id',
    'Thailand': 'th',
    'Vietnam': 'vn',
    'Malaysia': 'my',
    'Singapore': 'sg',
    'Philippines': 'ph',
    'Pakistan': 'pk',
    'Bangladesh': 'bd',
    'Sri Lanka': 'lk',
    'Afghanistan': 'af',
    'Uzbekistan': 'uz',
    'Kazakhstan': 'kz',
    'Kyrgyzstan': 'kg',
    'Tajikistan': 'tj',
    'Turkmenistan': 'tm',
    'Azerbaijan': 'az',
    'Armenia': 'am',
    'Georgia': 'ge',
    'Bosnia and Herzegovina': 'ba',
    'North Macedonia': 'mk',
    'Albania': 'al',
    'Montenegro': 'me',
    'Slovenia': 'si',
    'Slovakia': 'sk',
    'Bulgaria': 'bg',
    'Finland': 'fi',
    'Iceland': 'is',
    'Estonia': 'ee',
    'Latvia': 'lv',
    'Lithuania': 'lt',
    'Belarus': 'by',
    'Moldova': 'md',
    'Kosovo': 'xk',
    'Cyprus': 'cy',
    'Malta': 'mt',
    'Luxembourg': 'lu',
    'Andorra': 'ad',
    'Monaco': 'mc',
    'San Marino': 'sm',
    'Liechtenstein': 'li',
    'Faroe Islands': 'fo',
    'Gibraltar': 'gi',
    'Northern Ireland': 'gb-nir',
    'Republic of Ireland': 'ie',
    'Ireland': 'ie',
  };
  
  const code = countryCodeMap[countryName];
  return code ? `https://flagcdn.com/w40/${code}.png` : '';
};

// Get country code for display
const getCountryCode = (countryName: string): string => {
  const codeMap: { [key: string]: string } = {
    'England': 'ENG',
    'Spain': 'ESP',
    'Italy': 'ITA',
    'Germany': 'GER',
    'France': 'FRA',
    'Poland': 'POL',
    'Portugal': 'POR',
    'Netherlands': 'NED',
    'Belgium': 'BEL',
    'Turkey': 'TUR',
    'Brazil': 'BRA',
    'Argentina': 'ARG',
    'USA': 'USA',
    'Mexico': 'MEX',
    'Scotland': 'SCO',
    'Wales': 'WAL',
    'Austria': 'AUT',
    'Switzerland': 'SUI',
    'Sweden': 'SWE',
    'Norway': 'NOR',
    'Denmark': 'DEN',
    'Greece': 'GRE',
    'Russia': 'RUS',
    'Ukraine': 'UKR',
    'Croatia': 'CRO',
    'Serbia': 'SRB',
    'Czech Republic': 'CZE',
    'Romania': 'ROU',
    'Hungary': 'HUN',
    'Japan': 'JPN',
    'South Korea': 'KOR',
    'Australia': 'AUS',
    'Canada': 'CAN',
  };
  return codeMap[countryName] || countryName.substring(0, 3).toUpperCase();
};

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
  country_name?: string;
  has_standings?: boolean;
  has_top_scorers?: boolean;
  venue_id?: number;
  venue_name?: string;
  isPopular?: boolean;
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
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [dateFrom, setDateFrom] = useState(new Date().toISOString().split('T')[0]);
  const [dateTo, setDateTo] = useState("");
  const [sortBy, setSortBy] = useState("starting_at");
  const [order, setOrder] = useState("asc");
  const [showFilters, setShowFilters] = useState(false);
  const [showPredictableOnly, setShowPredictableOnly] = useState(false);
  const [searchTeam, setSearchTeam] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeFixtureFilter, setActiveFixtureFilter] = useState<"upcoming" | "latest" | "started" | null>("upcoming");
  
  // Popular matches data
  const [popularMatches, setPopularMatches] = useState<Fixture[]>([]);
  const [allMatches, setAllMatches] = useState<Fixture[]>([]);
  
  // Live matches for carousel
  const [liveMatches, setLiveMatches] = useState<any[]>([]);
  
  // Top players data
  const [topPlayers, setTopPlayers] = useState<any[]>([]);
  const [isLoadingPlayers, setIsLoadingPlayers] = useState(false);
  const [currentLeagueIndex, setCurrentLeagueIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  
  // League rotation configuration
  const topLeagues = [
    { id: 17, name: "PREMIER LEAGUE", country: "England" },
    { id: 8, name: "LA LIGA", country: "Spain" },
    { id: 23, name: "SERIE A", country: "Italy" },
    { id: 35, name: "BUNDESLIGA", country: "Germany" },
    { id: 34, name: "LIGUE 1", country: "France" }
  ];
  
  // Infinite scroll
  const [displayedFixtures, setDisplayedFixtures] = useState<Fixture[]>([]);
  const [fixturesPage, setFixturesPage] = useState(1);
  const [hasMoreFixtures, setHasMoreFixtures] = useState(true);
  const FIXTURES_PER_PAGE = 40;
  
  // Region filter (Poland/Europe/World) - Load from localStorage
  const [selectedRegion, setSelectedRegion] = useState<"poland" | "europe" | "world">(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("selectedRegion");
      return (saved === "poland" || saved === "europe" || saved === "world") ? saved : "world";
    }
    return "world";
  });
  
  // Save selectedRegion to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("selectedRegion", selectedRegion);
    }
  }, [selectedRegion]);
  
  // Unique countries and leagues from current fixtures
  const [availableCountries, setAvailableCountries] = useState<{name: string, count: number}[]>([]);
  const [availableLeagues, setAvailableLeagues] = useState<{id: string, name: string, country: string, count: number}[]>([]);

  // Memoized computations for performance
  const filteredFixtures = useMemo(() => {
    let filtered = [...allMatches];
    
    // Apply region filter first (Poland/Europe/World)
    if (selectedRegion === "poland") {
      filtered = filtered.filter((fixture) => 
        fixture.country_name?.toLowerCase() === "poland"
      );
    } else if (selectedRegion === "europe") {
      // European countries list
      const europeanCountries = [
        "england", "spain", "italy", "germany", "france", "portugal", "netherlands",
        "belgium", "scotland", "turkey", "greece", "poland", "ukraine", "czech republic",
        "austria", "switzerland", "denmark", "sweden", "norway", "croatia", "serbia",
        "romania", "russia", "hungary", "slovakia", "bulgaria", "finland", "ireland",
        "wales", "northern ireland", "slovenia", "bosnia and herzegovina", "albania",
        "north macedonia", "montenegro", "cyprus", "luxembourg", "iceland", "malta",
        "andorra", "liechtenstein", "faroe islands", "gibraltar", "kosovo", "latvia",
        "lithuania", "estonia", "belarus", "moldova", "armenia", "georgia", "azerbaijan"
      ];
      filtered = filtered.filter((fixture) => 
        europeanCountries.includes(fixture.country_name?.toLowerCase() || "")
      );
    }
    // If "world" is selected, show all matches (no filtering)
    
    // Apply date filters
    if (dateTo) {
      filtered = filtered.filter((fixture) => {
        const eventDate = new Date(fixture.starting_at).toISOString().split('T')[0];
        return eventDate <= dateTo;
      });
    }
    
    // Apply country filter
    if (selectedCountries.length > 0) {
      filtered = filtered.filter((fixture) => 
        selectedCountries.includes(fixture.country_name || '')
      );
    }
    
    // Apply league filter
    if (selectedLeagues.length > 0) {
      filtered = filtered.filter((fixture) => 
        selectedLeagues.includes(fixture.league_id?.toString() || '')
      );
    }
    
    // Apply predictable only filter
    if (showPredictableOnly) {
      filtered = filtered.filter((fixture) => {
        return fixture.state_id === 0 || fixture.state_name === "notstarted" || fixture.state_name === "Not started";
      });
    }
    
    // Apply team search filter
    if (debouncedSearch) {
      const searchLower = debouncedSearch.toLowerCase();
      filtered = filtered.filter((fixture) => 
        fixture.home_team_name?.toLowerCase().includes(searchLower) ||
        fixture.away_team_name?.toLowerCase().includes(searchLower)
      );
    }
    
    // Sort matches
    filtered.sort((a, b) => {
      // First priority: Popular matches come first
      if (a.isPopular && !b.isPopular) return -1;
      if (!a.isPopular && b.isPopular) return 1;
      
      // Second priority: Predictable matches
      const aIsPredictable = a.state_id === 0 || a.state_name === "notstarted" || a.state_name === "Not started";
      const bIsPredictable = b.state_id === 0 || b.state_name === "notstarted" || b.state_name === "Not started";
      
      if (aIsPredictable && !bIsPredictable) return -1;
      if (!aIsPredictable && bIsPredictable) return 1;
      
      // Third priority: User-selected sorting
      let aValue: any = a[sortBy as keyof typeof a];
      let bValue: any = b[sortBy as keyof typeof b];
      
      if (sortBy === "starting_at") {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }
      
      if (order === "desc") {
        return bValue > aValue ? 1 : bValue < aValue ? -1 : 0;
      } else {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      }
    });
    
    return filtered;
  }, [allMatches, selectedCountries, selectedLeagues, dateTo, showPredictableOnly, debouncedSearch, sortBy, order, selectedRegion]);

  // Update fixtures when filtered results change and reset pagination
  useEffect(() => {
    setFixtures(filteredFixtures);
    setDisplayedFixtures(filteredFixtures.slice(0, FIXTURES_PER_PAGE));
    setFixturesPage(1);
    setHasMoreFixtures(filteredFixtures.length > FIXTURES_PER_PAGE);
  }, [filteredFixtures]);

  // Load more fixtures for infinite scroll
  const loadMoreFixtures = useCallback(() => {
    const nextPage = fixturesPage + 1;
    const startIndex = nextPage * FIXTURES_PER_PAGE;
    const endIndex = startIndex + FIXTURES_PER_PAGE;
    const moreFixtures = filteredFixtures.slice(startIndex, endIndex);
    
    if (moreFixtures.length > 0) {
      setDisplayedFixtures(prev => [...prev, ...moreFixtures]);
      setFixturesPage(nextPage);
      setHasMoreFixtures(endIndex < filteredFixtures.length);
    } else {
      setHasMoreFixtures(false);
    }
  }, [fixturesPage, filteredFixtures]);

  // Infinite scroll observer
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 500 && hasMoreFixtures && !isLoadingFixtures) {
        loadMoreFixtures();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasMoreFixtures, isLoadingFixtures, loadMoreFixtures]);

  // Prediction modal states
  const [selectedFixture, setSelectedFixture] = useState<Fixture | null>(null);

  useEffect(() => {
    fetchUser();
    fetchPopularMatches();
    fetchFixtures();
    fetchTopPlayers(topLeagues[0].id);
    
    // Preload all other leagues' data in the background to prevent lag
    // This happens silently and won't affect the UI
    setTimeout(() => {
      topLeagues.slice(1).forEach((league, index) => {
        // Stagger the preloading by 200ms each to avoid overwhelming the API
        setTimeout(() => {
          fetchTopPlayers(league.id);
        }, index * 200);
      });
    }, 1000); // Wait 1 second before starting preload
  }, []);

  // Debounce search input for performance
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTeam);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTeam]);

  // Auto-rotate top players every 3.5 seconds
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setCurrentLeagueIndex((prev) => {
        const nextIndex = (prev + 1) % topLeagues.length;
        fetchTopPlayers(topLeagues[nextIndex].id);
        return nextIndex;
      });
    }, 3500);

    return () => clearInterval(interval);
  }, [isPaused]);

  // Refresh data when date changes
  useEffect(() => {
    if (dateFrom !== new Date().toISOString().split('T')[0]) {
      fetchFixtures();
    }
  }, [dateFrom]);

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

  const fetchPopularMatches = useCallback(async () => {
    try {
      const cacheKey = 'popular-matches';
      
      const transformedEvents = await ApiCache.getOrFetch(
        cacheKey,
        async () => {
          // Fetch live events from SofaScore (these are typically the most popular/trending)
          const response = await fetch('https://www.sofascore.com/api/v1/sport/football/events/live');
          if (!response.ok) {
            throw new Error('Failed to fetch live events');
          }
          
          const data = await response.json();
          const events = data.events || [];
          
          // Transform live events to fixture format (these are trending/popular)
          return events.slice(0, 10).map((event: any) => ({
            id: event.id,
            api_id: event.id,
            name: `${event.homeTeam?.name || 'Home'} - ${event.awayTeam?.name || 'Away'}`,
            starting_at: new Date(event.startTimestamp * 1000).toISOString(),
            result_info: event.slug || null,
            state_id: event.status?.code || 0,
            state_name: event.status?.description || event.status?.type || null,
            home_team_id: event.homeTeam?.id || null,
            home_team_name: event.homeTeam?.name || null,
            home_team_logo: event.homeTeam?.id ? `https://api.sofascore.com/api/v1/team/${event.homeTeam.id}/image` : null,
            away_team_id: event.awayTeam?.id || null,
            away_team_name: event.awayTeam?.name || null,
            away_team_logo: event.awayTeam?.id ? `https://api.sofascore.com/api/v1/team/${event.awayTeam.id}/image` : null,
            home_score: event.homeScore?.current ?? event.homeScore?.display ?? null,
            away_score: event.awayScore?.current ?? event.awayScore?.display ?? null,
            league_id: event.tournament?.uniqueTournament?.id || event.tournament?.id || null,
            league_name: event.tournament?.uniqueTournament?.name || event.tournament?.name || null,
            country_name: event.tournament?.category?.name || null,
            has_standings: event.tournament?.uniqueTournament?.hasStandingsGroups || false,
            has_top_scorers: event.tournament?.uniqueTournament?.hasEventPlayerStatistics || false,
            venue_id: null,
            venue_name: null,
            isPopular: true
          }));
        },
        ApiCache.DURATIONS.SHORT, // Cache for 2 minutes (live data changes frequently)
        false // Don't use stale-while-revalidate - refresh only when expired
      );
      
      setPopularMatches(transformedEvents);
      
      // Also set live matches for carousel with logos
      const liveMatchesData = transformedEvents.map((event: any) => ({
        id: event.api_id,
        home_team_name: event.home_team_name || 'Home',
        away_team_name: event.away_team_name || 'Away',
        home_team_logo: event.home_team_logo,
        away_team_logo: event.away_team_logo,
        home_score: event.home_score,
        away_score: event.away_score,
        league_name: event.league_name || 'Unknown League',
      }));
      setLiveMatches(liveMatchesData);
    } catch (error) {
      console.error("Failed to fetch popular matches:", error);
    }
  }, []);



  const fetchFixtures = async () => {
    setIsLoadingFixtures(true);
    try {
      // Fetch directly from SofaScore API
      const dateToFetch = dateFrom || new Date().toISOString().split('T')[0];
      const url = `https://www.sofascore.com/api/v1/sport/football/scheduled-events/${dateToFetch}`;
      
      console.log("Fetching from SofaScore:", url);
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        console.log("SofaScore API response:", data);
        
        // Transform SofaScore data to our format
        let events = data.events || [];
        
        // Extract unique countries and leagues for filter dropdowns
        const countryMap = new Map<string, number>();
        const leagueMap = new Map<string, {id: string, name: string, country: string, count: number}>();
        
        events.forEach((event: any) => {
          const country = event.tournament?.category?.name || 'Unknown';
          const leagueId = event.tournament?.uniqueTournament?.id?.toString() || event.tournament?.id?.toString();
          const leagueName = event.tournament?.uniqueTournament?.name || event.tournament?.name || 'Unknown';
          
          // Count countries
          countryMap.set(country, (countryMap.get(country) || 0) + 1);
          
          // Count leagues
          if (leagueId) {
            if (leagueMap.has(leagueId)) {
              const existing = leagueMap.get(leagueId)!;
              existing.count += 1;
            } else {
              leagueMap.set(leagueId, {
                id: leagueId,
                name: leagueName,
                country: country,
                count: 1
              });
            }
          }
        });
        
        // Convert to sorted arrays
        const countriesArray = Array.from(countryMap.entries())
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
        
        const leaguesArray = Array.from(leagueMap.values())
          .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
        
        setAvailableCountries(countriesArray);
        setAvailableLeagues(leaguesArray);
        
        // Transform to our fixture format
        let transformedFixtures = events.map((event: any) => ({
          id: event.id,
          api_id: event.id,
          name: `${event.homeTeam?.name || 'Home'} - ${event.awayTeam?.name || 'Away'}`,
          starting_at: new Date(event.startTimestamp * 1000).toISOString(),
          result_info: event.slug || null,
          state_id: event.status?.code || 0,
          state_name: event.status?.description || event.status?.type || null,
          home_team_id: event.homeTeam?.id || null,
          home_team_name: event.homeTeam?.name || null,
          home_team_logo: event.homeTeam?.id ? `https://api.sofascore.com/api/v1/team/${event.homeTeam.id}/image` : null,
          away_team_id: event.awayTeam?.id || null,
          away_team_name: event.awayTeam?.name || null,
          away_team_logo: event.awayTeam?.id ? `https://api.sofascore.com/api/v1/team/${event.awayTeam.id}/image` : null,
          home_score: event.homeScore?.current ?? event.homeScore?.display ?? null,
          away_score: event.awayScore?.current ?? event.awayScore?.display ?? null,
          league_id: event.tournament?.uniqueTournament?.id || event.tournament?.id || null,
          league_name: event.tournament?.uniqueTournament?.name || event.tournament?.name || null,
          country_name: event.tournament?.category?.name || null,
          has_standings: event.tournament?.uniqueTournament?.hasStandingsGroups || event.tournament?.uniqueTournament?.hasPerformanceGraphFeature || false,
          has_top_scorers: event.tournament?.uniqueTournament?.hasEventPlayerStatistics || false,
          venue_id: null,
          venue_name: null,
        }));
        
        // Merge with popular matches (mark popular matches that also appear in regular matches)
        const popularMatchIds = new Set(popularMatches.map((m: Fixture) => m.api_id));
        transformedFixtures = transformedFixtures.map((fixture: any) => ({
          ...fixture,
          isPopular: popularMatchIds.has(fixture.api_id)
        }));
        
        // Add popular matches that aren't already in the regular matches
        const regularMatchIds = new Set(transformedFixtures.map((m: any) => m.api_id));
        const uniquePopularMatches = popularMatches.filter(match => !regularMatchIds.has(match.api_id));
        transformedFixtures = [...uniquePopularMatches, ...transformedFixtures];
        
        console.log("Transformed fixtures:", transformedFixtures.length);
        console.log("Popular matches:", popularMatches.length);
        console.log("First fixture:", transformedFixtures[0]);
        
        // Store all matches for filtering
        setAllMatches(transformedFixtures);
        
        // Don't apply filters here - let the useEffect handle it
      } else {
        console.error("SofaScore API error:", response.status, await response.text());
      }
    } catch (error) {
      console.error("Failed to fetch fixtures:", error);
    } finally {
      setIsLoadingFixtures(false);
    }
  };

  const fetchTopPlayers = async (leagueId: number) => {
    setIsLoadingPlayers(true);
    try {
      const cacheKey = `top-players-${leagueId}`;
      
      const data = await ApiCache.getOrFetch(
        cacheKey,
        async () => {
          // Cache the seasons fetch separately
          const seasonsCacheKey = `seasons-${leagueId}`;
          const seasonsData = await ApiCache.getOrFetch(
            seasonsCacheKey,
            async () => {
              const seasonsResponse = await fetch(`https://api.sofascore.com/api/v1/unique-tournament/${leagueId}/seasons`);
              if (!seasonsResponse.ok) {
                throw new Error('Failed to fetch seasons');
              }
              return await seasonsResponse.json();
            },
            ApiCache.DURATIONS.VERY_LONG, // Cache seasons for 24 hours - they rarely change
            false // Don't use stale-while-revalidate - only fetch when expired
          );
          
          const currentSeason = seasonsData.seasons[0];
          const seasonId = currentSeason.id;
          
          // Cache the top players fetch separately
          const playersCacheKey = `top-players-data-${leagueId}-${seasonId}`;
          const playersData = await ApiCache.getOrFetch(
            playersCacheKey,
            async () => {
              const response = await fetch(`https://api.sofascore.com/api/v1/unique-tournament/${leagueId}/season/${seasonId}/top-players/overall`);
              if (!response.ok) {
                throw new Error('Failed to fetch top players');
              }
              return await response.json();
            },
            ApiCache.DURATIONS.LONG, // Cache top players for 1 hour
            false // Don't use stale-while-revalidate - only fetch when expired
          );
          
          return playersData.topPlayers?.goals || [];
        },
        ApiCache.DURATIONS.LONG, // Cache the final result for 1 hour
        false // Don't use stale-while-revalidate - only fetch when cache expires
      );
      
      setTopPlayers(data.slice(0, 10));
    } catch (error) {
      console.error("Failed to fetch top players:", error);
      setTopPlayers([]); // Set empty array on error instead of leaving stale data
    } finally {
      setIsLoadingPlayers(false);
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
      toast.error("Please enter a valid amount");
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
        toast.success(`💰 ${amount} coins added successfully!`);
      } else {
        throw new Error("Failed to add coins");
      }
    } catch (error) {
      console.error("Failed to add coins:", error);
      toast.error("Failed to add coins");
    } finally {
      setIsAddingCoins(false);
    }
  };

  const isMatchActive = (fixture: Fixture) => {
    const matchDate = new Date(fixture.starting_at);
    const now = new Date();
    // Match is active if it hasn't started yet and within 24 hours
    const hoursDiff = (matchDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    return hoursDiff > 0 && hoursDiff <= 24;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen football-bg p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between flex-wrap gap-4"
        >
          <div>
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-4xl font-black italic dashboard-title"
            >
              COIN KICKER
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-muted-foreground mt-1"
            >
              Welcome to the game, {user?.email}
            </motion.p>
          </div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex gap-2 items-center"
          >
            <div className="flex items-center gap-2">
              <Select value={selectedRegion} onValueChange={(value: "poland" | "europe" | "world") => setSelectedRegion(value)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="poland">Poland</SelectItem>
                  <SelectItem value="europe">Europe</SelectItem>
                  <SelectItem value="world">World</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-md border bg-card">
              <Coins className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-bold">{user?.coins || 0}</span>
            </div>
            <Link href="/profile">
              <Button variant="outline" size="icon" title="Profile">
                <User className="h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </motion.div>

        {/* Popular Matches - Auto Scrolling Carousel */}
        {popularMatches.length > 0 && !showFilters && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-black italic uppercase section-title">
                  POPULAR MATCHES
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="scroll-container">
                  <div className="scroll-content">
                    {/* Duplicate the matches twice for seamless infinite scroll */}
                    {[...popularMatches, ...popularMatches].map((fixture, index) => (
                      <Link 
                        key={`${fixture.id}-${index}`} 
                        href={`/auth/match/${fixture.api_id}`}
                        className="flex-shrink-0 w-[350px]"
                      >
                        <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 border-l-4 border-l-orange-500 h-full relative overflow-hidden">
                          {/* Animated gradient background */}
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-red-500/5"
                            animate={{
                              opacity: [0.3, 0.6, 0.3],
                            }}
                            transition={{ duration: 2, repeat: Infinity }}
                          />
                          <CardContent className="p-4 relative z-10">
                            <div className="space-y-3">
                              {/* Match Header */}
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <motion.div
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ duration: 1, repeat: Infinity }}
                                    className="w-2 h-2 bg-red-500 rounded-full"
                                  />
                                  <Badge className="text-xs bg-orange-500 hover:bg-orange-600">
                                    LIVE
                                  </Badge>
                                </div>
                                {fixture.league_name && (
                                  <Badge variant="outline" className="text-xs">
                                    🏆 {fixture.league_name}
                                  </Badge>
                                )}
                              </div>

                              {/* Teams and Score */}
                              <div className="text-center space-y-2">
                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex items-center gap-2 flex-1">
                                    {fixture.home_team_logo && (
                                      <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center">
                                        <img
                                          src={fixture.home_team_logo}
                                          alt={fixture.home_team_name || "Home"}
                                          className="max-w-full max-h-full object-contain"
                                          onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.style.display = 'none';
                                          }}
                                        />
                                      </div>
                                    )}
                                    <span className="font-medium text-sm truncate">
                                      {fixture.home_team_name}
                                    </span>
                                  </div>
                                  <div className="text-2xl font-bold mx-2">
                                    {fixture.home_score !== null && fixture.away_score !== null ? (
                                      `${fixture.home_score}:${fixture.away_score}`
                                    ) : (
                                      "VS"
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 flex-1 justify-end">
                                    <span className="font-medium text-sm truncate">
                                      {fixture.away_team_name}
                                    </span>
                                    {fixture.away_team_logo && (
                                      <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center">
                                        <img
                                          src={fixture.away_team_logo}
                                          alt={fixture.away_team_name || "Away"}
                                          className="max-w-full max-h-full object-contain"
                                          onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.style.display = 'none';
                                          }}
                                        />
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Top Players */}
        {topPlayers.length > 0 && !showFilters && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-black italic uppercase section-title flex items-center justify-between">
                  <span>TOP SCORERS - {topLeagues[currentLeagueIndex].name}</span>
                  <div className="flex gap-1">
                    {topLeagues.map((_, index) => (
                      <div
                        key={index}
                        className={`w-2 h-2 rounded-full transition-all ${
                          index === currentLeagueIndex ? 'bg-primary w-4' : 'bg-muted-foreground/30'
                        }`}
                      />
                    ))}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentLeagueIndex}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4"
                  >
                    {topPlayers.map((playerData, index) => (
                      <motion.div
                        key={playerData.player.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05, duration: 0.3 }}
                      >
                        <Link href={`/auth/player/${playerData.player.id}`}>
                          <motion.div
                            whileHover={{ scale: 1.05, y: -4 }}
                            transition={{ duration: 0.15, type: "spring", stiffness: 400, damping: 25 }}
                            className="text-center p-3 rounded-lg border hover:shadow-lg will-change-transform transition-shadow duration-150 cursor-pointer"
                          >
                            <div className="relative w-16 h-16 mx-auto mb-2">
                              <div className="w-full h-full rounded-full overflow-hidden border-2 border-primary/20 bg-muted flex items-center justify-center">
                                <img
                                  src={`https://api.sofascore.com/api/v1/player/${playerData.player.id}/image`}
                                  alt={playerData.player.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                    if (target.parentElement) {
                                      target.parentElement.innerHTML = `<div class="w-full h-full flex items-center justify-center text-xl font-bold">${playerData.player.name.substring(0, 2).toUpperCase()}</div>`;
                                    }
                                  }}
                                />
                              </div>
                              <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-lg">
                                {index + 1}
                              </div>
                            </div>
                            <p className="font-semibold text-sm truncate mb-1">{playerData.player.name}</p>
                            <div className="flex items-center justify-center gap-1">
                              <span className="text-xs">⚽</span>
                              <span className="text-sm font-bold text-primary">{playerData.statistics.goals}</span>
                            </div>
                          </motion.div>
                        </Link>
                      </motion.div>
                    ))}
                  </motion.div>
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>
        )}

        

        {/* Search and Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="text-2xl font-black italic uppercase section-title">FILTERS</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                {showFilters ? "Hide" : "Show"} Filters
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Team Search - Always Visible */}
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  id="searchTeam"
                  type="text"
                  placeholder="Search by team name..."
                  value={searchTeam}
                  onChange={(e) => setSearchTeam(e.target.value)}
                  className="flex-1"
                />
                <Link href="/auth/leagues">
                  <Button variant="outline" className="gap-2">
                    <Trophy className="h-4 w-4" />
                    Browse Leagues
                  </Button>
                </Link>
              </div>
            </div>

            {/* Predictable Only Toggle */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="predictableOnly"
                checked={showPredictableOnly}
                onChange={(e) => setShowPredictableOnly(e.target.checked)}
                className="w-4 h-4 cursor-pointer"
              />
              <Label htmlFor="predictableOnly" className="cursor-pointer">
                Show only predictable matches
              </Label>
            </div>

            {showFilters && (
              <div className="space-y-4 pt-4 border-t">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                      To Date (Optional)
                    </Label>
                    <Input
                      id="dateTo"
                      type="date"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                    />
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
                        <SelectItem value="league_name">League Name</SelectItem>
                        <SelectItem value="country_name">Country</SelectItem>
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

                  {/* Country Filter */}
                  <div className="space-y-2 md:col-span-2">
                    <Label>🌍 Filter by Country ({availableCountries.length} available)</Label>
                    <Select
                      value=""
                      onValueChange={(value) => {
                        if (value && !selectedCountries.includes(value)) {
                          setSelectedCountries([...selectedCountries, value]);
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select countries..." />
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px]">
                        {availableCountries.map((country) => (
                          <SelectItem key={country.name} value={country.name}>
                            {country.name} ({country.count} matches)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {selectedCountries.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {selectedCountries.map((country) => (
                          <Badge key={country} variant="secondary">
                            {country}
                            <X
                              className="ml-1 h-3 w-3 cursor-pointer"
                              onClick={() => setSelectedCountries(selectedCountries.filter(c => c !== country))}
                            />
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* League Filter */}
                  <div className="space-y-2 md:col-span-2 lg:col-span-3">
                    <Label>⚽ Filter by League ({availableLeagues.length} available)</Label>
                    <Select
                      value=""
                      onValueChange={(value) => {
                        if (value && !selectedLeagues.includes(value)) {
                          setSelectedLeagues([...selectedLeagues, value]);
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select leagues..." />
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px]">
                        {availableLeagues.map((league) => (
                          <SelectItem key={league.id} value={league.id}>
                            {league.name} ({league.country}) - {league.count} matches
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {selectedLeagues.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {selectedLeagues.map((leagueId) => {
                          const league = availableLeagues.find(l => l.id === leagueId);
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
                </div>

                <div className="flex gap-2 pt-4 border-t">
                  <div className="text-sm text-muted-foreground flex items-center gap-2 flex-1">
                    ⚡ Filters are applied instantly
                    {isLoadingFixtures && <Loader2 className="h-4 w-4 animate-spin" />}
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedLeagues([]);
                      setSelectedCountries([]);
                      setDateFrom(new Date().toISOString().split('T')[0]);
                      setDateTo("");
                      setSortBy("starting_at");
                      setOrder("asc");
                      setShowPredictableOnly(false);
                      setSearchTeam("");
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          {/* Trending Teaser */}
          {fixtures.length > 0 && (
            <motion.div
              className="mb-4 p-4 rounded-lg border border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10"
              animate={{ 
                boxShadow: ["0 0 0 0 rgba(var(--primary), 0)", "0 0 20px 5px rgba(var(--primary), 0.1)", "0 0 0 0 rgba(var(--primary), 0)"]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Trophy className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-bold text-sm">🔥 {fixtures.length} matches waiting for your predictions!</p>
                  </div>
                </div>
                <Badge variant="default" className="animate-pulse">
                  HOT
                </Badge>
              </div>
            </motion.div>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-2xl font-black italic uppercase section-title">ALL FIXTURES</span>
                <div className="flex items-center flex-wrap gap-2">
                  {(selectedCountries.length > 0 || selectedLeagues.length > 0 || searchTeam) && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    >
                      <Badge variant="outline" className="text-xs">
                        🔍 {selectedCountries.length + selectedLeagues.length + (searchTeam ? 1 : 0)} filters active
                      </Badge>
                    </motion.div>
                  )}
                  <Badge variant="secondary">{fixtures.length} matches</Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Quick Filter Buttons - Moved above fixtures */}
              <div className="flex gap-2 mb-4 pb-4 border-b">
                <Button
                  variant={activeFixtureFilter === "upcoming" ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setActiveFixtureFilter("upcoming");
                    setSortBy("starting_at");
                    setOrder("asc");
                    setShowPredictableOnly(false);
                  }}
                  className="text-xs"
                >
                  UPCOMING
                </Button>
                <Button
                  variant={activeFixtureFilter === "latest" ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setActiveFixtureFilter("latest");
                    setSortBy("starting_at");
                    setOrder("desc");
                    setShowPredictableOnly(false);
                  }}
                  className="text-xs"
                >
                  LATEST
                </Button>
                <Button
                  variant={activeFixtureFilter === "started" ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setActiveFixtureFilter("started");
                    setShowPredictableOnly(true);
                    setSortBy("starting_at");
                    setOrder("asc");
                  }}
                  className="text-xs"
                >
                  STARTED
                </Button>
              </div>
              
              {isLoadingFixtures ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : fixtures.length === 0 ? (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-muted-foreground text-center py-8"
                >
                  No fixtures found. Try adjusting your filters or check your API configuration.
                </motion.p>
              ) : (
                <>
                  <div className="space-y-3">
                    <AnimatePresence mode="popLayout">
                      {displayedFixtures.map((fixture, index) => (
                        <React.Fragment key={`fragment-${fixture.id}-${index}`}>
                          {/* Insert Live Matches Carousel every 50 records */}
                          {index > 0 && index % 50 === 0 && liveMatches.length > 0 && (
                            <div className="my-4">
                              <LiveMatchesCarousel 
                                matches={liveMatches}
                                autoScroll={true}
                                scrollSpeed={30}
                              />
                            </div>
                          )}
                          
                          <motion.div
                            key={fixture.id}
                            layout
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ delay: Math.min(index * 0.02, 0.5), duration: 0.3 }}
                          >
                            <FixtureCard
                              fixture={fixture}
                              isMatchActive={isMatchActive}
                              onPredictClick={setSelectedFixture}
                              onCountryClick={(country) => {
                                if (!selectedCountries.includes(country)) {
                                  setSelectedCountries([...selectedCountries, country]);
                                  setShowFilters(true);
                                }
                              }}
                            />
                          </motion.div>
                        </React.Fragment>
                      ))}
                    </AnimatePresence>
                  </div>
                  
                  {/* Load More Indicator */}
                  {hasMoreFixtures && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex justify-center py-8"
                    >
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      >
                        <Loader2 className="h-6 w-6 text-muted-foreground" />
                      </motion.div>
                      <span className="ml-2 text-muted-foreground">Loading more matches...</span>
                    </motion.div>
                  )}
                  
                  {!hasMoreFixtures && displayedFixtures.length > FIXTURES_PER_PAGE && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center text-muted-foreground py-4"
                    >
                      All matches loaded ({displayedFixtures.length} total)
                    </motion.p>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Prediction Dialog */}
        <PredictionDialog
          isOpen={!!selectedFixture}
          onClose={() => setSelectedFixture(null)}
          fixture={selectedFixture ? {
            id: selectedFixture.api_id,
            name: selectedFixture.name,
            starting_at: selectedFixture.starting_at,
            home_team_name: selectedFixture.home_team_name || "Home",
            away_team_name: selectedFixture.away_team_name || "Away",
          } : null}
          onSuccess={() => {
            fetchFixtures();
            fetchUser();
          }}
        />

        {/* Exit Intent Popup */}
        <ExitIntentPopup
          liveMatches={popularMatches.map(match => ({
            id: match.api_id,
            home_team_name: match.home_team_name || "Home",
            away_team_name: match.away_team_name || "Away",
            home_score: match.home_score ?? null,
            away_score: match.away_score ?? null,
            league_name: match.league_name || "Unknown League",
          }))}
          onClose={() => {}}
        />
      </div>
    </div>
  );
}
