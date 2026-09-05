'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  FileText,
  Award,
  CreditCard,
  Bell,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  School,
  Newspaper,
  Shield,
  BarChart3,
  MessageSquare,
  Calendar,
  CreditCard as CreditCardIcon,
  Wallet,
  Target,
  Trophy,
  Medal,
  UserCheck,
  UserPlus,
  ClipboardList,
  Phone,
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const sidebarSections = [
  {
    title: 'OVERVIEW',
    items: [
      { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
      { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    ],
  },
  {
    title: 'MANAGEMENT',
    items: [
      { name: 'Students', href: '/admin/students', icon: Users },
      { name: 'Teachers', href: '/admin/teachers', icon: UserCheck },
      { name: 'Parents', href: '/admin/parents', icon: UserPlus },
      { name: 'Programs', href: '/admin/programs', icon: BookOpen },
    ],
  },
  {
    title: 'LEARNING',
    items: [
      { name: 'Courses', href: '/admin/courses', icon: GraduationCap },
      { name: 'Subjects', href: '/admin/subjects', icon: BookOpen },
      { name: 'Question Bank', href: '/admin/questions', icon: FileText },
      { name: 'CBT Management', href: '/admin/cbt', icon: ClipboardList },
      { name: 'Study Materials', href: '/admin/materials', icon: FileText },
      { name: 'Timetable', href: '/admin/timetable', icon: Calendar },
    ],
  },
  {
    title: 'EXAMINATION',
    items: [
      { name: 'Results', href: '/admin/results', icon: Award },
      { name: 'Mock Exams', href: '/admin/mock', icon: Calendar },
      { name: 'Performance', href: '/admin/performance', icon: Target },
      { name: 'JAMB Deadlines', href: '/admin/jamb/deadlines', icon: Calendar },
      { name: 'JAMB Subjects', href: '/admin/jamb/subjects', icon: BookOpen },
      { name: 'JAMB Syllabus', href: '/admin/jamb/syllabus', icon: FileText },
    ],
  },
  {
    title: 'ADMISSION',
    items: [
      { name: 'Institutions', href: '/admin/institutions', icon: School },
      { name: 'Admission Hub', href: '/admin/admission-hub', icon: GraduationCap },
    ],
  },
  {
    title: 'FINANCE',
    items: [
      { name: 'Payments', href: '/admin/payments', icon: CreditCard },
      { name: 'Wallet Records', href: '/admin/wallet', icon: Wallet },
    ],
  },
  {
    title: 'ENGAGEMENT',
    items: [
      { name: 'Notifications', href: '/admin/notifications', icon: Bell },
      { name: 'Email Campaigns', href: '/admin/campaigns', icon: MessageSquare },
      { name: 'Announcements', href: '/admin/announcements', icon: Newspaper },
      { name: 'Notices', href: '/admin/notices', icon: FileText },
    ],
  },
  {
    title: 'REWARDS',
    items: [
      { name: 'Badges', href: '/admin/badges', icon: Medal },
      { name: 'Leaderboard', href: '/admin/leaderboard', icon: Trophy },
      { name: 'Certificates', href: '/admin/certificates', icon: Award },
      { name: 'ID Cards', href: '/admin/id-cards', icon: CreditCardIcon },
    ],
  },
  {
    title: 'RESOURCES',
    items: [
      { name: 'News & Articles', href: '/admin/news', icon: Newspaper },
    ],
  },
  {
    title: 'SYSTEM',
    items: [
      { name: 'Contact Page', href: '/admin/contact', icon: MessageSquare },
      { name: 'Support Settings', href: '/admin/support', icon: Phone },
      { name: 'Audit Logs', href: '/admin/audit', icon: Shield },
      { name: 'Referrals', href: '/admin/referrals', icon: Users },
      { name: 'Settings', href: '/admin/settings', icon: Settings },
    ],
  },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [avatarDropdownOpen, setAvatarDropdownOpen] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      
      if (!token || !userStr) {
        router.push('/login');
        return;
      }
      
      try {
        const userData = JSON.parse(userStr);
        if (userData.role !== 'ADMIN') {
          router.push('/login');
          return;
        }
        setUser(userData);
      } catch {
        router.push('/login');
        return;
      }
      setLoading(false);
    };

    checkAuth();

    // Check auth when page is shown (including back button navigation)
    window.addEventListener('pageshow', checkAuth);
    return () => window.removeEventListener('pageshow', checkAuth);
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
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
    <div className="min-h-screen bg-gray-100">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-primary-900 text-white transform transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between h-16 px-4 border-b border-primary-800">
            <Link href="/admin/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden">
                <img src="/logo.png" alt="Edwardian" className="h-full w-full object-contain" />
              </div>
              <span className="font-bold">Admin Panel</span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 hover:bg-primary-800 rounded"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto py-4 px-3">
            {sidebarSections.map((section, sIdx) => (
              <div key={sIdx} className="mb-4">
                <p className="text-xs font-semibold text-primary-400 uppercase tracking-wider mb-2 px-3">
                  {section.title}
                </p>
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
                          ? 'bg-accent-500 text-primary-900'
                          : 'text-primary-200 hover:bg-primary-800 hover:text-white'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-sm font-medium">{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>

          <div className="p-3 border-t border-primary-800">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2 w-full text-primary-200 hover:bg-primary-800 hover:text-white rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
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
              <h1 className="text-lg font-semibold text-gray-900">Administration</h1>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/"
                target="_blank"
                className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                View Site
              </Link>
              <div className="relative">
                <button
                  onClick={() => setAvatarDropdownOpen(!avatarDropdownOpen)}
                  className="flex items-center gap-2 p-1 hover:bg-gray-100 rounded-lg"
                >
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user?.fullName || 'Admin'}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-primary-600">
                        {user?.fullName?.charAt(0) || 'A'}
                      </span>
                    </div>
                  )}
                  <span className="hidden sm:block text-sm font-medium text-gray-700">
                    {user?.fullName || 'Admin'}
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
                        href="/admin/dashboard"
                        onClick={() => setAvatarDropdownOpen(false)}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Dashboard
                      </Link>
                      <Link
                        href="/admin/settings"
                        onClick={() => setAvatarDropdownOpen(false)}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Settings
                      </Link>
                      <Link
                        href="/admin/profile"
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
