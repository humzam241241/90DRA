import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Heart,
  MessageCircle,
  Trophy,
  TrendingUp,
  Lightbulb,
  Send,
  Target,
  Loader2,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";

const POST_TYPES = [
  { value: "win", label: "win", icon: Trophy, color: "from-emerald-500 to-green-600" },
  { value: "question", label: "question", icon: MessageCircle, color: "from-amber-500 to-yellow-600" },
  { value: "motivation", label: "motivation", icon: Heart, color: "from-pink-500 to-rose-600" },
  { value: "progress_update", label: "progress update", icon: TrendingUp, color: "from-blue-500 to-indigo-600" },
  { value: "tip", label: "tip", icon: Lightbulb, color: "from-violet-500 to-purple-600" },
];

const FILTER_TABS = [
  { value: "all", label: "All" },
  { value: "win", label: "Wins" },
  { value: "question", label: "Questions" },
  { value: "motivation", label: "Motivation" },
  { value: "tip", label: "Tips" },
];

const POST_TYPE_META = {
  win: { icon: Trophy, color: "bg-emerald-100 text-emerald-800", label: "Win" },
  milestone: { icon: Target, color: "bg-blue-100 text-blue-800", label: "Milestone" },
  motivation: { icon: Heart, color: "bg-pink-100 text-pink-800", label: "Motivation" },
  question: { icon: MessageCircle, color: "bg-amber-100 text-amber-800", label: "Question" },
  progress_photo: { icon: TrendingUp, color: "bg-blue-100 text-blue-800", label: "Progress" },
  progress_update: { icon: TrendingUp, color: "bg-blue-100 text-blue-800", label: "Progress Update" },
  tip: { icon: Lightbulb, color: "bg-violet-100 text-violet-800", label: "Tip" },
};

