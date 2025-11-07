"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, Loader2, ShoppingCart, Check, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/theme-toggle";
import { SHOP_ITEMS, SHOP_CATEGORIES, ShopItem } from "@/lib/shop-items";

export default function ShopPage() {
  const router = useRouter();
  const [ownedItems, setOwnedItems] = useState<string[]>([]);
  const [coins, setCoins] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [purchasingItem, setPurchasingItem] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    fetchShopData();
  }, []);

  const fetchShopData = async () => {
    try {
      const response = await fetch("/api/shop");
      if (response.ok) {
        const data = await response.json();
        console.log("Shop data received:", data); // Debug log
        setOwnedItems(data.ownedItems || []);
        setCoins(data.coins || 0);
        console.log("Coins set to:", data.coins); // Debug log
      } else {
        console.error("Failed to fetch shop data, status:", response.status);
        toast.error("Failed to load shop");
      }
    } catch (error) {
      console.error("Failed to fetch shop data:", error);
      toast.error("Failed to load shop");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePurchase = async (item: ShopItem) => {
    if (ownedItems.includes(item.id)) {
      toast.info("You already own this item");
      return;
    }

    if (coins < item.price) {
      toast.error("Insufficient coins!");
      return;
    }

    setPurchasingItem(item.id);
    try {
      const response = await fetch("/api/shop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId: item.id }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(`Purchased ${item.namePolish}! 🎉`);
        setOwnedItems([...ownedItems, item.id]);
        setCoins(data.coinsRemaining);
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to purchase item");
      }
    } catch (error) {
      console.error("Purchase error:", error);
      toast.error("Failed to purchase item");
    } finally {
      setPurchasingItem(null);
    }
  };

  const filteredItems = SHOP_ITEMS.filter(
    (item) => selectedCategory === "all" || item.category === selectedCategory
  );

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
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => router.push('/auth/dashboard')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Shop</h1>
              <p className="text-muted-foreground">Customize your profile with exclusive items</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-card px-6 py-3 rounded-lg border">
              <p className="text-sm text-muted-foreground">Your Balance</p>
              <p className="text-2xl font-bold">{coins} 🪙</p>
            </div>
            <ThemeToggle />
          </div>
        </div>

        {/* Category Filter */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-2">
              {SHOP_CATEGORIES.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                >
                  {category.namePolish}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Shop Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => {
            const isOwned = ownedItems.includes(item.id);
            const canAfford = coins >= item.price;
            const isPurchasing = purchasingItem === item.id;

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className={`h-full ${isOwned ? 'border-green-500/50 bg-green-500/5' : ''}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-4xl">{item.icon}</div>
                        <div>
                          <CardTitle className="text-lg">{item.namePolish}</CardTitle>
                          <CardDescription className="text-xs">{item.name}</CardDescription>
                        </div>
                      </div>
                      {item.limited && (
                        <Badge variant="destructive" className="text-xs">
                          Limited
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                    
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div>
                        <p className="text-sm text-muted-foreground">Price</p>
                        <p className="text-xl font-bold">{item.price.toLocaleString()} 🪙</p>
                      </div>
                      
                      {isOwned ? (
                        <Button disabled className="gap-2">
                          <Check className="h-4 w-4" />
                          Owned
                        </Button>
                      ) : canAfford ? (
                        <Button
                          onClick={() => handlePurchase(item)}
                          disabled={isPurchasing}
                          className="gap-2"
                        >
                          {isPurchasing ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Buying...
                            </>
                          ) : (
                            <>
                              <ShoppingCart className="h-4 w-4" />
                              Buy
                            </>
                          )}
                        </Button>
                      ) : (
                        <Button disabled className="gap-2">
                          <Lock className="h-4 w-4" />
                          Not Enough
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {filteredItems.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">No items in this category yet</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
