import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface CreatePostFormProps {
  onSubmit: (content: string) => Promise<void>;
}

export function CreatePostForm({ onSubmit }: CreatePostFormProps) {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSubmit(content.trim());
      setContent('');
    } catch (error) {
      console.error('Failed to create post:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <Card className="card-rounded">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit}>
          <div className="flex gap-3">
            <Avatar className="shrink-0">
              <AvatarImage src={user.avatarUrl} alt={user.name} />
              <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-3">
              <Textarea
                placeholder="Share your practice progress, achievements, or thoughts..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="resize-none min-h-[100px]"
                autoFocus
                disabled={isSubmitting}
              />
              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={!content.trim() || isSubmitting}
                  className="gap-2"
                >
                  <Send size={16} />
                  {isSubmitting ? 'Posting...' : 'Post'}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
