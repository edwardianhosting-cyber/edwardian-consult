'use client';

import { useState, useEffect } from 'react';
import { Upload, FileText, Image, CheckCircle, XCircle, Loader2, Download } from 'lucide-react';
import { api, API_BASE } from '@/lib/api';

interface Question {
  id: string;
  subject: string;
  text: string;
  imageUrl?: string;
}

export default function QuestionUpload() {
  const [bulkFile, setBulkFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [bulkResult, setBulkResult] = useState<{ created: number; errors: string[] } | null>(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  useEffect(() => {
    fetchQuestions();
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

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] || null;
    setImageFile(file);
    setUploadedUrl(null);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  }

  async function handleImageUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!imageFile) return;

    setImageLoading(true);
    try {
      const response = await api.uploadQuestionImage(imageFile);
      setUploadedUrl(response.data.url);
    } catch (error: any) {
      alert(error.message || 'Failed to upload image');
    } finally {
      setImageLoading(false);
    }
  }

  async function handleBulkUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!bulkFile) return;

    setBulkLoading(true);
    setBulkResult(null);
    try {
      const response = await api.uploadQuestionsFile(bulkFile);
      setBulkResult(response.data);
      await fetchQuestions();
    } catch (error: any) {
      alert(error.message || 'Failed to upload file');
    } finally {
      setBulkLoading(false);
    }
  }

  async function downloadSample(format: 'csv' | 'excel') {
    try {
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE}/questions/sample`, {
        headers,
      });

      if (!res.ok) throw new Error('Failed to download sample');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `questions-sample.${format === 'excel' ? 'xlsx' : 'csv'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error: any) {
      alert(error.message || 'Failed to download sample');
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary-600" />
            Upload Questions (CSV or Excel)
          </h3>
          <form onSubmit={handleBulkUpload} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Question File
              </label>
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={(e) => setBulkFile(e.target.files?.[0] || null)}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
              />
              <p className="text-xs text-gray-500 mt-1">
                Supported formats: CSV (.csv) or Excel (.xlsx, .xls)
              </p>
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
            <p className="text-xs text-gray-500 mt-2">
              Required columns: subject, examType, institution, year, topic, difficulty, text, options, correctOption, explanation
            </p>
            <p className="text-xs text-gray-500">
              Options should be pipe-separated (e.g., Option A|Option B|Option C|Option D)
            </p>
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

        <div className="bg-white rounded-xl border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Image className="h-5 w-5 text-primary-600" />
            Upload Question Image
          </h3>
          <form onSubmit={handleImageUpload} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image File
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
              />
            </div>
            {imagePreview && (
              <div className="mt-2">
                <img src={imagePreview} alt="Preview" className="h-40 w-auto rounded-lg border" />
              </div>
            )}
            <button
              type="submit"
              disabled={!imageFile || imageLoading}
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
                  Upload Image
                </>
              )}
            </button>
          </form>

          {uploadedUrl && (
            <div className="mt-4 p-4 rounded-lg border border-green-200 bg-green-50">
              <div className="flex items-center gap-2 text-green-700 mb-2">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">Image Uploaded</span>
              </div>
              <p className="text-sm text-gray-600 break-all">{uploadedUrl}</p>
              <p className="text-xs text-gray-500 mt-1">Use this URL in the imageUrl column when uploading questions via CSV/Excel.</p>
            </div>
          )}
        </div>
      </div>

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
