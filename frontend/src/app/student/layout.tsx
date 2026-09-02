'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home,
  BookOpen,
  FileText,
  Award,
  CreditCard,
  Bell,
  User,
  Settings,
  HelpCircle,
  LogOut,
  ChevronDown,
  Menu,
  X,
  GraduationCap,
  ClipboardList,
  Trophy,
  Calendar,
  MessageSquare,
  Search,
  CreditCard as CreditCardIcon,
  Wallet,
  Target,
  Brain,
  Medal,
  Newspaper,
  Briefcase,
  FileCheck,
  Users,
  Share2,
  FilePlus,
} from 'lucide-react';
import NotificationBell from '@/components/NotificationBell';

interface StudentLayoutProps {
  children: React.ReactNode;
}

const sidebarSections = [
  {
    title: '',
    items: [
      { name: 'Dashboard', href: '/student/dashboard', icon: Home },
    ],
  },
  {
    title: 'LEARNING',
    items: [
      { name: 'My Courses', href: '/student/courses', icon: BookOpen },
      { name: 'Study Materials', href: '/student/materials', icon: FileText },
      { name: 'Assignments', href: '/student/assignments', icon: ClipboardList },
      { name: 'Study Planner', href: '/student/study-planner', icon: Calendar },
      { name: 'Timetable', href: '/student/timetable', icon: Calendar },
    ],
  },
  {
    title: 'EXAMINATION',
    items: [
      { name: 'CBT Practice', href: '/student/cbt', icon: GraduationCap },
      { name: 'Mock Exams', href: '/student/mock', icon: FileText },
      { name: 'JAMB Tools', href: '/student/jamb', icon: Brain },
      { name: 'Mock Results', href: '/student/mock-results', icon: Award },
      { name: 'Results', href: '/student/results', icon: Award },
      { name: 'Performance', href: '/student/performance', icon: Target },
      { name: 'Leaderboard', href: '/student/leaderboard', icon: Trophy },
    ],
  },
  {
    title: 'ADMISSION',
    items: [
      { name: 'Admission Hub', href: '/student/admission', icon: GraduationCap },
      { name: 'Institution Match', href: '/student/institutions', icon: Search },
      { name: 'My Applications', href: '/student/applications', icon: ClipboardList },
      { name: 'Admission Tracker', href: '/student/tracker', icon: Target },
    ],
  },
  {
    title: 'RESOURCES',
    items: [
      { name: 'Scholarships', href: '/student/scholarships', icon: Medal },
      { name: 'Career Guidance', href: '/student/careers', icon: Briefcase },
      { name: 'News & Updates', href: '/student/news', icon: Newspaper },
      { name: 'Notices', href: '/student/notices', icon: FileCheck },
      { name: 'Documents', href: '/student/documents', icon: FilePlus },
      { name: 'Referrals', href: '/student/referrals', icon: Share2 },
    ],
  },
  {
    title: 'FINANCE',
    items: [
      { name: 'Payments', href: '/student/payments', icon: CreditCard },
      { name: 'Wallet', href: '/student/wallet', icon: Wallet },
    ],
  },
  {
    title: 'ACCOUNT',
    items: [
      { name: 'My Profile', href: '/student/profile', icon: User },
      { name: 'ID Card', href: '/student/id-card', icon: CreditCardIcon },
      { name: 'Transcript', href: '/student/transcript', icon: FileCheck },
      { name: 'Badges', href: '/student/badges', icon: Medal },
    ],
  },
  {
    title: 'COMMUNICATION',
    items: [
      { name: 'Notifications', href: '/student/notifications', icon: Bell },
      { name: 'Messages', href: '/student/messages', icon: MessageSquare },
    ],
  },
  {
    title: '',
    items: [
      { name: 'Settings', href: '/student/settings', icon: Settings },
      { name: 'Help & Support', href: '/student/help', icon: HelpCircle },
    ],
  },
];

export default function StudentLayout({ children }: StudentLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
        if (userData.role !== 'STUDENT') {
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
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
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-4 border-b">
            <Link href="/student/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden">
                <img src="/logo.png" alt="Edwardian" className="h-full w-full object-contain" />
              </div>
              <span className="font-bold text-primary-800">Edwardian</span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 hover:bg-gray-100 rounded"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
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
                          ? 'bg-primary-50 text-primary-700'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${isActive ? 'text-primary-600' : ''}`} />
                      <span className="text-sm font-medium">{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>

          {/* Logout */}
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

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top header */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div className="hidden sm:flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2 w-64">
                <Search className="w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search anything..."
                  className="bg-transparent border-none outline-none text-sm w-full"
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <NotificationBell />
              <Link
                href="/student/profile"
                className="flex items-center gap-2 p-1 hover:bg-gray-100 rounded-lg"
              >
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-primary-600" />
                </div>
                <span className="hidden sm:block text-sm font-medium text-gray-700">
                  {user?.fullName || 'Student'}
                </span>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </Link>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
