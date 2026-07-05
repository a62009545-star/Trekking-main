import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, HelpCircle, X, AlertTriangle } from 'lucide-react';
import API from '../../api/axios';

// Must match the category options shown on the public FAQ page's filter bar (minus "All")
const categories = ['Booking', 'Trekking', 'Payment', 'Safety', 'Other'];

const emptyForm = { question: '', answer: '', category: 'Other', order: 0, isActive: true };

const categoryStyles = {
  Booking: 'bg-blue-50 text-blue-700 border-blue-200',
  Trekking: 'bg-green-50 text-green-700 border-green-200',
  Payment: 'bg-purple-50 text-purple-700 border-purple-200',
  Safety: 'bg-red-50 text-red-700 border-red-200',
  Other: 'bg-gray-50 text-gray-600 border-gray-200',
};

const AdminFAQ = () => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const fetchFaqs = async () => {
    try {
      // Note: no admin-only "get all" endpoint exists for FAQs (unlike Packages/Gallery),
      // so this only returns isActive:true entries — a deactivated FAQ won't appear here.
      const res = await API.get('/faq');
      setFaqs(res.data.data);
    } catch (err) {
      toast.error('Failed to load FAQs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  const openCreateModal = () => {
    setEditingId(null);
    setForm({ ...emptyForm, order: faqs.length });
    setModalOpen(true);
  };

  const openEditModal = (faq) => {
    setEditingId(faq._id);
    setForm({
      question: faq.question,
      answer: faq.answer,
      category: faq.category || 'Other',
      order: faq.order ?? 0,
      isActive: faq.isActive,
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.question.trim() || !form.answer.trim()) {
      toast.error('Question and answer are required');
      return;
    }

    setSubmitting(true);
    try {
      if (editingId) {
        const res = await API.put(`/faq/${editingId}`, form);
        setFaqs((prev) => prev.map((f) => (f._id === editingId ? res.data.data : f)));
        toast.success('FAQ updated');
      } else {
        const res = await API.post('/faq', form);
        setFaqs((prev) => [...prev, res.data.data].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));
        toast.success('FAQ created');
      }
      closeModal();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save FAQ');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (faq) => {
    const confirmed = window.confirm(`Delete this FAQ: "${faq.question}"?`);
    if (!confirmed) return;

    setDeletingId(faq._id);
    try {
      await API.delete(`/faq/${faq._id}`);
      setFaqs((prev) => prev.filter((f) => f._id !== faq._id));
      toast.success('FAQ deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete FAQ');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0a1628]">FAQs</h1>
          <p className="text-sm text-gray-400 mt-1">Manage frequently asked questions</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-[#0a1628] text-white font-semibold text-sm px-5 py-2.5 rounded-full hover:bg-[#0f1f38] transition-colors"
        >
          <Plus size={16} />
          Add FAQ
        </button>
      </div>

      {/* Caveat notice */}
      <div className="flex items-start gap-2.5 bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3 mb-6">
        <AlertTriangle size={16} className="text-yellow-600 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-yellow-800">
          If you mark an FAQ as inactive, it will disappear from this list too (the backend only
          exposes active FAQs). To bring it back you'd need direct database access — deactivating
          is effectively the same as deleting until an admin-only list endpoint is added.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse bg-gray-100 rounded-lg h-14" />
            ))}
          </div>
        ) : faqs.length === 0 ? (
          <div className="text-center py-20">
            <HelpCircle size={48} className="mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-500 mb-2">No FAQs yet</h3>
            <p className="text-gray-400 text-sm mb-6">Add your first question to get started.</p>
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 bg-[#0a1628] text-white font-semibold text-sm px-5 py-2.5 rounded-full hover:bg-[#0f1f38] transition-colors"
            >
              <Plus size={16} />
              Add FAQ
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {faqs
              .slice()
              .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
              .map((faq) => (
                <div key={faq._id} className="flex items-start justify-between gap-4 px-6 py-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium border ${
                          categoryStyles[faq.category] || categoryStyles.Other
                        }`}
                      >
                        {faq.category || 'Other'}
                      </span>
                      <p className="text-xs text-gray-400">Order: {faq.order ?? 0}</p>
                    </div>
                    <p className="font-medium text-[#0a1628]">{faq.question}</p>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{faq.answer}</p>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => openEditModal(faq)}
                      className="p-2 rounded-lg text-gray-400 hover:text-[#0a1628] hover:bg-gray-100 transition-colors"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => handleDelete(faq)}
                      disabled={deletingId === faq._id}
                      className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-[#0a1628]">
                {editingId ? 'Edit FAQ' : 'Add FAQ'}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">Question</label>
                <input
                  type="text"
                  value={form.question}
                  onChange={(e) => setForm((f) => ({ ...f, question: e.target.value }))}
                  placeholder="e.g. What should I pack for a trek?"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">Answer</label>
                <textarea
                  value={form.answer}
                  onChange={(e) => setForm((f) => ({ ...f, answer: e.target.value }))}
                  rows={4}
                  placeholder="Write the answer here..."
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent bg-white"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-400 mt-1">
                  Controls which filter tab this FAQ appears under on the public page.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1.5">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={form.order}
                    onChange={(e) => setForm((f) => ({ ...f, order: Number(e.target.value) }))}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                  />
                </div>
                <div className="flex items-end pb-2.5">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.isActive}
                      onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                      className="w-4 h-4 rounded border-gray-300 text-yellow-500 focus:ring-yellow-400"
                    />
                    <span className="text-sm text-gray-600">Active (visible publicly)</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-[#0a1628] text-white font-semibold text-sm py-2.5 rounded-full hover:bg-[#0f1f38] transition-colors disabled:opacity-60"
                >
                  {submitting ? 'Saving...' : editingId ? 'Save Changes' : 'Create FAQ'}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-5 py-2.5 text-sm font-medium text-gray-500 hover:text-gray-700"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFAQ;