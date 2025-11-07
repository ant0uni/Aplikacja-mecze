"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Image from "next/image";

interface Team {
  id: number;
  name: string;
  logo?: string;
}

interface LeaguePredictionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  league: {
    id: number;
    name: string;
  } | null;
  teams: Team[];
  onSuccess?: () => void;
}

export function LeaguePredictionDialog({ 
  isOpen, 
  onClose, 
  league, 
  teams,
  onSuccess 
}: LeaguePredictionDialogProps) {
  const router = useRouter();
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  const [coinsWagered, setCoinsWagered] = useState("");
  const [isPredicting, setIsPredicting] = useState(false);
  const [userCoins, setUserCoins] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetchUserCoins();
      // Reset form
      setSelectedTeamId(null);
      setCoinsWagered("");
      setSearchQuery("");
    }
  }, [isOpen]);

  const fetchUserCoins = async () => {
    try {
      const response = await fetch("/api/user/me");
      if (response.ok) {
        const data = await response.json();
        setUserCoins(data.user?.coins || 0);
      }
    } catch (error) {
      console.error("Failed to fetch user coins:", error);
    }
  };

  const handlePredict = async () => {
    if (!league || !selectedTeamId) return;

    const wager = parseInt(coinsWagered);

    if (isNaN(wager)) {
      toast.error("Please enter a valid number");
      return;
    }

    if (wager > userCoins) {
      toast.error("Not enough coins!");
      return;
    }

    if (wager < 1) {
      toast.error("Wager must be at least 1 coin");
      return;
    }

    const selectedTeam = teams.find(t => t.id === selectedTeamId);
    if (!selectedTeam) {
      toast.error("Please select a team");
      return;
    }

    setIsPredicting(true);

    try {
      const response = await fetch("/api/predictions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          predictionType: "league",
          leagueId: league.id,
          leagueName: league.name,
          predictedWinnerId: selectedTeam.id,
          predictedWinnerName: selectedTeam.name,
          predictedWinnerLogo: selectedTeam.logo || `https://api.sofascore.com/api/v1/team/${selectedTeam.id}/image`,
          coinsWagered: wager,
        }),
      });

      if (response.ok) {
        toast.success("🏆 League prediction submitted successfully!");
        onClose();
        if (onSuccess) {
          onSuccess();
        }
        router.refresh();
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to submit prediction");
      }
    } catch (error) {
      console.error("Failed to submit prediction:", error);
      toast.error("Failed to submit prediction");
    } finally {
      setIsPredicting(false);
    }
  };

  const filteredTeams = teams.filter(team => 
    team.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedTeam = teams.find(t => t.id === selectedTeamId);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Predict League Winner 🏆</DialogTitle>
          <DialogDescription>
            Who will win {league?.name}?
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4 overflow-y-auto flex-1">
          {/* Selected Team Display */}
          {selectedTeam && (
            <div className="p-4 bg-primary/10 rounded-lg border-2 border-primary">
              <Label className="text-xs text-muted-foreground mb-2 block">Your Prediction</Label>
              <div className="flex items-center gap-3">
                {selectedTeam.logo ? (
                  <Image 
                    src={selectedTeam.logo || `https://api.sofascore.com/api/v1/team/${selectedTeam.id}/image`}
                    alt={selectedTeam.name}
                    width={40}
                    height={40}
                    className="rounded-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold">
                    {selectedTeam.name.substring(0, 2)}
                  </div>
                )}
                <span className="font-bold text-lg">{selectedTeam.name}</span>
              </div>
            </div>
          )}

          {/* Team Search */}
          <div className="space-y-2">
            <Label htmlFor="search">Search Teams</Label>
            <Input
              id="search"
              type="text"
              placeholder="Type to search teams..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Team Selection */}
          <div className="space-y-2">
            <Label>Select Winner ({filteredTeams.length} teams)</Label>
            <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto border rounded-lg p-2">
              {filteredTeams.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">No teams found</p>
              ) : (
                filteredTeams.map((team) => (
                  <button
                    key={team.id}
                    type="button"
                    onClick={() => setSelectedTeamId(team.id)}
                    className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all hover:border-primary/50 ${
                      selectedTeamId === team.id 
                        ? 'border-primary bg-primary/5' 
                        : 'border-transparent bg-muted/50'
                    }`}
                  >
                    {team.logo ? (
                      <Image 
                        src={team.logo || `https://api.sofascore.com/api/v1/team/${team.id}/image`}
                        alt={team.name}
                        width={32}
                        height={32}
                        className="rounded-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
                        {team.name.substring(0, 2)}
                      </div>
                    )}
                    <span className="font-semibold text-sm text-left">{team.name}</span>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Wager Input */}
          <div className="space-y-2">
            <Label htmlFor="wager">Coins to Wager</Label>
            <Input
              id="wager"
              type="number"
              placeholder="Enter amount"
              value={coinsWagered}
              onChange={(e) => setCoinsWagered(e.target.value)}
              min="1"
              max={userCoins}
            />
            <p className="text-xs text-muted-foreground">
              Available: {userCoins} coins
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={handlePredict}
            disabled={isPredicting || !selectedTeamId || !coinsWagered}
          >
            {isPredicting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirm Prediction
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
