export type UserRole = 'ADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT';

export interface User {
  id: number;
  email: string;
  name: string;
  firstName: string;
  avatarUrl?: string;
  role: UserRole | null;  // null means needs onboarding
  hasCompletedOnboarding: boolean;
  studioId?: number;
  studioName?: string;
  inviteCode?: string;  // only for teachers
}

export interface Studio {
  id: number;
  name: string;
  inviteCode: string;
  teacherId: number;
}

export interface StudentProfile {
  id: number;
  userId: number;
  studioId: number;
  totalPoints: number;
  currentStreak: number;
  longestStreak: number;
}

export interface PracticeSession {
  id: number;
  studentId: number;
  startTime: string;
  endTime?: string;
  minutes: number;
  assignmentId?: number;
  pointsEarned: number;
}

export interface Assignment {
  id: number;
  studioId: number;
  title: string;
  description: string;
  goalMinutes: number;
  dueDate: string;
  attachments?: string;
  pointsValue: number;
  createdAt?: string;
  studentProgress?: StudentAssignmentProgress;
}

export interface StudentAssignmentProgress {
  progressMinutes: number;
  completed: boolean;
  completedAt?: string;
  progressPercentage: number;
}

export interface ActivePracticeSession {
  startTime: Date;
  elapsedSeconds: number;
  assignmentId?: number;
}

export interface LeaderboardEntry {
  rank: number;
  studentId: number;
  studentName: string;
  avatarUrl?: string;
  totalPoints: number;
  currentStreak: number;
  weeklyMinutes: number;
}

export interface LeaderboardResponse {
  entries: LeaderboardEntry[];
  totalStudents: number;
  myRank?: number;
}

export interface CommunityPost {
  id: number;
  userId: number;
  userName: string;
  userAvatar?: string;
  content: string;
  practiceMinutes?: number;
  createdAt: string;
  likes: number;
  comments: number;
}

export interface StudioResponse {
  id: number;
  name: string;
  inviteCode: string;
  teacher: User;
  createdAt: string;
  studentCount: number;
}

export interface CompleteSignupResponse {
  user: User;
  studio?: StudioResponse;
  needsStudentCreation?: boolean; // true for PARENT - frontend shows "add children" form
}

export interface StudentSummary {
  id: number;
  userId?: number;  // null for parent-created students
  name: string;
  avatarUrl?: string;
  age?: number;
  grade?: string;
  totalPoints?: number;
  currentStreak?: number;
  // Parent invite fields (for teacher view)
  parentEmail?: string;
  parentInviteStatus?: 'none' | 'pending' | 'invited' | 'claimed';
  parentName?: string;
}

export interface CreateStudentRequest {
  name: string;
  age?: number;
  grade?: string;
}

export interface TeacherCreateStudentRequest {
  name: string;
  age?: number;
  grade?: string;
  parentEmail?: string;
  sendInvite?: boolean;
}

export interface PracticeStats {
  totalMinutesToday: number;
  totalMinutesWeek: number;
  totalMinutesMonth: number;
  currentStreak: number;
  totalPoints: number;
}

export interface StudentDashboardData {
  stats: PracticeStats;
  activeAssignments: Assignment[];
  recentSessions: PracticeSession[];
}

export interface TeacherDashboardData {
  studio: {
    id: number;
    name: string;
    inviteCode: string;
    studentCount: number;
  };
  stats: {
    totalStudents: number;
    weeklyPracticeMinutes: number;
    activeAssignments: number;
    averageStreak: number;
  };
  students: StudentListItem[];
  recentActivity: RecentActivityItem[];
}

export interface StudentListItem {
  id: number;
  userId: number;
  name: string;
  avatarUrl?: string;
  lastPractice?: string;
  weeklyMinutes: number;
  currentStreak: number;
  totalPoints: number;
}

export interface RecentActivityItem {
  id: number;
  studentName: string;
  studentAvatar?: string;
  type: 'practice' | 'assignment_complete';
  description: string;
  timestamp: string;
  points?: number;
}

export interface Post {
  id: number;
  content: string;
  mediaUrl?: string;
  mediaType?: 'IMAGE' | 'VIDEO' | 'AUDIO';
  createdAt: string;
  authorId: number;
  authorName: string;
  authorAvatar?: string;
  reactions: Record<string, number>;  // emoji -> count
  userReaction?: string;  // current user's reaction
}

export interface PostsResponse {
  content: Post[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
}

// COPPA Compliance Types
export type AgeRange = 'UNDER_13' | 'AGE_13_TO_15' | 'AGE_16_PLUS';
export type AccountStatus = 'ACTIVE' | 'PENDING_CONSENT' | 'SUSPENDED' | 'DELETED';
export type ConsentRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED';

export interface AgeVerificationResponse {
  id: number;
  ageRange: AgeRange;
  isMinor: boolean;
  requiresConsent: boolean;
  verificationMethod: string;
}

export interface ConsentRequestResponse {
  id: number;
  parentEmail: string;
  status: ConsentRequestStatus;
  tokenExpiresAt: string;
  createdAt: string;
  respondedAt?: string;
  expired: boolean;
}

export interface ConsentFormData {
  childFirstName: string;
  parentEmail: string;
  valid: boolean;
  expired: boolean;
  message?: string;
}

export interface ConsentStatusResponse {
  accountStatus: AccountStatus;
  consentRequestStatus?: ConsentRequestStatus;
  hasActiveConsent: boolean;
  parentEmail?: string;
  message: string;
}

// Badge Types
export interface Badge {
  id: number;
  name: string;
  description: string;
  iconUrl: string;
  criteria: string;
}

export interface StudentBadge {
  id: number;
  badge: Badge;
  earnedAt: string;
}

// Magic Link Types
export interface MagicLinkCheckResponse {
  valid: boolean;
  email?: string;
  studentName?: string;
  expired?: boolean;
  used?: boolean;
  message?: string;
}

export interface MagicLinkLoginResponse {
  success: boolean;
  token: string;
  userId: number;
  email: string;
  name: string;
  role: string;
  newUser: boolean;
  studentId: number;
  studentName: string;
}
