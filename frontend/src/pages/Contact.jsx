import { useState } from 'react';
import { Phone, Mail, MapPin, Clock, Send, CheckCircle2 } from 'lucide-react';
import API from '../api/axios';

const contactInfo = [
  {
    icon: Phone,
    label: 'Call Us',
    value: '+91 9027378308',
    sub: 'Mon - Sat, 9am - 7pm',
  },
  {
    icon: Mail,
    label: 'Email Us',
    value: 'matrikatoursandtravels3@gmail.com',
    sub: 'We reply within 24 hours',
  },
  {
    icon: MapPin,
    label: 'Visit Us',
    value: 'Jogiwala, Dehradun',
    sub: 'Uttarakhand, India - 248001',
  },
  {
    icon: Clock,
    label: 'Office Hours',
    value: '9:00 AM - 7:00 PM',
    sub: 'Monday to Saturday',
  },
];

const initialForm = { name: '', email: '', phone: '', subject: '', message: '' };

const Contact = () => {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = 'Name is required';
    if (!form.email.trim()) newErrors.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) newErrors.email = 'Enter a valid email';
    if (!form.subject.trim()) newErrors.subject = 'Subject is required';
    if (!form.message.trim()) newErrors.message = 'Message is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!validate()) return;

    setSubmitting(true);
    try {
      await API.post('/contact', form);
      setSubmitted(true);
      setForm(initialForm);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#0a1628] py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-yellow-400 text-sm font-semibold uppercase tracking-widest mb-2">
            Get In Touch
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-3">Contact Us</h1>
          <p className="text-gray-400 max-w-xl mx-auto text-sm">
            Have a question about a trek, a booking, or just want to say hi? We'd love to hear from you.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Form */}
          <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-200 p-6 sm:p-8">
            {submitted ? (
              <div className="text-center py-16">
                <CheckCircle2 size={56} className="mx-auto mb-4 text-yellow-400" />
                <h3 className="text-lg font-semibold text-[#0a1628] mb-2">Message Sent!</h3>
                <p className="text-gray-500 text-sm mb-6">
                  Thanks for reaching out. Our team will get back to you shortly.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="text-sm font-medium text-[#0a1628] underline underline-offset-2"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-semibold text-[#0a1628] mb-1">Send us a message</h2>
                <p className="text-sm text-gray-400 mb-6">
                  Fill out the form below and we'll get back to you as soon as possible.
                </p>

                {error && (
                  <div className="mb-5 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3">
                    {error}
                  </div>
                )}

                <div className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1.5">
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="John Doe"
                        className={`w-full px-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent ${
                          errors.name ? 'border-red-300' : 'border-gray-200'
                        }`}
                      />
                      {errors.name && (
                        <p className="text-xs text-red-500 mt-1">{errors.name}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1.5">
                        Phone (optional)
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        placeholder="+91 98765 43210"
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="john@example.com"
                      className={`w-full px-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent ${
                        errors.email ? 'border-red-300' : 'border-gray-200'
                      }`}
                    />
                    {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1.5">
                      Subject
                    </label>
                    <input
                      type="text"
                      name="subject"
                      value={form.subject}
                      onChange={handleChange}
                      placeholder="Booking inquiry, general question..."
                      className={`w-full px-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent ${
                        errors.subject ? 'border-red-300' : 'border-gray-200'
                      }`}
                    />
                    {errors.subject && (
                      <p className="text-xs text-red-500 mt-1">{errors.subject}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1.5">
                      Message
                    </label>
                    <textarea
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      rows={5}
                      placeholder="Tell us more about what you need..."
                      className={`w-full px-4 py-2.5 rounded-lg border text-sm resize-none focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent ${
                        errors.message ? 'border-red-300' : 'border-gray-200'
                      }`}
                    />
                    {errors.message && (
                      <p className="text-xs text-red-500 mt-1">{errors.message}</p>
                    )}
                  </div>

                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#0a1628] text-white font-semibold text-sm px-8 py-3 rounded-full hover:bg-[#0f1f38] transition-colors disabled:opacity-60"
                  >
                    {submitting ? 'Sending...' : 'Send Message'}
                    <Send size={16} />
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Map */}
          <div className="lg:col-span-2 rounded-2xl overflow-hidden border border-gray-200 min-h-[320px]">
            <iframe
              title="Matrika Treks Location"
              src="https://www.google.com/maps?q=Jogiwala,+Dehradun,+Uttarakhand+248001&output=embed"
              className="w-full h-full min-h-[320px]"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
      {/* Info Cards */}
        <div className="px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {contactInfo.map(({ icon: Icon, label, value, sub }) => (
            <div
              key={label}
              className="bg-white rounded-xl border border-gray-200 p-5 hover:border-yellow-400 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-[#0a1628] flex items-center justify-center mb-3">
                <Icon size={18} className="text-yellow-400" />
              </div>
              <p className="text-xs uppercase tracking-wide text-gray-400 font-semibold mb-1">
                {label}
              </p>
              <p className="text-sm font-medium text-[#0a1628]">{value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
            </div>
          ))}
        </div>
    </div>
  );
};

export default Contact;