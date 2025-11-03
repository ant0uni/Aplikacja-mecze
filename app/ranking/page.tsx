"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Crown, Medal, Coins, Calendar } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface RankingUser {
  id: number;
  nickname: string;
  email: string;
  coins: number;
  avatar: string | null;
  profileBackground: string | null;
  avatarFrame: string | null;
  profileTitle: string | null;
  createdAt: string;
}

export default function RankingPage() {
  const [users, setUsers] = useState<RankingUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRanking();
  }, []);

  const fetchRanking = async () => {
    try {
      const response = await fetch("/api/users/ranking");
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
      }
    } catch (error) {
      console.error("Failed to fetch ranking:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Medal className="h-6 w-6 text-amber-600" />;
      default:
        return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>;
    }
  };

  const getTopUserBackground = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border-2 border-yellow-500/50";
      case 2:
        return "bg-gradient-to-r from-gray-400/20 to-slate-400/20 border-2 border-gray-400/50";
      case 3:
        return "bg-gradient-to-r from-amber-600/20 to-orange-600/20 border-2 border-amber-600/50";
      default:
        return "";
    }
  };

  const getAvatarInitials = (nickname: string | null, email: string) => {
    if (nickname && nickname.length >= 2) {
      return nickname.substring(0, 2).toUpperCase();
    }
    return email.substring(0, 2).toUpperCase();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <Trophy className="h-12 w-12 mx-auto text-yellow-500" />
          </motion.div>
          <p className="text-muted-foreground">Loading rankings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Trophy className="h-10 w-10 text-yellow-500" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-500 to-amber-600 bg-clip-text text-transparent">
              Leaderboard
            </h1>
            <Trophy className="h-10 w-10 text-yellow-500" />
          </div>
          <p className="text-muted-foreground text-lg">
            Top predictors ranked by total coins earned
          </p>
        </motion.div>

        {/* Top 3 Podium */}
        {users.length >= 3 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="grid grid-cols-3 gap-4 mb-8 max-w-4xl mx-auto"
          >
            {/* 2nd Place */}
            <Link href={`/user/${users[1].id}`}>
              <motion.div
                whileHover={{ scale: 1.05, y: -5 }}
                className="bg-gradient-to-br from-gray-400/20 to-slate-400/20 border-2 border-gray-400/50 rounded-lg p-6 text-center cursor-pointer"
              >
                <div className="flex justify-center mb-3">
                  <Medal className="h-12 w-12 text-gray-400" />
                </div>
                <div className="mb-3">
                  <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-gray-300 to-gray-500 flex items-center justify-center text-white font-bold text-xl">
                    {getAvatarInitials(users[1].nickname, users[1].email)}
                  </div>
                </div>
                <h3 className="font-bold text-lg mb-1">{users[1].nickname || users[1].email}</h3>
                <div className="flex items-center justify-center gap-1 text-yellow-600">
                  <Coins className="h-5 w-5" />
                  <span className="font-bold text-xl">{users[1].coins.toLocaleString()}</span>
                </div>
              </motion.div>
            </Link>

            {/* 1st Place */}
            <Link href={`/user/${users[0].id}`}>
              <motion.div
                whileHover={{ scale: 1.05, y: -5 }}
                className="bg-gradient-to-br from-yellow-500/20 to-amber-500/20 border-2 border-yellow-500/50 rounded-lg p-6 text-center cursor-pointer -mt-4"
              >
                <div className="flex justify-center mb-3">
                  <Crown className="h-16 w-16 text-yellow-500" />
                </div>
                <div className="mb-3">
                  <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center text-white font-bold text-2xl border-4 border-yellow-500">
                    {getAvatarInitials(users[0].nickname, users[0].email)}
                  </div>
                </div>
                <h3 className="font-bold text-xl mb-1">{users[0].nickname || users[0].email}</h3>
                <div className="flex items-center justify-center gap-1 text-yellow-600">
                  <Coins className="h-6 w-6" />
                  <span className="font-bold text-2xl">{users[0].coins.toLocaleString()}</span>
                </div>
              </motion.div>
            </Link>

            {/* 3rd Place */}
            <Link href={`/user/${users[2].id}`}>
              <motion.div
                whileHover={{ scale: 1.05, y: -5 }}
                className="bg-gradient-to-br from-amber-600/20 to-orange-600/20 border-2 border-amber-600/50 rounded-lg p-6 text-center cursor-pointer"
              >
                <div className="flex justify-center mb-3">
                  <Medal className="h-12 w-12 text-amber-600" />
                </div>
                <div className="mb-3">
                  <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-amber-500 to-orange-700 flex items-center justify-center text-white font-bold text-xl">
                    {getAvatarInitials(users[2].nickname, users[2].email)}
                  </div>
                </div>
                <h3 className="font-bold text-lg mb-1">{users[2].nickname || users[2].email}</h3>
                <div className="flex items-center justify-center gap-1 text-yellow-600">
                  <Coins className="h-5 w-5" />
                  <span className="font-bold text-xl">{users[2].coins.toLocaleString()}</span>
                </div>
              </motion.div>
            </Link>
          </motion.div>
        )}

        {/* Full Rankings Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-lg border shadow-lg overflow-hidden"
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">Rank</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Title</TableHead>
                <TableHead className="text-right">Coins</TableHead>
                <TableHead className="text-right">Member Since</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user, index) => {
                const rank = index + 1;
                return (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.02 }}
                    className={`${getTopUserBackground(rank)} hover:bg-muted/50 transition-colors`}
                  >
                    <TableCell>
                      <div className="flex items-center justify-center">
                        {getRankIcon(rank)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                          {getAvatarInitials(user.nickname, user.email)}
                        </div>
                        <div>
                          <div className="font-semibold">{user.nickname || "Anonymous"}</div>
                          <div className="text-xs text-muted-foreground">{user.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {user.profileTitle ? (
                        <Badge variant="outline">{user.profileTitle}</Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">No title</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1 font-bold text-yellow-600">
                        <Coins className="h-4 w-4" />
                        {user.coins.toLocaleString()}
                      </div>
                    </TableCell>
                    <TableCell className="text-right text-sm text-muted-foreground">
                      <div className="flex items-center justify-end gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(user.createdAt).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/user/${user.id}`}>
                        <Button variant="outline" size="sm">
                          View Profile
                        </Button>
                      </Link>
                    </TableCell>
                  </motion.tr>
                );
              })}
            </TableBody>
          </Table>
        </motion.div>

        {users.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No users found in the ranking.</p>
          </div>
        )}
      </div>
    </div>
  );
}
