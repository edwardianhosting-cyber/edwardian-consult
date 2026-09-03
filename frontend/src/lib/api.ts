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
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string> || {}),
  };

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
  
  // Results
  getResults: () => fetchAPI('/cbt/results'),
  
  // Leaderboard
  getLeaderboard: (examType?: string) => {
    const query = examType ? `?examType=${encodeURIComponent(examType)}` : '';
    return fetchAPI(`/gamification/leaderboard${query}`);
  },
  
  // Badges
  getBadges: () => fetchAPI('/gamification/badges'),
  getMyBadges: () => fetchAPI('/gamification/my-badges'),
  
  // Study Materials
  getMaterials: () => fetchAPI('/study-material/materials'),
  getMaterialsHierarchy: () => fetchAPI('/study-material/materials/hierarchy'),
  getStudySubject: (id: string) => fetchAPI(`/study-material/subjects/${id}`),
  getStudyTopics: (subjectId: string) => fetchAPI(`/study-material/subjects/${subjectId}/topics`),
  getStudyResources: (topicId: string) => fetchAPI(`/study-material/topics/${topicId}/resources`),
  createMaterial: (data: any) => fetchAPI('/study-material', { method: 'POST', body: JSON.stringify(data) }),
  updateMaterial: (id: string, data: any) => fetchAPI(`/study-material/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteMaterial: (id: string) => fetchAPI(`/study-material/${id}`, { method: 'DELETE' }),
  uploadMaterialFile: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return fetchFormData('/study-material/upload', formData);
  },
  getAssignments: () => fetchAPI('/assignments'),
  getAvailableAssignments: () => fetchAPI('/assignments/available'),
  submitAssignment: (id: string, data: any) => fetchAPI(`/assignments/${id}/submit`, { method: 'POST', body: JSON.stringify(data) }),
  
  // Mock Exams
  getMockExams: () => fetchAPI('/cbt/mock-exams'),
  
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
  submitApplication: (data: any) => fetchAPI('/admission/apply', { method: 'POST', body: JSON.stringify(data) }),
  updateMyApplicationStatus: (id: string, status: string) => fetchAPI(`/admission/my-applications/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  
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
  getPayments: () => fetchAPI('/payments/my-payments'),
  
  // Wallet
  getWalletItems: () => fetchAPI('/wallet'),
  getWalletBalance: () => fetchAPI('/wallet/balance'),
  depositToWallet: (amount: number, reference?: string) => fetchAPI('/wallet/deposit', { method: 'POST', body: JSON.stringify({ amount, reference }) }),
  payFromWallet: (amount: number, description: string, reference?: string) => fetchAPI('/wallet/pay', { method: 'POST', body: JSON.stringify({ amount, description, reference }) }),
  
  // ID Card
  getIDCard: () => fetchAPI('/idcard/id-card'),
  
  // Transcript
  getTranscript: () => fetchAPI('/transcripts/'),
  generateTranscript: () => fetchAPI('/transcripts/generate', { method: 'POST' }),

  // Messages
  getMessages: () => fetchAPI('/email/messages'),

  // Referrals
  getReferrals: () => fetchAPI('/referrals'),
  getReferralStats: () => fetchAPI('/referrals/stats'),
  createReferral: (data: { email: string }) => fetchAPI('/referrals', { method: 'POST', body: JSON.stringify(data) }),

  // JAMB Tools
  getJambSubjects: () => fetchAPI('/jamb/subjects'),
  getJambCombinations: () => fetchAPI('/jamb/combinations'),
  getJambSyllabus: () => fetchAPI('/jamb/syllabus'),
  getJambNews: () => fetchAPI('/jamb/news'),
  getJambDeadlines: () => fetchAPI('/jamb/deadlines'),
  checkJambCombination: (data: any) => fetchAPI('/jamb/check-combination', { method: 'POST', body: JSON.stringify(data) }),
  calculateJambScore: (data: any) => fetchAPI('/jamb/calculate-score', { method: 'POST', body: JSON.stringify(data) }),

  // Documents
  getMyDocuments: () => fetchAPI('/documents/my'),
  uploadDocument: (formData: FormData) => fetchFormData('/documents', formData),

  
  // User
  updateProfile: (data: any) => fetchAPI('/users/profile', { method: 'PATCH', body: JSON.stringify(data) }),
  changePassword: (data: any) => fetchAPI('/users/change-password', { method: 'POST', body: JSON.stringify(data) }),
  
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
  
  // Admin - Stats
  getStats: () => fetchAPI('/users/stats'),
  
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
  uploadQuestionsFile: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return fetchFormData('/questions/bulk-upload', formData);
  },
  getAllQuestions: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetchAPI(`/cbt/questions${query}`);
  },
  
  // Teacher Dashboard
  getTeacherStats: () => fetchAPI('/users/stats'),
  
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
    getSubjects: () => fetchAPI('/study-material/subjects'),
    getSubject: (id: string) => fetchAPI(`/study-material/subjects/${id}`),
    createSubject: (data: any) => fetchAPI('/study-material/subjects', { method: 'POST', body: JSON.stringify(data) }),
    updateSubject: (id: string, data: any) => fetchAPI(`/study-material/subjects/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteSubject: (id: string) => fetchAPI(`/study-material/subjects/${id}`, { method: 'DELETE' }),
    getTopics: (subjectId: string) => fetchAPI(`/study-material/subjects/${subjectId}/topics`),
    createTopic: (data: any) => fetchAPI('/study-material/topics', { method: 'POST', body: JSON.stringify(data) }),
    updateTopic: (id: string, data: any) => fetchAPI(`/study-material/topics/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteTopic: (id: string) => fetchAPI(`/study-material/topics/${id}`, { method: 'DELETE' }),
    getResources: (topicId: string) => fetchAPI(`/study-material/topics/${topicId}/resources`),
    createResource: (data: any) => fetchAPI('/study-material/resources', { method: 'POST', body: JSON.stringify(data) }),
    updateResource: (id: string, data: any) => fetchAPI(`/study-material/resources/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteResource: (id: string) => fetchAPI(`/study-material/resources/${id}`, { method: 'DELETE' }),
  };

// Default export for backward compatibility
export default api;