import { useNavigate } from 'react-router-dom';
import { Music } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export function QuickPracticeButton() {
  const navigate = useNavigate();

  return (
    <Card className="card-rounded-lg border-0 shadow-lg overflow-hidden">
      <div className="gradient-teal">
        <CardContent className="p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="space-y-1">
              <h2 className="text-2xl font-heading font-bold">Start Practicing!</h2>
              <p className="text-teal-50 text-sm">Track your time and earn points</p>
            </div>
            <div className="bg-white/20 p-3 rounded-full animate-pulse">
              <Music className="h-8 w-8" />
            </div>
          </div>
          <Button
            size="lg"
            onClick={() => navigate('/practice')}
            className="w-full bg-white text-piano-teal hover:bg-white/90 font-heading font-semibold text-lg touch-target transition-all duration-200 hover:scale-[1.02]"
          >
            Open Practice Timer
          </Button>
        </CardContent>
      </div>
    </Card>
  );
}
