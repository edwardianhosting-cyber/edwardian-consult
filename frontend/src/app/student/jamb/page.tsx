'use client';

import { useEffect, useState } from 'react';
import { BookOpen, Search, CheckCircle, XCircle, AlertCircle, Calendar, FileText, ExternalLink, ChevronRight, Award, Target, Clock } from 'lucide-react';
import { API_BASE } from '@/lib/api';

interface JAMBSubject {
  name: string;
  code: string;
}

interface SubjectCombination {
  id: string;
  course: string;
  subjects: JAMBSubject[];
  compulsory: JAMBSubject[];
  optional: JAMBSubject[];
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
}

interface JAMBDeadline {
  event: string;
  date: string;
  description: string;
}

export default function JAMBCentrePage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'subjects' | 'combinations' | 'syllabus' | 'news' | 'tools'>('overview');
  const [subjects, setSubjects] = useState<JAMBSubject[]>([]);
  const [combinations, setCombinations] = useState<SubjectCombination[]>([]);
  const [syllabus, setSyllabus] = useState<JAMBSyllabus[]>([]);
  const [news, setNews] = useState<JAMBNews[]>([]);
  const [deadlines, setDeadlines] = useState<JAMBDeadline[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [combinationResult, setCombinationResult] = useState<{
    valid: boolean;
    missing: string[];
    extra: string[];
    message: string;
  } | null>(null);

  const [scoreCalculator, setScoreCalculator] = useState({
    correct: 0,
    total: 100,
    result: null as { score: number; percentage: number; grade: string } | null,
  });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const [subjectsRes, combinationsRes, syllabusRes, newsRes, deadlinesRes] = await Promise.all([
        fetch(`${API_BASE}/jamb/subjects`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE}/jamb/combinations`, {
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
      ]);

      if (subjectsRes.ok) setSubjects((await subjectsRes.json()).data);
      if (combinationsRes.ok) setCombinations((await combinationsRes.json()).data);
      if (syllabusRes.ok) setSyllabus((await syllabusRes.json()).data);
      if (newsRes.ok) setNews((await newsRes.json()).data);
      if (deadlinesRes.ok) setDeadlines((await deadlinesRes.json()).data);
    } catch (error) {
      console.error('Failed to fetch JAMB data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function checkCombination() {
    if (!selectedCourse || selectedSubjects.length === 0) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/jamb/check-combination`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ course: selectedCourse, subjects: selectedSubjects }),
      });

      if (res.ok) {
        const data = await res.json();
        setCombinationResult(data.data);
      }
    } catch (error) {
      console.error('Failed to check combination:', error);
    }
  }

  async function calculateScore() {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/jamb/calculate-score`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          correctAnswers: scoreCalculator.correct,
          totalQuestions: scoreCalculator.total,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setScoreCalculator(prev => ({ ...prev, result: data.data }));
      }
    } catch (error) {
      console.error('Failed to calculate score:', error);
    }
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BookOpen },
    { id: 'subjects', label: 'Subjects', icon: FileText },
    { id: 'combinations', label: 'Subject Checker', icon: CheckCircle },
    { id: 'syllabus', label: 'Syllabus', icon: BookOpen },
    { id: 'news', label: 'News & Updates', icon: Calendar },
    { id: 'tools', label: 'Tools', icon: Target },
  ];

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
        <h1 className="text-2xl font-bold text-gray-900">JAMB Centre</h1>
        <p className="text-gray-600 mt-1">Everything you need for JAMB UTME preparation</p>
      </div>

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
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{combinations.length}</p>
                  <p className="text-sm text-gray-500">Course Combinations</p>
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
          </div>

          {/* Upcoming Deadlines */}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary-600" />
              Upcoming JAMB Deadlines
            </h2>
            <div className="space-y-3">
              {deadlines.slice(0, 5).map((deadline, index) => (
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
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="grid sm:grid-cols-2 gap-4">
            <button
              onClick={() => setActiveTab('combinations')}
              className="bg-white rounded-xl border border-gray-100 p-6 text-left hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Subject Combination Checker</h3>
                  <p className="text-sm text-gray-500">Verify your subjects for your chosen course</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 ml-auto" />
              </div>
            </button>
            <button
              onClick={() => setActiveTab('tools')}
              className="bg-white rounded-xl border border-gray-100 p-6 text-left hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Target className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Score Calculator</h3>
                  <p className="text-sm text-gray-500">Calculate your JAMB score</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 ml-auto" />
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Subjects Tab */}
      {activeTab === 'subjects' && (
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">All JAMB Subjects</h2>
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

      {/* Subject Combination Checker Tab */}
      {activeTab === 'combinations' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Subject Combination Checker</h2>
            <p className="text-gray-600 mb-6">
              Select your course and subjects to verify if your combination is valid.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Course</label>
                <select
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Select a course...</option>
                  {combinations.map((c) => (
                    <option key={c.id} value={c.course}>{c.course}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Your Subjects</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {subjects.map((subject) => (
                    <label
                      key={subject.code}
                      className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors ${
                        selectedSubjects.includes(subject.name)
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedSubjects.includes(subject.name)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedSubjects([...selectedSubjects, subject.name]);
                          } else {
                            setSelectedSubjects(selectedSubjects.filter(s => s !== subject.name));
                          }
                        }}
                        className="w-4 h-4 text-primary-600 rounded"
                      />
                      <span className="text-sm">{subject.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button
                onClick={checkCombination}
                disabled={!selectedCourse || selectedSubjects.length === 0}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
              >
                Check Combination
              </button>

              {combinationResult && (
                <div className={`p-4 rounded-lg border-2 ${
                  combinationResult.valid
                    ? 'border-green-200 bg-green-50'
                    : 'border-red-200 bg-red-50'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    {combinationResult.valid ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600" />
                    )}
                    <p className={`font-medium ${combinationResult.valid ? 'text-green-800' : 'text-red-800'}`}>
                      {combinationResult.message}
                    </p>
                  </div>
                  {combinationResult.missing.length > 0 && (
                    <p className="text-sm text-red-700">
                      Missing: {combinationResult.missing.join(', ')}
                    </p>
                  )}
                  {combinationResult.extra.length > 0 && (
                    <p className="text-sm text-yellow-700">
                      Not required: {combinationResult.extra.join(', ')}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Course Combinations Reference */}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Course Subject Combinations</h2>
            <div className="space-y-4">
              {combinations.map((combo) => (
                <div key={combo.id} className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">{combo.course}</h3>
                  <div className="flex flex-wrap gap-2">
                    {combo.subjects.map((subject) => (
                      <span
                        key={subject.code}
                        className={`text-xs px-2 py-1 rounded ${
                          combo.compulsory.some(s => s.code === subject.code)
                            ? 'bg-primary-100 text-primary-700'
                            : 'bg-gray-200 text-gray-600'
                        }`}
                      >
                        {subject.name}
                        {combo.compulsory.some(s => s.code === subject.code) && ' *'}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">* Compulsory subjects</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Syllabus Tab */}
      {activeTab === 'syllabus' && (
        <div className="space-y-4">
          {syllabus.map((subject) => (
            <div key={subject.id} className="bg-white rounded-xl border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">{subject.subject}</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {subject.topics.map((topic, index) => (
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
          ))}
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
              <div key={item.id} className="bg-white rounded-xl border border-gray-100 p-6">
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
              </div>
            ))
          )}
        </div>
      )}

      {/* Tools Tab */}
      {activeTab === 'tools' && (
        <div className="grid sm:grid-cols-2 gap-6">
          {/* Score Calculator */}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-primary-600" />
              JAMB Score Calculator
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Correct Answers</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={scoreCalculator.correct}
                  onChange={(e) => setScoreCalculator(prev => ({ ...prev, correct: parseInt(e.target.value) || 0 }))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Questions</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={scoreCalculator.total}
                  onChange={(e) => setScoreCalculator(prev => ({ ...prev, total: parseInt(e.target.value) || 100 }))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                />
              </div>
              <button
                onClick={calculateScore}
                className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                Calculate Score
              </button>
              {scoreCalculator.result && (
                <div className="p-4 bg-primary-50 rounded-lg text-center">
                  <p className="text-3xl font-bold text-primary-700">{scoreCalculator.result.score}</p>
                  <p className="text-sm text-primary-600">out of 400</p>
                  <p className="text-lg font-medium text-gray-900 mt-2">
                    {scoreCalculator.result.percentage}% - Grade {scoreCalculator.result.grade}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* CAPS Guide */}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-primary-600" />
              JAMB CAPS Guide
            </h2>
            <div className="space-y-3">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="font-medium text-gray-900">1. Visit CAPS Portal</p>
                <p className="text-sm text-gray-600">Go to caps.jamb.gov.ng</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="font-medium text-gray-900">2. Login</p>
                <p className="text-sm text-gray-600">Use your JAMB registration number</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="font-medium text-gray-900">3. Check Status</p>
                <p className="text-sm text-gray-600">Click &quot;Check Admission Status&quot;</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="font-medium text-gray-900">4. Accept/Reject</p>
                <p className="text-sm text-gray-600">Accept your admission if offered</p>
              </div>
            </div>
            <a
              href="https://caps.jamb.gov.ng"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 text-primary-600 hover:text-primary-700"
            >
              Open CAPS Portal
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>

          {/* Quick Links */}
          <div className="bg-white rounded-xl border border-gray-100 p-6 sm:col-span-2">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Official JAMB Resources</h2>
            <div className="grid sm:grid-cols-3 gap-4">
              <a
                href="https://portal.jamb.gov.ng"
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <p className="font-medium text-gray-900">JAMB Portal</p>
                <p className="text-sm text-gray-500">Registration & Profile</p>
              </a>
              <a
                href="https://efacility.jamb.gov.ng"
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <p className="font-medium text-gray-900">JAMB eFacility</p>
                <p className="text-sm text-gray-500">Print documents & more</p>
              </a>
              <a
                href="https://caps.jamb.gov.ng"
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <p className="font-medium text-gray-900">JAMB CAPS</p>
                <p className="text-sm text-gray-500">Admission status</p>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

