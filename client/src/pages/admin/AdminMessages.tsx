import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { ContactMessage } from '../../types';
import { MessageSquare, Mail, Phone, Calendar, Trash2, CheckCircle2, RefreshCw } from 'lucide-react';

export const AdminMessages: React.FC = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = () => {
    setLoading(true);
    api.getMessages()
      .then((data) => setMessages(data.messages))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleToggleRead = async (id: string, currentStatus: boolean | number) => {
    try {
      await api.markMessageRead(id, !currentStatus);
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, is_read: !currentStatus } : m))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this message?')) return;
    try {
      await api.deleteMessage(id);
      setMessages((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Customer Inquiries</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Messages sent from the Contact Us form and bulk inquiry requests.
          </p>
        </div>

        <button
          onClick={fetchMessages}
          className="p-2.5 bg-slate-950 border border-slate-800 text-slate-300 rounded-xl text-xs flex items-center space-x-2 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      <div className="space-y-4">
        {messages.length > 0 ? (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`p-6 rounded-3xl border transition-all ${
                msg.is_read
                  ? 'bg-slate-950/60 border-slate-800/80 text-slate-300'
                  : 'bg-slate-900 border-cyan-800/60 text-white shadow-lg ring-1 ring-cyan-500/20'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                    msg.is_read ? 'bg-slate-800 text-slate-400' : 'bg-cyan-600 text-white'
                  }`}>
                    {msg.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold">{msg.name}</h4>
                    <div className="flex items-center space-x-3 text-[11px] text-slate-400 mt-0.5">
                      <span className="flex items-center space-x-1">
                        <Mail className="w-3 h-3 text-cyan-400" />
                        <a href={`mailto:${msg.email}`} className="hover:underline">{msg.email}</a>
                      </span>
                      {msg.phone && (
                        <span className="flex items-center space-x-1">
                          <Phone className="w-3 h-3 text-cyan-400" />
                          <a href={`tel:${msg.phone}`} className="hover:underline">{msg.phone}</a>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-[10px] text-slate-500">
                    {msg.created_at}
                  </span>
                  <button
                    onClick={() => handleToggleRead(msg.id, msg.is_read)}
                    className={`text-[10px] font-semibold px-2.5 py-1 rounded-full cursor-pointer ${
                      msg.is_read
                        ? 'bg-slate-800 text-slate-400 hover:text-white'
                        : 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                    }`}
                  >
                    {msg.is_read ? 'Mark Unread' : 'Mark Read'}
                  </button>
                  <button
                    onClick={() => handleDelete(msg.id)}
                    className="p-1 text-slate-500 hover:text-rose-400 cursor-pointer"
                    title="Delete Message"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="pt-3 text-xs space-y-1">
                <div className="font-bold text-cyan-300">Subject: {msg.subject}</div>
                <p className="text-slate-300 leading-relaxed whitespace-pre-line">{msg.message}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-slate-950/80 border border-slate-800 rounded-3xl p-12 text-center text-slate-500 text-xs">
            No customer inquiries yet.
          </div>
        )}
      </div>
    </div>
  );
};
