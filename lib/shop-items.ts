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
  {
    id: "bg_champions_gold",
    name: "Champions Gold",
    namePolish: "Złoto Mistrzów",
    description: "Luxurious golden background for champions",
    price: 12000,
    category: "background",
    icon: "🏆",
  },
  {
    id: "bg_ocean_blue",
    name: "Ocean Blue",
    namePolish: "Błękit Oceanu",
    description: "Calm and serene ocean gradient",
    price: 5000,
    category: "background",
    icon: "🌊",
  },
  {
    id: "bg_sunset_glory",
    name: "Sunset Glory",
    namePolish: "Zachód Chwały",
    description: "Warm sunset colors for your profile",
    price: 6000,
    category: "background",
    icon: "🌅",
  },
  {
    id: "bg_forest_green",
    name: "Forest Green",
    namePolish: "Zieleń Lasu",
    description: "Fresh green pitch-inspired background",
    price: 5500,
    category: "background",
    icon: "🌲",
  },
  {
    id: "bg_midnight_purple",
    name: "Midnight Purple",
    namePolish: "Purpura Północy",
    description: "Mysterious and elegant purple tones",
    price: 7000,
    category: "background",
    icon: "🌌",
  },
  {
    id: "bg_fire_red",
    name: "Fire Red",
    namePolish: "Ognista Czerwień",
    description: "Passionate red gradient for true fans",
    price: 6500,
    category: "background",
    icon: "🔥",
  },
  {
    id: "bg_ice_crystal",
    name: "Ice Crystal",
    namePolish: "Lodowy Kryształ",
    description: "Cool and sophisticated icy background",
    price: 7500,
    category: "background",
    icon: "❄️",
  },
  {
    id: "bg_rainbow_pride",
    name: "Rainbow Pride",
    namePolish: "Tęczowa Duma",
    description: "Colorful rainbow gradient showing your pride",
    price: 9000,
    category: "background",
    icon: "🌈",
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
  {
    id: "badge_big_winner",
    name: "Big Winner",
    namePolish: "Wielki Wygraniec",
    description: "Won over 10,000 coins from predictions",
    price: 8000,
    category: "badge",
    icon: "💰",
  },
  {
    id: "badge_prediction_streak",
    name: "Prediction Streak",
    namePolish: "Seria Trafionych",
    description: "5 correct predictions in a row",
    price: 4000,
    category: "badge",
    icon: "🔥",
  },
  {
    id: "badge_early_adopter",
    name: "Early Adopter",
    namePolish: "Pierwszy Użytkownik",
    description: "One of the first users on the platform",
    price: 15000,
    category: "badge",
    icon: "⭐",
    limited: true,
  },
  {
    id: "badge_football_expert",
    name: "Football Expert",
    namePolish: "Ekspert Piłkarski",
    description: "Made 100+ predictions",
    price: 6000,
    category: "badge",
    icon: "🎓",
  },
  {
    id: "badge_lucky_charm",
    name: "Lucky Charm",
    namePolish: "Szczęśliwy Talizman",
    description: "Won 3 high-stakes predictions",
    price: 5500,
    category: "badge",
    icon: "🍀",
  },
  {
    id: "badge_vip_member",
    name: "VIP Member",
    namePolish: "Członek VIP",
    description: "Exclusive VIP status badge",
    price: 20000,
    category: "badge",
    icon: "👑",
    limited: true,
  },
  {
    id: "badge_top_10",
    name: "Top 10 Ranker",
    namePolish: "Top 10 w Rankingu",
    description: "Reached top 10 in global rankings",
    price: 12000,
    category: "badge",
    icon: "🏅",
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
  bg_champions_gold: {
    gradient: "from-yellow-300 via-yellow-500 to-orange-600",
  },
  bg_ocean_blue: {
    gradient: "from-blue-400 via-cyan-500 to-teal-600",
  },
  bg_sunset_glory: {
    gradient: "from-orange-400 via-pink-500 to-purple-600",
  },
  bg_forest_green: {
    gradient: "from-green-400 via-emerald-500 to-green-700",
  },
  bg_midnight_purple: {
    gradient: "from-purple-900 via-violet-800 to-indigo-900",
  },
  bg_fire_red: {
    gradient: "from-red-500 via-rose-600 to-red-700",
  },
  bg_ice_crystal: {
    gradient: "from-cyan-300 via-blue-400 to-indigo-500",
  },
  bg_rainbow_pride: {
    gradient: "from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500",
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

// Victory effect definitions (used for special animations or visual enhancements)
export const VICTORY_EFFECTS: Record<string, { animation: string; glow: string }> = {
  none: {
    animation: "",
    glow: "",
  },
  effect_golden_celebration: {
    animation: "animate-pulse",
    glow: "shadow-lg shadow-yellow-400/30",
  },
};
