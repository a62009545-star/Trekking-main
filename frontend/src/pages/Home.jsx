import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield, Heart, Star, Users, MapPin, Clock, ChevronRight,
  Award, Compass, HeartHandshake, Mountain
} from 'lucide-react';
import Ankit from "../assets/Ankit.png";
import Archana from "../assets/Archana.png";
import Harshmani from "../assets/Harsh.png";
import Shivani from "../assets/Shivani.png";
import Arjun from "../assets/Arjun.png";
import API from '../api/axios';

// ─── Hero Section ───────────────────────────────────────────────
const Hero = () => (
  <section className="relative min-h-[90vh] flex items-center bg-[#0a1628] overflow-hidden">
    {/* Background gradient overlay */}
    <div className="absolute inset-0  to-transparent z-10" />

    {/* Background image placeholder */}
    <div
      className="absolute inset-0 bg-cover bg-center opacity-40"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1600&q=80')",
      }}
    />

    <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="max-w-2xl">
        <p className="text-yellow-400 text-sm font-semibold uppercase tracking-widest mb-3">
          COMMUNITY-LED • ADVENTURE-FIRST          </p>
        <h1 className="text-5xl sm:text-6xl font-bold text-white leading-tight mb-4">
          Empower &{' '}
          <span className="text-yellow-400">Explore</span>
        </h1>
        <p className="text-lg text-gray-300 mb-2 font-medium">
          "Empower & Explore the Journey Together — for Women & Groups Alike"
        </p>
        <p className="text-gray-400 mb-8 leading-relaxed">
          Join thousands of fearless explorers discovering India’s most breathtaking, transformative, and empowering destinations — with trips designed especially for women and open to all who seek meaningful travel.
        </p>
        <div className="flex flex-wrap gap-4">
          <Link
            to="/packages"
            className="bg-yellow-500 hover:bg-yellow-400 text-[#0a1628] font-bold px-8 py-3 rounded-full transition-colors flex items-center gap-2"
          >
            Explore Trips <ChevronRight size={18} />
          </Link>
          <Link
            to="/gallery"
            className="border-2 border-yellow-500 text-yellow-400 hover:bg-yellow-500 hover:text-[#0a1628] font-bold px-8 py-3 rounded-full transition-colors"
          >
            Watch Gallery
          </Link>
        </div>
      </div>
    </div>
  </section>
);

