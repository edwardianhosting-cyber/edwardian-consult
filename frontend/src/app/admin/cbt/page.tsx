'use client';

import { useEffect, useState } from 'react';
import { ClipboardList, BookOpen, BarChart3, CheckCircle, XCircle, Clock, Eye, EyeOff, Trash2, Search, Printer, ChevronRight } from 'lucide-react';
import { api } from '@/lib/api';

interface MockExam {
  id: string;
  title: string;
  subject: string;
  duration: number;
  isPublished: boolean;
  createdAt: string;
  questions?: any[];
}

interface CBTResult {
  id: string;
  score: number;
  subject: string;
  type: string;
  completedAt: string;
  user?: {
    fullName: string;
    email: string;
  };
  exam?: {
    title: string;
    subject: string;
    examType?: string;
  };
}

interface CBTStats {
  totalExams: number;
  totalResults: number;
  publishedExams: number;
  draftExams: number;
  averageScore: number;
  recentResults: CBTResult[];
}

type View = 'home' | 'practice' | 'mock' | 'results';

export default function AdminCBTPage() {
  const [view, setView] = useState<View>('home');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<CBTStats | null>(null);
  const [exams, setExams] = useState<MockExam[]>([]);
  const [results, setResults] = useState<CBTResult[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [examTypeFilter, setExamTypeFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [orgName, setOrgName] = useState('Edwardian Educational Consult');

  useEffect(() => {
    fetchData();
  }, [view, examTypeFilter, currentPage]);

  async function fetchData() {
    setLoading(true);
    try {
      if (view === 'home' || view === 'practice' || view === 'mock') {
        const data = await api.adminGetCBTStats();
        setStats(data.data);
      }
      if (view === 'mock') {
        const data = await api.adminGetAllMockExams();
        setExams(data.data || []);
      }
      if (view === 'practice' || view === 'mock') {
        const data = await api.adminGetAllCBTResults(currentPage, 50);
        setResults(data.data?.results || []);
        setTotalPages(data.data?.pagination?.totalPages || 1);
      }
      if (view === 'results') {
        const data = await api.adminGetAllCBTResults(currentPage, 50);
        setResults(data.data?.results || []);
        setTotalPages(data.data?.pagination?.totalPages || 1);
      }
    } catch (error) {
      console.error('Failed to fetch CBT data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handlePublish(id: string) {
    setActionLoading(id);
    try {
      await api.publishMockExam(id);
      fetchData();
    } catch (error) {
      console.error('Failed to publish:', error);
    } finally {
      setActionLoading(null);
    }
  }

  async function handleUnpublish(id: string) {
    setActionLoading(id);
    try {
      await api.unpublishMockExam(id);
      fetchData();
    } catch (error) {
      console.error('Failed to unpublish:', error);
    } finally {
      setActionLoading(null);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this mock exam? This action cannot be undone.')) return;
    setActionLoading(id);
    try {
      await api.deleteMockExam(id);
      fetchData();
    } catch (error) {
      console.error('Failed to delete:', error);
    } finally {
      setActionLoading(null);
    }
  }

  function handlePrint() {
    window.print();
  }

  const filteredResults = results.filter((result) => {
    if (examTypeFilter === 'ALL') return true;
    if (examTypeFilter === 'PRACTICE') return result.type !== 'MOCK';
    return result.type === examTypeFilter || result.exam?.examType === examTypeFilter;
  });

  const homeCards = [
    {
      title: 'Practice CBT',
      description: 'View practice CBT performance and results across all students',
      icon: BookOpen,
      color: 'primary',
      bgColor: 'bg-primary-100',
      hoverBgColor: 'bg-primary-200',
      textColor: 'text-primary-600',
      onClick: () => setView('practice'),
    },
    {
      title: 'Mock Exams',
      description: 'Manage mock exams and review student performance',
      icon: ClipboardList,
      color: 'accent',
      bgColor: 'bg-yellow-100',
      hoverBgColor: 'bg-yellow-200',
      textColor: 'text-yellow-600',
      onClick: () => setView('mock'),
    },
    {
      title: 'All Results',
      description: 'Complete results overview with filtering and printing',
      icon: BarChart3,
      color: 'primary',
      bgColor: 'bg-primary-100',
      hoverBgColor: 'bg-primary-200',
      textColor: 'text-primary-600',
      onClick: () => setView('results'),
    },
  ];

  const examTypes = ['ALL', 'JAMB', 'WAEC', 'NECO', 'POST-UTME', 'MOCK', 'PRACTICE'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">CBT Management</h1>
          <p className="text-gray-600 mt-1">Monitor and manage CBT examinations system-wide</p>
        </div>
        {view !== 'home' && (
          <button
            onClick={() => setView('home')}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium"
          >
            Back to Home
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <>
          {/* Home View */}
          {view === 'home' && (
            <div className="grid sm:grid-cols-3 gap-6">
              {homeCards.map((card, idx) => {
                const Icon = card.icon;
                return (
                  <button
                    key={idx}
                    onClick={card.onClick}
                    className="bg-white rounded-xl border border-gray-100 p-6 text-left hover:shadow-lg hover:border-primary-200 transition-all group"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className={`w-12 h-12 bg-${card.color}-100 rounded-xl flex items-center justify-center group-hover:bg-${card.color}-200 transition-colors`}>
                        <Icon className={`w-6 h-6 text-${card.color}-600`} />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">{card.title}</h3>
                        <p className="text-sm text-gray-500">{card.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center text-primary-600 text-sm font-medium">
                      Open <ChevronRight className="w-4 h-4 ml-1" />
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Practice/Mock Results View */}
          {(view === 'practice' || view === 'mock') && (
            <div className="space-y-4">
              <div className="bg-white rounded-xl border border-gray-100 p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Exam Type</label>
                    <select
                      value={examTypeFilter}
                      onChange={(e) => {
                        setExamTypeFilter(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                    >
                      {examTypes.map((type) => (
                        <option key={type} value={type}>{type === 'ALL' ? 'All Types' : type}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={handlePrint}
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center gap-2"
                    >
                      <Printer className="w-4 h-4" />
                      Print Results
                    </button>
                  </div>
                </div>
              </div>

              {/* Print Header */}
              <div className="hidden print:block mb-6">
                <div className="text-center border-b pb-4 mb-4">
                  <h1 className="text-2xl font-bold text-gray-900">{orgName}</h1>
                  <p className="text-gray-600">CBT Results Report</p>
                  <p className="text-sm text-gray-500">Generated on {new Date().toLocaleDateString()}</p>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                {filteredResults.length === 0 ? (
                  <div className="text-center py-16">
                    <p className="text-gray-500">No results found</p>
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-gray-50 border-b">
                            <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Student</th>
                            <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Exam</th>
                            <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Subject</th>
                            <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Type</th>
                            <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Score</th>
                            <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredResults.map((result) => (
                            <tr key={result.id} className="border-b last:border-0 hover:bg-gray-50">
                              <td className="px-4 py-3 text-sm text-gray-900">
                                {result.user?.fullName || result.user?.email || 'Unknown'}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-600">{result.exam?.title || '-'}</td>
                              <td className="px-4 py-3 text-sm text-gray-600">{result.subject}</td>
                              <td className="px-4 py-3 text-sm text-gray-600">
                                <span className="capitalize">{result.type.toLowerCase()}</span>
                              </td>
                              <td className="px-4 py-3">
                                <span className={`text-sm font-medium px-2 py-1 rounded ${
                                  result.score >= 70 ? 'bg-green-100 text-green-700' :
                                  result.score >= 50 ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-red-100 text-red-700'
                                }`}>
                                  {Math.round(result.score)}%
                                </span>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-500">
                                {new Date(result.completedAt).toLocaleDateString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {totalPages > 1 && (
                      <div className="flex items-center justify-between px-4 py-3 border-t">
                        <button
                          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                          disabled={currentPage === 1}
                          className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                        >
                          Previous
                        </button>
                        <span className="text-sm text-gray-600">Page {currentPage} of {totalPages}</span>
                        <button
                          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                          disabled={currentPage === totalPages}
                          className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                        >
                          Next
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {/* Mock Exams Management View */}
          {view === 'mock' && (
            <div className="space-y-4">
              <div className="bg-white rounded-xl border border-gray-100 p-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search mock exams..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                {exams.length === 0 ? (
                  <div className="text-center py-16">
                    <p className="text-gray-500">No mock exams found</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50 border-b">
                          <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Title</th>
                          <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Subject</th>
                          <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Duration</th>
                          <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Questions</th>
                          <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Status</th>
                          <th className="text-right px-4 py-3 text-sm font-semibold text-gray-600">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {exams.map((exam) => (
                          <tr key={exam.id} className="border-b last:border-0 hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm text-gray-900 font-medium">{exam.title}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{exam.subject}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{exam.duration} min</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{exam.questions?.length || 0}</td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                                exam.isPublished
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-gray-100 text-gray-700'
                              }`}>
                                {exam.isPublished ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                                {exam.isPublished ? 'Published' : 'Draft'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex items-center justify-end gap-2">
                                {exam.isPublished ? (
                                  <button
                                    onClick={() => handleUnpublish(exam.id)}
                                    disabled={actionLoading === exam.id}
                                    className="p-1.5 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded disabled:opacity-50"
                                    title="Unpublish"
                                  >
                                    <EyeOff className="w-4 h-4" />
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handlePublish(exam.id)}
                                    disabled={actionLoading === exam.id}
                                    className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded disabled:opacity-50"
                                    title="Publish"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>
                                )}
                                <button
                                  onClick={() => handleDelete(exam.id)}
                                  disabled={actionLoading === exam.id}
                                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded disabled:opacity-50"
                                  title="Delete"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
