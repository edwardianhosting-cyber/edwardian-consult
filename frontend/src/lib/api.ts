export const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000')
  .replace(/\/api$/, '')
  .replace(/\/+$/, '') + '/api';

// NEXT_PUBLIC_API_URL must be set at BUILD time (in .env.local for dev, or in
// your host's environment variables for production — e.g. Vercel project
// settings). If it's missing, every request silently falls back to
// localhost:5000, which will never work once the site isn't running on the
// same machine as the API — this is the #1 cause of "Failed to fetch" on a
// deployed site.
if (typeof window !== 'undefined' && !process.env.NEXT_PUBLIC_API_URL) {
  console.warn(
    `[api] NEXT_PUBLIC_API_URL is not set — falling back to ${API_BASE}. ` +
    `Set NEXT_PUBLIC_API_URL in your environment (and redeploy) if this isn't running locally.`
  );
}

function describeNetworkError(err: unknown): Error {
  // A raw TypeError with no HTTP status means fetch never got a response at
  // all: wrong URL, server unreachable/down, or the browser blocked it (most
  // commonly a CORS rejection, which fetch reports as this same generic
  // error with no further detail).
  if (err instanceof TypeError) {
    return new Error(
      `Failed to fetch. Could not reach the API at ${API_BASE}. Check that: ` +
      `(1) the backend server is running and reachable, ` +
      `(2) NEXT_PUBLIC_API_URL is set correctly for this environment, and ` +
      `(3) the backend's CORS allow-list (FRONTEND_URL) includes this site's origin.`
    );
  }
  return err instanceof Error ? err : new Error('Request failed');
}

async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  const isFormData = options.body instanceof FormData;
  const headers: Record<string, string> = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string> || {}),
  };

  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });
  } catch (err) {
    throw describeNetworkError(err);
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || 'Request failed');
  }

  return res.json();
}

async function fetchFormData(endpoint: string, formData: FormData) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers,
      body: formData,
    });
  } catch (err) {
    throw describeNetworkError(err);
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || 'Request failed');
  }

  return res.json();
}

