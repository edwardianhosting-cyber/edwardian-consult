'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  FileText,
  ClipboardList,
  Calendar,
  Bell,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  GraduationCap,
  Award,
  BarChart3,
  Upload,
  MessageSquare,
} from 'lucide-react';

interface TeacherLayoutProps {
  children: React.ReactNode;
}

const sidebarSections = [
  {
    title: '',
    items: [
      { name: 'Dashboard', href: '/teacher/dashboard', icon: LayoutDashboard },
    ],
  },
  {
    title: 'STUDENTS',
    items: [
      { name: 'My Students', href: '/teacher/students', icon: Users },
      { name: 'Attendance', href: '/teacher/attendance', icon: Calendar },
      { name: 'Performance', href: '/teacher/performance', icon: BarChart3 },
    ],
  },
  {
    title: 'LEARNING',
    items: [
      { name: 'Courses', href: '/teacher/courses', icon: BookOpen },
      { name: 'Study Materials', href: '/teacher/materials', icon: Upload },
      { name: 'Assignments', href: '/teacher/assignments', icon: ClipboardList },
    ],
  },
  {
    title: 'EXAMINATION',
    items: [
      { name: 'Question Bank', href: '/teacher/questions', icon: FileText },
      { name: 'Mock Exams', href: '/teacher/mock', icon: GraduationCap },
      { name: 'CBT Management', href: '/teacher/results', icon: Award },
    ],
  },
  {
    title: 'COMMUNICATION',
    items: [
      { name: 'Announcements', href: '/teacher/announcements', icon: Bell },
      { name: 'Messages', href: '/teacher/messages', icon: MessageSquare },
    ],
  },
  {
    title: 'ACCOUNT',
    items: [
      { name: 'My Profile', href: '/teacher/profile', icon: Users },
      { name: 'Settings', href: '/teacher/settings', icon: Settings },
    ],
  },
];

export default function TeacherLayout({ children }: TeacherLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [avatarDropdownOpen, setAvatarDropdownOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (!token || !userStr) {
      router.push('/login');
      return;
    }
    
    try {
      const userData = JSON.parse(userStr);
      if (userData.role !== 'TUTOR') {
        router.push('/login');
        return;
      }
      setUser(userData);
    } catch {
      router.push('/login');
      return;
    }
    setLoading(false);
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between h-16 px-4 border-b">
            <Link href="/teacher/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden">
                <img src="/logo.png" alt="Edwardian" className="h-full w-full object-contain" />
              </div>
              <span className="font-bold text-primary-800">Teacher Portal</span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 hover:bg-gray-100 rounded"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto py-4 px-3">
            {sidebarSections.map((section, sIdx) => (
              <div key={sIdx} className="mb-4">
                {section.title && (
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-3">
                    {section.title}
                  </p>
                )}
                {section.items.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg mb-1 transition-colors ${
                        isActive
                          ? 'bg-purple-50 text-purple-700'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${isActive ? 'text-purple-600' : ''}`} />
                      <span className="text-sm font-medium">{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>

          <div className="p-3 border-t">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2 w-full text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
              >
                <Menu className="w-5 h-5" />
              </button>
              <h1 className="text-lg font-semibold text-gray-900">Teacher Dashboard</h1>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/teacher/announcements"
                className="relative p-2 hover:bg-gray-100 rounded-lg"
              >
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </Link>
              <div className="relative">
                <button
                  onClick={() => setAvatarDropdownOpen(!avatarDropdownOpen)}
                  className="flex items-center gap-2 p-1 hover:bg-gray-100 rounded-lg"
                >
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user?.fullName || 'Teacher'}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <GraduationCap className="w-4 h-4 text-purple-600" />
                    </div>
                  )}
                  <span className="hidden sm:block text-sm font-medium text-gray-700">
                    {user?.fullName || 'Teacher'}
                  </span>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>
                {avatarDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setAvatarDropdownOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                      <Link
                        href="/teacher/dashboard"
                        onClick={() => setAvatarDropdownOpen(false)}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Dashboard
                      </Link>
                      <Link
                        href="/teacher/settings"
                        onClick={() => setAvatarDropdownOpen(false)}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Settings
                      </Link>
                      <Link
                        href="/teacher/profile"
                        onClick={() => setAvatarDropdownOpen(false)}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Profile
                      </Link>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