// ─── Stats Section ───────────────────────────────────────────────
const Stats = () => {
  const stats = [
    { value: '5,000+', label: 'Happy Travelers' },
    { value: '120+', label: 'Trips Completed' },
    { value: '8+', label: 'Years Experience' },
    { value: '98%', label: 'Customer Satisfaction' },
  ];

  return (
    <section className="bg-[#0d1f3c] py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl font-bold text-yellow-400">{stat.value}</p>
              <p className="text-sm text-gray-400 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ─── Featured Packages ───────────────────────────────────────────
const PackageCard = ({ pkg }) => (
  <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow group">
    <div className="relative overflow-hidden h-48">
      {pkg.images?.[0] ? (
        <img
          src={pkg.images[0].url}
          alt={pkg.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-blue-900 to-blue-700 flex items-center justify-center">
          <Mountain size={40} className="text-white/50" />
        </div>
      )}
      {pkg.isFeatured && (
        <span className="absolute top-3 left-3 bg-yellow-500 text-[#0a1628] text-xs font-bold px-2 py-1 rounded-full">
          Featured
        </span>
      )}
      <span className="absolute top-3 right-3 bg-[#0a1628]/80 text-white text-xs px-2 py-1 rounded-full">
        {pkg.difficulty}
      </span>
    </div>
    <div className="p-4">
      <div className="flex items-center gap-1 text-gray-500 text-xs mb-1">
        <MapPin size={12} />
        <span>{pkg.location?.region || 'India'}</span>
      </div>
      <h3 className="font-bold text-[#0a1628] text-base mb-1 line-clamp-1">{pkg.title}</h3>
      <p className="text-gray-500 text-xs mb-3 line-clamp-2">{pkg.shortDescription}</p>
      <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
        <span className="flex items-center gap-1">
          <Clock size={12} />
          {pkg.duration?.days}D / {pkg.duration?.nights}N
        </span>
        <span className="flex items-center gap-1">
          <Users size={12} />
          Max {pkg.groupSize?.max}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs text-gray-400">Starting from</span>
          <p className="text-lg font-bold text-[#0a1628]">
            ₹{pkg.price?.amount?.toLocaleString()}
          </p>
        </div>
        <Link
          to={`/packages/${pkg.slug}`}
          className="bg-[#0a1628] hover:bg-yellow-500 hover:text-[#0a1628] text-white text-xs font-semibold px-4 py-2 rounded-full transition-colors"
        >
          Book Now
        </Link>
      </div>
    </div>
  </div>
);

const FeaturedPackages = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const res = await API.get('/packages?featured=true&limit=6');
        setPackages(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPackages();
  }, []);

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <p className="text-yellow-500 text-sm font-semibold uppercase tracking-widest mb-2">
            Handpicked for You
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#0a1628]">
            Our Featured Trips
          </h2>
          <p className="text-gray-500 mt-3 max-w-xl mx-auto text-sm">
            Carefully curated women-only trek experiences across India's most stunning landscapes, cultural hotspots, and coastal escapes.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-md animate-pulse">
                <div className="h-48 bg-gray-200" />
                <div className="p-4 space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-1/3" />
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-full" />
                  <div className="h-8 bg-gray-200 rounded w-1/3 ml-auto" />
                </div>
              </div>
            ))}
          </div>
        ) : packages.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Mountain size={48} className="mx-auto mb-3 opacity-30" />
            <p>No featured packages yet. Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {packages.map((pkg) => (
              <PackageCard key={pkg._id} pkg={pkg} />
            ))}
          </div>
        )}

        <div className="text-center mt-10">
          <Link
            to="/packages"
            className="inline-flex items-center gap-2 bg-[#0a1628] hover:bg-yellow-500 hover:text-[#0a1628] text-white font-semibold px-8 py-3 rounded-full transition-colors"
          >
            View All Packages <ChevronRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
};

