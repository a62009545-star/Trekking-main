import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, Package as PackageIcon, Star, ImageOff } from 'lucide-react';
import API from '../../api/axios';

const difficultyStyles = {
  Easy: 'bg-green-50 text-green-700 border-green-200',
  Moderate: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  Difficult: 'bg-orange-50 text-orange-700 border-orange-200',
  Extreme: 'bg-red-50 text-red-700 border-red-200',
};

const AdminPackages = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const fetchPackages = async () => {
    try {
      const res = await API.get('/packages/admin/all');
      setPackages(res.data.data);
    } catch (err) {
      toast.error('Failed to load packages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  const handleDelete = async (pkg) => {
    const confirmed = window.confirm(
      `Delete "${pkg.title}"? This will also remove its images and cannot be undone.`
    );
    if (!confirmed) return;

    setDeletingId(pkg._id);
    try {
      await API.delete(`/packages/${pkg._id}`);
      setPackages((prev) => prev.filter((p) => p._id !== pkg._id));
      toast.success('Package deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete package');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#0a1628]">Packages</h1>
          <p className="text-sm text-gray-400 mt-1">Manage all trek packages</p>
        </div>
        <Link
          to="/admin/packages/new"
          className="flex items-center gap-2 bg-[#0a1628] text-white font-semibold text-sm px-5 py-2.5 rounded-full hover:bg-[#0f1f38] transition-colors"
        >
          <Plus size={16} />
          Add Package
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse bg-gray-100 rounded-lg h-16" />
            ))}
          </div>
        ) : packages.length === 0 ? (
          <div className="text-center py-20">
            <PackageIcon size={48} className="mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-500 mb-2">No packages yet</h3>
            <p className="text-gray-400 text-sm mb-6">
              Add your first trek package to get started.
            </p>
            <Link
              to="/admin/packages/new"
              className="inline-flex items-center gap-2 bg-[#0a1628] text-white font-semibold text-sm px-5 py-2.5 rounded-full hover:bg-[#0f1f38] transition-colors"
            >
              <Plus size={16} />
              Add Package
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-400 uppercase tracking-wide border-b border-gray-100">
                  <th className="px-6 py-3 font-medium">Package</th>
                  <th className="px-6 py-3 font-medium">Category</th>
                  <th className="px-6 py-3 font-medium">Difficulty</th>
                  <th className="px-6 py-3 font-medium">Price</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {packages.map((pkg) => (
                  <tr key={pkg._id} className="hover:bg-gray-50">
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0 flex items-center justify-center">
                          {pkg.images?.[0]?.url ? (
                            <img
                              src={pkg.images[0].url}
                              alt={pkg.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <ImageOff size={16} className="text-gray-300" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="font-medium text-[#0a1628] truncate">{pkg.title}</p>
                            {pkg.isFeatured && (
                              <Star size={12} className="text-yellow-400 flex-shrink-0" fill="currentColor" />
                            )}
                          </div>
                          <p className="text-xs text-gray-400 truncate max-w-[220px]">
                            {pkg.shortDescription}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3.5 text-gray-500">{pkg.category}</td>
                    <td className="px-6 py-3.5">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium border ${
                          difficultyStyles[pkg.difficulty] || 'bg-gray-50 text-gray-600 border-gray-200'
                        }`}
                      >
                        {pkg.difficulty}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-gray-700 font-medium">
                      {pkg.price?.currency === 'INR' ? '₹' : `${pkg.price?.currency} `}
                      {pkg.price?.amount?.toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-3.5">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium border ${
                          pkg.isActive
                            ? 'bg-green-50 text-green-700 border-green-200'
                            : 'bg-gray-50 text-gray-500 border-gray-200'
                        }`}
                      >
                        {pkg.isActive ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-6 py-3.5">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to={`/admin/packages/edit/${pkg._id}`}
                          className="p-2 rounded-lg text-gray-400 hover:text-[#0a1628] hover:bg-gray-100 transition-colors"
                        >
                          <Pencil size={15} />
                        </Link>
                        <button
                          onClick={() => handleDelete(pkg)}
                          disabled={deletingId === pkg._id}
                          className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
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

export default AdminPackages;