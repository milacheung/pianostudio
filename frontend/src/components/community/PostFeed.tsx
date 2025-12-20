import { useState, useEffect } from 'react';
import { PostCard } from './PostCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Loader2 } from 'lucide-react';
import { apiService } from '@/services/api';
import type { Post } from '@/types';

interface PostFeedProps {
  refreshTrigger?: number;
}

export function PostFeed({ refreshTrigger = 0 }: PostFeedProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchPosts = async (page: number = 0, append: boolean = false) => {
    try {
      if (!append) setLoading(true);
      else setLoadingMore(true);

      const response = await apiService.getPosts(page, 20);

      if (append) {
        setPosts((prev) => [...prev, ...response.content]);
      } else {
        setPosts(response.content);
      }

      setTotalPages(response.totalPages);
      setCurrentPage(page);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchPosts(0, false);
  }, [refreshTrigger]);

  const handleLoadMore = () => {
    if (currentPage + 1 < totalPages) {
      fetchPosts(currentPage + 1, true);
    }
  };

  const handleDelete = async (postId: number) => {
    await apiService.deletePost(postId);
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  const handleReact = async (postId: number, emoji: string) => {
    // Optimistic update
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;

        const newReactions = { ...p.reactions };
        const oldEmoji = p.userReaction;

        // Remove old reaction count
        if (oldEmoji && newReactions[oldEmoji] > 0) {
          newReactions[oldEmoji] -= 1;
          if (newReactions[oldEmoji] === 0) {
            delete newReactions[oldEmoji];
          }
        }

        // Add new reaction count
        newReactions[emoji] = (newReactions[emoji] || 0) + 1;

        return {
          ...p,
          reactions: newReactions,
          userReaction: emoji,
        };
      })
    );

    try {
      await apiService.addReaction(postId, emoji);
    } catch (error) {
      console.error('Failed to add reaction:', error);
      // Revert optimistic update on error
      fetchPosts(0, false);
    }
  };

  const handleRemoveReaction = async (postId: number) => {
    // Optimistic update
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;

        const newReactions = { ...p.reactions };
        if (p.userReaction && newReactions[p.userReaction] > 0) {
          newReactions[p.userReaction] -= 1;
          if (newReactions[p.userReaction] === 0) {
            delete newReactions[p.userReaction];
          }
        }

        return {
          ...p,
          reactions: newReactions,
          userReaction: undefined,
        };
      })
    );

    try {
      await apiService.removeReaction(postId);
    } catch (error) {
      console.error('Failed to remove reaction:', error);
      // Revert optimistic update on error
      fetchPosts(0, false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-piano-purple" />
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <Card className="card-rounded">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <Users className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Posts Yet</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            Be the first to share your practice progress with the community!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          onDelete={handleDelete}
          onReact={handleReact}
          onRemoveReaction={handleRemoveReaction}
        />
      ))}

      {currentPage + 1 < totalPages && (
        <div className="flex justify-center pt-2">
          <Button
            onClick={handleLoadMore}
            disabled={loadingMore}
            variant="outline"
            className="w-full max-w-xs"
          >
            {loadingMore ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              'Load More'
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
