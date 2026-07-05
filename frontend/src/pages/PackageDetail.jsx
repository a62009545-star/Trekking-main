import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  MapPin, Clock, Users, CheckCircle, XCircle,
  Mountain, Calendar, Star, Phone, Mail, ChevronDown, ChevronUp,
  ArrowLeft, XCircle as X
} from 'lucide-react';
import API from '../api/axios';
import toast from 'react-hot-toast';

const ImageGallery = ({ images, title }) => {
  const [active, setActive] = useState(0);
  if (!images || images.length === 0) {
    return (
      <div className="w-full h-80 bg-gradient-to-br from-[#0a1628] to-[#1a3a6b] rounded-2xl flex items-center justify-center">
        <Mountain size={64} className="text-white/20" />
      </div>
    );
  }
  return (
    <div>
      <div className="rounded-2xl overflow-hidden h-80 sm:h-96 mb-3">
        <img src={images[active].url} alt={title} className="w-full h-full object-cover" />
      </div>
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button key={i} onClick={() => setActive(i)} className={`shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-colors ${active === i ? 'border-yellow-500' : 'border-transparent'}`}>
              <img src={img.url} alt={`${title} ${i + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const BookingForm = ({ pkg }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [bookingId, setBookingId] = useState(null);
  const [form, setForm] = useState({
    contactPerson: { name: '', email: '', phone: '', city: '' },
    travelers: [{ name: '', age: '', gender: 'Female' }],
    groupSize: 1,
    trekDate: '',
    specialRequests: '',
    emergencyContact: { name: '', phone: '', relation: '' },
  });

  const updateContact = (field, value) => setForm((prev) => ({ ...prev, contactPerson: { ...prev.contactPerson, [field]: value } }));
  const updateEmergency = (field, value) => setForm((prev) => ({ ...prev, emergencyContact: { ...prev.emergencyContact, [field]: value } }));
  const updateTraveler = (index, field, value) => {
    const updated = [...form.travelers];
    updated[index] = { ...updated[index], [field]: value };
    setForm((prev) => ({ ...prev, travelers: updated }));
  };
  const addTraveler = () => {
    if (form.travelers.length < (pkg.groupSize?.max || 20)) {
      setForm((prev) => ({ ...prev, travelers: [...prev.travelers, { name: '', age: '', gender: 'Female' }], groupSize: prev.groupSize + 1 }));
    }
  };
  const removeTraveler = (index) => {
    if (form.travelers.length > 1) {
      const updated = form.travelers.filter((_, i) => i !== index);
      setForm((prev) => ({ ...prev, travelers: updated, groupSize: updated.length }));
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await API.post('/bookings', {
        packageId: pkg._id,
        ...form,
        groupSize: form.travelers.length,
        travelers: form.travelers.map((t) => ({ ...t, age: Number(t.age) })),
      });
      setBookingId(res.data.data.bookingId);
      setStep(3);
      toast.success('Booking submitted successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (step === 3 && bookingId) {
    return (
      <div className="text-center py-8 px-4">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={32} className="text-green-500" />
        </div>
        <h3 className="text-xl font-bold text-[#0a1628] mb-2">Booking Submitted!</h3>
        <p className="text-gray-500 text-sm mb-4">Your booking ID is:</p>
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-6 py-3 inline-block mb-4">
          <p className="text-2xl font-bold text-[#0a1628] tracking-widest">{bookingId}</p>
        </div>
        <p className="text-gray-400 text-xs mb-6">Save this ID to check your booking status anytime.</p>
        <button onClick={() => { setStep(1); setBookingId(null); }} className="text-yellow-500 text-sm font-medium hover:underline">
          Make another booking
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        {[1, 2].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${step >= s ? 'bg-[#0a1628] text-white' : 'bg-gray-100 text-gray-400'}`}>{s}</div>
            {s < 2 && <div className={`h-0.5 w-8 ${step > s ? 'bg-[#0a1628]' : 'bg-gray-200'}`} />}
          </div>
        ))}
        <span className="text-xs text-gray-400 ml-2">{step === 1 ? 'Contact Details' : 'Travelers & Date'}</span>
      </div>

      {step === 1 && (
        <div className="space-y-3">
          <h4 className="font-semibold text-[#0a1628] text-sm">Contact Person</h4>
          <input type="text" placeholder="Full Name *" value={form.contactPerson.name} onChange={(e) => updateContact('name', e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-yellow-400" />
          <input type="email" placeholder="Email Address *" value={form.contactPerson.email} onChange={(e) => updateContact('email', e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-yellow-400" />
          <input type="tel" placeholder="Phone Number *" value={form.contactPerson.phone} onChange={(e) => updateContact('phone', e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-yellow-400" />
          <input type="text" placeholder="City" value={form.contactPerson.city} onChange={(e) => updateContact('city', e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-yellow-400" />
          <h4 className="font-semibold text-[#0a1628] text-sm pt-2">Emergency Contact</h4>
          <input type="text" placeholder="Emergency Contact Name" value={form.emergencyContact.name} onChange={(e) => updateEmergency('name', e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-yellow-400" />
          <div className="grid grid-cols-2 gap-2">
            <input type="tel" placeholder="Phone" value={form.emergencyContact.phone} onChange={(e) => updateEmergency('phone', e.target.value)} className="border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-yellow-400" />
            <input type="text" placeholder="Relation" value={form.emergencyContact.relation} onChange={(e) => updateEmergency('relation', e.target.value)} className="border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-yellow-400" />
          </div>
          <button onClick={() => { if (!form.contactPerson.name || !form.contactPerson.email || !form.contactPerson.phone) { toast.error('Please fill in all required fields'); return; } setStep(2); }} className="w-full bg-[#0a1628] hover:bg-yellow-500 hover:text-[#0a1628] text-white font-semibold py-3 rounded-xl transition-colors text-sm">
            Next: Traveler Details
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Trek Date *</label>
            <input type="date" value={form.trekDate} onChange={(e) => setForm((prev) => ({ ...prev, trekDate: e.target.value }))} min={new Date().toISOString().split('T')[0]} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-yellow-400" />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-gray-500 uppercase">Travelers</label>
              <button onClick={addTraveler} className="text-xs text-yellow-600 font-medium hover:underline">+ Add Traveler</button>
            </div>
            <div className="space-y-3">
              {form.travelers.map((t, i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-600">Traveler {i + 1}</span>
                    {form.travelers.length > 1 && <button onClick={() => removeTraveler(i)} className="text-xs text-red-400 hover:text-red-600">Remove</button>}
                  </div>
                  <input type="text" placeholder="Full Name *" value={t.name} onChange={(e) => updateTraveler(i, 'name', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-yellow-400 bg-white" />
                  <div className="grid grid-cols-2 gap-2">
                    <input type="number" placeholder="Age *" value={t.age} onChange={(e) => updateTraveler(i, 'age', e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-yellow-400 bg-white" />
                    <select value={t.gender} onChange={(e) => updateTraveler(i, 'gender', e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-yellow-400 bg-white">
                      <option value="Female">Female</option>
                      <option value="Male">Male</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <textarea placeholder="Special requests..." rows={3} value={form.specialRequests} onChange={(e) => setForm((prev) => ({ ...prev, specialRequests: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-yellow-400 resize-none" />
          <div className="flex gap-2">
            <button onClick={() => setStep(1)} className="flex-1 border border-gray-200 text-gray-600 font-semibold py-3 rounded-xl text-sm hover:border-gray-300 transition-colors">Back</button>
            <button onClick={() => { if (!form.trekDate) { toast.error('Please select a trek date'); return; } if (form.travelers.some((t) => !t.name || !t.age)) { toast.error('Please fill in all traveler details'); return; } handleSubmit(); }} disabled={loading} className="flex-1 bg-[#0a1628] hover:bg-yellow-500 hover:text-[#0a1628] text-white font-semibold py-3 rounded-xl transition-colors text-sm disabled:opacity-60">
              {loading ? 'Submitting...' : 'Submit Booking'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const PackageDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [pkg, setPkg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openItinerary, setOpenItinerary] = useState(null);

  useEffect(() => {
    const fetchPackage = async () => {
      try {
        const res = await API.get(`/packages/${slug}`);
        setPkg(res.data.data);
      } catch {
        navigate('/packages');
      } finally {
        setLoading(false);
      }
    };
    fetchPackage();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!pkg) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#0a1628] py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <button onClick={() => navigate('/packages')} className="flex items-center gap-2 text-gray-400 hover:text-yellow-400 text-sm transition-colors">
            <ArrowLeft size={16} /> Back to Packages
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <ImageGallery images={pkg.images} title={pkg.title} />

            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="text-xs bg-yellow-100 text-yellow-700 font-semibold px-3 py-1 rounded-full">{pkg.category}</span>
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${pkg.difficulty === 'Easy' ? 'bg-green-100 text-green-700' : pkg.difficulty === 'Moderate' ? 'bg-yellow-100 text-yellow-700' : pkg.difficulty === 'Difficult' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'}`}>{pkg.difficulty}</span>
                {pkg.isFeatured && <span className="text-xs bg-[#0a1628] text-white font-semibold px-3 py-1 rounded-full flex items-center gap-1"><Star size={10} className="fill-yellow-400 text-yellow-400" /> Featured</span>}
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-[#0a1628] mb-3">{pkg.title}</h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1"><MapPin size={14} className="text-yellow-500" />{pkg.location?.region}, {pkg.location?.state}</span>
                <span className="flex items-center gap-1"><Clock size={14} className="text-yellow-500" />{pkg.duration?.days} Days / {pkg.duration?.nights} Nights</span>
                <span className="flex items-center gap-1"><Users size={14} className="text-yellow-500" />{pkg.groupSize?.min}–{pkg.groupSize?.max} People</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6">
              <h2 className="text-lg font-bold text-[#0a1628] mb-3">About This Trek</h2>
              <p className="text-gray-600 text-sm leading-relaxed">{pkg.fullDescription}</p>
            </div>

            {pkg.highlights?.length > 0 && (
              <div className="bg-white rounded-2xl p-6">
                <h2 className="text-lg font-bold text-[#0a1628] mb-4">Highlights</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {pkg.highlights.map((h, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <Star size={14} className="text-yellow-500 fill-yellow-500 mt-0.5 shrink-0" />
                      <span className="text-sm text-gray-600">{h}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(pkg.included?.length > 0 || pkg.excluded?.length > 0) && (
              <div className="bg-white rounded-2xl p-6">
                <h2 className="text-lg font-bold text-[#0a1628] mb-4">Inclusions & Exclusions</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {pkg.included?.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-green-600 mb-3 flex items-center gap-1"><CheckCircle size={14} /> Included</h3>
                      <ul className="space-y-2">
                        {pkg.included.map((item, i) => <li key={i} className="flex items-start gap-2 text-sm text-gray-600"><CheckCircle size={13} className="text-green-500 mt-0.5 shrink-0" />{item}</li>)}
                      </ul>
                    </div>
                  )}
                  {pkg.excluded?.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-red-500 mb-3 flex items-center gap-1"><XCircle size={14} /> Excluded</h3>
                      <ul className="space-y-2">
                        {pkg.excluded.map((item, i) => <li key={i} className="flex items-start gap-2 text-sm text-gray-600"><XCircle size={13} className="text-red-400 mt-0.5 shrink-0" />{item}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {pkg.itinerary?.length > 0 && (
              <div className="bg-white rounded-2xl p-6">
                <h2 className="text-lg font-bold text-[#0a1628] mb-4">Day-by-Day Itinerary</h2>
                <div className="space-y-2">
                  {pkg.itinerary.map((day) => (
                    <div key={day.day} className="border border-gray-100 rounded-xl overflow-hidden">
                      <button onClick={() => setOpenItinerary(openItinerary === day.day ? null : day.day)} className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 bg-[#0a1628] text-white text-xs font-bold rounded-full flex items-center justify-center shrink-0">{day.day}</span>
                          <span className="font-semibold text-[#0a1628] text-sm">{day.title}</span>
                        </div>
                        {openItinerary === day.day ? <ChevronUp size={16} className="text-gray-400 shrink-0" /> : <ChevronDown size={16} className="text-gray-400 shrink-0" />}
                      </button>
                      {openItinerary === day.day && day.description && (
                        <div className="px-4 pb-4 pt-1 text-sm text-gray-600 border-t border-gray-100">{day.description}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(pkg.bestSeason?.length > 0 || pkg.tags?.length > 0) && (
              <div className="bg-white rounded-2xl p-6">
                {pkg.bestSeason?.length > 0 && (
                  <div className="mb-4">
                    <h2 className="text-lg font-bold text-[#0a1628] mb-3 flex items-center gap-2"><Calendar size={18} className="text-yellow-500" /> Best Season</h2>
                    <div className="flex flex-wrap gap-2">
                      {pkg.bestSeason.map((s, i) => <span key={i} className="bg-yellow-50 text-yellow-700 text-xs font-medium px-3 py-1 rounded-full border border-yellow-200">{s}</span>)}
                    </div>
                  </div>
                )}
                {pkg.tags?.length > 0 && (
                  <div>
                    <h2 className="text-lg font-bold text-[#0a1628] mb-3">Tags</h2>
                    <div className="flex flex-wrap gap-2">
                      {pkg.tags.map((tag, i) => <span key={i} className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">#{tag}</span>)}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-20 space-y-4">
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="mb-4">
                  <p className="text-xs text-gray-400">Starting from</p>
                  <p className="text-3xl font-bold text-[#0a1628]">₹{pkg.price?.amount?.toLocaleString()}<span className="text-sm font-normal text-gray-400 ml-1">/ person</span></p>
                </div>
                <div className="space-y-2 text-sm text-gray-600 mb-4 pb-4 border-b border-gray-100">
                  <div className="flex justify-between"><span className="text-gray-400">Duration</span><span className="font-medium">{pkg.duration?.days}D / {pkg.duration?.nights}N</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">Difficulty</span><span className="font-medium">{pkg.difficulty}</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">Group Size</span><span className="font-medium">{pkg.groupSize?.min}–{pkg.groupSize?.max}</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">Category</span><span className="font-medium">{pkg.category}</span></div>
                </div>
                <BookingForm pkg={pkg} />
              </div>

              <div className="bg-[#0a1628] rounded-2xl p-5">
                <h3 className="text-white font-semibold mb-1">Need Help?</h3>
                <p className="text-gray-400 text-xs mb-4">Our team is happy to help you plan your perfect trek.</p>
                <a href="tel:+919876543210" className="flex items-center gap-2 text-yellow-400 text-sm hover:text-yellow-300 transition-colors mb-2"><Phone size={14} /> +91 98765 43210</a>
                <a href="mailto:info@matrikatours.com" className="flex items-center gap-2 text-yellow-400 text-sm hover:text-yellow-300 transition-colors"><Mail size={14} /> info@matrikatours.com</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PackageDetail;