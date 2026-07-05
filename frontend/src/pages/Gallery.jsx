import { useState, useEffect } from 'react';
import { X, Mountain } from 'lucide-react';
import API from '../api/axios';

const categories = ['All', 'Trek', 'Camp', 'Nature', 'People', 'Wildlife', 'Other'];

const Gallery = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [lightbox, setLightbox] = useState(null);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const params = activeCategory !== 'All' ? `?category=${activeCategory}` : '';
        const res = await API.get(`/gallery${params}`);
        setImages(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchImages();
  }, [activeCategory]);

  const handleCategoryChange = (cat) => {
    setActiveCategory(cat);
    setLoading(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#0a1628] py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-yellow-400 text-sm font-semibold uppercase tracking-widest mb-2">
            Memories & Moments
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-3">Our Gallery</h1>
          <p className="text-gray-400 max-w-xl mx-auto text-sm">
            A glimpse into the journeys, landscapes, and sisterhood that make every Matrika trek unforgettable.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
                activeCategory === cat
                  ? 'bg-[#0a1628] text-white'
                  : 'bg-white text-gray-500 border border-gray-200 hover:border-yellow-400'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="columns-2 sm:columns-3 lg:columns-4 gap-3 space-y-3">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="animate-pulse bg-gray-200 rounded-xl break-inside-avoid"
                style={{ height: `${[200, 250, 180, 220, 260, 190][i % 6]}px` }}
              />
            ))}
          </div>
        ) : images.length === 0 ? (
          <div className="text-center py-20">
            <Mountain size={56} className="mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-500 mb-2">No images yet</h3>
            <p className="text-gray-400 text-sm">Check back soon for stunning photos!</p>
          </div>
        ) : (
          <div className="columns-2 sm:columns-3 lg:columns-4 gap-3 space-y-3">
            {images.map((img) => (
              <div
                key={img._id}
                className="break-inside-avoid rounded-xl overflow-hidden cursor-pointer group relative"
                onClick={() => setLightbox(img)}
              >
                <img
                  src={img.url}
                  alt={img.title || img.category}
                  className="w-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-[#0a1628]/0 group-hover:bg-[#0a1628]/40 transition-colors duration-300 flex items-end p-3">
                  {img.title && (
                    <p className="text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      {img.title}
                    </p>
                  )}
                </div>
                <span className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  {img.category}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute top-4 right-4 text-white hover:text-yellow-400 transition-colors"
            onClick={() => setLightbox(null)}
          >
            <X size={28} />
          </button>
          <div onClick={(e) => e.stopPropagation()} className="max-w-4xl w-full">
            <img
              src={lightbox.url}
              alt={lightbox.title || lightbox.category}
              className="w-full max-h-[80vh] object-contain rounded-xl"
            />
            {(lightbox.title || lightbox.category) && (
              <div className="text-center mt-3">
                {lightbox.title && <p className="text-white font-medium">{lightbox.title}</p>}
                <p className="text-gray-400 text-sm">{lightbox.category}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Gallery;