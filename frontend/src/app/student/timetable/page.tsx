'use client';

import { useEffect, useState } from 'react';
import { Calendar, Clock, MapPin, BookOpen, Bell } from 'lucide-react';
import api from '@/lib/api';

interface TimetableEntry {
  id: string;
  day: string;
  time: string;
  subject: string;
  instructor: string;
  venue: string;
  type: string;
  examType?: string;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const TIME_SLOTS = [
  '08:00 - 09:30',
  '09:30 - 11:00',
  '11:00 - 12:30',
  '12:30 - 14:00',
  '14:00 - 15:30',
];

export default function TimetablePage() {
  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<string>('all');

  useEffect(() => {
    fetchTimetable();
  }, []);

  async function fetchTimetable() {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getTimetable();
      setEntries((data as any).data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch timetable');
    } finally {
      setLoading(false);
    }
  }

  const filtered = selectedDay === 'all' ? entries : entries.filter(e => e.day === selectedDay);

  function getEntriesForDay(day: string) {
    return filtered.filter(e => e.day === day);
  }

  function getEntryForSlot(day: string, time: string) {
    return entries.find(e => e.day === day && e.time === time);
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
          <h1 className="text-2xl font-bold text-gray-900">Timetable</h1>
          <p className="text-gray-600 mt-1">View and manage Timetable</p>
        </div>
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-red-500 text-lg">{error}</p>
          <button
            onClick={fetchTimetable}
            className="mt-4 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const daysToShow = selectedDay === 'all' ? DAYS : DAYS.filter(d => d === selectedDay);
  const hasAnyEntry = DAYS.some(day => getEntriesForDay(day).length > 0);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Timetable</h1>
        <p className="text-gray-600 mt-1">Your class schedule</p>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        <button
          onClick={() => setSelectedDay('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
            selectedDay === 'all'
              ? 'bg-primary-600 text-white'
              : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          All Days
        </button>
        {DAYS.map((day) => (
          <button
            key={day}
            onClick={() => setSelectedDay(day)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              selectedDay === day
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            {day}
          </button>
        ))}
      </div>

      {!hasAnyEntry ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No timetable entries</p>
          <p className="text-gray-400 text-sm mt-1">Your class schedule will appear here</p>
        </div>
      ) : (
        <div className="space-y-6">
          {daysToShow.map((day) => {
            const dayEntries = getEntriesForDay(day);
            if (dayEntries.length === 0) return null;

            return (
              <div key={day} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
                  <h2 className="text-lg font-semibold text-gray-900">{day}</h2>
                  <p className="text-sm text-gray-500">{dayEntries.length} class{dayEntries.length === 1 ? '' : 'es'}</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100">
                        <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600 w-32">Time</th>
                        <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Subject</th>
                        <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Instructor</th>
                        <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Venue</th>
                        <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Type</th>
                      </tr>
                    </thead>
                    <tbody>
                      {TIME_SLOTS.map((timeSlot) => {
                        const entry = getEntryForSlot(day, timeSlot);
                        if (!entry) {
                          return (
                            <tr key={timeSlot} className="border-b border-gray-50">
                              <td className="px-4 py-3 text-sm text-gray-500">{timeSlot}</td>
                              <td className="px-4 py-3 text-sm text-gray-400 italic">Free</td>
                              <td className="px-4 py-3 text-sm text-gray-400">-</td>
                              <td className="px-4 py-3 text-sm text-gray-400">-</td>
                              <td className="px-4 py-3 text-sm text-gray-400">-</td>
                            </tr>
                          );
                        }

                        return (
                          <tr key={entry.id} className="border-b border-gray-50 hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm font-medium text-gray-900 whitespace-nowrap">
                              <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4 text-gray-400" />
                                {entry.time}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                  <BookOpen className="w-4 h-4 text-primary-600" />
                                </div>
                                <span className="text-sm font-medium text-gray-900">{entry.subject}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">{entry.instructor || '-'}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {entry.venue ? (
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-4 h-4 text-gray-400" />
                                  {entry.venue}
                                </span>
                              ) : '-'}
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full flex items-center gap-1 w-fit">
                                <Bell className="w-3 h-3" />
                                {entry.type}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
