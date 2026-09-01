'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Medal, Search, Calendar, ExternalLink, Filter, Plus, X } from 'lucide-react';

interface Scholarship {
  id: string;
  title: string;
  description: string;
  provider: string;
  amount?: number;
  currency: string;
  deadline?: string;
  applicationUrl?: string;
  eligibility: any;
}

export default function ScholarshipsPage() {
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterLevel, setFilterLevel] = useState('all');
  const [error, setError] = useState<string | null>(null);
  const [selectedScholarship, setSelectedScholarship] = useState<Scholarship | null>(null);

  useEffect(() => {
    fetchScholarships();
  }, []);

  async function fetchScholarships() {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getScholarships();
      setScholarships(data.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch scholarships');
    } finally {
      setLoading(false);
    }
  }

  const filtered = scholarships.filter(s => {
    const matchesSearch = s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.provider.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel = filterLevel === 'all' || s.eligibility?.level === filterLevel;
    return matchesSearch && matchesLevel;
  });

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
          <h1 className="text-2xl font-bold text-gray-900">Scholarship Finder</h1>
          <p className="text-gray-600 mt-1">Find scholarships that match your profile</p>
        </div>
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <Medal className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-red-500 text-lg">{error}</p>
          <button
            onClick={fetchScholarships}
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Scholarship Finder</h1>
        <p className="text-gray-600 mt-1">Find scholarships that match your profile</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search scholarships..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <select
          value={filterLevel}
          onChange={(e) => setFilterLevel(e.target.value)}
          className="px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500"
        >
          <option value="all">All Levels</option>
          <option value="undergraduate">Undergraduate</option>
          <option value="secondary">Secondary</option>
          <option value="postgraduate">Postgraduate</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <Medal className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No scholarships found</p>
          <p className="text-gray-400 text-sm mt-1">Check back later for new opportunities</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {filtered.map((scholarship) => (
            <div
              key={scholarship.id}
              className="bg-white rounded-xl border border-gray-100 p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <Medal className="w-6 h-6 text-yellow-600" />
                </div>
                {scholarship.amount && (
                  <span className="text-lg font-bold text-green-600">
                    {scholarship.currency} {scholarship.amount.toLocaleString()}
                  </span>
                )}
              </div>
              <h3 className="font-bold text-gray-900 mb-2">{scholarship.title}</h3>
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{scholarship.description}</p>
              <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                <span>By {scholarship.provider}</span>
                {scholarship.deadline && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(scholarship.deadline).toLocaleDateString()}
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedScholarship(scholarship)}
                  className="flex-1 py-2 bg-primary-50 text-primary-600 rounded-lg text-sm font-medium hover:bg-primary-100"
                >
                  Read More
                </button>
                {scholarship.applicationUrl && (
                  <a
                    href={scholarship.applicationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium text-center hover:bg-primary-700"
                  >
                    Apply Now
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Read More Modal */}
      {selectedScholarship && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedScholarship.title}</h2>
                  <p className="text-gray-500">By {selectedScholarship.provider}</p>
                </div>
                <button
                  onClick={() => setSelectedScholarship(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-600 whitespace-pre-wrap">{selectedScholarship.description}</p>
                </div>

                {selectedScholarship.amount && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Amount</h3>
                    <p className="text-green-600 font-bold text-xl">
                      {selectedScholarship.currency} {selectedScholarship.amount.toLocaleString()}
                    </p>
                  </div>
                )}

                {selectedScholarship.deadline && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Deadline</h3>
                    <p className="text-gray-600">{new Date(selectedScholarship.deadline).toLocaleDateString()}</p>
                  </div>
                )}

                {selectedScholarship.eligibility && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Eligibility</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      {Object.entries(selectedScholarship.eligibility).map(([key, value]) => (
                        <div key={key} className="flex justify-between py-1">
                          <span className="text-gray-500 capitalize">{key}:</span>
                          <span className="text-gray-900">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedScholarship.applicationUrl && (
                  <a
                    href={selectedScholarship.applicationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full py-3 bg-primary-600 text-white rounded-lg text-center font-medium hover:bg-primary-700"
                  >
                    Apply Now
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
