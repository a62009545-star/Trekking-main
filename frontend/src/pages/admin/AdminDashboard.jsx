import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, CalendarCheck, Mail, Image, TrendingUp, ArrowRight } from 'lucide-react';
import API from '../../api/axios';

const statCards = [
  { key: 'packages', label: 'Total Packages', icon: Package, to: '/admin/packages', endpoint: '/packages' },
  { key: 'bookings', label: 'Total Bookings', icon: CalendarCheck, to: '/admin/bookings', endpoint: '/bookings' },
  { key: 'contacts', label: 'Contact Messages', icon: Mail, to: '/admin/contacts', endpoint: '/contact' },
  { key: 'gallery', label: 'Gallery Images', icon: Image, to: '/admin/gallery', endpoint: '/gallery' },
];

const statusStyles = {
  Pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  Approved: 'bg-green-50 text-green-700 border-green-200',
  Cancelled: 'bg-red-50 text-red-700 border-red-200',
  Completed: 'bg-blue-50 text-blue-700 border-blue-200',
};

const AdminDashboard = () => {
  const [counts, setCounts] = useState({});
  const [loadingStats, setLoadingStats] = useState(true);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);

  useEffect(() => {
    const fetchCounts = async () => {
      const results = await Promise.allSettled(
        statCards.map((card) => API.get(card.endpoint))
      );

      const newCounts = {};
      results.forEach((res, i) => {
        const key = statCards[i].key;
        if (res.status === 'fulfilled') {
          const data = res.value.data?.data;
          newCounts[key] = Array.isArray(data) ? data.length : res.value.data?.count ?? '—';
        } else {
          newCounts[key] = '—';
        }
      });
      setCounts(newCounts);
      setLoadingStats(false);
    };

    const fetchRecentBookings = async () => {
      try {
        const res = await API.get('/bookings');
        const bookings = res.data?.data || [];
        const sorted = [...bookings].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setRecentBookings(sorted.slice(0, 5));
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingBookings(false);
      }
    };

    fetchCounts();
    fetchRecentBookings();
  }, []);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#0a1628]">Dashboard</h1>
        <p className="text-sm text-gray-400 mt-1">Overview of your trek booking platform</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {statCards.map(({ key, label, icon: Icon, to }) => (
          <Link
            key={key}
            to={to}
            className="bg-white rounded-xl border border-gray-200 p-5 hover:border-yellow-400 hover:shadow-sm transition-all group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-full bg-[#0a1628] flex items-center justify-center">
                <Icon size={18} className="text-yellow-400" />
              </div>
              <ArrowRight
                size={16}
                className="text-gray-300 group-hover:text-yellow-500 group-hover:translate-x-0.5 transition-all"
              />
            </div>
            {loadingStats ? (
              <div className="animate-pulse bg-gray-200 rounded h-8 w-14 mb-1" />
            ) : (
              <p className="text-2xl font-bold text-[#0a1628]">{counts[key]}</p>
            )}
            <p className="text-xs text-gray-400 font-medium mt-1">{label}</p>
          </Link>
        ))}
      </div>

      {/* Recent Bookings */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <TrendingUp size={18} className="text-[#0a1628]" />
            <h2 className="font-semibold text-[#0a1628] text-sm">Recent Bookings</h2>
          </div>
          <Link
            to="/admin/bookings"
            className="text-xs font-medium text-yellow-600 hover:text-yellow-700"
          >
            View all
          </Link>
        </div>

        {loadingBookings ? (
          <div className="p-6 space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse bg-gray-100 rounded-lg h-12" />
            ))}
          </div>
        ) : recentBookings.length === 0 ? (
          <div className="text-center py-14">
            <CalendarCheck size={40} className="mx-auto mb-3 text-gray-300" />
            <p className="text-sm text-gray-400">No bookings yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-400 uppercase tracking-wide border-b border-gray-100">
                  <th className="px-6 py-3 font-medium">Booking ID</th>
                  <th className="px-6 py-3 font-medium">Customer</th>
                  <th className="px-6 py-3 font-medium">Package</th>
                  <th className="px-6 py-3 font-medium">Trek Date</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentBookings.map((booking) => (
                  <tr key={booking._id} className="hover:bg-gray-50">
                    <td className="px-6 py-3.5 font-mono text-xs text-gray-500">
                      {booking.bookingId || '—'}
                    </td>
                    <td className="px-6 py-3.5 font-medium text-[#0a1628]">
                      {booking.contactPerson?.name || '—'}
                    </td>
                    <td className="px-6 py-3.5 text-gray-500">
                      {booking.package?.title || '—'}
                    </td>
                    <td className="px-6 py-3.5 text-gray-500">
                      {booking.trekDate
                        ? new Date(booking.trekDate).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })
                        : '—'}
                    </td>
                    <td className="px-6 py-3.5">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium border ${
                          statusStyles[booking.status] || 'bg-gray-50 text-gray-600 border-gray-200'
                        }`}
                      >
                        {booking.status || 'Pending'}
                      </span>
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
};

export default AdminDashboard;