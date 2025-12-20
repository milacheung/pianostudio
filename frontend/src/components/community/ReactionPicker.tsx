import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ReactionPickerProps {
  reactions: Record<string, number>;
  userReaction?: string;
  onReact: (emoji: string) => void;
  onRemoveReaction: () => void;
}

const ALLOWED_EMOJIS = ['👏', '❤️', '🎉', '🎹', '🎵', '🎶', '⭐', '🔥', '💯', '👍', '🙌', '💪', '🌟'];

export function ReactionPicker({ reactions, userReaction, onReact, onRemoveReaction }: ReactionPickerProps) {
  const handleReactionClick = (emoji: string) => {
    if (userReaction === emoji) {
      onRemoveReaction();
    } else {
      onReact(emoji);
    }
  };

  return (
    <div className="flex flex-wrap gap-1">
      {ALLOWED_EMOJIS.map((emoji) => {
        const count = reactions[emoji] || 0;
        const isActive = userReaction === emoji;

        return (
          <Button
            key={emoji}
            variant="outline"
            size="sm"
            onClick={() => handleReactionClick(emoji)}
            className={cn(
              "h-8 px-2 text-sm transition-all",
              isActive && "bg-piano-purple/10 border-piano-purple hover:bg-piano-purple/20",
              count === 0 && !isActive && "opacity-50 hover:opacity-100"
            )}
          >
            <span className="mr-1">{emoji}</span>
            {count > 0 && <span className="text-xs font-medium">{count}</span>}
          </Button>
        );
      })}
    </div>
  );
}
