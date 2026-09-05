'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen, FileText, Calendar, Clock } from 'lucide-react';
import { API_BASE } from '@/lib/api';

interface JAMBSubject {
  name: string;
  code: string;
}

interface JAMBSyllabus {
  id: string;
  subject: string;
  topics: {
    name: string;
    subtopics: string[];
  }[];
  year: number;
}

interface JAMBNews {
  id: string;
  title: string;
  content: string;
  category: string;
  publishedAt: string;
  slug: string;
}

interface JAMBDeadline {
  event: string;
  date: string;
  description: string;
}

export default function JAMBCentrePage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'subjects' | 'syllabus' | 'news'>('overview');
  const [subjects, setSubjects] = useState<JAMBSubject[]>([]);
  const [syllabus, setSyllabus] = useState<JAMBSyllabus[]>([]);
  const [news, setNews] = useState<JAMBNews[]>([]);
  const [deadlines, setDeadlines] = useState<JAMBDeadline[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSyllabus, setSelectedSyllabus] = useState<JAMBSyllabus | null>(null);
  const [mySubjects, setMySubjects] = useState<string[]>([]);
  const [examTypes, setExamTypes] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');

      const [subjectsRes, syllabusRes, newsRes, deadlinesRes, mySubjectsRes, profileRes] = await Promise.all([
        fetch(`${API_BASE}/jamb/subjects`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE}/jamb/syllabus`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE}/jamb/news`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE}/jamb/deadlines`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE}/study/my-subjects`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE}/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (subjectsRes.ok) {
        const subjectsData = await subjectsRes.json();
        setSubjects(subjectsData.data || []);
      } else {
        console.error('Failed to fetch JAMB subjects:', subjectsRes.status, subjectsRes.statusText);
      }

      if (syllabusRes.ok) {
        const syllabusData = await syllabusRes.json();
        setSyllabus(syllabusData.data || []);
      } else {
        console.error('Failed to fetch syllabus:', syllabusRes.status, syllabusRes.statusText);
        const errBody = await syllabusRes.json().catch(() => ({}));
        setError(errBody.message || `Syllabus fetch failed (${syllabusRes.status})`);
      }

      if (newsRes.ok) {
        const newsData = await newsRes.json();
        setNews(newsData.data || []);
      } else {
        console.error('Failed to fetch news:', newsRes.status, newsRes.statusText);
      }

      if (deadlinesRes.ok) {
        const deadlinesData = await deadlinesRes.json();
        setDeadlines(deadlinesData.data || []);
      } else {
        console.error('Failed to fetch deadlines:', deadlinesRes.status, deadlinesRes.statusText);
      }

      if (mySubjectsRes.ok) {
        const myData = await mySubjectsRes.json();
        const subjectNames = (myData.data || []).map((s: any) => s.title || s.name || s.subject);
        setMySubjects(subjectNames);
      } else {
        console.error('Failed to fetch my subjects:', mySubjectsRes.status, mySubjectsRes.statusText);
      }

      if (profileRes.ok) {
        const profileData = await profileRes.json();
        const profile = profileData.data || profileData;
        setExamTypes(profile.examTypes || []);
      } else {
        console.error('Failed to fetch profile:', profileRes.status, profileRes.statusText);
      }
    } catch (error) {
      console.error('Failed to fetch JAMB data:', error);
      setError('Failed to load JAMB data. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BookOpen },
    { id: 'subjects', label: 'Subjects', icon: FileText },
    { id: 'syllabus', label: 'Syllabus', icon: BookOpen },
    { id: 'news', label: 'News & Updates', icon: Calendar },
  ];

  const primaryExam = (examTypes[0] || 'JAMB').toUpperCase();
  const examLabel = primaryExam === 'JAMB' ? 'JAMB' : primaryExam === 'WAEC' ? 'WAEC' : primaryExam === 'NECO' ? 'NECO' : primaryExam === 'JUPEB' ? 'JUPEB' : primaryExam === 'IJMB' ? 'IJMB' : 'Examination';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{examLabel} Centre</h1>
        <p className="text-gray-600 mt-1">
          {examTypes.length > 0
            ? `Everything you need for ${examTypes.join(', ')} preparation`
            : 'Everything you need for examination preparation'}
        </p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl p-6 border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{subjects.length}</p>
                  <p className="text-sm text-gray-500">JAMB Subjects</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{deadlines.length}</p>
                  <p className="text-sm text-gray-500">Upcoming Deadlines</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {mySubjects.length > 0 ? syllabus.filter(s => mySubjects.some(ms => ms.toLowerCase() === s.subject.toLowerCase())).length : syllabus.length}
                  </p>
                  <p className="text-sm text-gray-500">{examLabel} Syllabus Subjects</p>
                </div>
              </div>
            </div>
          </div>

          {/* Upcoming Deadlines */}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary-600" />
              Upcoming JAMB Deadlines
            </h2>
            <div className="space-y-3">
              {deadlines.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No upcoming deadlines.</p>
                  <p className="text-sm text-gray-400 mt-1">Deadlines will appear here once published.</p>
                </div>
              ) : (
                deadlines.slice(0, 5).map((deadline, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{deadline.event}</p>
                      <p className="text-sm text-gray-500">{deadline.description}</p>
                    </div>
                    <span className="text-sm font-medium text-primary-600">
                      {new Date(deadline.date).toLocaleDateString('en-NG', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent News */}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary-600" />
              Latest JAMB News
            </h2>
            <div className="space-y-3">
              {news.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No news available at the moment.</p>
                  <p className="text-sm text-gray-400 mt-1">Check back later for updates.</p>
                </div>
              ) : (
                news.slice(0, 3).map((item) => (
                  <Link
                    key={item.id}
                    href={`/student/jamb/news/${item.slug}`}
                    className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <p className="font-medium text-gray-900">{item.title}</p>
                    <p className="text-sm text-gray-500 mt-1">{item.content.slice(0, 150)}...</p>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Subjects Tab */}
      {activeTab === 'subjects' && (
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{examLabel} Subjects</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {subjects.map((subject) => (
              <div key={subject.code} className="p-3 bg-gray-50 rounded-lg">
                <p className="font-medium text-gray-900">{subject.name}</p>
                <p className="text-xs text-gray-500">{subject.code}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Syllabus Tab */}
      {activeTab === 'syllabus' && (
        <div className="space-y-4">
          {!selectedSyllabus ? (
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">{examLabel} Syllabus</h2>
              <p className="text-sm text-gray-600 mb-4">Select a subject to view its topics and subtopics.</p>
              {(() => {
                const isJamb = examTypes.some(e => e.toUpperCase() === 'JAMB');
                if (!isJamb) {
                  return (
                    <div className="text-center py-8 text-gray-500">
                      <p>Syllabus for {examLabel} is being prepared.</p>
                      <p className="text-sm text-gray-400 mt-1">Please check back later.</p>
                    </div>
                  );
                }
                const filtered = mySubjects.length > 0
                  ? syllabus.filter(item => mySubjects.some(s => s.toLowerCase() === item.subject.toLowerCase()))
                  : syllabus;
                if (filtered.length === 0) {
                  return (
                    <div className="text-center py-8 text-gray-500">
                      <p>No JAMB subjects registered yet.</p>
                      <p className="text-sm text-gray-400 mt-1">Register JAMB subjects to see your syllabus here.</p>
                    </div>
                  );
                }
                return (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {filtered.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setSelectedSyllabus(item)}
                        className="p-3 bg-gray-50 rounded-lg text-left hover:bg-gray-100 transition-colors"
                      >
                        <p className="font-medium text-gray-900">{item.subject}</p>
                        <p className="text-xs text-gray-500">{item.topics.length} topics</p>
                      </button>
                    ))}
                  </div>
                );
              })()}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">{selectedSyllabus.subject} Syllabus</h2>
                <button
                  onClick={() => setSelectedSyllabus(null)}
                  className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  Back to subjects
                </button>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {selectedSyllabus.topics.map((topic, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-medium text-gray-900 mb-2">{topic.name}</h3>
                    <ul className="space-y-1">
                      {topic.subtopics.map((subtopic, i) => (
                        <li key={i} className="text-sm text-gray-600 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-primary-600 rounded-full" />
                          {subtopic}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* News Tab */}
      {activeTab === 'news' && (
        <div className="space-y-4">
          {news.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No JAMB news available at the moment</p>
            </div>
          ) : (
            news.map((item) => (
              <Link
                key={item.id}
                href={`/student/jamb/news/${item.slug}`}
                className="block bg-white rounded-xl border border-gray-100 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded">
                    {item.category}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(item.publishedAt).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.content}</p>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}
