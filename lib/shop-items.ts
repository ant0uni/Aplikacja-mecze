export interface ShopItem {
  id: string;
  name: string;
  namePolish: string;
  description: string;
  price: number;
  category: "avatar" | "background" | "frame" | "effect" | "title" | "badge";
  icon: string;
  image?: string;
  limited?: boolean;
}

export const SHOP_ITEMS: ShopItem[] = [
  // Avatars
  {
    id: "avatar_golden_fan",
    name: "Golden Fan",
    namePolish: "Złoty Kibic",
    description: "Show everyone you're a true golden supporter",
    price: 10000,
    category: "avatar",
    icon: "🏆",
  },
  {
    id: "avatar_retro_player",
    name: "Retro Player",
    namePolish: "Retro Piłkarz",
    description: "Classic football style from the golden era",
    price: 7500,
    category: "avatar",
    icon: "⚽",
  },
  {
    id: "avatar_ultras_3000",
    name: "Ultras 3000",
    namePolish: "Ultras 3000",
    description: "For the most passionate fans",
    price: 6000,
    category: "avatar",
    icon: "🔥",
  },
  {
    id: "avatar_country_flag",
    name: "Country Flag Avatar",
    namePolish: "Avatar z flagą kraju",
    description: "Represent your country with pride",
    price: 3000,
    category: "avatar",
    icon: "🇵🇱",
  },
  {
    id: "avatar_seasonal_exclusive",
    name: "Seasonal Exclusive",
    namePolish: "Ekskluzywny avatar sezonowy",
    description: "Limited edition seasonal avatar - won't be available again!",
    price: 12000,
    category: "avatar",
    icon: "⭐",
    limited: true,
  },

  // Profile Backgrounds
  {
    id: "bg_stadium_night",
    name: "Stadium at Night",
    namePolish: "Stadion nocą",
    description: "Beautiful stadium illuminated at night",
    price: 8000,
    category: "background",
    icon: "🌃",
  },

  // Avatar Frames
  {
    id: "frame_golden_laurel",
    name: "Golden Laurel",
    namePolish: "Złoty Laur",
    description: "Prestigious golden laurel frame for champions",
    price: 6000,
    category: "frame",
    icon: "👑",
  },

  // Victory Effects
  {
    id: "effect_confetti",
    name: "Confetti",
    namePolish: "Konfetti",
    description: "Celebrate your wins with confetti animation",
    price: 4000,
    category: "effect",
    icon: "🎉",
  },

  // Titles
  {
    id: "title_prediction_master",
    name: "Prediction Master",
    namePolish: "Mistrz Typowania",
    description: "Show off your prediction skills",
    price: 7000,
    category: "title",
    icon: "🎯",
  },

  // Badges
  {
    id: "badge_100_percent",
    name: "100% Accuracy",
    namePolish: "100% trafień",
    description: "Proof of perfect prediction streak",
    price: 5000,
    category: "badge",
    icon: "💯",
  },
];

export const SHOP_CATEGORIES = [
  { id: "all", name: "All Items", namePolish: "Wszystkie" },
  { id: "avatar", name: "Avatars", namePolish: "Awatary" },
  { id: "background", name: "Backgrounds", namePolish: "Tła" },
  { id: "frame", name: "Frames", namePolish: "Ramki" },
  { id: "effect", name: "Effects", namePolish: "Efekty" },
  { id: "title", name: "Titles", namePolish: "Tytuły" },
  { id: "badge", name: "Badges", namePolish: "Odznaki" },
];

// Avatar definitions for rendering
export const AVATARS: Record<string, { gradient: string; icon: string }> = {
  default: {
    gradient: "from-blue-500 to-purple-600",
    icon: "", // Will use initials
  },
  avatar_golden_fan: {
    gradient: "from-yellow-400 to-orange-500",
    icon: "🏆",
  },
  avatar_retro_player: {
    gradient: "from-green-600 to-teal-500",
    icon: "⚽",
  },
  avatar_ultras_3000: {
    gradient: "from-red-600 to-pink-500",
    icon: "🔥",
  },
  avatar_country_flag: {
    gradient: "from-red-500 to-white",
    icon: "🇵🇱",
  },
  avatar_seasonal_exclusive: {
    gradient: "from-purple-500 via-pink-500 to-yellow-500",
    icon: "⭐",
  },
};

// Background definitions
export const BACKGROUNDS: Record<string, { gradient: string; pattern?: string }> = {
  default: {
    gradient: "from-blue-500 to-purple-600",
  },
  bg_stadium_night: {
    gradient: "from-indigo-900 via-purple-900 to-black",
    pattern: "stadium",
  },
};

// Frame definitions
export const FRAMES: Record<string, { border: string; shadow: string }> = {
  none: {
    border: "border-4 border-white/30",
    shadow: "",
  },
  frame_golden_laurel: {
    border: "border-4 border-yellow-400",
    shadow: "shadow-lg shadow-yellow-400/50",
  },
};