export const api = {
  // Auth
  getProfile: () => fetchAPI('/auth/me'),
  
  // CBT
  getQuestions: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetchAPI(`/cbt/questions${query}`);
  },
  generateCBT: (data: any) => fetchAPI('/cbt/generate', { method: 'POST', body: JSON.stringify(data) }),
  submitCBT: (examId: string, answers: any, type = 'PRACTICE') => fetchAPI(`/cbt/submit/${examId}`, { method: 'POST', body: JSON.stringify({ answers, type }) }),
  getCBTResults: (page = 1, type?: string) => {
    const query = type ? `?page=${page}&type=${type}` : `?page=${page}`;
    return fetchAPI(`/cbt/results${query}`);
  },
  getCBTResult: (id: string) => fetchAPI(`/cbt/results/${id}`),
  getMockResults: () => api.getCBTResults(1, 'MOCK'),
  getPerformance: () => fetchAPI('/cbt/performance'),
  
  // Notifications
  getNotifications: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetchAPI(`/notifications${query}`);
  },
  getRecentNotifications: (limit = 5) => fetchAPI(`/notifications/recent?limit=${limit}`),
  markNotificationRead: (id: string) => fetchAPI(`/notifications/${id}/read`, { method: 'PATCH' }),
  markAllNotificationsRead: () => fetchAPI('/notifications/read-all', { method: 'PATCH' }),
  updateNotificationPreferences: (prefs: any) => fetchAPI('/notifications/preferences', { method: 'PATCH', body: JSON.stringify(prefs) }),
  getNotificationPreferences: () => fetchAPI('/notifications/preferences'),
  sendNotification: (data: any) => fetchAPI('/notifications/admin/send', { method: 'POST', body: JSON.stringify(data) }),

  // Push notifications
  getVapidPublicKey: () => fetchAPI('/notifications/push/vapid-public-key'),
  subscribePush: (subscription: PushSubscriptionJSON) => fetchAPI('/notifications/push/subscribe', { method: 'POST', body: JSON.stringify({ subscription }) }),
  unsubscribePush: (endpoint: string) => fetchAPI('/notifications/push/unsubscribe', { method: 'POST', body: JSON.stringify({ endpoint }) }),
  sendTestPush: () => fetchAPI('/notifications/push/test', { method: 'POST' }),
  
  // Results
  getResults: () => fetchAPI('/cbt/results'),
  
  // Leaderboard
  getLeaderboard: (limit?: number, examType?: string) => {
    const query = new URLSearchParams();
    if (limit) query.set('limit', String(limit));
    if (examType) query.set('examType', examType);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return fetchAPI(`/gamification/leaderboard${qs}`);
  },
  getMyRank: () => fetchAPI('/gamification/rank'),
  
  // Badges
  getBadges: () => fetchAPI('/gamification/badges'),
  getMyBadges: () => fetchAPI('/gamification/my-badges'),
  adminGetAllBadges: () => fetchAPI('/gamification/admin/badges'),
  adminCreateBadge: (data: any) => fetchAPI('/gamification/admin/badges', { method: 'POST', body: JSON.stringify(data) }),
  adminUpdateBadge: (id: string, data: any) => fetchAPI(`/gamification/admin/badges/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  adminDeleteBadge: (id: string) => fetchAPI(`/gamification/admin/badges/${id}`, { method: 'DELETE' }),
  
  // Study Materials
  getMaterials: () => fetchAPI('/study-material/materials'),
  getMaterialsHierarchy: (examType?: string) => {
    const query = examType ? `?examType=${encodeURIComponent(examType)}` : '';
    return fetchAPI(`/study-material/materials/hierarchy${query}`);
  },
  getStudySubject: (id: string) => fetchAPI(`/study-material/subjects/${id}`),
  getStudyTopics: (subjectId: string) => fetchAPI(`/study-material/subjects/${subjectId}/topics`),
  getStudyResources: (topicId: string) => fetchAPI(`/study-material/topics/${topicId}/resources`),
  createMaterial: (data: any) => fetchAPI('/study-material', { method: 'POST', body: JSON.stringify(data) }),
  updateMaterial: (id: string, data: any) => fetchAPI(`/study-material/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteMaterial: (id: string) => fetchAPI(`/study-material/${id}`, { method: 'DELETE' }),
  uploadMaterialFile: (file: File, options?: { type?: string; topicId?: string; title?: string; description?: string; order?: number }) => {
    const formData = new FormData();
    formData.append('file', file);
    if (options?.type) formData.append('type', options.type);
    if (options?.topicId) formData.append('topicId', options.topicId);
    if (options?.title) formData.append('title', options.title);
    if (options?.description) formData.append('description', options.description);
    if (options?.order !== undefined) formData.append('order', String(options.order));
    return fetchFormData('/study-material/upload', formData);
  },
  getAssignments: () => fetchAPI('/assignments'),
  getAvailableAssignments: () => fetchAPI('/assignments/available'),
  submitAssignment: (id: string, data: any) => fetchAPI(`/assignments/${id}/submit`, { method: 'POST', body: JSON.stringify(data) }),
  
  // Mock Exams
  getMockExams: () => fetchAPI('/cbt/mock-exams'),
  startMockExam: (examId: string) => fetchAPI(`/cbt/mock-exams/${examId}/start`, { method: 'POST' }),
  getAllMockExams: () => fetchAPI('/cbt/mock-exams/admin/all'),
  
  // Admin - CBT
  adminGetAllMockExams: () => fetchAPI('/cbt/admin/mock-exams'),
  adminGetCBTStats: () => fetchAPI('/cbt/admin/stats'),
  adminGetAllCBTResults: (page = 1, limit = 20) => {
    const query = `?page=${page}&limit=${limit}`;
    return fetchAPI(`/cbt/admin/results${query}`);
  },
  
  // Study Planner
  getStudyPlans: () => fetchAPI('/study/plans'),
  getTodayTasks: () => fetchAPI('/study/today-tasks'),
  completeTask: (taskId: string) => fetchAPI(`/study/tasks/${taskId}/complete`, { method: 'PATCH' }),
  
  // Subjects
  getMySubjects: () => fetchAPI('/study/my-subjects'),
  updateMySubjects: (subjects: string[]) => fetchAPI('/study/my-subjects', { method: 'PUT', body: JSON.stringify({ subjects }) }),
  
  // Study Schedules
  getStudySchedules: () => fetchAPI('/study-schedules'),
  createStudySchedule: (data: any) => fetchAPI('/study-schedules', { method: 'POST', body: JSON.stringify(data) }),
  updateStudySchedule: (id: string, data: any) => fetchAPI(`/study-schedules/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteStudySchedule: (id: string) => fetchAPI(`/study-schedules/${id}`, { method: 'DELETE' }),
  completeStudySchedule: (id: string) => fetchAPI(`/study-schedules/${id}/complete`, { method: 'PATCH' }),
  
  // Timetable
  getTimetable: () => fetchAPI('/timetable'),
  getAllTimetableEntries: () => fetchAPI('/timetable/admin/all'),
  createTimetableEntry: (data: any) => fetchAPI('/timetable', { method: 'POST', body: JSON.stringify(data) }),
  updateTimetableEntry: (id: string, data: any) => fetchAPI(`/timetable/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteTimetableEntry: (id: string) => fetchAPI(`/timetable/${id}`, { method: 'DELETE' }),
  
  // Admission
  getAdmissionStatus: () => fetchAPI('/admission/tracker'),
  getAdmissionHub: () => fetchAPI('/admission/hub'),
  getInstitutions: () => fetchAPI('/admission/institutions'),
  getAdmissionAnnouncements: () => fetchAPI('/admission/announcements'),
  submitApplication: (data: any) => fetchAPI('/admission/apply', { method: 'POST', body: JSON.stringify(data) }),
  updateMyApplicationStatus: (id: string, status: string) => fetchAPI(`/admission/my-applications/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  
  // Admin - Admission
  adminCreateInstitution: (data: any) => fetchAPI('/admission/institutions', { method: 'POST', body: JSON.stringify(data) }),
  adminUpdateInstitution: (id: string, data: any) => fetchAPI(`/admission/institutions/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  adminDeleteInstitution: (id: string) => fetchAPI(`/admission/institutions/${id}`, { method: 'DELETE' }),
  adminCreateCourse: (data: any) => fetchAPI('/admission/courses', { method: 'POST', body: JSON.stringify(data) }),
  adminUpdateCourse: (id: string, data: any) => fetchAPI(`/admission/courses/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  adminDeleteCourse: (id: string) => fetchAPI(`/admission/courses/${id}`, { method: 'DELETE' }),
  adminGetAllCourses: (params?: { institutionId?: string; search?: string }) => {
    const query = params ? '?' + new URLSearchParams(params as any).toString() : '';
    return fetchAPI(`/admission/courses${query}`);
  },
  adminGetAdmissionAnnouncements: () => fetchAPI('/admission/announcements'),
  adminGetAdmissionAnnouncement: (id: string) => fetchAPI(`/admission/announcements/${id}`),
  adminCreateAdmissionAnnouncement: (data: any) => fetchAPI('/admission/announcements', { method: 'POST', body: JSON.stringify(data) }),
  adminUpdateAdmissionAnnouncement: (id: string, data: any) => fetchAPI(`/admission/announcements/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  adminDeleteAdmissionAnnouncement: (id: string) => fetchAPI(`/admission/announcements/${id}`, { method: 'DELETE' }),
  
  // Upload
  uploadImage: (file: File, folder?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder || 'uploads');
    return fetchAPI('/upload/image', { method: 'POST', body: formData });
  },
  
  // Campaigns
  getCampaigns: () => fetchAPI('/campaigns'),
  createCampaign: (data: any) => fetchAPI('/campaigns', { method: 'POST', body: JSON.stringify(data) }),
  updateCampaign: (id: string, data: any) => fetchAPI(`/campaigns/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCampaign: (id: string) => fetchAPI(`/campaigns/${id}`, { method: 'DELETE' }),
  sendCampaign: (id: string) => fetchAPI(`/campaigns/${id}/send`, { method: 'POST' }),
  
  // Scholarships
  getScholarships: () => fetchAPI('/scholarships'),
  createScholarship: (data: any) => fetchAPI('/scholarships', { method: 'POST', body: JSON.stringify(data) }),
  deleteScholarship: (id: string) => fetchAPI(`/scholarships/${id}`, { method: 'DELETE' }),
  
  // Career
  getCareers: () => fetchAPI('/careers'),
  getCareer: (id: string) => fetchAPI(`/careers/${id}`),
  createCareer: (data: any) => fetchAPI('/careers', { method: 'POST', body: JSON.stringify(data) }),
  updateCareer: (id: string, data: any) => fetchAPI(`/careers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCareer: (id: string) => fetchAPI(`/careers/${id}`, { method: 'DELETE' }),
  matchCareers: (subjects: string[]) => fetchAPI('/careers/match', { method: 'POST', body: JSON.stringify({ subjects }) }),
  
  // News
  getNews: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetchAPI(`/news${query}`);
  },
  getNewsForStudent: (programme?: string) => {
    const params: Record<string, string> = { forStudent: 'true' };
    if (programme) params.programme = programme;
    const query = '?' + new URLSearchParams(params).toString();
    return fetchAPI(`/news${query}`);
  },
  getNewsBySlug: (slug: string) => fetchAPI(`/news/${slug}`),
  createNews: (data: any) => fetchAPI('/news', { method: 'POST', body: JSON.stringify(data) }),
  updateNews: (id: string, data: any) => fetchAPI(`/news/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteNews: (id: string) => fetchAPI(`/news/${id}`, { method: 'DELETE' }),
  getAllNews: () => fetchAPI('/news/admin/all'),
  
  // Notices
  getNotices: () => fetchAPI('/notices'),
  getAllNotices: () => fetchAPI('/notices/all'),
  createNotice: (data: any) => fetchAPI('/notices', { method: 'POST', body: JSON.stringify(data) }),
  updateNotice: (id: string, data: any) => fetchAPI(`/notices/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteNotice: (id: string) => fetchAPI(`/notices/${id}`, { method: 'DELETE' }),
  
  // Payments
  getPayments: () => fetchAPI('/payments/'),
  getPayment: (id: string) => fetchAPI(`/payments/${id}`),
  getPaymentsAdmin: (page = 1, limit = 20, status?: string) => {
    const query = status ? `?page=${page}&limit=${limit}&status=${encodeURIComponent(status)}` : `?page=${page}&limit=${limit}`;
    return fetchAPI(`/payments/admin/all${query}`);
  },
  
  // Wallet
  getWalletItems: () => fetchAPI('/wallet'),
  getWalletBalance: () => fetchAPI('/wallet/balance'),
  depositToWallet: (amount: number, reference?: string) => fetchAPI('/wallet/deposit', { method: 'POST', body: JSON.stringify({ amount, reference }) }),
  payFromWallet: (amount: number, description: string, reference?: string) => fetchAPI('/wallet/pay', { method: 'POST', body: JSON.stringify({ amount, description, reference }) }),
  getAdminWalletItems: (params?: { type?: string }) => {
    const query = params?.type ? `?type=${encodeURIComponent(params.type)}` : '';
    return fetchAPI(`/wallet/admin/all${query}`);
  },
  getAdminWalletMonthly: () => fetchAPI('/wallet/admin/monthly'),
  getAdminWalletStats: () => fetchAPI('/wallet/admin/stats'),
  
  // ID Card
  getIDCard: () => fetchAPI('/idcard/id-card'),
  adminGetStudentsForIDCards: (params?: { year?: string; search?: string }) => {
    const query = params?.year ? `?year=${encodeURIComponent(params.year)}${params.search ? `&search=${encodeURIComponent(params.search)}` : ''}` : '';
    return fetchAPI(`/idcard/admin/students${query}`);
  },
  adminGetStudentIDCard: (id: string) => fetchAPI(`/idcard/admin/students/${id}/id-card`),
  
  // Transcript
  getTranscript: () => fetchAPI('/transcripts/'),
  generateTranscript: () => fetchAPI('/transcripts/generate', { method: 'POST' }),

  // Messages
  getMessages: () => fetchAPI('/email/messages'),

  // Referrals
  getReferrals: () => fetchAPI('/referrals'),
  getReferralStats: () => fetchAPI('/referrals/stats'),
  createReferral: (data: { email: string }) => fetchAPI('/referrals', { method: 'POST', body: JSON.stringify(data) }),
  applyReferralCode: (code: string) => fetchAPI('/referrals/apply', { method: 'POST', body: JSON.stringify({ code }) }),

  // JAMB Tools
  getJambSubjects: () => fetchAPI('/jamb/subjects'),
  getJambCombinations: () => fetchAPI('/jamb/combinations'),
  getJambSyllabus: () => fetchAPI('/jamb/syllabus'),
  getJambNews: () => fetchAPI('/jamb/news'),
  getJambDeadlines: () => fetchAPI('/jamb/deadlines'),
  checkJambCombination: (data: any) => fetchAPI('/jamb/check-combination', { method: 'POST', body: JSON.stringify(data) }),
  calculateJambScore: (data: any) => fetchAPI('/jamb/calculate-score', { method: 'POST', body: JSON.stringify(data) }),

  // Admin - JAMB
  adminGetJambDeadlines: () => fetchAPI('/jamb/admin/deadlines'),
  adminCreateJambDeadline: (data: any) => fetchAPI('/jamb/admin/deadlines', { method: 'POST', body: JSON.stringify(data) }),
  adminUpdateJambDeadline: (id: string, data: any) => fetchAPI(`/jamb/admin/deadlines/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  adminDeleteJambDeadline: (id: string) => fetchAPI(`/jamb/admin/deadlines/${id}`, { method: 'DELETE' }),
  adminGetJambSubjects: () => fetchAPI('/jamb/admin/subjects'),
  adminCreateJambSubject: (data: any) => fetchAPI('/jamb/admin/subjects', { method: 'POST', body: JSON.stringify(data) }),
  adminUpdateJambSubject: (id: string, data: any) => fetchAPI(`/jamb/admin/subjects/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  adminDeleteJambSubject: (id: string) => fetchAPI(`/jamb/admin/subjects/${id}`, { method: 'DELETE' }),
  bulkUploadJambSubjects: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return fetchFormData('/jamb/admin/subjects/bulk', formData);
  },
  adminGetJambSyllabus: () => fetchAPI('/jamb/admin/syllabus'),
  adminCreateJambSyllabus: (data: any) => fetchAPI('/jamb/admin/syllabus', { method: 'POST', body: JSON.stringify(data) }),
  adminUpdateJambSyllabus: (id: string, data: any) => fetchAPI(`/jamb/admin/syllabus/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  adminDeleteJambSyllabus: (id: string) => fetchAPI(`/jamb/admin/syllabus/${id}`, { method: 'DELETE' }),

  // Documents
  getMyDocuments: () => fetchAPI('/documents/my'),
  uploadDocument: (formData: FormData) => fetchFormData('/documents', formData),

  
  // User
  updateProfile: (data: any) => fetchAPI('/users/profile', { method: 'PATCH', body: JSON.stringify(data) }),
  changePassword: (data: any) => fetchAPI('/users/change-password', { method: 'POST', body: JSON.stringify(data) }),
  uploadAvatar: (file: File) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return fetchFormData('/users/avatar', formData);
  },
  
  // Admin - Users
  getUsers: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetchAPI(`/users${query}`);
  },
  getStudent: (id: string) => fetchAPI(`/users/students/${id}`),
  updateStudent: (id: string, data: any) => fetchAPI(`/users/students/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  resetParentCode: (id: string) => fetchAPI(`/users/students/${id}/reset-parent-code`, { method: 'POST' }),
  createUser: (data: any) => fetchAPI('/users', { method: 'POST', body: JSON.stringify(data) }),
  updateUser: (id: string, data: any) => fetchAPI(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteUser: (id: string) => fetchAPI(`/users/${id}`, { method: 'DELETE' }),
  resetUserPassword: (id: string, password?: string) => fetchAPI(`/users/${id}/reset-password`, { method: 'POST', body: JSON.stringify({ password }) }),
  
  // Admin - Stats
  getStats: () => fetchAPI('/analytics/stats'),
  getAnalyticsStats: () => fetchAPI('/analytics/stats'),
  getAnalyticsTimeSeries: (range: '7d' | '30d' | '90d') => fetchAPI(`/analytics/timeseries?range=${range}`),
  
  // Admin - Settings
  getSettings: () => fetchAPI('/settings'),
  updateSetting: (key: string, value: string) => fetchAPI(`/settings/${key}`, { method: 'PUT', body: JSON.stringify({ value }) }),
  bulkUpdateSettings: (data: Record<string, string>) => fetchAPI('/settings/bulk', { method: 'POST', body: JSON.stringify(data) }),
  
  // Admin - Study Subjects
  getStudySubjects: () => fetchAPI('/study-material/subjects'),
  
  // Admin - Programs
  getAllPrograms: () => fetchAPI('/programs/admin/all'),
  
  // Questions
  uploadQuestionImage: (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    return fetchFormData('/questions/upload-image', formData);
  },
  uploadQuestionsFile: (file: File, defaults?: { subject?: string; examType?: string; institution?: string; year?: number }) => {
    const formData = new FormData();
    formData.append('file', file);
    if (defaults) {
      Object.entries(defaults).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          formData.append(key, String(value));
        }
      });
    }
    return fetchFormData('/questions/bulk-upload', formData);
  },
  uploadQuestionsJson: (questions: any[], defaults?: { subject?: string; examType?: string; institution?: string; year?: number }) => {
    return fetchAPI('/questions/bulk-upload-json', { method: 'POST', body: JSON.stringify({ questions, defaults }) });
  },
  getAllQuestions: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetchAPI(`/cbt/questions${query}`);
  },
  
  // Teacher Dashboard
  getTeacherStats: () => fetchAPI('/users/teacher-stats'),
  
  // Assignments
  createAssignment: (data: any) => fetchAPI('/assignments', { method: 'POST', body: JSON.stringify(data) }),
  updateAssignment: (id: string, data: any) => fetchAPI(`/assignments/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteAssignment: (id: string) => fetchAPI(`/assignments/${id}`, { method: 'DELETE' }),
  publishAssignment: (id: string) => fetchAPI(`/assignments/${id}/publish`, { method: 'PATCH' }),
  unpublishAssignment: (id: string) => fetchAPI(`/assignments/${id}/unpublish`, { method: 'PATCH' }),
  
  // Mock Exams
  createMockExam: (data: any) => fetchAPI('/cbt/mock-exams', { method: 'POST', body: JSON.stringify(data) }),
  updateMockExam: (id: string, data: any) => fetchAPI(`/cbt/mock-exams/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteMockExam: (id: string) => fetchAPI(`/cbt/mock-exams/${id}`, { method: 'DELETE' }),
  publishMockExam: (id: string) => fetchAPI(`/cbt/mock-exams/${id}/publish`, { method: 'PATCH' }),
  unpublishMockExam: (id: string) => fetchAPI(`/cbt/mock-exams/${id}/unpublish`, { method: 'PATCH' }),
  getMockExamQuestions: (examId: string) => fetchAPI(`/cbt/mock-exams/${examId}/questions`),
  addQuestionsToMockExam: (examId: string, questionIds: string[]) => fetchAPI(`/cbt/mock-exams/${examId}/questions`, { method: 'POST', body: JSON.stringify({ questionIds }) }),
  uploadQuestionsToMockExam: (examId: string, questions: any[]) => fetchAPI(`/cbt/mock-exams/${examId}/upload`, { method: 'POST', body: JSON.stringify({ questions }) }),
  removeQuestionFromMockExam: (examId: string, questionId: string) => fetchAPI(`/cbt/mock-exams/${examId}/questions/${questionId}`, { method: 'DELETE' }),
  
  // Students
  getStudents: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetchAPI(`/users/students${query}`);
  },
  
  // Attendance
  getAttendance: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetchAPI(`/attendance${query}`);
  },
  markAttendance: (data: any) => fetchAPI('/attendance', { method: 'POST', body: JSON.stringify(data) }),
  
  // Questions
  createQuestion: (data: any) => fetchAPI('/questions', { method: 'POST', body: JSON.stringify(data) }),
  updateQuestion: (id: string, data: any) => fetchAPI(`/questions/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteQuestion: (id: string) => fetchAPI(`/questions/${id}`, { method: 'DELETE' }),
  downloadQuestionSample: (format = 'excel') => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return fetch(`${API_BASE}/questions/sample?format=${format}`, { headers }).then(res => res.blob());
  },
};

// Auth API (login, register)
export const authApi = {
  login: (data: { email: string; password: string }) =>
    fetchAPI('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  parentLogin: (data: { portalId: string; accessCode: string }) =>
    fetchAPI('/auth/parent-login', { method: 'POST', body: JSON.stringify(data) }),
  register: (data: any) =>
    fetchAPI('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  logout: () => fetchAPI('/auth/logout', { method: 'POST' }),
  getProfile: () => fetchAPI('/auth/me'),
  forgotPassword: (data: { email: string }) =>
    fetchAPI('/auth/forgot-password', { method: 'POST', body: JSON.stringify(data) }),
  resetPassword: (data: { token: string; password: string }) =>
    fetchAPI('/auth/reset-password', { method: 'POST', body: JSON.stringify(data) }),
};

// Contact API
export const contactApi = {
  getAll: () => fetchAPI('/contact'),
  getAllAdmin: () => fetchAPI('/contact/admin'),
  createSection: (data: any) => fetchAPI('/contact/sections', { method: 'POST', body: JSON.stringify(data) }),
  updateSection: (id: string, data: any) => fetchAPI(`/contact/sections/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteSection: (id: string) => fetchAPI(`/contact/sections/${id}`, { method: 'DELETE' }),
  createCard: (data: any) => fetchAPI('/contact/cards', { method: 'POST', body: JSON.stringify(data) }),
  updateCard: (id: string, data: any) => fetchAPI(`/contact/cards/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCard: (id: string) => fetchAPI(`/contact/cards/${id}`, { method: 'DELETE' }),
};

  // Programs API
  export const programApi = {
    getAll: () => fetchAPI('/programs'),
    getBySlug: (slug: string) => fetchAPI(`/programs/${slug}`),
    create: (data: any) => fetchAPI('/programs', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => fetchAPI(`/programs/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => fetchAPI(`/programs/${id}`, { method: 'DELETE' }),
    getAllAdmin: () => fetchAPI('/programs/admin/all'),
  };
  
  // Study Subjects API
  export const studyApi = {
    getSubjects: (params?: { examType?: string }) => {
      const query = params?.examType ? `?examType=${encodeURIComponent(params.examType)}` : '';
      return fetchAPI(`/study-material/subjects${query}`);
    },
    getSubject: (id: string) => fetchAPI(`/study-material/subjects/${id}`),
    createSubject: (data: any) => fetchAPI('/study-material/subjects', { method: 'POST', body: JSON.stringify(data) }),
    updateSubject: (id: string, data: any) => fetchAPI(`/study-material/subjects/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteSubject: (id: string) => fetchAPI(`/study-material/subjects/${id}`, { method: 'DELETE' }),
    uploadSyllabus: (subjectId: string, file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      return fetchFormData(`/study-material/subjects/${subjectId}/syllabus`, formData);
    },
    uploadSyllabusText: (subjectId: string, text: string, examType?: string) => fetchAPI(`/study-material/subjects/${subjectId}/syllabus-text`, { method: 'POST', body: JSON.stringify({ text, examType }) }),
    uploadTopicsCsv: (subjectId: string, file: File, examType?: string) => {
      const formData = new FormData();
      formData.append('file', file);
      if (examType) {
        formData.append('examType', examType);
      }
      return fetchFormData(`/study-material/subjects/${subjectId}/topics/csv`, formData);
    },
    uploadTopicsJson: (subjectId: string, jsonText: string, examType?: string) => fetchAPI(`/study-material/subjects/${subjectId}/topics/json`, { method: 'POST', body: JSON.stringify({ topics: JSON.parse(jsonText), examType }) }),
    getTopics: (subjectId: string) => fetchAPI(`/study-material/subjects/${subjectId}/topics`),
    createTopic: (data: any) => fetchAPI('/study-material/topics', { method: 'POST', body: JSON.stringify(data) }),
    updateTopic: (id: string, data: any) => fetchAPI(`/study-material/topics/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteTopic: (id: string) => fetchAPI(`/study-material/topics/${id}`, { method: 'DELETE' }),
    getResources: (topicId: string) => fetchAPI(`/study-material/resources/${topicId}`),
    createResource: (data: any) => fetchAPI('/study-material/resources', { method: 'POST', body: JSON.stringify(data) }),
    updateResource: (id: string, data: any) => fetchAPI(`/study-material/resources/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteResource: (id: string) => fetchAPI(`/study-material/resources/${id}`, { method: 'DELETE' }),
    uploadFile: (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      return fetchFormData('/study-material/upload', formData);
    },
    getAllMaterials: () => fetchAPI('/study-material/all'),
  };

// Default export for backward compatibility
export default api;