export default function Community() {
  const [user, setUser] = useState(null);
  const [filter, setFilter] = useState("all");
  const [selectedType, setSelectedType] = useState("win");
  const [content, setContent] = useState("");
  const queryClient = useQueryClient();

  React.useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);
    } catch (error) {
      console.error("Error loading user:", error);
    }
  };

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["community-posts", filter],
    queryFn: async () => {
      if (filter === "all") {
        return await base44.entities.CommunityPost.list("-created_date");
      }
      return await base44.entities.CommunityPost.filter({ post_type: filter }, "-created_date");
    },
    initialData: [],
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.CommunityPost.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community-posts"] });
      setContent("");
    },
  });

  const likeMutation = useMutation({
    mutationFn: async ({ postId, currentLikes, likedBy }) => {
      const userEmail = user?.email;
      const hasLiked = (likedBy || []).includes(userEmail);
      return await base44.entities.CommunityPost.update(postId, {
        likes: hasLiked ? Math.max(0, currentLikes - 1) : (currentLikes || 0) + 1,
        liked_by: hasLiked
          ? (likedBy || []).filter((email) => email !== userEmail)
          : [...(likedBy || []), userEmail],
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community-posts"] });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!user || !content.trim()) return;
    const dayNumber = user.program_start_date
      ? Math.ceil((new Date() - new Date(user.program_start_date)) / (1000 * 60 * 60 * 24))
      : 1;
    createMutation.mutate({
      post_type: selectedType,
      content: content.trim(),
      author_name: user.full_name || user.email,
      day_number: dayNumber,
    });
  };

  // Leaderboard: rank by number of posts + likes received
  const { data: leaderboard = [] } = useQuery({
    queryKey: ["community-leaderboard"],
    queryFn: async () => {
      const all = await base44.entities.CommunityPost.list();
      const byAuthor = {};
      all.forEach((post) => {
        const author = post.author_name || "Unknown";
        if (!byAuthor[author]) byAuthor[author] = { name: author, posts: 0, likes: 0 };
        byAuthor[author].posts += 1;
        byAuthor[author].likes += post.likes || 0;
      });
      return Object.values(byAuthor)
        .sort((a, b) => b.posts + b.likes - (a.posts + a.likes))
        .slice(0, 5);
    },
    initialData: [],
  });

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Shift Society Community</h1>
        <p className="text-gray-500 mt-1">Connect, share, and inspire each other</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: Feed */}
        <div className="lg:col-span-2 space-y-6">
          {/* Share form */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-purple-600" />
                <h3 className="font-bold text-gray-900">Share with the Community</h3>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Post type chips */}
                <div className="flex flex-wrap gap-2">
                  {POST_TYPES.map((type) => {
                    const isActive = selectedType === type.value;
                    return (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setSelectedType(type.value)}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                          isActive
                            ? `bg-gradient-to-r ${type.color} text-white shadow-md`
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {type.label}
                      </button>
                    );
                  })}
                </div>

                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Share your win, ask a question, or motivate others..."
                  rows={4}
                  className="resize-none"
                />

                <Button
                  type="submit"
                  disabled={!content.trim() || createMutation.isPending}
                  className="w-full bg-gradient-to-r from-purple-400 via-purple-500 to-indigo-400 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg"
                >
                  {createMutation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4 mr-2" />
                  )}
                  Post to Community
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Filter tabs */}
          <div className="bg-gray-100 rounded-xl p-1 flex">
            {FILTER_TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setFilter(tab.value)}
                className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  filter === tab.value
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Feed */}
          {isLoading ? (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 mx-auto animate-spin text-purple-600" />
            </div>
          ) : posts.length === 0 ? (
            <Card className="border-dashed border-2">
              <CardContent className="text-center py-12">
                <Users className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 font-medium">No posts yet</p>
                <p className="text-sm text-gray-400 mt-1">Be the first to share!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {posts.map((post, i) => {
                const meta = POST_TYPE_META[post.post_type] || POST_TYPE_META.win;
                const Icon = meta.icon;
                const hasLiked = (post.liked_by || []).includes(user?.email);

                return (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Card className="hover:shadow-md transition-shadow border-0 shadow-sm">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-white font-bold">
                                {post.author_name?.[0]?.toUpperCase() || "U"}
                              </span>
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900">{post.author_name}</div>
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <span>Day {post.day_number || "?"}</span>
                                <span>•</span>
                                <span>
                                  {post.created_at
                                    ? formatDistanceToNow(new Date(post.created_at), { addSuffix: true })
                                    : ""}
                                </span>
                              </div>
                            </div>
                          </div>
                          <Badge className={meta.color}>
                            <Icon className="w-3 h-3 mr-1" />
                            {meta.label}
                          </Badge>
                        </div>

                        <p className="text-gray-700 whitespace-pre-wrap mb-4">{post.content}</p>

                        {post.image_url && (
                          <img
                            src={post.image_url}
                            alt="Post"
                            className="rounded-lg w-full max-h-96 object-cover mb-4"
                          />
                        )}

                        <div className="flex items-center pt-3 border-t">
                          <button
                            onClick={() =>
                              likeMutation.mutate({
                                postId: post.id,
                                currentLikes: post.likes || 0,
                                likedBy: post.liked_by || [],
                              })
                            }
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${
                              hasLiked
                                ? "text-red-600 bg-red-50"
                                : "text-gray-600 hover:bg-gray-50"
                            }`}
                          >
                            <Heart
                              className={`w-4 h-4 ${hasLiked ? "fill-current" : ""}`}
                            />
                            <span className="text-sm font-medium">{post.likes || 0}</span>
                          </button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Sidebar */}
        <div className="space-y-6">
          {/* Leaderboard */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Trophy className="w-5 h-5 text-amber-500" />
                Leaderboard
              </CardTitle>
              <p className="text-xs text-gray-500">Most active members</p>
            </CardHeader>
            <CardContent>
              {leaderboard.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">No activity yet</p>
              ) : (
                <div className="space-y-3">
                  {leaderboard.map((member, i) => (
                    <div key={member.name} className="flex items-center gap-3">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                          i === 0
                            ? "bg-gradient-to-br from-amber-400 to-orange-500"
                            : i === 1
                            ? "bg-gradient-to-br from-gray-400 to-gray-500"
                            : i === 2
                            ? "bg-gradient-to-br from-orange-600 to-amber-700"
                            : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm text-gray-900 truncate">
                          {member.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {member.posts} posts · {member.likes} likes
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Community Guidelines */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-700 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <CardContent className="p-6 relative">
              <div className="w-14 h-14 rounded-full border-4 border-white/40 flex items-center justify-center mb-4">
                <Target className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-4">Community Guidelines</h3>
              <ul className="space-y-3 text-sm">
                <li className="flex gap-2">
                  <span className="text-white/80">•</span>
                  <span>Be supportive and encouraging</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-white/80">•</span>
                  <span>Share your authentic journey</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-white/80">•</span>
                  <span>Ask questions without judgment</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-white/80">•</span>
                  <span>Celebrate others' wins</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
