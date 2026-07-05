import { useState, useEffect } from 'react';
import { ChevronDown, HelpCircle, Search } from 'lucide-react';
import API from '../api/axios';

const categories = ['All', 'Booking', 'Trekking', 'Payment', 'Safety', 'Other'];

const FAQ = () => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [openId, setOpenId] = useState(null);

  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        // Backend mounts this router at /api/faq (singular) — see server.js
        const params = activeCategory !== 'All' ? `?category=${activeCategory}` : '';
        const res = await API.get(`/faq${params}`);
        setFaqs(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchFaqs();
  }, [activeCategory]);

  const handleCategoryChange = (cat) => {
    setActiveCategory(cat);
    setLoading(true);
    setOpenId(null);
  };

  const filteredFaqs = faqs.filter(
    (f) =>
      f.question.toLowerCase().includes(search.toLowerCase()) ||
      f.answer.toLowerCase().includes(search.toLowerCase())
  );

  const toggleOpen = (id) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#0a1628] py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-yellow-400 text-sm font-semibold uppercase tracking-widest mb-2">
            Got Questions?
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-3">
            Frequently Asked Questions
          </h1>
          <p className="text-gray-400 max-w-xl mx-auto text-sm">
            Everything you need to know before you lace up your boots and join a Matrika trek.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Search */}
        <div className="relative mb-6">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search a question..."
            className="w-full pl-11 pr-4 py-3 rounded-full border border-gray-200 bg-white text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
          />
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 justify-center mb-10">
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

        {/* Accordion List */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse bg-gray-200 rounded-xl h-16" />
            ))}
          </div>
        ) : filteredFaqs.length === 0 ? (
          <div className="text-center py-20">
            <HelpCircle size={56} className="mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-500 mb-2">No questions found</h3>
            <p className="text-gray-400 text-sm">
              Try a different search term or browse another category.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredFaqs.map((faq) => {
              const isOpen = openId === faq._id;
              return (
                <div
                  key={faq._id}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden"
                >
                  <button
                    onClick={() => toggleOpen(faq._id)}
                    className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
                  >
                    <span className="text-sm sm:text-base font-medium text-[#0a1628]">
                      {faq.question}
                    </span>
                    <ChevronDown
                      size={18}
                      className={`flex-shrink-0 text-gray-400 transition-transform duration-300 ${
                        isOpen ? 'rotate-180 text-yellow-500' : ''
                      }`}
                    />
                  </button>
                  <div
                    className={`grid transition-all duration-300 ease-in-out ${
                      isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className="px-5 pb-4 text-sm text-gray-500 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Still have questions CTA */}
        <div className="mt-14 text-center bg-[#0a1628] rounded-2xl py-10 px-6">
          <h3 className="text-white text-xl font-semibold mb-2">Still have questions?</h3>
          <p className="text-gray-400 text-sm mb-5">
            Our team is happy to help you plan your next adventure.
          </p>
          <a
            href="/contact"
            className="inline-block bg-yellow-400 text-[#0a1628] font-semibold text-sm px-6 py-3 rounded-full hover:bg-yellow-300 transition-colors"
          >
            Contact Us
          </a>
        </div>
      </div>
    </div>
  );
};

export default FAQ;