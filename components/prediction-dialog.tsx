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

interface PredictionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  fixture: {
    id: number;
    name: string;
    starting_at: string;
    home_team_name: string;
    away_team_name: string;
  } | null;
  onSuccess?: () => void;
}

export function PredictionDialog({ isOpen, onClose, fixture, onSuccess }: PredictionDialogProps) {
  const router = useRouter();
  const [predictedHomeScore, setPredictedHomeScore] = useState("");
  const [predictedAwayScore, setPredictedAwayScore] = useState("");
  const [coinsWagered, setCoinsWagered] = useState("");
  const [isPredicting, setIsPredicting] = useState(false);
  const [userCoins, setUserCoins] = useState(0);

  useEffect(() => {
    if (isOpen) {
      fetchUserCoins();
      // Reset form
      setPredictedHomeScore("");
      setPredictedAwayScore("");
      setCoinsWagered("");
    }
  }, [isOpen]);

  const fetchUserCoins = async () => {
    try {
      const response = await fetch("/api/user/me");
      if (response.ok) {
        const data = await response.json();
        setUserCoins(data.coins || 0);
      }
    } catch (error) {
      console.error("Failed to fetch user coins:", error);
    }
  };

  const handlePredict = async () => {
    if (!fixture) return;

    const homeScore = parseInt(predictedHomeScore);
    const awayScore = parseInt(predictedAwayScore);
    const wager = parseInt(coinsWagered);

    if (isNaN(homeScore) || isNaN(awayScore) || isNaN(wager)) {
      alert("Please enter valid numbers");
      return;
    }

    if (wager > userCoins) {
      alert("Not enough coins!");
      return;
    }

    if (wager < 1) {
      alert("Wager must be at least 1 coin");
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
          fixture_id: fixture.id,
          predicted_home_score: homeScore,
          predicted_away_score: awayScore,
          coins_wagered: wager,
        }),
      });

      if (response.ok) {
        alert("Prediction submitted successfully!");
        onClose();
        if (onSuccess) {
          onSuccess();
        }
        router.refresh();
      } else {
        const data = await response.json();
        alert(data.error || "Failed to submit prediction");
      }
    } catch (error) {
      console.error("Failed to submit prediction:", error);
      alert("Failed to submit prediction");
    } finally {
      setIsPredicting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Make Your Prediction</DialogTitle>
          <DialogDescription>
            Predict the score for: {fixture?.name}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Match Date</Label>
            <p className="text-sm text-muted-foreground">
              {fixture && new Date(fixture.starting_at).toLocaleString()}
            </p>
          </div>
          <div className="space-y-2">
            <Label>Predicted Score</Label>
            <div className="grid grid-cols-3 gap-2 items-center">
              <div className="space-y-1">
                <Label htmlFor="homeScore" className="text-xs">
                  {fixture?.home_team_name || "Home"}
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
                  {fixture?.away_team_name || "Away"}
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
            disabled={isPredicting || !predictedHomeScore || !predictedAwayScore || !coinsWagered}
          >
            {isPredicting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirm Prediction
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
