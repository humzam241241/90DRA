import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Heart, MessageCircle, Trophy, Plus, TrendingUp } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function Community() {
  const [showForm, setShowForm] = useState(false);
  const [user, setUser] = useState(null);
  const [filter, setFilter] = useState("all");
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

  const { data: posts, isLoading } = useQuery({
    queryKey: ['community-posts', filter],
    queryFn: async () => {
      if (filter === "all") {
        return await base44.entities.CommunityPost.list('-created_date');
      }
      return await base44.entities.CommunityPost.filter({ post_type: filter }, '-created_date');
    },
    initialData: [],
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.CommunityPost.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-posts'] });
      setShowForm(false);
      setFormData({ post_type: 'win', content: '' });
    },
  });

  const likeMutation = useMutation({
    mutationFn: async ({ postId, currentLikes, likedBy }) => {
      const userEmail = user?.email;
      const hasLiked = likedBy.includes(userEmail);
      
      return await base44.entities.CommunityPost.update(postId, {
        likes: hasLiked ? currentLikes - 1 : currentLikes + 1,
        liked_by: hasLiked 
          ? likedBy.filter(email => email !== userEmail)
          : [...likedBy, userEmail]
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-posts'] });
    },
  });

  const [formData, setFormData] = useState({
    post_type: 'win',
    content: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!user) return;
    
    const dayNumber = user.program_start_date 
      ? Math.ceil((new Date() - new Date(user.program_start_date)) / (1000 * 60 * 60 * 24))
      : 1;

    createMutation.mutate({
      ...formData,
      author_name: user.full_name || user.email,
      day_number: dayNumber
    });
  };

  const postTypeColors = {
    win: "bg-green-100 text-green-800",
    milestone: "bg-blue-100 text-blue-800",
    motivation: "bg-purple-100 text-purple-800",
    question: "bg-yellow-100 text-yellow-800",
    progress_photo: "bg-pink-100 text-pink-800"
  };

  const postTypeIcons = {
    win: Trophy,
    milestone: TrendingUp,
    motivation: Heart,
    question: MessageCircle,
    progress_photo: Users
  };

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Shift Society</h1>
          <p className="text-gray-500 mt-1">Connect, motivate, and celebrate together</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="bg-purple-600 hover:bg-purple-700">
          <Plus className="w-4 h-4 mr-2" />
          Share Update
        </Button>
      </div>

      {/* Filter Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-600">Filter:</span>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Posts</SelectItem>
                <SelectItem value="win">Wins</SelectItem>
                <SelectItem value="milestone">Milestones</SelectItem>
                <SelectItem value="motivation">Motivation</SelectItem>
                <SelectItem value="question">Questions</SelectItem>
                <SelectItem value="progress_photo">Progress Photos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* New Post Form */}
      {showForm && (
        <Card className="border-2 border-purple-400">
          <CardHeader>
            <CardTitle>Share Your Update</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Select value={formData.post_type} onValueChange={(value) => setFormData({...formData, post_type: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="win">Win / Achievement</SelectItem>
                    <SelectItem value="milestone">Milestone Reached</SelectItem>
                    <SelectItem value="motivation">Motivational Message</SelectItem>
                    <SelectItem value="question">Ask Question</SelectItem>
                    <SelectItem value="progress_photo">Progress Photo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Textarea
                value={formData.content}
                onChange={(e) => setFormData({...formData, content: e.target.value})}
                placeholder="Share your thoughts, wins, or ask for support..."
                rows={4}
                required
              />

              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
                  Post Update
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Community Feed */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="text-gray-500 mt-4">Loading community posts...</p>
        </div>
      ) : posts.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 mb-4">No posts yet. Be the first to share!</p>
            <Button onClick={() => setShowForm(true)} className="bg-purple-600 hover:bg-purple-700">
              Share Update
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => {
            const Icon = postTypeIcons[post.post_type];
            const hasLiked = post.liked_by?.includes(user?.email);

            return (
              <Card key={post.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold">{post.author_name?.[0] || 'U'}</span>
                      </div>
                      <div>
                        <div className="font-semibold">{post.author_name}</div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <span>Day {post.day_number || '?'}</span>
                          <span>•</span>
                          <span>{formatDistanceToNow(new Date(post.created_date), { addSuffix: true })}</span>
                        </div>
                      </div>
                    </div>
                    <Badge className={postTypeColors[post.post_type]}>
                      <Icon className="w-3 h-3 mr-1" />
                      {post.post_type?.replace('_', ' ')}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-gray-700 whitespace-pre-wrap">{post.content}</p>
                  
                  {post.image_url && (
                    <img 
                      src={post.image_url} 
                      alt="Post" 
                      className="rounded-lg w-full max-h-96 object-cover"
                    />
                  )}

                  <div className="flex items-center gap-4 pt-2 border-t">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => likeMutation.mutate({
                        postId: post.id,
                        currentLikes: post.likes || 0,
                        likedBy: post.liked_by || []
                      })}
                      className={hasLiked ? 'text-red-600' : ''}
                    >
                      <Heart className={`w-4 h-4 mr-1 ${hasLiked ? 'fill-current' : ''}`} />
                      {post.likes || 0} {post.likes === 1 ? 'Like' : 'Likes'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}