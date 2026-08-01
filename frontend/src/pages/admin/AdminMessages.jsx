import React, { useEffect, useState } from 'react';
import { contactAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  const fetchMessages = () => {
    setLoading(true);
    const params = filter !== '' ? { isRead: filter } : {};
    contactAPI.getAll(params)
      .then((r) => setMessages(r.data.messages))
      .catch(() => toast.error('Failed to load messages.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchMessages(); }, [filter]);

  const handleMarkRead = async (id) => {
    try {
      await contactAPI.markRead(id);
      toast.success('Marked as read.');
      fetchMessages();
    } catch {
      toast.error('Failed to update.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this message?')) return;
    try {
      await contactAPI.delete(id);
      toast.success('Message deleted.');
      fetchMessages();
    } catch {
      toast.error('Failed to delete.');
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-headline-md font-bold text-on-surface mb-1">Contact Messages</h2>
        <p className="text-body-md text-on-surface-variant">View and manage messages from website visitors.</p>
      </div>

      <div className="flex gap-3">
        {[{ v: '', l: 'All' }, { v: 'false', l: 'Unread' }, { v: 'true', l: 'Read' }].map((f) => (
          <button key={f.v} onClick={() => setFilter(f.v)} className={`px-5 py-2 rounded-full text-label-lg font-semibold transition-all ${filter === f.v ? 'bg-primary text-on-primary' : 'bg-secondary-container text-on-secondary-container hover:bg-outline-variant'}`}>
            {f.l}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>
      ) : messages.length === 0 ? (
        <div className="text-center py-20 text-on-surface-variant">
          <span className="material-symbols-outlined text-6xl mb-4 block">mail</span>
          <p className="text-body-lg">No messages found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((msg) => (
            <div key={msg._id} className={`card p-6 ${!msg.isRead ? 'border-l-4 border-l-primary' : ''}`}>
              <div className="flex flex-col md:flex-row md:items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <h3 className="text-headline-sm font-bold text-on-surface">{msg.name}</h3>
                    {!msg.isRead && <span className="bg-primary text-on-primary text-label-md px-2 py-0.5 rounded-full">New</span>}
                  </div>
                  <div className="flex flex-wrap gap-4 text-label-md text-on-surface-variant mb-3">
                    <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">mail</span>{msg.email}</span>
                    {msg.phone && <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">call</span>{msg.phone}</span>}
                    <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">schedule</span>{new Date(msg.createdAt).toLocaleDateString('en-IN')}</span>
                  </div>
                  <p className="font-semibold text-on-surface mb-2">{msg.subject}</p>
                  <p className="text-body-md text-on-surface-variant">{msg.message}</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  {!msg.isRead && (
                    <button onClick={() => handleMarkRead(msg._id)} className="px-4 py-2 border border-outline-variant text-on-surface-variant rounded-lg text-label-lg hover:bg-surface-container transition-all">
                      Mark Read
                    </button>
                  )}
                  <button onClick={() => handleDelete(msg._id)} className="p-2 border border-outline-variant text-error rounded-lg hover:bg-error-container transition-all">
                    <span className="material-symbols-outlined">delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
