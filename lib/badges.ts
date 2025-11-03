// Badge definitions
export const BADGE_DEFINITIONS: Record<string, { name: string; description: string; icon: string; color: string }> = {
  winner: {
    name: "Always The Winner",
    description: "Won 10 predictions in a row",
    icon: "🏆",
    color: "bg-yellow-500/20 text-yellow-600 border-yellow-500/50",
  },
  veteran: {
    name: "Veteran Predictor",
    description: "Made 100+ predictions",
    icon: "🎖️",
    color: "bg-blue-500/20 text-blue-600 border-blue-500/50",
  },
  sharpshooter: {
    name: "Sharpshooter",
    description: "75%+ win rate with 20+ predictions",
    icon: "🎯",
    color: "bg-red-500/20 text-red-600 border-red-500/50",
  },
  millionaire: {
    name: "Coin Millionaire",
    description: "Earned 10,000+ coins",
    icon: "💰",
    color: "bg-green-500/20 text-green-600 border-green-500/50",
  },
  lucky: {
    name: "Lucky Streak",
    description: "Won 5 predictions in a row",
    icon: "🍀",
    color: "bg-emerald-500/20 text-emerald-600 border-emerald-500/50",
  },
  collector: {
    name: "Badge Collector",
    description: "Own 5 or more badges",
    icon: "📛",
    color: "bg-purple-500/20 text-purple-600 border-purple-500/50",
  },
};

// Available badges for purchase (future feature)
export const PURCHASABLE_BADGES = [
  { id: "custom1", name: "Golden Crown", price: 500, icon: "👑" },
  { id: "custom2", name: "Diamond Star", price: 1000, icon: "💎" },
  { id: "custom3", name: "Fire Master", price: 750, icon: "🔥" },
  { id: "custom4", name: "Ice King", price: 750, icon: "❄️" },
  { id: "custom5", name: "Lightning Bolt", price: 600, icon: "⚡" },
];
