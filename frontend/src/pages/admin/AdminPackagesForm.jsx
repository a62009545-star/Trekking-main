import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { X, Plus, Upload, ImageIcon, ChevronLeft } from 'lucide-react';
import API from '../../api/axios';


const difficulties = ['Easy', 'Moderate', 'Difficult', 'Extreme'];

const emptyDay = () => ({ title: '', description: '' });

// Reusable tag-style array input (for highlights, included, excluded, bestSeason, tags)
const TagListInput = ({ label, placeholder, values, onChange }) => {
  const [input, setInput] = useState('');

  const addValue = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    onChange([...values, trimmed]);
    setInput('');
  };

  const removeValue = (index) => {
    onChange(values.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addValue();
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-600 mb-1.5">{label}</label>
      <div className="flex gap-2 mb-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1 px-3.5 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
        />
        <button
          type="button"
          onClick={addValue}
          className="px-3.5 py-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
        >
          <Plus size={16} />
        </button>
      </div>
      {values.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {values.map((val, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-700 text-xs font-medium px-3 py-1.5 rounded-full"
            >
              {val}
              <button type="button" onClick={() => removeValue(i)} className="hover:text-red-500">
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

const AdminPackageForm = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    title: '',
    shortDescription: '',
    fullDescription: '',
    difficulty: '',
    days: '',
    nights: '',
    priceAmount: '',
    currency: 'INR',
    region: '',
    state: '',
    groupMin: 1,
    groupMax: 20,
    isFeatured: false,
    isActive: true,
  });

  const [highlights, setHighlights] = useState([]);
  const [included, setIncluded] = useState([]);
  const [excluded, setExcluded] = useState([]);
  const [bestSeason, setBestSeason] = useState([]);
  const [tags, setTags] = useState([]);
  const [itinerary, setItinerary] = useState([emptyDay()]);
  const [images, setImages] = useState([]); // [{ file, previewUrl }]

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // ---------- Itinerary ----------
  const addDay = () => setItinerary((prev) => [...prev, emptyDay()]);

  const removeDay = (index) => {
    setItinerary((prev) => prev.filter((_, i) => i !== index));
  };

  const updateDay = (index, field, value) => {
    setItinerary((prev) =>
      prev.map((day, i) => (i === index ? { ...day, [field]: value } : day))
    );
  };

  // ---------- Images ----------
  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (images.length + files.length > 10) {
      toast.error('Maximum 10 images allowed');
      return;
    }

    const newImages = files.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
    }));

    setImages((prev) => [...prev, ...newImages]);
    e.target.value = ''; // allow re-selecting the same file
  };

  const removeImage = (index) => {
    setImages((prev) => {
      URL.revokeObjectURL(prev[index].previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  };

  // ---------- Validation ----------
  const validate = () => {
    if (!form.title.trim()) return 'Title is required';
    if (!form.shortDescription.trim()) return 'Short description is required';
    if (!form.fullDescription.trim()) return 'Full description is required';
    if (!form.difficulty) return 'Difficulty is required';
    if (!form.days || !form.nights) return 'Duration (days & nights) is required';
    if (!form.priceAmount) return 'Price is required';
    if (!form.groupMin || !form.groupMax) return 'Group size (min & max) is required';
    if (Number(form.groupMin) > Number(form.groupMax)) return 'Min group size cannot exceed max';
    if (itinerary.some((day) => !day.title.trim())) return 'Every itinerary day needs a title';
    return null;
  };

  // ---------- Submit ----------
  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validate();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    const formData = new FormData();

    formData.append('title', form.title.trim());
    formData.append('shortDescription', form.shortDescription.trim());
    formData.append('fullDescription', form.fullDescription.trim());
    formData.append('difficulty', form.difficulty);
    formData.append('isFeatured', form.isFeatured);
    formData.append('isActive', form.isActive);

    formData.append(
      'duration',
      JSON.stringify({ days: Number(form.days), nights: Number(form.nights) })
    );
    formData.append(
      'price',
      JSON.stringify({ amount: Number(form.priceAmount), currency: form.currency })
    );
    formData.append(
      'location',
      JSON.stringify({ region: form.region.trim(), state: form.state.trim() })
    );
    formData.append(
      'groupSize',
      JSON.stringify({ min: Number(form.groupMin), max: Number(form.groupMax) })
    );

    formData.append('highlights', JSON.stringify(highlights));
    formData.append('included', JSON.stringify(included));
    formData.append('excluded', JSON.stringify(excluded));
    formData.append('bestSeason', JSON.stringify(bestSeason));
    formData.append('tags', JSON.stringify(tags));

    formData.append(
      'itinerary',
      JSON.stringify(
        itinerary.map((day, i) => ({
          day: i + 1,
          title: day.title.trim(),
          description: day.description.trim(),
        }))
      )
    );

    images.forEach((img) => formData.append('images', img.file));

    setSubmitting(true);
    try {
      await API.post('/packages', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Package created successfully');
      navigate('/admin/packages');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create package');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl">
      <button
        onClick={() => navigate('/admin/packages')}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#0a1628] mb-4"
      >
        <ChevronLeft size={16} />
        Back to Packages
      </button>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#0a1628]">Add New Package</h1>
        <p className="text-sm text-gray-400 mt-1">Create a new trek package for the public site</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-[#0a1628] mb-4">Basic Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Title</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => updateField('title', e.target.value)}
                placeholder="Kedarkantha Trek"
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
              />
              <p className="text-xs text-gray-400 mt-1">
                URL slug will be generated automatically from the title
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">
                Short Description
              </label>
              <input
                type="text"
                value={form.shortDescription}
                onChange={(e) => updateField('shortDescription', e.target.value)}
                placeholder="A quick one-line teaser shown on the package cards"
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">
                Full Description
              </label>
              <textarea
                value={form.fullDescription}
                onChange={(e) => updateField('fullDescription', e.target.value)}
                rows={5}
                placeholder="Detailed description shown on the package detail page"
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">
                Difficulty
              </label>
              <select
                value={form.difficulty}
                onChange={(e) => updateField('difficulty', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent bg-white"
              >
                <option value="">Select difficulty</option>
                {difficulties.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Duration, Price, Group Size */}
        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-[#0a1628] mb-4">Duration, Price &amp; Group Size</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Days</label>
              <input
                type="number"
                min="1"
                value={form.days}
                onChange={(e) => updateField('days', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Nights</label>
              <input
                type="number"
                min="0"
                value={form.nights}
                onChange={(e) => updateField('nights', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">
                Price (₹)
              </label>
              <input
                type="number"
                min="0"
                value={form.priceAmount}
                onChange={(e) => updateField('priceAmount', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Currency</label>
              <input
                type="text"
                value={form.currency}
                onChange={(e) => updateField('currency', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">
                Min Group Size
              </label>
              <input
                type="number"
                min="1"
                value={form.groupMin}
                onChange={(e) => updateField('groupMin', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">
                Max Group Size
              </label>
              <input
                type="number"
                min="1"
                value={form.groupMax}
                onChange={(e) => updateField('groupMax', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
              />
            </div>
          </div>
        </section>

        {/* Location */}
        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-[#0a1628] mb-4">Location</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Region</label>
              <input
                type="text"
                value={form.region}
                onChange={(e) => updateField('region', e.target.value)}
                placeholder="Garhwal Himalayas"
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">State</label>
              <input
                type="text"
                value={form.state}
                onChange={(e) => updateField('state', e.target.value)}
                placeholder="Uttarakhand"
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
              />
            </div>
          </div>
        </section>

        {/* Images */}
        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-[#0a1628] mb-1">Images</h2>
          <p className="text-xs text-gray-400 mb-4">
            JPG, PNG or WEBP, up to 5MB each. Max 10 images.
          </p>

          <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-200 rounded-xl py-8 cursor-pointer hover:border-yellow-400 transition-colors mb-4">
            <Upload size={22} className="text-gray-400" />
            <span className="text-sm text-gray-500">Click to upload images</span>
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              multiple
              onChange={handleImageSelect}
              className="hidden"
            />
          </label>

          {images.length === 0 ? (
            <div className="flex items-center gap-2 text-gray-300 text-sm">
              <ImageIcon size={16} />
              No images selected yet
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {images.map((img, i) => (
                <div key={i} className="relative group rounded-lg overflow-hidden aspect-square">
                  <img
                    src={img.previewUrl}
                    alt={`Upload ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute top-1.5 right-1.5 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Highlights, Included, Excluded, Season, Tags */}
        <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
          <h2 className="font-semibold text-[#0a1628]">Details</h2>
          <TagListInput
            label="Highlights"
            placeholder="e.g. Summit sunrise views — press Enter to add"
            values={highlights}
            onChange={setHighlights}
          />
          <TagListInput
            label="Included"
            placeholder="e.g. All meals — press Enter to add"
            values={included}
            onChange={setIncluded}
          />
          <TagListInput
            label="Excluded"
            placeholder="e.g. Personal expenses — press Enter to add"
            values={excluded}
            onChange={setExcluded}
          />
          <TagListInput
            label="Best Season"
            placeholder="e.g. December — press Enter to add"
            values={bestSeason}
            onChange={setBestSeason}
          />
          <TagListInput
            label="Tags"
            placeholder="e.g. snow-trek — press Enter to add"
            values={tags}
            onChange={setTags}
          />
        </section>

        {/* Itinerary */}
        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-[#0a1628]">Itinerary</h2>
            <button
              type="button"
              onClick={addDay}
              className="flex items-center gap-1.5 text-xs font-medium text-yellow-600 hover:text-yellow-700"
            >
              <Plus size={14} />
              Add Day
            </button>
          </div>

          <div className="space-y-4">
            {itinerary.map((day, i) => (
              <div key={i} className="border border-gray-100 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                    Day {i + 1}
                  </span>
                  {itinerary.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeDay(i)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  value={day.title}
                  onChange={(e) => updateDay(i, 'title', e.target.value)}
                  placeholder="Day title, e.g. Arrival & acclimatization"
                  className="w-full mb-2 px-3.5 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                />
                <textarea
                  value={day.description}
                  onChange={(e) => updateDay(i, 'description', e.target.value)}
                  rows={2}
                  placeholder="Day description (optional)"
                  className="w-full px-3.5 py-2 rounded-lg border border-gray-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                />
              </div>
            ))}
          </div>
        </section>

        {/* Flags */}
        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-8">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isFeatured}
                onChange={(e) => updateField('isFeatured', e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-yellow-500 focus:ring-yellow-400"
              />
              <span className="text-sm text-gray-600">Feature this package on the homepage</span>
            </label>
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => updateField('isActive', e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-yellow-500 focus:ring-yellow-400"
              />
              <span className="text-sm text-gray-600">Publish immediately (visible to public)</span>
            </label>
          </div>
        </section>

        {/* Submit */}
        <div className="flex items-center gap-3 pb-4">
          <button
            type="submit"
            disabled={submitting}
            className="bg-[#0a1628] text-white font-semibold text-sm px-8 py-3 rounded-full hover:bg-[#0f1f38] transition-colors disabled:opacity-60"
          >
            {submitting ? 'Creating...' : 'Create Package'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/packages')}
            className="text-sm font-medium text-gray-500 hover:text-gray-700 px-4 py-3"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminPackageForm;