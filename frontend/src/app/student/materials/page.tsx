'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { BookOpen, ChevronRight, FileText, Image, Type, Video, Music, PlayCircle, ArrowLeft } from 'lucide-react';

interface StudyResource {
  id: string;
  title: string;
  type: string;
  fileUrl?: string;
  imageUrl?: string;
  textContent?: string;
  description?: string;
  duration?: number;
}

interface StudyTopic {
  id: string;
  name: string;
  description?: string;
  order: number;
  resources: StudyResource[];
}

interface StudySubject {
  id: string;
  name: string;
  description?: string;
  code?: string;
  topics: StudyTopic[];
}

type View = 'subjects' | 'topics' | 'resources';

export default function MaterialsPage() {
  const [view, setView] = useState<View>('subjects');
  const [subjects, setSubjects] = useState<StudySubject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<StudySubject | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<StudyTopic | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchHierarchy();
  }, []);

  async function fetchHierarchy() {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getMaterialsHierarchy();
      setSubjects(data.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch materials');
    } finally {
      setLoading(false);
    }
  }

  function openSubject(subject: StudySubject) {
    setSelectedSubject(subject);
    setSelectedTopic(null);
    setView('topics');
  }

  function openTopic(topic: StudyTopic) {
    setSelectedTopic(topic);
    setView('resources');
  }

  function goBack() {
    if (view === 'resources') {
      setView('topics');
      setSelectedTopic(null);
    } else if (view === 'topics') {
      setView('subjects');
      setSelectedSubject(null);
    }
  }

  function formatDuration(seconds?: number) {
    if (!seconds) return '';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Study Materials</h1>
          <p className="text-gray-600 mt-1">Browse subjects, topics and resources</p>
        </div>
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-red-500 text-lg">{error}</p>
          <button
            onClick={fetchHierarchy}
            className="mt-4 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Study Materials</h1>
          <p className="text-gray-600 mt-1">
            {view === 'subjects' && 'Select a subject to explore topics and resources'}
            {view === 'topics' && selectedSubject && `Topics in ${selectedSubject.name}`}
            {view === 'resources' && selectedTopic && `Resources for ${selectedTopic.name}`}
          </p>
        </div>
        {view !== 'subjects' && (
          <button
            onClick={goBack}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        )}
      </div>

      {/* Breadcrumb */}
      {view !== 'subjects' && (
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <button
            onClick={() => { setView('subjects'); setSelectedSubject(null); setSelectedTopic(null); }}
            className="hover:text-primary-600"
          >
            Subjects
          </button>
          {view === 'topics' && selectedSubject && (
            <>
              <ChevronRight className="w-4 h-4" />
              <span className="text-gray-900">{selectedSubject.name}</span>
            </>
          )}
          {view === 'resources' && selectedSubject && selectedTopic && (
            <>
              <ChevronRight className="w-4 h-4" />
              <button
                onClick={() => { setView('topics'); setSelectedTopic(null); }}
                className="hover:text-primary-600"
              >
                {selectedSubject.name}
              </button>
              <ChevronRight className="w-4 h-4" />
              <span className="text-gray-900">{selectedTopic.name}</span>
            </>
          )}
        </div>
      )}

      {/* Subjects View */}
      {view === 'subjects' && (
        <div>
          {subjects.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No subjects available yet</p>
              <p className="text-gray-400 text-sm mt-1">
                Register for subjects in your settings to access study materials.
              </p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {subjects.map((subject) => (
                <button
                  key={subject.id}
                  onClick={() => openSubject(subject)}
                  className="bg-white rounded-xl border border-gray-100 p-6 hover:shadow-md transition-all text-left"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm">{subject.name}</h3>
                      {subject.code && (
                        <p className="text-xs text-gray-500">{subject.code}</p>
                      )}
                    </div>
                  </div>
                  {subject.description && (
                    <p className="text-sm text-gray-500 line-clamp-2">{subject.description}</p>
                  )}
                  <div className="mt-4 flex items-center gap-1 text-xs text-primary-600 font-medium">
                    <span>{subject.topics.length} topics</span>
                    <ChevronRight className="w-3 h-3" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Topics View */}
      {view === 'topics' && selectedSubject && (
        <div>
          {selectedSubject.topics.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No topics available yet</p>
              <p className="text-gray-400 text-sm mt-1">
                Topics for {selectedSubject.name} will appear here soon.
              </p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {selectedSubject.topics.map((topic) => (
                <button
                  key={topic.id}
                  onClick={() => openTopic(topic)}
                  className="bg-white rounded-xl border border-gray-100 p-6 hover:shadow-md transition-all text-left"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm">{topic.name}</h3>
                      {topic.description && (
                        <p className="text-xs text-gray-500 line-clamp-1">{topic.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-1 text-xs text-primary-600 font-medium">
                    <span>{topic.resources.length} resources</span>
                    <ChevronRight className="w-3 h-3" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Resources View */}
      {view === 'resources' && selectedTopic && (
        <div>
          {selectedTopic.resources.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No resources available yet</p>
              <p className="text-gray-400 text-sm mt-1">
                Resources for {selectedTopic.name} will appear here soon.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {selectedTopic.resources.map((resource) => (
                <ResourceCard key={resource.id} resource={resource} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ResourceCard({ resource }: { resource: StudyResource }) {
  const [showText, setShowText] = useState(false);

  const typeConfig: Record<string, { icon: typeof Video; color: string; label: string }> = {
    VIDEO: { icon: Video, color: 'text-red-600 bg-red-100', label: 'Video Lesson' },
    AUDIO: { icon: Music, color: 'text-purple-600 bg-purple-100', label: 'Audio Lesson' },
    PDF: { icon: FileText, color: 'text-red-600 bg-red-100', label: 'PDF Document' },
    WORD: { icon: FileText, color: 'text-blue-600 bg-blue-100', label: 'Word Document' },
    TEXT: { icon: Type, color: 'text-green-600 bg-green-100', label: 'Text Notes' },
    IMAGE: { icon: Image, color: 'text-pink-600 bg-pink-100', label: 'Image' },
  };

  const config = typeConfig[resource.type] || typeConfig.TEXT;
  const Icon = config.icon;

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6">
      <div className="flex items-start gap-4 mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${config.color}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1">{resource.title}</h3>
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full uppercase">
            {resource.type}
          </span>
          {resource.description && (
            <p className="text-sm text-gray-500 mt-2">{resource.description}</p>
          )}
        </div>
      </div>

      {/* Video Player */}
      {resource.type === 'VIDEO' && resource.fileUrl && (
        <div className="rounded-xl overflow-hidden bg-black">
          <video
            controls
            controlsList="nodownload"
            disablePictureInPicture
            className="w-full max-h-[480px]"
            preload="metadata"
          >
            <source src={resource.fileUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      )}

      {/* Audio Player */}
      {resource.type === 'AUDIO' && resource.fileUrl && (
        <div className="rounded-xl overflow-hidden bg-gray-50 p-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
              <PlayCircle className="w-8 h-8 text-purple-600" />
            </div>
            <div className="flex-1">
              <audio
                controls
                controlsList="nodownload"
                className="w-full"
                preload="metadata"
              >
                <source src={resource.fileUrl} type="audio/mpeg" />
                Your browser does not support the audio tag.
              </audio>
            </div>
          </div>
        </div>
      )}

      {/* PDF as Image */}
      {resource.type === 'PDF' && resource.imageUrl && (
        <div className="rounded-xl overflow-hidden border border-gray-100">
          <img
            src={resource.imageUrl}
            alt={resource.title}
            className="w-full max-h-[600px] object-contain bg-gray-50"
          />
          <div className="p-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
            <p className="text-xs text-gray-500">PDF preview — first page</p>
            {resource.fileUrl && (
              <a
                href={resource.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary-600 hover:text-primary-700"
              >
                Open original
              </a>
            )}
          </div>
        </div>
      )}

      {/* PDF fallback if no imageUrl */}
      {resource.type === 'PDF' && !resource.imageUrl && resource.fileUrl && (
        <div className="rounded-xl overflow-hidden border border-gray-100">
          <img
            src={resource.fileUrl}
            alt={resource.title}
            className="w-full max-h-[600px] object-contain bg-gray-50"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
              (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
            }}
          />
          <div className="hidden p-8 text-center text-gray-500">
            <p>Preview not available.</p>
            {resource.fileUrl && (
              <a
                href={resource.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-600 hover:text-primary-700"
              >
                Open original
              </a>
            )}
          </div>
        </div>
      )}

      {/* Word Document Text */}
      {resource.type === 'WORD' && (
        <div className="rounded-xl border border-gray-100">
          {resource.textContent ? (
            <div className="max-h-[500px] overflow-y-auto p-6 bg-white">
              <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans leading-relaxed">
                {resource.textContent}
              </pre>
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              <Type className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p>No extracted text available for this document.</p>
              {resource.fileUrl && (
                <a
                  href={resource.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:text-primary-700"
                >
                  Open original
                </a>
              )}
            </div>
          )}
        </div>
      )}

      {/* Plain Text */}
      {resource.type === 'TEXT' && resource.textContent && (
        <div className="rounded-xl border border-gray-100">
          <div className="max-h-[500px] overflow-y-auto p-6 bg-white">
            <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans leading-relaxed">
              {resource.textContent}
            </pre>
          </div>
        </div>
      )}

      {/* Generic File fallback */}
      {!['VIDEO', 'AUDIO', 'PDF', 'WORD', 'TEXT'].includes(resource.type) && resource.fileUrl && (
        <div className="rounded-xl border border-gray-100 p-6 text-center">
          <p className="text-gray-500 mb-3">This resource type ({resource.type}) requires a direct file view.</p>
          <a
            href={resource.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100"
          >
            Open File
          </a>
        </div>
      )}
    </div>
  );
}