// ─── Why Travel With Us ──────────────────────────────────────────
const WhyUs = () => {
  const reasons = [
    {
      icon: <Shield size={28} />,
      title: 'Women-Only Groups',
      desc: 'Travel safely in the company of like-minded women with certified female guides.',
    },
    {
      icon: <HeartHandshake size={28} />,
      title: 'Trusted Hospitality',
      desc: 'Thoughtfully designed accommodations and experiences throughout your journey.',
    },
    {
      icon: <Award size={28} />,
      title: 'Well Equipped',
      desc: 'All essentials provided including safety gear, first aid, and emergency support.',
    },
    {
      icon: <Heart size={28} />,
      title: 'Mindful Curation',
      desc: 'Every detail curated for comfort, safety, and meaningful experiences.',
    },
    {
      icon: <Star size={28} />,
      title: 'Small Meaningful Groups',
      desc: 'Deliberately kept small groups to ensure personal attention and bonding.',
    },
    {
      icon: <Compass size={28} />,
      title: 'Expert Local Guides',
      desc: 'Knowledgeable and passionate guides who know every trail and story.',
    },
    {
      icon: <Users size={28} />,
      title: 'Community Building',
      desc: 'Join a growing sisterhood of women who travel, explore, and inspire.',
    },
    {
      icon: <Mountain size={28} />,
      title: 'Unmatched Diversity',
      desc: 'From Himalayan treks to coastal escapes — experiences for every woman.',
    },
  ];

  return (
    <section className="py-16 bg-[#0a1628]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <p className="text-yellow-400 text-sm font-semibold uppercase tracking-widest mb-2">
            Our Promise
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            Why Travel With Matrika?
          </h2>
          <p className="text-gray-400 mt-3 max-w-xl mx-auto text-sm">
            Every journey thoughtfully crafted for safety, community, empowerment, and boundless joy.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {reasons.map((r) => (
            <div
              key={r.title}
              className="bg-[#0d1f3c] rounded-2xl p-5 hover:bg-[#1a2f4a] transition-colors group"
            >
              <div className="text-yellow-400 mb-3 group-hover:scale-110 transition-transform">
                {r.icon}
              </div>
              <h3 className="text-white font-semibold text-sm mb-2">{r.title}</h3>
              <p className="text-gray-400 text-xs leading-relaxed">{r.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ─── About Section ───────────────────────────────────────────────
const About = () => {
  const team = [
    {
      name: 'Archana Uniyal',
      role: 'Founder',
      initials: 'AU',
      photo: Archana, // e.g. '/team/archana.jpg' — leave empty to fall back to initials
      av: 'bg-amber-100 text-amber-900',
      badge: 'Leadership',
      badgeColor: 'bg-amber-100 text-amber-800',
    },
    {
      name: 'Harshmani Uniyal',
      role: 'CEO',
      initials: 'HU',
      photo: Harshmani,
      av: 'bg-[#0a1628] text-yellow-400',
      badge: 'Leadership',
      badgeColor: 'bg-[#0a1628] text-yellow-400',
    },
    {
      name: 'Ankit Sajwan',
      role: 'Company Manager',
      initials: 'AS',
      photo: Ankit,
      av: 'bg-amber-100 text-amber-900',
      badge: 'Operations',
      badgeColor: 'bg-blue-50 text-blue-800',
    },
    {
      name: 'Arjun Uniyal',
      role: 'Accounts Manager',
      initials: 'AU',
      photo: Arjun,
      av: 'bg-[#0a1628] text-yellow-400',
      badge: 'Finance',
      badgeColor: 'bg-green-50 text-green-800',
    },
    {
      name: 'Shivani',
      role: 'Marketing Manager',
      initials: 'SH',
      photo: Shivani,
      av: 'bg-amber-100 text-amber-900',
      badge: 'Growth',
      badgeColor: 'bg-purple-50 text-purple-800',
    },

  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-amber-700 bg-amber-100 px-4 py-1.5 rounded-full mb-3">
            The People Behind the Magic
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#0a1628] mb-2">
            Meet the Team
          </h2>
          <p className="text-gray-400 text-sm">Six passionate people. One mission.</p>
        </div>

        {/* Team Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
          {team.map((member) => (
            <div
              key={member.name}
              className="bg-white border border-gray-100 hover:border-yellow-400 rounded-2xl p-6 text-center transition-all duration-300 hover:-translate-y-1 group"
            >
              {/* Avatar with dashed ring */}
              <div className="relative w-18 h-18 mx-auto mb-4" style={{ width: '72px', height: '72px' }}>
                <div
                  className="absolute inset-0 rounded-full border-2 border-dashed border-gray-200 group-hover:border-yellow-400 transition-colors duration-300"
                  style={{
                    inset: '-6px',
                    position: 'absolute',
                    borderRadius: '50%',
                    width: 'calc(100% + 12px)',
                    height: 'calc(100% + 12px)',
                  }}
                />
                {member.photo ? (
                  <img
                    src={member.photo}
                    alt={member.name}
                    className="w-full h-full rounded-full object-cover object-center"
                  />
                ) : (
                  <div
                    className={`w-full h-full rounded-full flex items-center justify-center text-sm font-bold ${member.av}`}
                  >
                    {member.initials}
                  </div>
                )}
              </div>

              <p className="font-bold text-[#0a1628] text-sm leading-tight mb-1">{member.name}</p>
              <p className="text-gray-400 text-xs uppercase tracking-wider mb-3">{member.role}</p>
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${member.badgeColor}`}>
                {member.badge}
              </span>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

// ─── Testimonials ────────────────────────────────────────────────
const Testimonials = () => {
  const testimonials = [
    {
      name: 'Aanya Singh',
      city: 'Mumbai',
      text: 'The Valley of Flowers trek was life-changing! The team made sure every moment was safe, fun, and filled with memories I will treasure forever.',
      rating: 5,
    },
    {
      name: 'Meera Patel',
      city: 'Ahmedabad',
      text: 'As a solo traveler, I was nervous at first. But Matrika made me feel at home from day one. The sisterhood I found here is priceless!',
      rating: 5,
    },
    {
      name: 'Divya Nair',
      city: 'Bangalore',
      text: 'Professional, caring, and deeply empowering. Every detail was thoughtfully arranged. Will definitely book again!',
      rating: 5,
    },
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <p className="text-yellow-500 text-sm font-semibold uppercase tracking-widest mb-2">
            Real Stories
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#0a1628]">
            What Our Travelers Say          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div key={t.name} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex gap-1 mb-3">
                {[...Array(t.rating)].map((_, i) => (
                  <Star key={i} size={14} className="text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">"{t.text}"</p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-yellow-500 rounded-full flex items-center justify-center text-[#0a1628] font-bold text-sm">
                  {t.name[0]}
                </div>
                <div>
                  <p className="font-semibold text-[#0a1628] text-sm">{t.name}</p>
                  <p className="text-xs text-gray-400">{t.city}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ─── CTA / Book Section ──────────────────────────────────────────
const CTA = () => (
  <section className="py-16 bg-[#0d1f3c]">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div>
          <p className="text-yellow-400 text-sm font-semibold uppercase tracking-widest mb-2">
            Start Your Adventure
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to Start Your Journey?
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed mb-6">
            Choose from our carefully curated trek packages and take the first step toward an unforgettable adventure. Our team is ready to help you plan the perfect trip.
          </p>
          <ul className="space-y-2 mb-6">
            {[
              'Women-only safe group travel',
              'Expert certified female guides',
              'All difficulty levels covered',
              '24/7 support throughout your journey',
            ].map((point) => (
              <li key={point} className="flex items-center gap-2 text-sm text-gray-300">
                <div className="w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center shrink-0">
                  <ChevronRight size={10} className="text-[#0a1628]" />
                </div>
                {point}
              </li>
            ))}
          </ul>
          <Link
            to="/packages"
            className="inline-flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-[#0a1628] font-bold px-8 py-3 rounded-full transition-colors"
          >
            Browse Packages <ChevronRight size={18} />
          </Link>
        </div>

        {/* Quick Contact Form */}
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h3 className="font-bold text-[#0a1628] text-lg mb-4">Book Your Trip</h3>
          <QuickContactForm />
        </div>
      </div>
    </div>
  </section>
);

const QuickContactForm = () => {
  const [form, setForm] = useState({
    name: '', email: '', phone: '', subject: 'Trip Enquiry', message: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post('/contact', form);
      setSuccess(true);
      setForm({ name: '', email: '', phone: '', subject: 'Trip Enquiry', message: '' });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <Heart size={28} className="text-green-500" />
        </div>
        <h4 className="font-bold text-[#0a1628] mb-2">Enquiry Sent!</h4>
        <p className="text-gray-500 text-sm">We'll get back to you within 24 hours.</p>
        <button
          onClick={() => setSuccess(false)}
          className="mt-4 text-yellow-500 text-sm font-medium hover:underline"
        >
          Send another enquiry
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <input
          type="text"
          placeholder="Your Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
          className="col-span-2 sm:col-span-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-yellow-400"
        />
        <input
          type="tel"
          placeholder="Phone Number"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          required
          className="col-span-2 sm:col-span-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-yellow-400"
        />
      </div>
      <input
        type="email"
        placeholder="Email Address"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
        required
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-yellow-400"
      />
      <div className="flex gap-2 flex-wrap">
        {['Himalayan', 'Coastal', 'Desert', 'Cultural'].map((cat) => (
          <button
            type="button"
            key={cat}
            onClick={() => setForm({ ...form, subject: `${cat} Trek Enquiry` })}
            className={`text-xs px-3 py-1 rounded-full border transition-colors ${form.subject === `${cat} Trek Enquiry`
              ? 'bg-yellow-500 border-yellow-500 text-[#0a1628] font-semibold'
              : 'border-gray-200 text-gray-500 hover:border-yellow-400'
              }`}
          >
            {cat}
          </button>
        ))}
      </div>
      <textarea
        placeholder="Tell us about your dream trip..."
        rows={3}
        value={form.message}
        onChange={(e) => setForm({ ...form, message: e.target.value })}
        required
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-yellow-400 resize-none"
      />
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#0a1628] hover:bg-yellow-500 hover:text-[#0a1628] text-white font-semibold py-3 rounded-full transition-colors text-sm disabled:opacity-60"
      >
        {loading ? 'Sending...' : 'Send Enquiry'}
      </button>
    </form>
  );
};

// ─── Main Home Page ──────────────────────────────────────────────
const Home = () => {
  return (
    <div>
      <Hero />
      <Stats />
      <FeaturedPackages />
      <WhyUs />
      <About />
      <Testimonials />
      <CTA />
    </div>
  );
};

export default Home;