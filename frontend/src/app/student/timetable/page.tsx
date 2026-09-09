'use client';

import { useEffect, useState } from 'react';
import { Calendar, Clock, MapPin } from 'lucide-react';
import { api } from '@/lib/api';

interface TimetableEntry {
  id: string;
  day: string;
  time: string;
  subject: string;
  instructor?: string;
  venue?: string;
  type?: string;
  examType?: string;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export default function StudentTimetablePage() {
  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTimetable();
  }, []);

  async function fetchTimetable() {
    try {
      setLoading(true);
      const data = await api.getTimetable();
      setEntries((data as any).data || []);
    } catch (err: any) {
      console.error('Failed to fetch timetable:', err);
    } finally {
      setLoading(false);
    }
  }

  function formatTime(time: string) {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  }

  function groupByDay(entries: TimetableEntry[]) {
    const grouped: Record<string, TimetableEntry[]> = {};
    DAYS.forEach(day => {
      grouped[day] = entries
        .filter(e => e.day.toLowerCase() === day.toLowerCase())
        .sort((a, b) => a.time.localeCompare(b.time));
    });
    return grouped;
  }

  const grouped = groupByDay(entries);

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
        <h1 className="text-2xl font-bold text-gray-900">Class Timetable</h1>
        <p className="text-gray-600 mt-1">Your weekly class schedule</p>
      </div>

      {entries.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No timetable entries available</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {DAYS.map(day => (
            <div key={day} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900">{day}</h3>
              </div>
              <div className="p-4">
                {grouped[day]?.length > 0 ? (
                  <div className="space-y-3">
                    {grouped[day].map((entry) => (
                      <div key={entry.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600 w-24">
                            <Clock className="w-4 h-4" />
                            {formatTime(entry.time)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{entry.subject}</p>
                            {entry.instructor && (
                              <p className="text-sm text-gray-500">{entry.instructor}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <MapPin className="w-4 h-4" />
                          {entry.venue || '-'}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 py-2">No classes scheduled</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
