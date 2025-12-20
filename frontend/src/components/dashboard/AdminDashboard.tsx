import { useState, useEffect } from 'react';
import { Shield, Users, Trash2, Crown, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/context/AuthContext';
import { apiService } from '@/services/api';

interface AdminUser {
  id: number;
  email: string;
  name: string;
  firstName: string | null;
  avatarUrl: string | null;
  role: string;
  createdAt: string;
}

export function AdminDashboard() {
  const { user } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getAdminUsers();
      setUsers(data);
    } catch (err) {
      console.error('Failed to fetch users:', err);
      setError('Failed to load users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: number, newRole: string) => {
    if (userId === user?.id) {
      alert("You cannot change your own role.");
      return;
    }

    setActionLoading(userId);
    try {
      const updatedUser = await apiService.updateUserRole(userId, newRole);
      setUsers(users.map(u => u.id === userId ? updatedUser : u));
    } catch (err) {
      console.error('Failed to update role:', err);
      alert('Failed to update role. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteUser = async (userId: number, userName: string) => {
    if (userId === user?.id) {
      alert("You cannot delete your own account.");
      return;
    }

    if (!confirm(`Are you sure you want to delete ${userName}? This action cannot be undone.`)) {
      return;
    }

    setActionLoading(userId);
    try {
      await apiService.deleteUser(userId);
      setUsers(users.filter(u => u.id !== userId));
    } catch (err) {
      console.error('Failed to delete user:', err);
      alert('Failed to delete user. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleMakeAdmin = async (userId: number) => {
    if (!confirm('Are you sure you want to promote this user to Admin?')) {
      return;
    }

    setActionLoading(userId);
    try {
      const updatedUser = await apiService.makeUserAdmin(userId);
      setUsers(users.map(u => u.id === userId ? updatedUser : u));
    } catch (err) {
      console.error('Failed to make admin:', err);
      alert('Failed to promote user. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'TEACHER':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'STUDENT':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'PARENT':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getInitials = (name: string | null) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (loading) {
    return (
      <div className="container max-w-6xl px-4 py-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-piano-purple" />
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl px-4 py-6 space-y-6">
      {/* Header Section */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <Shield className="h-8 w-8 text-red-600" />
          <h1 className="text-3xl font-heading font-bold text-piano-purple">
            Admin Dashboard
          </h1>
        </div>
        <p className="text-muted-foreground">
          Welcome, {user?.firstName || user?.name}! Manage users and system settings.
        </p>
      </div>

      {/* Stats Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-piano-purple/10 rounded-lg">
                <Users className="h-6 w-6 text-piano-purple" />
              </div>
              <div>
                <p className="text-2xl font-bold">{users.length}</p>
                <p className="text-sm text-muted-foreground">Total Users</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Crown className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{users.filter(u => u.role === 'TEACHER').length}</p>
                <p className="text-sm text-muted-foreground">Teachers</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{users.filter(u => u.role === 'STUDENT').length}</p>
                <p className="text-sm text-muted-foreground">Students</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
          <p className="text-red-700">{error}</p>
          <Button variant="outline" size="sm" onClick={fetchUsers} className="mt-2">
            Retry
          </Button>
        </div>
      )}

      {/* User List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            User Management
          </CardTitle>
          <CardDescription>
            View and manage all users in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.map((u) => (
              <div
                key={u.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={u.avatarUrl || undefined} alt={u.name} />
                    <AvatarFallback>{getInitials(u.name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{u.name || 'Unnamed User'}</p>
                    <p className="text-sm text-muted-foreground">{u.email}</p>
                  </div>
                  <Badge className={`ml-2 ${getRoleBadgeColor(u.role)}`}>
                    {u.role}
                  </Badge>
                  {u.id === user?.id && (
                    <Badge variant="outline" className="ml-1">You</Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {actionLoading === u.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      {u.id !== user?.id && (
                        <>
                          <Select
                            value={u.role}
                            onValueChange={(value: string) => handleRoleChange(u.id, value)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="STUDENT">Student</SelectItem>
                              <SelectItem value="TEACHER">Teacher</SelectItem>
                              <SelectItem value="PARENT">Parent</SelectItem>
                              <SelectItem value="ADMIN">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                          {u.role !== 'ADMIN' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleMakeAdmin(u.id)}
                              title="Promote to Admin"
                            >
                              <Crown className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteUser(u.id, u.name)}
                            title="Delete User"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
            {users.length === 0 && !loading && (
              <p className="text-center text-muted-foreground py-8">
                No users found.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
