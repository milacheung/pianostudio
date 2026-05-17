import axios, { type AxiosInstance } from 'axios';
import type {
  User,
  StudentProfile,
  PracticeSession,
  PracticeStats,
  Assignment,
  LeaderboardResponse,
  CompleteSignupResponse,
  StudentSummary,
  CreateStudentRequest,
  TeacherCreateStudentRequest,
  TeacherDashboardData,
  StudentListItem,
  StudentDashboardData,
  Post,
  PostsResponse,
  AgeVerificationResponse,
  ConsentRequestResponse,
  ConsentFormData,
  ConsentStatusResponse,
  Badge,
  StudentBadge,
  MagicLinkCheckResponse,
  MagicLinkLoginResponse
} from '@/types';

const API_BASE_URL = import.meta.env.PROD
  ? 'https://pianostudio-api.fly.dev'
  : 'http://localhost:8080';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add JWT token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor to handle auth errors
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Clear token and redirect to login
          localStorage.removeItem('auth_token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  getGoogleAuthUrl(): string {
    return `${API_BASE_URL}/oauth2/authorization/google`;
  }

  async getCurrentUser(): Promise<User> {
    const response = await this.api.get<User>('/api/auth/me');
    return response.data;
  }

  async logout(): Promise<void> {
    await this.api.post('/api/auth/logout');
    localStorage.removeItem('auth_token');
  }

  async completeSignup(data: {
    role: 'TEACHER' | 'PARENT';
    studioName?: string;
    inviteCode?: string;
  }): Promise<CompleteSignupResponse> {
    const response = await this.api.post<CompleteSignupResponse>('/api/auth/complete-signup', data);
    return response.data;
  }

  // Student management endpoints (for parents)
  async getMyStudents(): Promise<StudentSummary[]> {
    const response = await this.api.get<StudentSummary[]>('/api/students/my');
    return response.data;
  }

  async createStudent(data: CreateStudentRequest): Promise<StudentSummary> {
    const response = await this.api.post<StudentSummary>('/api/students', data);
    return response.data;
  }

  async updateStudent(studentId: number, data: CreateStudentRequest): Promise<StudentSummary> {
    const response = await this.api.put<StudentSummary>(`/api/students/${studentId}`, data);
    return response.data;
  }

  async deleteStudent(studentId: number): Promise<void> {
    await this.api.delete(`/api/students/${studentId}`);
  }

  // Teacher student management endpoints
  async getStudioStudents(): Promise<StudentSummary[]> {
    const response = await this.api.get<StudentSummary[]>('/api/students/studio');
    return response.data;
  }

  async createStudentAsTeacher(data: TeacherCreateStudentRequest): Promise<StudentSummary> {
    const response = await this.api.post<StudentSummary>('/api/students/studio', data);
    return response.data;
  }

  async updateStudentAsTeacher(studentId: number, data: TeacherCreateStudentRequest): Promise<StudentSummary> {
    const response = await this.api.put<StudentSummary>(`/api/students/studio/${studentId}`, data);
    return response.data;
  }

  async deleteStudentAsTeacher(studentId: number): Promise<void> {
    await this.api.delete(`/api/students/studio/${studentId}`);
  }

  // Student profile endpoints
  async getStudentProfile(studentId: number): Promise<StudentProfile> {
    const response = await this.api.get<StudentProfile>(`/api/students/${studentId}`);
    return response.data;
  }

  async getMyProfile(): Promise<StudentProfile> {
    const response = await this.api.get<StudentProfile>('/api/students/me');
    return response.data;
  }

  // Practice session endpoints
  async startPracticeSession(assignmentId?: number): Promise<PracticeSession> {
    const response = await this.api.post<PracticeSession>('/api/practice/start', {
      assignmentId,
    });
    return response.data;
  }

  async endPracticeSession(sessionId: number, minutes: number): Promise<PracticeSession> {
    const response = await this.api.post<PracticeSession>(`/api/practice/${sessionId}/end`, {
      minutes,
    });
    return response.data;
  }

  async getMyPracticeSessions(): Promise<PracticeSession[]> {
    const response = await this.api.get<PracticeSession[]>('/api/practice/me');
    return response.data;
  }

  async getPracticeStats(): Promise<PracticeStats> {
    const response = await this.api.get<PracticeStats>('/api/practice/me/stats');
    return response.data;
  }

  // Assignment endpoints
  async getMyAssignments(): Promise<Assignment[]> {
    const response = await this.api.get<Assignment[]>('/api/assignments/my-assignments');
    return response.data;
  }

  async getAssignments(): Promise<Assignment[]> {
    const response = await this.api.get<Assignment[]>('/api/assignments');
    return response.data;
  }

  async getAssignment(assignmentId: number): Promise<Assignment> {
    const response = await this.api.get<Assignment>(`/api/assignments/${assignmentId}`);
    return response.data;
  }

  async createAssignment(data: {
    title: string;
    description: string;
    goalMinutes: number;
    dueDate: string;
    pointsValue: number;
    attachments?: string;
  }): Promise<Assignment> {
    const response = await this.api.post<Assignment>('/api/assignments', data);
    return response.data;
  }

  async updateAssignment(assignmentId: number, data: {
    title: string;
    description: string;
    goalMinutes: number;
    dueDate: string;
    pointsValue: number;
    attachments?: string;
  }): Promise<Assignment> {
    const response = await this.api.put<Assignment>(`/api/assignments/${assignmentId}`, data);
    return response.data;
  }

  async deleteAssignment(assignmentId: number): Promise<void> {
    await this.api.delete(`/api/assignments/${assignmentId}`);
  }

  async updateAssignmentProgress(assignmentId: number, minutes: number): Promise<void> {
    await this.api.put(`/api/assignments/${assignmentId}/progress`, { minutes });
  }

  // Leaderboard endpoints
  async getLeaderboard(sortBy: 'points' | 'streak' | 'weekly' = 'points'): Promise<LeaderboardResponse> {
    const response = await this.api.get<LeaderboardResponse>('/api/leaderboard', {
      params: { sortBy },
    });
    return response.data;
  }

  async getMyRank(): Promise<number> {
    const response = await this.api.get<{ rank: number }>('/api/leaderboard/my-rank');
    return response.data.rank;
  }

  // Studio endpoints
  async joinStudio(inviteCode: string): Promise<void> {
    await this.api.post('/api/studios/join', { inviteCode });
  }

  async getStudioStudents(inviteCode: string): Promise<StudentSummary[]> {
    const response = await this.api.get<StudentSummary[]>(`/api/studios/${inviteCode}/students`);
    return response.data;
  }

  // Dashboard endpoints
  async getStudentDashboard(): Promise<StudentDashboardData> {
    const response = await this.api.get<StudentDashboardData>('/api/dashboard/student');
    return response.data;
  }

  async getTeacherDashboard(): Promise<TeacherDashboardData> {
    const response = await this.api.get<TeacherDashboardData>('/api/dashboard/teacher');
    return response.data;
  }

  async getMyStudioStudents(): Promise<StudentListItem[]> {
    const response = await this.api.get<StudentListItem[]>('/api/studios/my/students');
    return response.data;
  }

  // Post/Community endpoints
  async getPosts(page: number = 0, size: number = 20): Promise<PostsResponse> {
    const response = await this.api.get<PostsResponse>('/api/posts', {
      params: { page, size },
    });
    return response.data;
  }

  async createPost(content: string, mediaUrl?: string, mediaType?: 'IMAGE' | 'VIDEO' | 'AUDIO'): Promise<Post> {
    const response = await this.api.post<Post>('/api/posts', {
      content,
      mediaUrl,
      mediaType,
    });
    return response.data;
  }

  async deletePost(postId: number): Promise<void> {
    await this.api.delete(`/api/posts/${postId}`);
  }

  async addReaction(postId: number, emoji: string): Promise<void> {
    await this.api.post(`/api/posts/${postId}/reactions`, { emoji });
  }

  async removeReaction(postId: number): Promise<void> {
    await this.api.delete(`/api/posts/${postId}/reactions`);
  }

  // Admin endpoints
  async getAdminUsers(): Promise<AdminUser[]> {
    const response = await this.api.get<AdminUser[]>('/api/admin/users');
    return response.data;
  }

  async updateUserRole(userId: number, role: string): Promise<AdminUser> {
    const response = await this.api.put<AdminUser>(`/api/admin/users/${userId}/role`, { role });
    return response.data;
  }

  async deleteUser(userId: number): Promise<void> {
    await this.api.delete(`/api/admin/users/${userId}`);
  }

  async makeUserAdmin(userId: number): Promise<AdminUser> {
    const response = await this.api.post<AdminUser>(`/api/admin/users/${userId}/make-admin`);
    return response.data;
  }

  // Age Verification endpoints
  async verifyAge(birthDate: string): Promise<AgeVerificationResponse> {
    const response = await this.api.post<AgeVerificationResponse>('/api/age-verification/verify', { birthDate });
    return response.data;
  }

  async getAgeVerificationStatus(): Promise<AgeVerificationResponse> {
    const response = await this.api.get<AgeVerificationResponse>('/api/age-verification/status');
    return response.data;
  }

  // Consent endpoints
  async requestParentalConsent(parentEmail: string): Promise<ConsentRequestResponse> {
    const response = await this.api.post<ConsentRequestResponse>('/api/consent/request', { parentEmail });
    return response.data;
  }

  async getConsentStatus(): Promise<ConsentStatusResponse> {
    const response = await this.api.get<ConsentStatusResponse>('/api/consent/status');
    return response.data;
  }

  // Public consent endpoints (no auth needed)
  async getConsentFormData(token: string): Promise<ConsentFormData> {
    const response = await axios.get<ConsentFormData>(`${API_BASE_URL}/api/public/consent/form/${token}`);
    return response.data;
  }

  async submitConsentResponse(token: string, approved: boolean, parentSignature?: string): Promise<ConsentRequestResponse> {
    const response = await axios.post<ConsentRequestResponse>(`${API_BASE_URL}/api/public/consent/respond`, {
      token,
      approved,
      parentSignature
    });
    return response.data;
  }

  // Account deletion endpoint
  async deleteAccount(): Promise<{ success: boolean; message: string }> {
    const response = await this.api.delete<{ success: boolean; message: string }>('/api/users/me');
    return response.data;
  }

  // Badge endpoints
  async getAllBadges(): Promise<Badge[]> {
    const response = await this.api.get<Badge[]>('/api/badges');
    return response.data;
  }

  async getMyBadges(): Promise<StudentBadge[]> {
    const response = await this.api.get<StudentBadge[]>('/api/badges/me');
    return response.data;
  }

  async getMyBadgeCount(): Promise<number> {
    const response = await this.api.get<number>('/api/badges/me/count');
    return response.data;
  }

  async checkAndAwardBadges(): Promise<Badge[]> {
    const response = await this.api.post<Badge[]>('/api/badges/check');
    return response.data;
  }

  // Magic Link endpoints (public - no auth needed)
  async checkMagicLink(token: string): Promise<MagicLinkCheckResponse> {
    const response = await axios.get<MagicLinkCheckResponse>(
      `${API_BASE_URL}/api/magic-link/check/${token}`
    );
    return response.data;
  }

  async validateMagicLink(token: string): Promise<MagicLinkLoginResponse> {
    const response = await axios.post<MagicLinkLoginResponse>(
      `${API_BASE_URL}/api/magic-link/validate`,
      { token }
    );
    return response.data;
  }
}

// Admin types
interface AdminUser {
  id: number;
  email: string;
  name: string;
  firstName: string | null;
  avatarUrl: string | null;
  role: string;
  createdAt: string;
}

export const apiService = new ApiService();
