"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";

interface Match {
  id: number;
  home_team_name: string;
  away_team_name: string;
  home_score: number | null;
  away_score: number | null;
  league_name: string;
}

interface ExitIntentPopupProps {
  liveMatches: Match[];
  onClose: () => void;
}

export function ExitIntentPopup({ liveMatches, onClose }: ExitIntentPopupProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasShown, setHasShown] = useState(false);

  useEffect(() => {
    // Only show once per session
    if (hasShown) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (liveMatches.length > 0 && !hasShown) {
        // Note: Modern browsers ignore custom messages in beforeunload
        // So we can't show our modal here. Instead, we'll use mouse leave detection
        e.preventDefault();
        e.returnValue = '';
      }
    };

    const handleMouseLeave = (e: MouseEvent) => {
      // Detect when mouse leaves from top of viewport (like closing tab or switching)
      if (e.clientY <= 0 && !hasShown && liveMatches.length > 0) {
        setIsOpen(true);
        setHasShown(true);
      }
    };

    // Listen for mouse leaving viewport
    document.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [liveMatches, hasShown]);

  const handleClose = () => {
    setIsOpen(false);
    onClose();
  };

  // Take first 3 live matches
  const displayMatches = liveMatches.slice(0, 2);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            transition={{ duration: 0.25, type: "spring", stiffness: 400, damping: 25 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md max-h-[90vh] overflow-y-auto p-4"
          >
            <Card className="relative p-4 bg-gradient-to-br from-background via-background to-primary/5 border-2 border-primary/20 shadow-2xl">
              {/* Close button */}
              <button
                onClick={handleClose}
                className="absolute top-2 right-2 p-1 rounded-full hover:bg-muted transition-colors z-10"
              >
                <X className="h-4 w-4" />
              </button>

              {/* Header */}
              <div className="text-center mb-4">
                <motion.div
                  animate={{ rotate: [0, -10, 10, -10, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                  className="inline-block mb-2"
                >
                  <Trophy className="h-10 w-10 text-yellow-500" />
                </motion.div>
                <h2 className="text-xl font-bold mb-1">Already leaving?</h2>
                <p className="text-sm text-muted-foreground">
                  You lose a chance! Check out these live matches:
                </p>
              </div>

              {/* Live matches */}
              <div className="space-y-2 mb-4">
                {displayMatches.map((match, index) => (
                  <motion.div
                    key={match.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link href={`/auth/match/${match.id}`} onClick={handleClose}>
                      <Card className="p-3 hover:bg-muted/50 transition-all cursor-pointer group border hover:border-primary/50">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium group-hover:text-primary transition-colors">
                                {match.home_team_name}
                              </span>
                              <span className="text-base font-bold">
                                {match.home_score ?? '-'}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium group-hover:text-primary transition-colors">
                                {match.away_team_name}
                              </span>
                              <span className="text-base font-bold">
                                {match.away_score ?? '-'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            {match.league_name}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-500 font-medium animate-pulse">
                            LIVE
                          </span>
                        </div>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleClose}
                >
                  Continue Browsing
                </Button>
              </div>
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
