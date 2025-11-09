'use client';

import { useRouter } from 'next/navigation';
import { getCurrentUser, clearCurrentUser } from '@/lib/storage';
import { User } from '@/types';
import { LogOut, Home, FileText, Users, Settings, Calendar } from 'lucide-react';
import { useEffect, useState } from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      router.push('/login');
    } else {
      setUser(currentUser);
    }
  }, [router]);

  const handleLogout = () => {
    clearCurrentUser();
    router.push('/login');
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'sales_engineer':
        return 'Sales Engineer';
      case 'team_leader':
        return 'Team Leader';
      case 'admin':
        return 'Administrator';
      default:
        return role;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              <h1 className="text-xl font-semibold text-gray-900">
                Visit Report System
              </h1>
              <div className="flex items-center gap-6">
                <a
                  href="/dashboard"
                  className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors"
                >
                  <Home className="w-4 h-4" />
                  <span>Dashboard</span>
                </a>
                {user.role === 'sales_engineer' && (
                  <>
                    <a
                      href="/dashboard/visits/new"
                      className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors"
                      aria-label="Create new visit report"
                    >
                      <FileText className="w-4 h-4" />
                      <span>New Visit</span>
                    </a>
                    <a
                      href="/dashboard/reports/monthly"
                      className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors"
                      aria-label="Monthly reports"
                    >
                      <Calendar className="w-4 h-4" />
                      <span>Monthly Report</span>
                    </a>
                  </>
                )}
                {user.role === 'team_leader' && (
                  <a
                    href="/dashboard/team"
                    className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors"
                  >
                    <Users className="w-4 h-4" />
                    <span>Team Reports</span>
                  </a>
                )}
                {user.role === 'admin' && (
                  <a
                    href="/dashboard/admin"
                    className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Admin</span>
                  </a>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">{user.name}</div>
                <div className="text-xs text-gray-500">{getRoleLabel(user.role)}</div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}

