import React, { useState } from 'react';
import { api } from '../services/api';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2, ChevronDown, MessageSquare, AlertCircle } from 'lucide-react';
import { useOutlet } from '../context/OutletContext';

export const Contact: React.FC = () => {
  const { selectedOutlet } = useOutlet();
  const outletAddress = selectedOutlet?.address || '#142, High Level Road, Kirulapone, Colombo 5, Sri Lanka';
  const outletPhone = selectedOutlet?.phone || '+94 78 479 8095';
  const outletEmail = selectedOutlet?.email || 'orders@ceyloncatch.lk';
  const outletHours = selectedOutlet?.opening_hours || 'Monday - Sunday: 7:30 AM - 7:30 PM (Daily Fresh Catch)';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      await api.submitContact(formData);
      setSuccess(true);
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (err: any) {
      setError(err.message || 'Failed to submit inquiry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const faqs = [
    {
      q: 'How is the seafood packed to ensure it stays fresh during delivery?',
      a: 'All seafood is cleaned, portioned, and immediately placed in food-grade sealed pouches accompanied by specialized thermal ice packs inside insulated boxes. The cold-chain is maintained from our processing unit right to your doorstep.',
    },
    {
      q: 'What are your delivery areas and cut-off times?',
      a: 'We deliver daily across Colombo 1-15 and suburbs (Rajagiriya, Battaramulla, Dehiwala, Mount Lavinia, Negombo, etc.) as well as Kandy. Orders placed before 2:00 PM are eligible for same-day delivery.',
    },
    {
      q: 'Can I request specific cuts or whole fish cleaned?',
      a: 'Yes! On every product card and detail modal, you can select your preferred cut (e.g. Cleaned Slices, Whole Scaled & Gutted, Boneless Cubes, or Tail-on Prawns). Our skilled fishmongers will prepare it to your exact specification.',
    },
    {
      q: 'What payment methods do you accept?',
      a: 'We accept Cash on Delivery (COD), Online Debit & Credit Cards (via secure PayHere gateway), and direct Bank Transfer / FriMi deposits.',
    },
  ];

  return (
    <div className="bg-slate-50 min-h-screen py-10 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-cyan-600 bg-cyan-50 px-3 py-1 rounded-full border border-cyan-200">
            Get In Touch
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-3">
            Contact CeylonCatch
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            Have questions regarding fresh catch availability, catering orders, or delivery zones? Reach out to our dedicated team.
          </p>
        </div>

        {/* Contact Info & Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Info Card (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-slate-900 rounded-3xl p-8 text-white space-y-6 shadow-xl">
              <div>
                <h3 className="text-xl font-bold">Central Hub & Flagship Store</h3>
                <p className="text-xs text-slate-400 mt-1">Visit our Kirulapone fresh seafood hub or order online for fast home delivery.</p>
              </div>

              <div className="space-y-4 text-xs text-slate-300">
                <div className="flex items-start space-x-3">
                  <MapPin className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block">Central Store Address:</strong>
                    <span>{outletAddress}</span>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Phone className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block">Delivery Hotline:</strong>
                    <span>{outletPhone} (Voice & WhatsApp)</span>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Mail className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block">Email:</strong>
                    <span>{outletEmail}</span>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Clock className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block">Operating Hours:</strong>
                    <span>{outletHours}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-8 shadow-xs border border-slate-200/80">
            <div className="flex items-center space-x-2 text-sm font-bold text-slate-900 mb-6 pb-3 border-b border-slate-100">
              <MessageSquare className="w-4 h-4 text-cyan-600" />
              <span>Send Us an Inquiry</span>
            </div>

            {success && (
              <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>Thank you! Your message has been sent to our customer care team. We will call or email you promptly.</span>
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700 flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Your Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Kasun Perera"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="+94 77 XXX XXXX"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="kasun@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Subject *</label>
                  <input
                    type="text"
                    required
                    placeholder="Bulk order / Delivery question"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Your Message *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="How can we assist you with fresh seafood..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-500 hover:to-blue-600 text-white font-bold text-xs py-3 px-8 rounded-xl shadow-md shadow-cyan-900/10 cursor-pointer flex items-center space-x-2 transition-all"
              >
                <span>{loading ? 'Submitting...' : 'Send Message'}</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>

        {/* FAQs Accordion */}
        <div className="bg-white rounded-3xl p-8 shadow-xs border border-slate-200/80">
          <div className="text-center max-w-xl mx-auto mb-8">
            <h3 className="text-xl font-black text-slate-900">Frequently Asked Questions</h3>
            <p className="text-xs text-slate-500 mt-1">Everything you need to know about our sourcing, packaging, and delivery.</p>
          </div>

          <div className="max-w-3xl mx-auto divide-y divide-slate-100">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} className="py-4">
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full text-left flex items-center justify-between cursor-pointer group"
                  >
                    <span className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-cyan-700 transition-colors">
                      {faq.q}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180 text-cyan-600' : ''}`} />
                  </button>
                  {isOpen && (
                    <p className="text-xs text-slate-600 mt-2.5 leading-relaxed animate-in fade-in duration-150">
                      {faq.a}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
