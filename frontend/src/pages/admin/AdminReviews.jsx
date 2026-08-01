import React, { useEffect, useState } from 'react';
import { reviewAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = () => {
    setLoading(true);
    reviewAPI.getAll()
      .then((r) => setReviews(r.data.reviews))
      .catch(() => toast.error('Failed to load reviews.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchReviews(); }, []);

  const handleApprove = async (id) => {
    try {
      await reviewAPI.approve(id);
      toast.success('Review approved.');
      fetchReviews();
    } catch {
      toast.error('Failed to approve.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this review?')) return;
    try {
      await reviewAPI.delete(id);
      toast.success('Review deleted.');
      fetchReviews();
    } catch {
      toast.error('Failed to delete.');
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-headline-md font-bold text-on-surface mb-1">Manage Reviews</h2>
        <p className="text-body-md text-on-surface-variant">Approve or remove customer testimonials.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-20 text-on-surface-variant">
          <span className="material-symbols-outlined text-6xl mb-4 block">star_border</span>
          <p className="text-body-lg">No reviews yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reviews.map((r) => (
            <div key={r._id} className={`card p-6 ${!r.isApproved ? 'opacity-75' : ''}`}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex gap-1 mb-1">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="material-symbols-outlined text-lg" style={{ fontVariationSettings: `'FILL' ${i < r.rating ? 1 : 0}`, color: i < r.rating ? '#9b0044' : '#e1bec4' }}>star</span>
                    ))}
                  </div>
                  <p className="font-semibold text-on-surface">{r.name}</p>
                  {r.eventType && <p className="text-label-md text-on-surface-variant">{r.eventType}</p>}
                </div>
                <span className={`text-label-md px-3 py-1 rounded-full ${r.isApproved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                  {r.isApproved ? 'Approved' : 'Pending'}
                </span>
              </div>
              <p className="text-body-md text-on-surface-variant italic mb-4">"{r.message}"</p>
              <p className="text-label-md text-on-surface-variant mb-4">{new Date(r.createdAt).toLocaleDateString('en-IN')}</p>
              <div className="flex gap-2 pt-4 border-t border-outline-variant">
                {!r.isApproved && (
                  <button onClick={() => handleApprove(r._id)} className="flex-1 py-2 bg-green-600 text-white rounded-lg text-label-lg hover:bg-green-700 transition-all">Approve</button>
                )}
                <button onClick={() => handleDelete(r._id)} className="flex-1 py-2 border border-outline-variant text-error rounded-lg text-label-lg hover:bg-error-container transition-all">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
