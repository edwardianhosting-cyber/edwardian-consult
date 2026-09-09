'use client';

import { useState, useEffect } from 'react';
import { Upload, FileText, Image, CheckCircle, Loader2, Download, Copy, Check } from 'lucide-react';
import { api, API_BASE } from '@/lib/api';

interface Question {
  id: string;
  subject: string;
  text: string;
  imageUrl?: string;
}

interface Institution {
  id: string;
  name: string;
  abbreviation?: string;
}

export default function QuestionUpload() {
  const [bulkFile, setBulkFile] = useState<File | null>(null);
  const [bulkResult, setBulkResult] = useState<{ created: number; errors: string[] } | null>(null);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [imageLoading, setImageLoading] = useState(false);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [years, setYears] = useState<number[]>([]);
  const [defaults, setDefaults] = useState({
    subject: '',
    examType: 'JAMB',
    institution: '',
    year: new Date().getFullYear(),
    topic: '',
  });
  const [questionsJsonText, setQuestionsJsonText] = useState('');
  const [uploadingQuestionsJson, setUploadingQuestionsJson] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  useEffect(() => {
    fetchQuestions();
    fetchSubjects();
    fetchInstitutions();
    fetchYears();
  }, []);

  async function fetchQuestions() {
    setLoadingQuestions(true);
    try {
      const response = await api.getAllQuestions({ limit: '100' });
      setQuestions(response.data || []);
    } catch (error) {
      console.error('Failed to fetch questions:', error);
    } finally {
      setLoadingQuestions(false);
    }
  }

  async function fetchSubjects() {
    try {
      const response = await api.getStudySubjects();
      const data = response?.data || [];
      const subjectNames = data.map((s: any) => s.name).filter(Boolean);
      setSubjects(subjectNames);
    } catch (error) {
      console.error('Failed to fetch subjects:', error);
      setSubjects([]);
    }
  }

  async function fetchInstitutions() {
    try {
      const response = await api.getInstitutions();
      setInstitutions(response.data || []);
    } catch (error) {
      console.error('Failed to fetch institutions:', error);
    }
  }

  async function fetchYears() {
    try {
      const response = await api.getAllQuestions({ limit: '1000' });
      const data = response.data || [];
      const uniqueYears = Array.from(new Set(data.map((q: any) => q.year).filter(Boolean))) as number[];
      setYears(uniqueYears);
    } catch (error) {
      console.error('Failed to fetch years:', error);
      setYears([]);
    }
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    setImageFiles(files);
    setImageUrls([]);
    setImagePreviews(files.map(file => URL.createObjectURL(file)));
  }

  async function handleImageUpload() {
    if (!imageFiles.length) return;

    setImageLoading(true);
    try {
      const uploaded = await Promise.all(
        imageFiles.map(file => api.uploadQuestionImage(file))
      );
      const urls = uploaded.map(r => r.data.url);
      setImageUrls(urls);
    } catch (error: any) {
      alert(error.message || 'Failed to upload some images');
    } finally {
      setImageLoading(false);
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    setCopiedUrl(text);
    setTimeout(() => setCopiedUrl(null), 2000);
  }

  async function handleBulkUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!bulkFile) return;

    setBulkLoading(true);
    setBulkResult(null);
    try {
      const response = await api.uploadQuestionsFile(bulkFile, {
        subject: defaults.subject || undefined,
        examType: defaults.examType || undefined,
        institution: defaults.institution || undefined,
        year: defaults.year || undefined,
        topic: defaults.topic || undefined,
      });
      setBulkResult(response.data);
      await fetchQuestions();
    } catch (error: any) {
      alert(error.message || 'Failed to upload file');
    } finally {
      setBulkLoading(false);
    }
  }

  async function handleQuestionsJsonUpload() {
    if (!questionsJsonText.trim()) return;
    setUploadingQuestionsJson(true);
    setBulkResult(null);
    try {
      const questions = JSON.parse(questionsJsonText);
      const response = await api.uploadQuestionsJson(Array.isArray(questions) ? questions : [questions], {
        subject: defaults.subject || undefined,
        examType: defaults.examType || undefined,
        institution: defaults.institution || undefined,
        year: defaults.year || undefined,
        topic: defaults.topic || undefined,
      });
      setBulkResult(response.data);
      setQuestionsJsonText('');
      await fetchQuestions();
    } catch (error: any) {
      alert(error.message || 'Failed to upload JSON questions');
    } finally {
      setUploadingQuestionsJson(false);
    }
  }

  async function downloadSample(format: 'csv' | 'excel') {
    try {
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE}/questions/sample?format=${format}`, {
        headers,
      });

      if (!res.ok) throw new Error('Failed to download sample');

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `questions-sample.${format === 'excel' ? 'xlsx' : 'csv'}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error: any) {
      alert(error.message || 'Failed to download sample');
    }
  }

  return (
    <div className="space-y-6">
      {/* Question Settings */}
      <div className="bg-white rounded-xl border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Question Settings</h3>
        <p className="text-xs text-gray-500 mb-4">These settings will be applied to all uploaded questions. The file should only contain question, options, answer, explanation, and optional imageUrl.</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">University / Institution</label>
             <select
               value={defaults.institution}
               onChange={(e) => setDefaults({ ...defaults, institution: e.target.value })}
               className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
             >
               <option value="">All Institutions</option>
               {institutions.map((inst) => (
                 <option key={inst.id} value={inst.name}>{inst.name}</option>
               ))}
             </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
            <select
              value={defaults.subject}
              onChange={(e) => setDefaults({ ...defaults, subject: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Select subject...</option>
              {subjects.map((subject) => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Exam Type</label>
            <select
              value={defaults.examType}
              onChange={(e) => setDefaults({ ...defaults, examType: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="JAMB">JAMB</option>
              <option value="WAEC">WAEC</option>
              <option value="NECO">NECO</option>
              <option value="POST-UTME">POST-UTME</option>
              <option value="MOCK">MOCK</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
            <select
              value={defaults.year}
              onChange={(e) => setDefaults({ ...defaults, year: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Select year...</option>
              {years.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Topic (optional)</label>
            <input
              type="text"
              value={defaults.topic}
              onChange={(e) => setDefaults({ ...defaults, topic: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
              placeholder="e.g. Algebra"
            />
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* CSV / Excel Upload */}
        <div className="bg-white rounded-xl border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary-600" />
            Upload Questions (CSV or Excel)
          </h3>
          <form onSubmit={handleBulkUpload} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Question File</label>
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={(e) => setBulkFile(e.target.files?.[0] || null)}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
              />
              <p className="text-xs text-gray-500 mt-1">Supported formats: CSV (.csv) or Excel (.xlsx, .xls)</p>
            </div>
            <button
              type="submit"
              disabled={!bulkFile || bulkLoading}
              className="w-full btn-primary disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {bulkLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Upload File
                </>
              )}
            </button>
          </form>

          <div className="mt-4 p-4 rounded-lg border border-gray-200 bg-gray-50">
            <p className="text-sm font-medium text-gray-700 mb-2">Need a template?</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => downloadSample('csv')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary-700 bg-white border border-gray-200 rounded-lg hover:bg-primary-50"
              >
                <Download className="h-3.5 w-3.5" />
                Sample CSV
              </button>
              <button
                type="button"
                onClick={() => downloadSample('excel')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary-700 bg-white border border-gray-200 rounded-lg hover:bg-primary-50"
              >
                <Download className="h-3.5 w-3.5" />
                Sample Excel
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">File columns: <strong>question</strong>, <strong>options</strong>, <strong>answer</strong>, <strong>explanation</strong>, <strong>imageUrl</strong> (optional).</p>
            <p className="text-xs text-gray-500">Options should be pipe-separated (e.g., Option A|Option B|Option C|Option D).</p>
            <p className="text-xs text-gray-500">Answer is the 0-based index of the correct option (0 = first option).</p>
          </div>

          {bulkResult && (
            <div className="mt-4 p-4 rounded-lg border">
              <div className="flex items-center gap-2 text-green-700 mb-2">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">File Processed</span>
              </div>
              <p className="text-sm text-gray-600">Created: {bulkResult.created} questions</p>
              {bulkResult.errors.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm font-medium text-red-700">Errors:</p>
                  <ul className="text-xs text-red-600 list-disc list-inside max-h-40 overflow-y-auto">
                    {bulkResult.errors.map((err, idx) => (
                      <li key={idx}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* JSON Upload */}
        <div className="bg-white rounded-xl border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary-600" />
            Upload Questions via JSON
          </h3>
          <p className="text-xs text-gray-500 mb-2">Paste a JSON array of questions. Only question fields are needed; settings above are applied automatically.</p>
          <textarea
            value={questionsJsonText}
            onChange={(e) => setQuestionsJsonText(e.target.value)}
            rows={10}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 mb-3 font-mono text-xs"
            placeholder={`Paste JSON here, for example:\n[\n  {\n    "text": "What is the capital of Nigeria?",\n    "options": ["Lagos", "Abuja", "Port Harcourt", "Kano"],\n    "correctOption": 1,\n    "explanation": "Abuja is the capital."\n  }\n]`}
          />
          <div className="flex items-center gap-2 mb-3">
            <button
              type="button"
              onClick={() => {
                const sample = [
                  {
                    text: 'What is the value of x in 2x + 5 = 15?',
                    options: ['7', '8', '9', '10'],
                    correctOption: 1,
                    explanation: 'Subtract 5 from both sides then divide by 2.',
                  },
                  {
                    text: 'Choose the correct option: She ___ to school every day.',
                    options: ['go', 'goes', 'going', 'gone'],
                    correctOption: 1,
                    explanation: 'Third person singular present tense adds -es.',
                  },
                ];
                setQuestionsJsonText(JSON.stringify(sample, null, 2));
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary-700 bg-white border border-gray-200 rounded-lg hover:bg-primary-50"
            >
              <Download className="h-3.5 w-3.5" />
              Load Sample JSON
            </button>
            <span className="text-xs text-gray-500">Click to load a sample into the textarea.</span>
          </div>
          <button
            type="button"
            onClick={handleQuestionsJsonUpload}
            disabled={uploadingQuestionsJson || !questionsJsonText.trim()}
            className="w-full btn-primary disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {uploadingQuestionsJson ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Uploading JSON...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Upload Questions JSON
              </>
            )}
          </button>
          <p className="text-xs text-gray-500 mt-2">Supported fields: text, options, correctOption, explanation, imageUrl.</p>
        </div>
      </div>

      {/* Image Upload */}
      <div className="bg-white rounded-xl border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Image className="h-5 w-5 text-primary-600" />
          Upload Question Images
        </h3>
        <p className="text-xs text-gray-500 mb-3">Upload images and copy the generated URLs into the imageUrl column in your CSV/Excel or JSON.</p>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageChange}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 mb-3"
        />
        {imagePreviews.length > 0 && (
          <div className="grid grid-cols-4 gap-2 mb-3">
            {imagePreviews.map((src, idx) => (
              <img key={idx} src={src} alt="" className="h-20 w-full object-cover rounded border" />
            ))}
          </div>
        )}
        <button
          type="button"
          onClick={handleImageUpload}
          disabled={!imageFiles.length || imageLoading}
          className="w-full btn-primary disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {imageLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4" />
              Upload Image{imageFiles.length > 1 ? 's' : ''}
            </>
          )}
        </button>
        {imageUrls.length > 0 && (
          <div className="mt-4 p-4 rounded-lg border border-green-200 bg-green-50">
            <div className="flex items-center gap-2 text-green-700 mb-2">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">Image{imageUrls.length > 1 ? 's' : ''} Uploaded</span>
            </div>
            <p className="text-xs text-gray-500 mb-2">Copy these URLs into the imageUrl column in your CSV/Excel or JSON.</p>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {imageUrls.map((url, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <img src={url} alt="" className="h-8 w-8 object-cover rounded border" />
                  <p className="text-xs text-gray-600 break-all flex-1">{url}</p>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(url)}
                    className="p-1 text-gray-400 hover:text-primary-600"
                    title="Copy URL"
                  >
                    {copiedUrl === url ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Recent Questions */}
      <div className="bg-white rounded-xl border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Questions</h3>
        {loadingQuestions ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        ) : questions.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-8">No questions found. Upload a file to get started.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-3 font-medium text-gray-700">ID</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-700">Subject</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-700">Text</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-700">Image</th>
                </tr>
              </thead>
              <tbody>
                {questions.map((q) => (
                  <tr key={q.id} className="border-b last:border-0">
                    <td className="py-2 px-3 text-gray-600 font-mono text-xs">{q.id}</td>
                    <td className="py-2 px-3 text-gray-900">{q.subject}</td>
                    <td className="py-2 px-3 text-gray-600 max-w-md truncate">{q.text}</td>
                    <td className="py-2 px-3">
                      {q.imageUrl ? (
                        <img src={q.imageUrl} alt="" className="h-10 w-10 object-cover rounded border" />
                      ) : (
                        <span className="text-xs text-gray-400">None</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
