import { useState } from 'react';
import { CreatePostForm } from '@/components/community/CreatePostForm';
import { PostFeed } from '@/components/community/PostFeed';
import { apiService } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

export function CommunityPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { toast } = useToast();

  const handleCreatePost = async (content: string) => {
    try {
      await apiService.createPost(content);
      setRefreshTrigger((prev) => prev + 1);
      toast({
        title: 'Post created',
        description: 'Your post has been shared with the community.',
      });
    } catch (error) {
      console.error('Failed to create post:', error);
      toast({
        title: 'Error',
        description: 'Failed to create post. Please try again.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  return (
    <div className="container max-w-4xl px-4 py-6">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-heading font-bold">Community</h1>
          <p className="text-muted-foreground mt-1">Connect with other pianists in your studio</p>
        </div>

        <CreatePostForm onSubmit={handleCreatePost} />

        <PostFeed refreshTrigger={refreshTrigger} />
      </div>
    </div>
  );
}
