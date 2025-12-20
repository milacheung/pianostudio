import { useState, useMemo } from 'react';
import { Search, ArrowUpDown, TrendingUp, Clock, Award } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import type { StudentListItem } from '@/types';

interface StudentListTableProps {
  students: StudentListItem[];
}

type SortField = 'name' | 'lastPractice' | 'weeklyMinutes' | 'currentStreak' | 'totalPoints';
type SortDirection = 'asc' | 'desc';

export function StudentListTable({ students }: StudentListTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredAndSortedStudents = useMemo(() => {
    let filtered = students;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter((student) =>
        student.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      // Handle null/undefined lastPractice
      if (sortField === 'lastPractice') {
        aValue = aValue ? new Date(aValue).getTime() : 0;
        bValue = bValue ? new Date(bValue).getTime() : 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [students, searchQuery, sortField, sortDirection]);

  const formatLastPractice = (dateString?: string) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';

    const daysAgo = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (daysAgo < 7) return `${daysAgo}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const SortButton = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center gap-1 hover:text-piano-purple transition-colors"
    >
      {children}
      <ArrowUpDown
        className={`h-3 w-3 ${sortField === field ? 'text-piano-purple' : 'text-muted-foreground/50'}`}
      />
    </button>
  );

  if (students.length === 0) {
    return (
      <Card className="card-rounded">
        <CardHeader>
          <CardTitle>Students</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-piano-purple/10 mb-4">
              <Search className="h-8 w-8 text-piano-purple/50" />
            </div>
            <h3 className="font-semibold text-lg mb-2">No Students Yet</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              Share your invite code with students and parents to get started.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-rounded">
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <CardTitle>Students ({students.length})</CardTitle>
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search students..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">
                  <SortButton field="name">Student</SortButton>
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">
                  <SortButton field="lastPractice">Last Practice</SortButton>
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">
                  <SortButton field="weeklyMinutes">This Week</SortButton>
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">
                  <SortButton field="currentStreak">Streak</SortButton>
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">
                  <SortButton field="totalPoints">Points</SortButton>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedStudents.map((student, index) => (
                <tr
                  key={student.id}
                  className={`border-b last:border-b-0 hover:bg-accent/50 transition-colors cursor-pointer ${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                  }`}
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <img
                          src={student.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=7B68EE&color=fff`}
                          alt={student.name}
                        />
                      </Avatar>
                      <span className="font-medium">{student.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className={student.lastPractice ? '' : 'text-muted-foreground'}>
                        {formatLastPractice(student.lastPractice)}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant="secondary" className="bg-piano-teal/10 text-piano-teal">
                      {student.weeklyMinutes} min
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-orange-500" />
                      <span className="font-semibold">{student.currentStreak}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-piano-gold" />
                      <span className="font-semibold">{student.totalPoints}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-3">
          {filteredAndSortedStudents.map((student) => (
            <div
              key={student.id}
              className="p-4 rounded-lg border bg-white hover:bg-accent/50 transition-colors cursor-pointer"
            >
              <div className="flex items-start gap-3">
                <Avatar className="h-12 w-12">
                  <img
                    src={student.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=7B68EE&color=fff`}
                    alt={student.name}
                  />
                </Avatar>
                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between">
                    <h4 className="font-semibold">{student.name}</h4>
                    <Badge variant="secondary" className="bg-piano-purple/10 text-piano-purple">
                      {student.totalPoints} pts
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{formatLastPractice(student.lastPractice)}</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <TrendingUp className="h-3 w-3" />
                      <span>{student.currentStreak} day streak</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-sm font-medium">This week: </span>
                    <span className="text-sm text-piano-teal font-semibold">{student.weeklyMinutes} min</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredAndSortedStudents.length === 0 && (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">No students found matching "{searchQuery}"</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
