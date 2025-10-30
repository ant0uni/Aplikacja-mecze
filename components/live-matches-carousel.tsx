"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp } from "lucide-react";

interface LiveMatch {
  id: number;
  home_team_name: string;
  away_team_name: string;
  home_team_logo?: string | null;
  away_team_logo?: string | null;
  home_score: number | null;
  away_score: number | null;
  league_name: string;
}

interface LiveMatchesCarouselProps {
  matches: LiveMatch[];
  autoScroll?: boolean;
  scrollSpeed?: number;
}

export function LiveMatchesCarousel({ 
  matches, 
  autoScroll = true,
  scrollSpeed = 30 
}: LiveMatchesCarouselProps) {
  const [isPaused, setIsPaused] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    if (!autoScroll || isPaused || !scrollRef.current) return;

    const scrollContainer = scrollRef.current;
    const scrollWidth = scrollContainer.scrollWidth;
    const clientWidth = scrollContainer.clientWidth;

    const scroll = () => {
      if (scrollContainer) {
        const newPosition = scrollContainer.scrollLeft + 1;
        
        // Reset to start when reaching the end
        if (newPosition >= scrollWidth - clientWidth) {
          scrollContainer.scrollLeft = 0;
        } else {
          scrollContainer.scrollLeft = newPosition;
        }
      }
    };

    const interval = setInterval(scroll, scrollSpeed);
    return () => clearInterval(interval);
  }, [autoScroll, isPaused, scrollSpeed]);

  if (matches.length === 0) return null;

  // Duplicate matches for seamless loop
  const displayMatches = [...matches, ...matches];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-red-500" />
            <motion.span
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              🔴 LIVE NOW
            </motion.span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div 
            ref={scrollRef}
            className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide"
            style={{ scrollBehavior: 'auto' }}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {displayMatches.map((match, index) => (
              <motion.div
                key={`${match.id}-${index}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: Math.min(index * 0.05, 0.5) }}
              >
                <Link href={`/auth/match/${match.id}`}>
                  <Card className="min-w-[280px] p-4 hover:bg-muted/50 transition-all cursor-pointer group border hover:border-primary/50">
                    <Badge variant="destructive" className="mb-3 text-xs animate-pulse">
                      LIVE
                    </Badge>
                    
                    {/* Home Team */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 flex-1">
                        {match.home_team_logo ? (
                          <div className="relative w-6 h-6 flex-shrink-0">
                            <Image
                              src={match.home_team_logo}
                              alt={match.home_team_name}
                              fill
                              className="object-contain"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                              }}
                            />
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                            <span className="text-xs">⚽</span>
                          </div>
                        )}
                        <span className="font-medium truncate text-sm">
                          {match.home_team_name}
                        </span>
                      </div>
                      <motion.span 
                        className="font-bold text-lg ml-2"
                        animate={{ scale: match.home_score !== null ? [1, 1.1, 1] : 1 }}
                        transition={{ duration: 0.5 }}
                      >
                        {match.home_score ?? 0}
                      </motion.span>
                    </div>

                    {/* Away Team */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2 flex-1">
                        {match.away_team_logo ? (
                          <div className="relative w-6 h-6 flex-shrink-0">
                            <Image
                              src={match.away_team_logo}
                              alt={match.away_team_name}
                              fill
                              className="object-contain"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                              }}
                            />
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                            <span className="text-xs">⚽</span>
                          </div>
                        )}
                        <span className="font-medium truncate text-sm">
                          {match.away_team_name}
                        </span>
                      </div>
                      <motion.span 
                        className="font-bold text-lg ml-2"
                        animate={{ scale: match.away_score !== null ? [1, 1.1, 1] : 1 }}
                        transition={{ duration: 0.5 }}
                      >
                        {match.away_score ?? 0}
                      </motion.span>
                    </div>

                    {/* League Name */}
                    <div className="text-xs text-muted-foreground truncate border-t pt-2">
                      🏆 {match.league_name}
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
          {autoScroll && (
            <p className="text-xs text-muted-foreground text-center mt-2">
              Hover to pause • Auto-scrolling
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
