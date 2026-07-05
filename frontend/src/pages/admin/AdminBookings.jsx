import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  CalendarCheck,
  X,
  User,
  Mail,
  Phone,
  MapPin,
  Users,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import API from '../../api/axios';

const statusFilters = ['All', 'Pending', 'Approved', 'Cancelled', 'Completed'];

const statusStyles = {
  Pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  Approved: 'bg-green-50 text-green-700 border-green-200',
  Cancelled: 'bg-red-50 text-red-700 border-red-200',
  Completed: 'bg-blue-50 text-blue-700 border-blue-200',
};

// Mirrors backend VALID_TRANSITIONS so we only ever show buttons the server will accept
const VALID_TRANSITIONS = {
  Pending: ['Approved', 'Cancelled'],
  Approved: ['Cancelled', 'Completed'],
  Cancelled: [],
  Completed: [],
};

const formatDate = (date) =>
  date
    ? new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : '—';

const formatPrice = (price) =>
  price
    ? `${price.currency === 'INR' ? '₹' : price.currency + ' '}${price.amount?.toLocaleString('en-IN')}`
    : '—';

// ---------- Detail Modal ----------
const BookingDetailModal = ({ booking, onClose, onUpdated }) => {
  const [actionType, setActionType] = useState(null); // 'Approved' | 'Cancelled' | 'Completed'
  const [notes, setNotes] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const nextStatuses = VALID_TRANSITIONS[booking.status] || [];

  const handleConfirm = async () => {
    if (actionType === 'Cancelled' && !cancelReason.trim()) {
      toast.error('A cancellation reason is required');
      return;
    }

    setSubmitting(true);
    try {
      const payload = { status: actionType };
      if (notes.trim()) payload.adminNotes = notes.trim();
      if (actionType === 'Cancelled') payload.cancelReason = cancelReason.trim();

      const res = await API.patch(`/bookings/${booking._id}/status`, payload);
      toast.success(`Booking marked as ${actionType}`);
      onUpdated(res.data.data);
      setActionType(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update booking');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white">
          <div>
            <p className="text-xs text-gray-400 font-mono">{booking.bookingId}</p>
            <h2 className="font-semibold text-[#0a1628]">{booking.package?.title || 'Package'}</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Status */}
          <div className="flex items-center gap-2">
            <span
              className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${
                statusStyles[booking.status] || 'bg-gray-50 text-gray-600 border-gray-200'
              }`}
            >
              {booking.status}
            </span>
            <span className="text-xs text-gray-400">
              Trek date: {formatDate(booking.trekDate)} &middot; {formatPrice(booking.package?.price)}
            </span>
          </div>

          {/* Contact Person */}
          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
              Contact Person
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-1.5 text-sm">
              <div className="flex items-center gap-2 text-[#0a1628] font-medium">
                <User size={14} className="text-gray-400" />
                {booking.contactPerson?.name}
              </div>
              <div className="flex items-center gap-2 text-gray-500">
                <Mail size={14} className="text-gray-400" />
                {booking.contactPerson?.email}
              </div>
              <div className="flex items-center gap-2 text-gray-500">
                <Phone size={14} className="text-gray-400" />
                {booking.contactPerson?.phone}
              </div>
              {booking.contactPerson?.city && (
                <div className="flex items-center gap-2 text-gray-500">
                  <MapPin size={14} className="text-gray-400" />
                  {booking.contactPerson.city}
                </div>
              )}
            </div>
          </div>

          {/* Travelers */}
          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <Users size={13} />
              Travelers ({booking.groupSize})
            </h3>
            {booking.travelers?.length > 0 ? (
              <div className="border border-gray-100 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-left text-xs text-gray-400 uppercase">
                      <th className="px-4 py-2 font-medium">Name</th>
                      <th className="px-4 py-2 font-medium">Age</th>
                      <th className="px-4 py-2 font-medium">Gender</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {booking.travelers.map((t, i) => (
                      <tr key={i}>
                        <td className="px-4 py-2 text-[#0a1628]">{t.name}</td>
                        <td className="px-4 py-2 text-gray-500">{t.age}</td>
                        <td className="px-4 py-2 text-gray-500">{t.gender}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-gray-400">No traveler details provided</p>
            )}
          </div>

          {/* Special Requests */}
          {booking.specialRequests && (
            <div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                Special Requests
              </h3>
              <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-4">
                {booking.specialRequests}
              </p>
            </div>
          )}

          {/* Emergency Contact */}
          {booking.emergencyContact?.name && (
            <div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                Emergency Contact
              </h3>
              <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-4">
                {booking.emergencyContact.name}
                {booking.emergencyContact.relation && ` (${booking.emergencyContact.relation})`}
                {booking.emergencyContact.phone && ` — ${booking.emergencyContact.phone}`}
              </p>
            </div>
          )}

          {/* Admin Notes (existing) */}
          {booking.adminNotes && (
            <div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                Admin Notes
              </h3>
              <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-4">{booking.adminNotes}</p>
            </div>
          )}

          {/* Cancel Reason (if cancelled) */}
          {booking.status === 'Cancelled' && booking.cancelReason && (
            <div>
              <h3 className="text-xs font-semibold text-red-400 uppercase tracking-wide mb-2">
                Cancellation Reason
              </h3>
              <p className="text-sm text-red-600 bg-red-50 rounded-lg p-4">{booking.cancelReason}</p>
            </div>
          )}

          {/* Actions */}
          {nextStatuses.length > 0 && (
            <div className="border-t border-gray-100 pt-5">
              {!actionType ? (
                <div className="flex flex-wrap gap-2.5">
                  {nextStatuses.map((status) => (
                    <button
                      key={status}
                      onClick={() => setActionType(status)}
                      className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                        status === 'Cancelled'
                          ? 'bg-red-50 text-red-600 hover:bg-red-100'
                          : 'bg-[#0a1628] text-white hover:bg-[#0f1f38]'
                      }`}
                    >
                      Mark as {status}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm font-medium text-[#0a1628]">
                    Confirm: mark this booking as{' '}
                    <span className={actionType === 'Cancelled' ? 'text-red-600' : ''}>
                      {actionType}
                    </span>
                  </p>

                  {actionType === 'Cancelled' && (
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1.5">
                        Cancellation reason (required)
                      </label>
                      <textarea
                        value={cancelReason}
                        onChange={(e) => setCancelReason(e.target.value)}
                        rows={2}
                        placeholder="e.g. Customer requested cancellation"
                        className="w-full px-3.5 py-2 rounded-lg border border-gray-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-transparent"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">
                      Admin notes (optional)
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={2}
                      placeholder="Internal notes about this booking"
                      className="w-full px-3.5 py-2 rounded-lg border border-gray-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    />
                  </div>

                  <div className="flex gap-2.5">
                    <button
                      onClick={handleConfirm}
                      disabled={submitting}
                      className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors disabled:opacity-60 ${
                        actionType === 'Cancelled'
                          ? 'bg-red-500 text-white hover:bg-red-600'
                          : 'bg-[#0a1628] text-white hover:bg-[#0f1f38]'
                      }`}
                    >
                      {submitting ? 'Saving...' : `Confirm ${actionType}`}
                    </button>
                    <button
                      onClick={() => setActionType(null)}
                      className="px-5 py-2 rounded-full text-sm font-medium text-gray-500 hover:text-gray-700"
                    >
                      Back
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ---------- Main Page ----------
const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const [selectedBooking, setSelectedBooking] = useState(null);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 20 });
      if (statusFilter !== 'All') params.set('status', statusFilter);

      const res = await API.get(`/bookings?${params.toString()}`);
      setBookings(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, page]);

  const handleFilterChange = (status) => {
    setStatusFilter(status);
    setPage(1);
  };

  const openBooking = async (id) => {
    try {
      const res = await API.get(`/bookings/${id}`);
      setSelectedBooking(res.data.data);
    } catch (err) {
      toast.error('Failed to load booking details');
    }
  };

  const handleUpdated = (updatedBooking) => {
    setSelectedBooking(updatedBooking);
    setBookings((prev) =>
      prev.map((b) => (b._id === updatedBooking._id ? { ...b, ...updatedBooking } : b))
    );
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#0a1628]">Bookings</h1>
        <p className="text-sm text-gray-400 mt-1">Review and manage trek bookings</p>
      </div>

      {/* Status Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {statusFilters.map((status) => (
          <button
            key={status}
            onClick={() => handleFilterChange(status)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              statusFilter === status
                ? 'bg-[#0a1628] text-white'
                : 'bg-white text-gray-500 border border-gray-200 hover:border-yellow-400'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse bg-gray-100 rounded-lg h-14" />
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-20">
            <CalendarCheck size={48} className="mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-500 mb-2">No bookings found</h3>
            <p className="text-gray-400 text-sm">
              {statusFilter === 'All'
                ? 'No bookings have been made yet.'
                : `No ${statusFilter.toLowerCase()} bookings.`}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-gray-400 uppercase tracking-wide border-b border-gray-100">
                    <th className="px-6 py-3 font-medium">Booking ID</th>
                    <th className="px-6 py-3 font-medium">Customer</th>
                    <th className="px-6 py-3 font-medium">Package</th>
                    <th className="px-6 py-3 font-medium">Trek Date</th>
                    <th className="px-6 py-3 font-medium">Group</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {bookings.map((booking) => (
                    <tr
                      key={booking._id}
                      onClick={() => openBooking(booking._id)}
                      className="hover:bg-gray-50 cursor-pointer"
                    >
                      <td className="px-6 py-3.5 font-mono text-xs text-gray-500">
                        {booking.bookingId}
                      </td>
                      <td className="px-6 py-3.5 font-medium text-[#0a1628]">
                        {booking.contactPerson?.name}
                      </td>
                      <td className="px-6 py-3.5 text-gray-500">
                        {booking.package?.title || '—'}
                      </td>
                      <td className="px-6 py-3.5 text-gray-500">{formatDate(booking.trekDate)}</td>
                      <td className="px-6 py-3.5 text-gray-500">{booking.groupSize}</td>
                      <td className="px-6 py-3.5">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium border ${
                            statusStyles[booking.status] || 'bg-gray-50 text-gray-600 border-gray-200'
                          }`}
                        >
                          {booking.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
                <p className="text-xs text-gray-400">
                  Page {pagination.page} of {pagination.pages} &middot; {pagination.total} total
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                    disabled={page === pagination.pages}
                    className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {selectedBooking && (
        <BookingDetailModal
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
          onUpdated={handleUpdated}
        />
      )}
    </div>
  );
};

export default AdminBookings;