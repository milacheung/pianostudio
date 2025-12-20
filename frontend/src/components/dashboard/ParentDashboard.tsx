import { Heart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export function ParentDashboard() {
  return (
    <div className="container max-w-6xl px-4 py-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-heading font-bold text-piano-purple">
          Parent Dashboard
        </h1>
        <p className="text-muted-foreground">Coming soon!</p>
      </div>

      <Card className="card-rounded-lg">
        <CardContent className="p-12">
          <div className="text-center space-y-4">
            <div className="bg-piano-pink/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
              <Heart className="h-10 w-10 text-piano-pink" />
            </div>
            <div>
              <h3 className="text-xl font-heading font-semibold mb-2">Parent Dashboard Under Construction</h3>
              <p className="text-muted-foreground">
                The parent dashboard will show your child's practice progress and achievements.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
