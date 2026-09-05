'use client';

import { useEffect, useState } from 'react';
import { Search, Eye, Printer, X } from 'lucide-react';
import api from '@/lib/api';

interface Student {
  id: string;
  fullName: string;
  portalId: string;
  email: string;
  programme: string;
  classLevel: string;
  admissionYear: string;
  gender: string;
  state: string;
  avatar: string;
  passportUrl: string;
}

interface IDCardData {
  front: {
    schoolName: string;
    schoolShort: string;
    cardType: string;
    passportUrl: string | null;
    fullName: string;
    studentId: string;
    programme: string;
    classLevel: string;
    dateOfBirth: string;
    validUntil: string;
    qrCode: string;
    gender: string;
    state: string;
  };
  back: {
    studentId: string;
    fullName: string;
    programme: string;
    classLevel: string;
    targetCourse: string;
    targetInstitution: string;
    phone: string;
    email: string;
    address: string;
    state: string;
    lga: string;
    emergencyContact: string;
    registrationDate: string;
    validUntil: string;
    verificationUrl: string;
  };
  verification: {
    isValid: boolean;
    studentName: string;
    studentId: string;
    status: string;
    programme: string;
  };
}

export default function AdminIDCardsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [years, setYears] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);
  const [idCardData, setIdCardData] = useState<IDCardData | null>(null);
  const [loadingCard, setLoadingCard] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, [selectedYear]);

  async function fetchStudents() {
    try {
      setLoading(true);
      const data = await api.adminGetStudentsForIDCards({ year: selectedYear || undefined, search: searchQuery || undefined });
      const result = data.data || {};
      setStudents(result.students || []);
      setYears(result.years || []);
    } catch (err: any) {
      console.error('Failed to fetch students:', err);
    } finally {
      setLoading(false);
    }
  }

  async function viewIDCard(student: Student) {
    setViewingStudent(student);
    setLoadingCard(true);
    try {
      const data = await api.adminGetStudentIDCard(student.id);
      setIdCardData(data.data || null);
    } catch (err: any) {
      alert(err.message || 'Failed to load ID card');
    } finally {
      setLoadingCard(false);
    }
  }

  function printIDCard() {
    window.print();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">ID Cards</h1>
        <p className="text-gray-600 mt-1">View and print student ID cards</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or portal ID..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); }}
              onKeyDown={(e) => { if (e.key === 'Enter') fetchStudents(); }}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Years</option>
            {years.map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          <button
            onClick={fetchStudents}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Search
          </button>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : students.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500">No students found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Student</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Portal ID</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Programme</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Class</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Year</th>
                  <th className="text-right px-4 py-3 text-sm font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {student.avatar || student.passportUrl ? (
                          <img src={student.avatar || student.passportUrl} alt="" className="w-8 h-8 rounded-full object-cover" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-500">
                            {student.fullName.charAt(0)}
                          </div>
                        )}
                        <span className="text-sm font-medium text-gray-900">{student.fullName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{student.portalId}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{student.programme || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{student.classLevel || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{student.admissionYear || '-'}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => viewIDCard(student)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm"
                      >
                        <Eye className="w-4 h-4" />
                        View ID Card
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ID Card Modal */}
      {viewingStudent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">ID Card - {viewingStudent.fullName}</h2>
              <div className="flex gap-2">
                <button
                  onClick={printIDCard}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  Print
                </button>
                <button onClick={() => { setViewingStudent(null); setIdCardData(null); }} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="p-6">
              {loadingCard ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                </div>
              ) : idCardData ? (
                <div id="id-card-print" className="space-y-6">
                  {/* Front */}
                  <div className="border-2 border-gray-200 rounded-xl p-6 bg-white">
                    <div className="text-center border-b pb-4 mb-4">
                      <h3 className="text-xl font-bold text-gray-900">{idCardData.front.schoolName}</h3>
                      <p className="text-sm text-gray-500">STUDENT ID CARD</p>
                    </div>
                    <div className="flex gap-6">
                      <div className="flex-shrink-0">
                        {idCardData.front.passportUrl ? (
                          <img src={idCardData.front.passportUrl} alt="Passport" className="w-24 h-32 object-cover rounded-lg border" />
                        ) : (
                          <div className="w-24 h-32 bg-gray-100 rounded-lg border flex items-center justify-center text-gray-400 text-xs">
                            No Photo
                          </div>
                        )}
                      </div>
                      <div className="flex-1 space-y-2 text-sm">
                        <div><span className="font-medium">Name:</span> {idCardData.front.fullName}</div>
                        <div><span className="font-medium">ID:</span> {idCardData.front.studentId}</div>
                        <div><span className="font-medium">Programme:</span> {idCardData.front.programme}</div>
                        <div><span className="font-medium">Class:</span> {idCardData.front.classLevel}</div>
                        <div><span className="font-medium">Gender:</span> {idCardData.front.gender}</div>
                        <div><span className="font-medium">State:</span> {idCardData.front.state}</div>
                        <div><span className="font-medium">Valid Until:</span> {idCardData.front.validUntil}</div>
                      </div>
                      <div className="flex-shrink-0">
                        <img src={idCardData.front.qrCode} alt="QR" className="w-24 h-24" />
                      </div>
                    </div>
                  </div>

                  {/* Back */}
                  <div className="border-2 border-gray-200 rounded-xl p-6 bg-white">
                    <div className="text-center border-b pb-4 mb-4">
                      <h3 className="text-xl font-bold text-gray-900">ID Card - Back</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div><span className="font-medium">Phone:</span> {idCardData.back.phone}</div>
                      <div><span className="font-medium">Email:</span> {idCardData.back.email}</div>
                      <div><span className="font-medium">Address:</span> {idCardData.back.address}</div>
                      <div><span className="font-medium">LGA:</span> {idCardData.back.lga}</div>
                      <div><span className="font-medium">Emergency:</span> {idCardData.back.emergencyContact}</div>
                      <div><span className="font-medium">Registered:</span> {idCardData.back.registrationDate}</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-16">
                  <p className="text-gray-500">Failed to load ID card</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
