'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Save, Plus, Trash2, Edit2, Mail, Phone, MessageCircle } from 'lucide-react';

interface FAQ {
  id?: string;
  question: string;
  answer: string;
}

export default function AdminSupportPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [editingFaqIndex, setEditingFaqIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    supportEmail: '',
    supportPhone: '',
    supportWhatsApp: '',
    faqJson: '[]',
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getSettings();
      const settings = (data as any)?.data || {};
      setFormData({
        supportEmail: settings.supportEmail || '',
        supportPhone: settings.supportPhone || '',
        supportWhatsApp: settings.supportWhatsApp || '',
        faqJson: settings.supportFaqs || '[]',
      });
      try {
        setFaqs(JSON.parse(settings.supportFaqs || '[]'));
      } catch {
        setFaqs([]);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch support settings');
    } finally {
      setLoading(false);
    }
  }

  async function saveSettings(e: React.FormEvent) {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      let parsedFaqs: FAQ[] = [];
      try {
        parsedFaqs = JSON.parse(formData.faqJson);
        if (!Array.isArray(parsedFaqs)) throw new Error('FAQs must be an array');
      } catch (err: any) {
        setError('Invalid FAQ JSON: ' + err.message);
        setSaving(false);
        return;
      }
      setFaqs(parsedFaqs);

      await api.bulkUpdateSettings({
        supportEmail: formData.supportEmail,
        supportPhone: formData.supportPhone,
        supportWhatsApp: formData.supportWhatsApp,
        supportFaqs: JSON.stringify(parsedFaqs),
      });
      setSuccess('Support settings saved successfully');
    } catch (err: any) {
      setError(err.message || 'Failed to save support settings');
    } finally {
      setSaving(false);
    }
  }

  function updateFaqJson() {
    const cleaned = faqs.filter(f => f.question.trim() && f.answer.trim());
    setFormData(prev => ({ ...prev, faqJson: JSON.stringify(cleaned, null, 2) }));
  }

  function addFaq() {
    setFaqs(prev => [...prev, { question: '', answer: '' }]);
    setEditingFaqIndex(faqs.length);
    updateFaqJsonFromState([...faqs, { question: '', answer: '' }]);
  }

  function updateFaq(index: number, field: 'question' | 'answer', value: string) {
    const updated = [...faqs];
    updated[index] = { ...updated[index], [field]: value };
    setFaqs(updated);
    updateFaqJsonFromState(updated);
  }

  function deleteFaq(index: number) {
    const updated = faqs.filter((_, i) => i !== index);
    setFaqs(updated);
    updateFaqJsonFromState(updated);
  }

  function updateFaqJsonFromState(currentFaqs: FAQ[]) {
    setFormData(prev => ({
      ...prev,
      faqJson: JSON.stringify(currentFaqs.filter(f => f.question.trim() && f.answer.trim()), null, 2),
    }));
  }

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
        <h1 className="text-2xl font-bold text-gray-900">Support Settings</h1>
        <p className="text-gray-600 mt-1">Manage support contact details and FAQs</p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">
          {success}
        </div>
      )}

      <form onSubmit={saveSettings} className="space-y-6">
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
          <div className="grid sm:grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Support Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  required
                  value={formData.supportEmail}
                  onChange={(e) => setFormData({ ...formData, supportEmail: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="support@example.com"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Support Phone</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  required
                  value={formData.supportPhone}
                  onChange={(e) => setFormData({ ...formData, supportPhone: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="+234 800 000 0000"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Link</label>
              <div className="relative">
                <MessageCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="url"
                  required
                  value={formData.supportWhatsApp}
                  onChange={(e) => setFormData({ ...formData, supportWhatsApp: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="https://wa.me/2348000000000"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">FAQs</h2>
            <button
              type="button"
              onClick={addFaq}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add FAQ
            </button>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <div key={index} className="border border-gray-100 rounded-lg p-4">
                {editingFaqIndex === index ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={faq.question}
                      onChange={(e) => updateFaq(index, 'question', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                      placeholder="Question"
                    />
                    <textarea
                      value={faq.answer}
                      onChange={(e) => updateFaq(index, 'answer', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                      rows={3}
                      placeholder="Answer"
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => { setEditingFaqIndex(null); updateFaqJson(); }}
                        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => { setEditingFaqIndex(null); }}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{faq.question}</p>
                        <p className="text-sm text-gray-600 mt-1">{faq.answer}</p>
                      </div>
                      <div className="flex gap-2 ml-3">
                        <button
                          type="button"
                          onClick={() => setEditingFaqIndex(index)}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteFaq(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {faqs.length === 0 && (
              <p className="text-center text-gray-500 py-8">No FAQs yet. Click "Add FAQ" to create one.</p>
            )}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
