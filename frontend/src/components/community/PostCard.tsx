import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { ReactionPicker } from './ReactionPicker';
import type { Post } from '@/types';
import { useAuth } from '@/context/AuthContext';

interface PostCardProps {
  post: Post;
  onDelete: (postId: number) => Promise<void>;
  onReact: (postId: number, emoji: string) => Promise<void>;
  onRemoveReaction: (postId: number) => Promise<void>;
}

export function PostCard({ post, onDelete, onReact, onRemoveReaction }: PostCardProps) {
  const { user } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatTimestamp = (timestamp: string) => {
    const now = new Date();
    const postDate = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - postDate.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;

    return postDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;

    setIsDeleting(true);
    try {
      await onDelete(post.id);
    } catch (error) {
      console.error('Failed to delete post:', error);
      setIsDeleting(false);
    }
  };

  const canDelete = user && (user.role === 'TEACHER' || user.id === post.authorId);

  return (
    <Card className="card-rounded">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={post.authorAvatar} alt={post.authorName} />
              <AvatarFallback>{getInitials(post.authorName)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-base">{post.authorName}</p>
              <p className="text-sm text-muted-foreground">{formatTimestamp(post.createdAt)}</p>
            </div>
          </div>
          {canDelete && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 size={18} />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-base whitespace-pre-wrap break-words">{post.content}</p>

        {post.mediaUrl && (
          <div className="rounded-lg overflow-hidden">
            {post.mediaType === 'IMAGE' && (
              <img
                src={post.mediaUrl}
                alt="Post media"
                className="w-full h-auto max-h-96 object-cover"
              />
            )}
            {post.mediaType === 'VIDEO' && (
              <video
                src={post.mediaUrl}
                controls
                className="w-full h-auto max-h-96"
              />
            )}
            {post.mediaType === 'AUDIO' && (
              <audio src={post.mediaUrl} controls className="w-full" />
            )}
          </div>
        )}

        <div className="pt-2 border-t">
          <ReactionPicker
            reactions={post.reactions}
            userReaction={post.userReaction}
            onReact={(emoji) => onReact(post.id, emoji)}
            onRemoveReaction={() => onRemoveReaction(post.id)}
          />
        </div>
      </CardContent>
    </Card>
  );
}
