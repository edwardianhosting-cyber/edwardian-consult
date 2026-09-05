'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { ArrowLeft, Calendar, Eye, Tag } from 'lucide-react';

interface NewsArticle {
  id: string;
  title: string;
  category: string;
  content: string;
  excerpt?: string;
  coverImage?: string;
  viewCount: number;
  createdAt: string;
}

export default function JambNewsDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (slug) {
      fetchArticle();
    }
  }, [slug]);

  async function fetchArticle() {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getNewsBySlug(slug);
      if (data.data) {
        setArticle(data.data);
      } else {
        setError('Article not found');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch article');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-16">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Article Not Found</h1>
          <p className="text-gray-600 mb-6">{error || 'The article you are looking for does not exist.'}</p>
          <Link href="/student/jamb" className="text-primary-600 hover:underline">
            Back to JAMB Centre
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Link
        href="/student/jamb"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to JAMB Centre
      </Link>

      <article className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {article.coverImage && (
          <img
            src={article.coverImage}
            alt={article.title}
            className="w-full h-64 object-cover"
          />
        )}
        <div className="p-8">
          <div className="flex items-center gap-4 mb-4">
            <span className="text-sm bg-primary-50 text-primary-700 px-3 py-1 rounded-full font-medium">
              {article.category}
            </span>
            <span className="text-sm text-gray-400 flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {new Date(article.createdAt).toLocaleDateString('en-NG', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </span>
            <span className="text-sm text-gray-400 flex items-center gap-1">
              <Eye className="w-4 h-4" />
              {article.viewCount} views
            </span>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-6">{article.title}</h1>

          {article.excerpt && (
            <p className="text-lg text-gray-600 mb-6 italic border-l-4 border-primary-500 pl-4">
              {article.excerpt}
            </p>
          )}

          <div className="prose prose-lg max-w-none">
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{article.content}</p>
          </div>
        </div>
      </article>
    </div>
  );
}
