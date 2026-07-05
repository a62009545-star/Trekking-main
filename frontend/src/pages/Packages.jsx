import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Clock, Users, Mountain, Search, SlidersHorizontal, X } from 'lucide-react';
import API from '../api/axios';

// ─── Package Card ─────────────────────────────────────────────────
const PackageCard = ({ pkg }) => (
  <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group">
    <div className="relative overflow-hidden h-52">
      {pkg.images?.[0] ? (
        <img
          src={pkg.images[0].url}
          alt={pkg.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-[#0a1628] to-[#1a3a6b] flex items-center justify-center">
          <Mountain size={48} className="text-white/30" />
        </div>
      )}
      {pkg.isFeatured && (
        <span className="absolute top-3 left-3 bg-yellow-500 text-[#0a1628] text-xs font-bold px-3 py-1 rounded-full">
          Featured
        </span>
      )}
      <span className={`absolute top-3 right-3 text-white text-xs px-2 py-1 rounded-full font-medium ${
        pkg.difficulty === 'Easy' ? 'bg-green-500' :
        pkg.difficulty === 'Moderate' ? 'bg-yellow-500 text-[#0a1628]' :
        pkg.difficulty === 'Difficult' ? 'bg-orange-500' : 'bg-red-500'
      }`}>
        {pkg.difficulty}
      </span>
    </div>
    <div className="p-5">
      <div className="flex items-center gap-1 text-gray-400 text-xs mb-2">
        <MapPin size={12} />
        <span>{pkg.location?.region || 'India'}</span>
        <span className="mx-1">•</span>
        <span>{pkg.category}</span>
      </div>
      <h3 className="font-bold text-[#0a1628] text-lg mb-1 line-clamp-1">{pkg.title}</h3>
      <p className="text-gray-500 text-sm mb-4 line-clamp-2">{pkg.shortDescription}</p>
      <div className="flex items-center gap-4 text-xs text-gray-400 mb-4">
        <span className="flex items-center gap-1">
          <Clock size={12} />
          {pkg.duration?.days}D / {pkg.duration?.nights}N
        </span>
        <span className="flex items-center gap-1">
          <Users size={12} />
          {pkg.groupSize?.min}–{pkg.groupSize?.max} People
        </span>
      </div>
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div>
          <p className="text-xs text-gray-400">Starting from</p>
          <p className="text-xl font-bold text-[#0a1628]">
            ₹{pkg.price?.amount?.toLocaleString()}
          </p>
        </div>
        <Link
          to={`/packages/${pkg.slug}`}
          className="bg-[#0a1628] hover:bg-yellow-500 hover:text-[#0a1628] text-white text-sm font-semibold px-5 py-2 rounded-full transition-colors"
        >
          View Details
        </Link>
      </div>
    </div>
  </div>
);

// ─── Skeleton Card ────────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="bg-white rounded-2xl overflow-hidden shadow-md animate-pulse">
    <div className="h-52 bg-gray-200" />
    <div className="p-5 space-y-3">
      <div className="h-3 bg-gray-200 rounded w-1/3" />
      <div className="h-5 bg-gray-200 rounded w-3/4" />
      <div className="h-3 bg-gray-200 rounded w-full" />
      <div className="h-3 bg-gray-200 rounded w-2/3" />
      <div className="flex justify-between items-center pt-2">
        <div className="h-6 bg-gray-200 rounded w-1/4" />
        <div className="h-9 bg-gray-200 rounded-full w-1/3" />
      </div>
    </div>
  </div>
);

// ─── Main Packages Page ───────────────────────────────────────────
const Packages = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ total: 0, pages: 1, page: 1 });
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    search: '',
    category: '',
    difficulty: '',
    minPrice: '',
    maxPrice: '',
    sort: '-createdAt',
    page: 1,
  });

  const categories = ['Himalayan', 'Forest', 'Desert', 'Coastal', 'Wildlife', 'Cultural', 'Other'];
  const difficulties = ['Easy', 'Moderate', 'Difficult', 'Extreme'];
  const sortOptions = [
    { label: 'Newest First', value: '-createdAt' },
    { label: 'Oldest First', value: 'createdAt' },
    { label: 'Price: Low to High', value: 'price.amount' },
    { label: 'Price: High to Low', value: '-price.amount' },
  ];

  const fetchPackages = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.category) params.append('category', filters.category);
      if (filters.difficulty) params.append('difficulty', filters.difficulty);
      if (filters.minPrice) params.append('minPrice', filters.minPrice);
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
      params.append('sort', filters.sort);
      params.append('page', filters.page);
      params.append('limit', 9);

      const res = await API.get(`/packages?${params.toString()}`);
      setPackages(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, [filters.category, filters.difficulty, filters.minPrice, filters.maxPrice, filters.sort, filters.page]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      category: '',
      difficulty: '',
      minPrice: '',
      maxPrice: '',
      sort: '-createdAt',
      page: 1,
    });
  };

  const hasActiveFilters = filters.category || filters.difficulty || filters.minPrice || filters.maxPrice;

  const filteredPackages = filters.search
    ? packages.filter(
        (p) =>
          p.title.toLowerCase().includes(filters.search.toLowerCase()) ||
          p.shortDescription.toLowerCase().includes(filters.search.toLowerCase())
      )
    : packages;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-[#0a1628] py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-yellow-400 text-sm font-semibold uppercase tracking-widest mb-2">
            Explore & Discover
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-3">
            Our Trek Packages
          </h1>
          <p className="text-gray-400 max-w-xl mx-auto text-sm">
            From serene Himalayan trails to coastal adventures — find your perfect journey.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search + Filter Bar */}
        <div className="bg-white rounded-2xl shadow-sm p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search packages..."
                value={filters.search}
                onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl outline-none focus:border-yellow-400"
              />
            </div>

            {/* Sort */}
            <select
              value={filters.sort}
              onChange={(e) => handleFilterChange('sort', e.target.value)}
              className="text-sm border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-yellow-400 bg-white"
            >
              {sortOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-xl border transition-colors ${
                showFilters || hasActiveFilters
                  ? 'bg-[#0a1628] text-white border-[#0a1628]'
                  : 'border-gray-200 text-gray-600 hover:border-yellow-400'
              }`}
            >
              <SlidersHorizontal size={15} />
              Filters
              {hasActiveFilters && (
                <span className="w-4 h-4 bg-yellow-500 text-[#0a1628] rounded-full text-xs flex items-center justify-center font-bold">
                  !
                </span>
              )}
            </button>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Category */}
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase mb-2 block">Category</label>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => handleFilterChange('category', filters.category === cat ? '' : cat)}
                        className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                          filters.category === cat
                            ? 'bg-yellow-500 border-yellow-500 text-[#0a1628] font-semibold'
                            : 'border-gray-200 text-gray-500 hover:border-yellow-400'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Difficulty */}
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase mb-2 block">Difficulty</label>
                  <div className="flex flex-wrap gap-2">
                    {difficulties.map((d) => (
                      <button
                        key={d}
                        onClick={() => handleFilterChange('difficulty', filters.difficulty === d ? '' : d)}
                        className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                          filters.difficulty === d
                            ? 'bg-yellow-500 border-yellow-500 text-[#0a1628] font-semibold'
                            : 'border-gray-200 text-gray-500 hover:border-yellow-400'
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase mb-2 block">Min Price (₹)</label>
                  <input
                    type="number"
                    placeholder="e.g. 5000"
                    value={filters.minPrice}
                    onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                    className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-yellow-400"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase mb-2 block">Max Price (₹)</label>
                  <input
                    type="number"
                    placeholder="e.g. 20000"
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                    className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-yellow-400"
                  />
                </div>
              </div>

              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="mt-3 flex items-center gap-1 text-xs text-red-500 hover:underline"
                >
                  <X size={12} /> Clear all filters
                </button>
              )}
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-500">
            {loading ? 'Loading...' : `${pagination.total} packages found`}
          </p>
        </div>

        {/* Package Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(9)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filteredPackages.length === 0 ? (
          <div className="text-center py-20">
            <Mountain size={56} className="mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-500 mb-2">No packages found</h3>
            <p className="text-gray-400 text-sm mb-4">Try adjusting your filters</p>
            <button
              onClick={clearFilters}
              className="bg-[#0a1628] text-white text-sm font-semibold px-6 py-2 rounded-full hover:bg-yellow-500 hover:text-[#0a1628] transition-colors"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPackages.map((pkg) => (
              <PackageCard key={pkg._id} pkg={pkg} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && pagination.pages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-10">
            <button
              onClick={() => handleFilterChange('page', filters.page - 1)}
              disabled={filters.page === 1}
              className="px-4 py-2 text-sm font-medium border border-gray-200 rounded-xl disabled:opacity-40 hover:border-yellow-400 transition-colors"
            >
              Previous
            </button>
            {[...Array(pagination.pages)].map((_, i) => (
              <button
                key={i}
                onClick={() => handleFilterChange('page', i + 1)}
                className={`w-9 h-9 text-sm font-medium rounded-xl transition-colors ${
                  filters.page === i + 1
                    ? 'bg-[#0a1628] text-white'
                    : 'border border-gray-200 hover:border-yellow-400'
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => handleFilterChange('page', filters.page + 1)}
              disabled={filters.page === pagination.pages}
              className="px-4 py-2 text-sm font-medium border border-gray-200 rounded-xl disabled:opacity-40 hover:border-yellow-400 transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Packages;