import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Plus, Trash2, ImageIcon, Upload, X } from 'lucide-react';
import API from '../../api/axios';

const categories = ['Trek', 'Camp', 'Nature', 'People', 'Wildlife', 'Other'];

const AdminGallery = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Upload form state
  const [selectedFiles, setSelectedFiles] = useState([]); // [{ file, previewUrl }]
  const [category, setCategory] = useState('Trek');
  const [title, setTitle] = useState('');
  const [uploading, setUploading] = useState(false);

  const fetchImages = async () => {
    try {
      const res = await API.get('/gallery/admin');
      setImages(res.data.data);
    } catch (err) {
      toast.error('Failed to load gallery images');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newFiles = files.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
    }));
    setSelectedFiles((prev) => [...prev, ...newFiles]);
    e.target.value = '';
  };

  const removeSelectedFile = (index) => {
    setSelectedFiles((prev) => {
      URL.revokeObjectURL(prev[index].previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  };

  const closeModal = () => {
    selectedFiles.forEach((f) => URL.revokeObjectURL(f.previewUrl));
    setSelectedFiles([]);
    setCategory('Trek');
    setTitle('');
    setModalOpen(false);
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (selectedFiles.length === 0) {
      toast.error('Select at least one image');
      return;
    }

    const formData = new FormData();
    selectedFiles.forEach((f) => formData.append('images', f.file));
    formData.append('category', category);
    if (title.trim()) formData.append('title', title.trim());

    setUploading(true);
    try {
      const res = await API.post('/gallery', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setImages((prev) => [...res.data.data, ...prev]);
      toast.success(
        `${res.data.data.length} image${res.data.data.length > 1 ? 's' : ''} uploaded`
      );
      closeModal();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (image) => {
    const confirmed = window.confirm('Delete this image? This cannot be undone.');
    if (!confirmed) return;

    setDeletingId(image._id);
    try {
      await API.delete(`/gallery/${image._id}`);
      setImages((prev) => prev.filter((img) => img._id !== image._id));
      toast.success('Image deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete image');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#0a1628]">Gallery</h1>
          <p className="text-sm text-gray-400 mt-1">Manage photos shown on the public gallery</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 bg-[#0a1628] text-white font-semibold text-sm px-5 py-2.5 rounded-full hover:bg-[#0f1f38] transition-colors"
        >
          <Plus size={16} />
          Upload Images
        </button>
      </div>

      {loading ? (
        <div className="columns-2 sm:columns-3 lg:columns-4 gap-3 space-y-3">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="animate-pulse bg-gray-200 rounded-xl break-inside-avoid"
              style={{ height: `${[180, 220, 160, 200][i % 4]}px` }}
            />
          ))}
        </div>
      ) : images.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
          <ImageIcon size={48} className="mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-semibold text-gray-500 mb-2">No images yet</h3>
          <p className="text-gray-400 text-sm mb-6">Upload your first batch of gallery photos.</p>
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 bg-[#0a1628] text-white font-semibold text-sm px-5 py-2.5 rounded-full hover:bg-[#0f1f38] transition-colors"
          >
            <Plus size={16} />
            Upload Images
          </button>
        </div>
      ) : (
        <div className="columns-2 sm:columns-3 lg:columns-4 gap-3 space-y-3">
          {images.map((img) => (
            <div
              key={img._id}
              className="break-inside-avoid rounded-xl overflow-hidden relative group"
            >
              <img
                src={img.url}
                alt={img.title || img.category}
                className="w-full object-cover"
              />
              <div className="absolute inset-0 bg-[#0a1628]/0 group-hover:bg-[#0a1628]/50 transition-colors duration-300 flex flex-col justify-between p-3">
                <div className="flex justify-end">
                  <button
                    onClick={() => handleDelete(img)}
                    disabled={deletingId === img._id}
                    className="bg-white/90 text-red-500 rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  {img.title && <p className="text-white text-xs font-medium">{img.title}</p>}
                  <span className="inline-block bg-black/40 text-white text-[10px] px-2 py-0.5 rounded-full mt-1">
                    {img.category}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-[#0a1628]">Upload Images</h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpload} className="p-6 space-y-4">
              <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-200 rounded-xl py-8 cursor-pointer hover:border-yellow-400 transition-colors">
                <Upload size={22} className="text-gray-400" />
                <span className="text-sm text-gray-500">Click to select images</span>
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>

              {selectedFiles.length > 0 && (
                <div className="grid grid-cols-4 gap-2">
                  {selectedFiles.map((f, i) => (
                    <div key={i} className="relative group aspect-square rounded-lg overflow-hidden">
                      <img
                        src={f.previewUrl}
                        alt={`Selected ${i + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeSelectedFile(i)}
                        className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-400 mt-1">Applies to all images in this batch</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">
                  Title (optional)
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Sunrise at base camp"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                />
                <p className="text-xs text-gray-400 mt-1">Also applies to every image in this batch</p>
              </div>

              <button
                type="submit"
                disabled={uploading}
                className="w-full bg-[#0a1628] text-white font-semibold text-sm py-2.5 rounded-full hover:bg-[#0f1f38] transition-colors disabled:opacity-60"
              >
                {uploading ? 'Uploading...' : `Upload ${selectedFiles.length || ''} Image${selectedFiles.length !== 1 ? 's' : ''}`}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminGallery;