'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Search, MapPin, CheckCircle, XCircle, ExternalLink } from 'lucide-react';

interface InstitutionMatch {
  institution: {
    name: string;
    abbreviation?: string;
    type: string;
    location?: string;
    state?: string;
  };
  course: string;
  utmeCutoff?: number;
  meetsRequirement: boolean;
  olevelRequirements?: string;
  jambSubjects: string[];
  postUtmeRequired: boolean;
  postUtmeCutoff?: number;
  applicationFee?: number;
  deadline?: string;
}

export default function ApplicationsPage() {
  const [matches, setMatches] = useState<InstitutionMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMatches();
  }, []);

  async function fetchMatches() {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getInstitutions();
      setMatches(data.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch applications');
    } finally {
      setLoading(false);
    }
  }

  const filteredMatches = matches.filter(m =>
    m.institution.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.course.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          <h1 className="text-2xl font-bold text-gray-900">My Applications</h1>
          <p className="text-gray-600 mt-1">View and manage My Applications</p>
        </div>
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-red-500 text-lg">{error}</p>
          <button
            onClick={fetchMatches}
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
        <h1 className="text-2xl font-bold text-gray-900">My Applications</h1>
        <p className="text-gray-600 mt-1">View and manage My Applications</p>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search institutions or courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      {filteredMatches.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No applications yet</p>
          <p className="text-gray-400 text-sm mt-1">Find institutions to apply to</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {filteredMatches.map((match, index) => (
            <div
              key={index}
              className={`bg-white rounded-xl border p-6 hover:shadow-lg transition-shadow ${
                match.meetsRequirement ? 'border-green-200' : 'border-gray-100'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-bold text-gray-900">{match.institution.name}</h3>
                  {match.institution.abbreviation && (
                    <p className="text-sm text-gray-500">({match.institution.abbreviation})</p>
                  )}
                </div>
                {match.meetsRequirement ? (
                  <span className="flex items-center gap-1 text-green-600 text-sm font-medium bg-green-50 px-3 py-1 rounded-full">
                    <CheckCircle className="w-4 h-4" />
                    Eligible
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-red-600 text-sm font-medium bg-red-50 px-3 py-1 rounded-full">
                    <XCircle className="w-4 h-4" />
                    Below Cutoff
                  </span>
                )}
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Course:</span>
                  <span className="font-medium text-gray-900">{match.course}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Type:</span>
                  <span className="text-gray-900">{match.institution.type}</span>
                </div>
                {match.institution.location && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Location:</span>
                    <span className="text-gray-900">{match.institution.location}, {match.institution.state}</span>
                  </div>
                )}
                {match.utmeCutoff && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">UTME Cutoff:</span>
                    <span className="font-medium text-gray-900">{match.utmeCutoff}</span>
                  </div>
                )}
                {match.postUtmeRequired && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Post-UTME:</span>
                    <span className="text-gray-900">Required {match.postUtmeCutoff && `(${match.postUtmeCutoff}%)`}</span>
                  </div>
                )}
                {match.applicationFee && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Application Fee:</span>
                    <span className="text-gray-900">₦{match.applicationFee.toLocaleString()}</span>
                  </div>
                )}
                {match.deadline && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Deadline:</span>
                    <span className="text-gray-900">{new Date(match.deadline).toLocaleDateString()}</span>
                  </div>
                )}
              </div>

              {match.jambSubjects.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-500 mb-2">Required JAMB Subjects:</p>
                  <div className="flex flex-wrap gap-1">
                    {match.jambSubjects.map((subject, i) => (
                      <span key={i} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                        {subject}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <button className="mt-4 w-full py-2 bg-primary-50 text-primary-600 rounded-lg text-sm font-medium hover:bg-primary-100 flex items-center justify-center gap-2">
                <ExternalLink className="w-4 h-4" />
                View Details
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
