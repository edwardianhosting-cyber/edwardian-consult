'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Eye, EyeOff, Loader2, Save, X, GripVertical } from 'lucide-react';

interface ContactCard {
  id: string;
  title: string;
  description: string | null;
  icon: string | null;
  link: string;
  linkType: string;
  order: number;
  isActive: boolean;
  sectionId: string;
}

interface ContactSection {
  id: string;
  title: string;
  slug: string;
  order: number;
  isActive: boolean;
  cards: ContactCard[];
}

import { contactApi } from '@/lib/api';

const iconOptions = ['Phone', 'MessageCircle', 'Mail', 'ExternalLink'];
const linkTypeOptions = ['phone', 'whatsapp', 'email', 'url'];

export default function AdminContactPage() {
  const [sections, setSections] = useState<ContactSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSection, setEditingSection] = useState<ContactSection | null>(null);
  const [editingCard, setEditingCard] = useState<ContactCard | null>(null);
  const [isCreatingSection, setIsCreatingSection] = useState(false);
  const [isCreatingCard, setIsCreatingCard] = useState(false);
  const [selectedSectionId, setSelectedSectionId] = useState<string>('');

  const emptySection = { title: '', slug: '', order: 0, isActive: true };
  const emptyCard = { title: '', description: '', icon: 'Phone', link: '', linkType: 'url', order: 0, isActive: true, sectionId: '' };

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    try {
      const res = await contactApi.getAllAdmin();
      if (res.data.success) {
        setSections(res.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch sections:', error);
    } finally {
      setLoading(false);
    }
  };

  // Section handlers
  const handleCreateSection = () => {
    setEditingSection({ ...emptySection, id: '', cards: [] } as ContactSection);
    setIsCreatingSection(true);
  };

  const handleSaveSection = async () => {
    if (!editingSection) return;
    try {
      if (isCreatingSection) {
        await contactApi.createSection(editingSection);
      } else {
        await contactApi.updateSection(editingSection.id, editingSection);
      }
      setEditingSection(null);
      setIsCreatingSection(false);
      fetchSections();
    } catch (error) {
      console.error('Failed to save section:', error);
    }
  };

  const handleDeleteSection = async (id: string) => {
    if (!confirm('Delete this section and all its cards?')) return;
    try {
      await contactApi.deleteSection(id);
      fetchSections();
    } catch (error) {
      console.error('Failed to delete section:', error);
    }
  };

  // Card handlers
  const handleCreateCard = (sectionId: string) => {
    setEditingCard({ ...emptyCard, id: '', sectionId } as ContactCard);
    setIsCreatingCard(true);
    setSelectedSectionId(sectionId);
  };

  const handleSaveCard = async () => {
    if (!editingCard) return;
    try {
      if (isCreatingCard) {
        await contactApi.createCard(editingCard);
      } else {
        await contactApi.updateCard(editingCard.id, editingCard);
      }
      setEditingCard(null);
      setIsCreatingCard(false);
      fetchSections();
    } catch (error) {
      console.error('Failed to save card:', error);
    }
  };

  const handleDeleteCard = async (id: string) => {
    if (!confirm('Delete this card?')) return;
    try {
      await contactApi.deleteCard(id);
      fetchSections();
    } catch (error) {
      console.error('Failed to delete card:', error);
    }
  };

  const toggleSectionActive = async (section: ContactSection) => {
    try {
      await contactApi.updateSection(section.id, { ...section, isActive: !section.isActive });
      fetchSections();
    } catch (error) {
      console.error('Failed to toggle section:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <Loader2 className="h-10 w-10 text-primary-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Manage Contact</h1>
              <p className="text-sm text-gray-500 mt-1">Create sections and cards for the contact page</p>
            </div>
            <button
              onClick={handleCreateSection}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent-500 text-primary-900 font-semibold rounded-xl hover:bg-accent-400 transition-all"
            >
              <Plus className="h-5 w-5" />
              Add Section
            </button>
          </div>
        </div>
      </div>

      {/* Section Edit Modal */}
      {editingSection && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {isCreatingSection ? 'Create Section' : 'Edit Section'}
              </h2>
              <button onClick={() => setEditingSection(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                <input
                  type="text"
                  value={editingSection.title || ''}
                  onChange={(e) => setEditingSection({ ...editingSection, title: e.target.value })}
                  className="input-field"
                  placeholder="e.g., Mobile Calls"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Order</label>
                <input
                  type="number"
                  value={editingSection.order || 0}
                  onChange={(e) => setEditingSection({ ...editingSection, order: Number(e.target.value) })}
                  className="input-field"
                />
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={editingSection.isActive !== false}
                  onChange={(e) => setEditingSection({ ...editingSection, isActive: e.target.checked })}
                  className="w-5 h-5 rounded border-gray-300"
                />
                <label className="text-sm font-medium text-gray-700">Active</label>
              </div>
            </div>
            <div className="p-6 border-t flex justify-end gap-3">
              <button onClick={() => setEditingSection(null)} className="px-5 py-2.5 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
              <button onClick={handleSaveSection} className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent-500 text-primary-900 font-semibold rounded-xl hover:bg-accent-400">
                <Save className="h-4 w-4" /> Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Card Edit Modal */}
      {editingCard && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {isCreatingCard ? 'Create Card' : 'Edit Card'}
              </h2>
              <button onClick={() => setEditingCard(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                <input
                  type="text"
                  value={editingCard.title || ''}
                  onChange={(e) => setEditingCard({ ...editingCard, title: e.target.value })}
                  className="input-field"
                  placeholder="e.g., Call Us"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <input
                  type="text"
                  value={editingCard.description || ''}
                  onChange={(e) => setEditingCard({ ...editingCard, description: e.target.value })}
                  className="input-field"
                  placeholder="e.g., Speak directly with our team"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Link *</label>
                <input
                  type="text"
                  value={editingCard.link || ''}
                  onChange={(e) => setEditingCard({ ...editingCard, link: e.target.value })}
                  className="input-field"
                  placeholder="tel:+2348000000000 or mailto:info@example.com"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Icon</label>
                  <select
                    value={editingCard.icon || 'Phone'}
                    onChange={(e) => setEditingCard({ ...editingCard, icon: e.target.value })}
                    className="input-field"
                  >
                    {iconOptions.map((icon) => (
                      <option key={icon} value={icon}>{icon}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Link Type</label>
                  <select
                    value={editingCard.linkType || 'url'}
                    onChange={(e) => setEditingCard({ ...editingCard, linkType: e.target.value })}
                    className="input-field"
                  >
                    {linkTypeOptions.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Order</label>
                <input
                  type="number"
                  value={editingCard.order || 0}
                  onChange={(e) => setEditingCard({ ...editingCard, order: Number(e.target.value) })}
                  className="input-field"
                />
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={editingCard.isActive !== false}
                  onChange={(e) => setEditingCard({ ...editingCard, isActive: e.target.checked })}
                  className="w-5 h-5 rounded border-gray-300"
                />
                <label className="text-sm font-medium text-gray-700">Active</label>
              </div>
            </div>
            <div className="p-6 border-t flex justify-end gap-3">
              <button onClick={() => setEditingCard(null)} className="px-5 py-2.5 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
              <button onClick={handleSaveCard} className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent-500 text-primary-900 font-semibold rounded-xl hover:bg-accent-400">
                <Save className="h-4 w-4" /> Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sections List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {sections.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border">
            <p className="text-gray-500 mb-4">No contact sections yet. Create your first section!</p>
            <button onClick={handleCreateSection} className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent-500 text-primary-900 font-semibold rounded-xl">
              <Plus className="h-5 w-5" /> Add Section
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {sections.map((section) => (
              <div key={section.id} className={`bg-white rounded-xl border overflow-hidden ${!section.isActive ? 'opacity-60' : ''}`}>
                {/* Section Header */}
                <div className="p-4 bg-gray-50 border-b flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <GripVertical className="h-5 w-5 text-gray-400" />
                    <h3 className="font-semibold text-gray-900">{section.title}</h3>
                    <span className="text-xs text-gray-400">({section.cards.length} cards)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleSectionActive(section)}
                      className={`p-2 rounded-lg ${section.isActive ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'}`}
                    >
                      {section.isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={() => { setEditingSection(section); setIsCreatingSection(false); }}
                      className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteSection(section.id)}
                      className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleCreateCard(section.id)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-accent-500 text-primary-900 text-sm font-medium rounded-lg hover:bg-accent-400"
                    >
                      <Plus className="h-3 w-3" /> Card
                    </button>
                  </div>
                </div>

                {/* Cards List */}
                {section.cards.length > 0 && (
                  <div className="divide-y">
                    {section.cards.map((card) => (
                      <div key={card.id} className={`p-4 flex items-center gap-4 ${!card.isActive ? 'opacity-50' : ''}`}>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900">{card.title}</span>
                            <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded">{card.linkType}</span>
                          </div>
                          {card.description && <p className="text-sm text-gray-500 truncate">{card.description}</p>}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => { setEditingCard(card); setIsCreatingCard(false); }}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteCard(card.id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
