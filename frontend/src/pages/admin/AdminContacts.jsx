import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Mail, MailOpen, Trash2, X, Phone, User, Calendar } from 'lucide-react';
import API from '../../api/axios';

const formatDate = (date) =>
  date
    ? new Date(date).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '—';

const AdminContacts = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const fetchContacts = async () => {
    try {
      const res = await API.get('/contact');
      setContacts(res.data.data);
    } catch (err) {
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const openMessage = async (contact) => {
    setSelected(contact);

    if (!contact.isRead) {
      try {
        const res = await API.patch(`/contact/${contact._id}/read`);
        setContacts((prev) =>
          prev.map((c) => (c._id === contact._id ? res.data.data : c))
        );
        setSelected(res.data.data);
      } catch (err) {
        // Non-critical — the modal is still usable even if the read-flag update fails
        console.error(err);
      }
    }
  };

  const handleDelete = async (contact) => {
    const confirmed = window.confirm(`Delete message from "${contact.name}"?`);
    if (!confirmed) return;

    setDeletingId(contact._id);
    try {
      await API.delete(`/contact/${contact._id}`);
      setContacts((prev) => prev.filter((c) => c._id !== contact._id));
      if (selected?._id === contact._id) setSelected(null);
      toast.success('Message deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete message');
    } finally {
      setDeletingId(null);
    }
  };

  const unreadCount = contacts.filter((c) => !c.isRead).length;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#0a1628]">Contact Messages</h1>
        <p className="text-sm text-gray-400 mt-1">
          {unreadCount > 0 ? `${unreadCount} unread message${unreadCount > 1 ? 's' : ''}` : 'All caught up'}
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse bg-gray-100 rounded-lg h-16" />
            ))}
          </div>
        ) : contacts.length === 0 ? (
          <div className="text-center py-20">
            <Mail size={48} className="mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-500 mb-2">No messages yet</h3>
            <p className="text-gray-400 text-sm">Contact form submissions will show up here.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {contacts.map((contact) => (
              <div
                key={contact._id}
                onClick={() => openMessage(contact)}
                className={`flex items-start justify-between gap-4 px-6 py-4 cursor-pointer hover:bg-gray-50 ${
                  !contact.isRead ? 'bg-yellow-50/40' : ''
                }`}
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="mt-0.5 flex-shrink-0">
                    {contact.isRead ? (
                      <MailOpen size={16} className="text-gray-300" />
                    ) : (
                      <Mail size={16} className="text-yellow-500" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p
                        className={`text-sm truncate ${
                          contact.isRead ? 'text-gray-600' : 'text-[#0a1628] font-semibold'
                        }`}
                      >
                        {contact.name}
                      </p>
                      <span className="text-xs text-gray-400 flex-shrink-0">
                        {formatDate(contact.createdAt)}
                      </span>
                    </div>
                    <p
                      className={`text-sm truncate max-w-md ${
                        contact.isRead ? 'text-gray-400' : 'text-gray-600 font-medium'
                      }`}
                    >
                      {contact.subject}
                    </p>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(contact);
                  }}
                  disabled={deletingId === contact._id}
                  className="p-2 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50 flex-shrink-0"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-[#0a1628]">{selected.subject}</h2>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-gray-50 rounded-lg p-4 space-y-1.5 text-sm">
                <div className="flex items-center gap-2 text-[#0a1628] font-medium">
                  <User size={14} className="text-gray-400" />
                  {selected.name}
                </div>
                <div className="flex items-center gap-2 text-gray-500">
                  <Mail size={14} className="text-gray-400" />
                  {selected.email}
                </div>
                <div className="flex items-center gap-2 text-gray-500">
                  <Phone size={14} className="text-gray-400" />
                  {selected.phone}
                </div>
                <div className="flex items-center gap-2 text-gray-500">
                  <Calendar size={14} className="text-gray-400" />
                  {formatDate(selected.createdAt)}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                  Message
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                  {selected.message}
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <a
                  href={`mailto:${selected.email}`}
                  className="flex-1 text-center bg-[#0a1628] text-white font-semibold text-sm py-2.5 rounded-full hover:bg-[#0f1f38] transition-colors"
                >
                  Reply via Email
                </a>
                <button
                  onClick={() => handleDelete(selected)}
                  className="px-5 py-2.5 text-sm font-medium text-red-500 hover:text-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminContacts;