import React, { useState } from 'react';
import { DailyStats } from '../types';

interface DailyReviewProps {
  stats: DailyStats;
  onSave: (rating: number, notes: string) => void;
  onClose: () => void;
}

const DailyReview: React.FC<DailyReviewProps> = ({ stats, onSave, onClose }) => {
  const [rating, setRating] = useState(3);
  const [notes, setNotes] = useState('');

  const handleSubmit = () => {
    onSave(rating, notes);
    onClose();
  };

  const getProductivityMessage = (score: number) => {
    if (score >= 80) return "Outstanding productivity! 🎉";
    if (score >= 60) return "Great work today! ✨";
    if (score >= 40) return "Good effort! 👍";
    return "Tomorrow is another chance! 💪";
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800">
        <h2 className="text-2xl font-bold mb-2">Daily Review</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          How was your productivity today?
        </p>

        {/* Productivity Summary */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 rounded-2xl p-4 mb-6">
          <div className="text-center mb-4">
            <div className="text-4xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">
              {stats.productivityScore}/100
            </div>
            <p className="text-sm font-medium">{getProductivityMessage(stats.productivityScore)}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="text-center">
              <div className="font-bold text-lg">{stats.completedTasks}</div>
              <div className="text-slate-600 dark:text-slate-400">Tasks Done</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-lg">{stats.efficiencyRate}%</div>
              <div className="text-slate-600 dark:text-slate-400">Efficiency</div>
            </div>
          </div>
        </div>

        {/* Rating */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-3">Rate Your Day</label>
          <div className="flex justify-center gap-1">
            {[1, 2, 3, 4, 5].map(star => (
              <button
                key={star}
                onClick={() => setRating(star)}
                className="text-3xl transition-transform hover:scale-110"
              >
                {star <= rating ? '⭐' : '☆'}
              </button>
            ))}
          </div>
          <div className="text-center mt-2 text-sm text-slate-600 dark:text-slate-400">
            {rating === 5 ? 'Excellent!' : 
             rating === 4 ? 'Very Good' : 
             rating === 3 ? 'Good' : 
             rating === 2 ? 'Fair' : 
             'Needs Improvement'}
          </div>
        </div>

        {/* Notes */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Reflection Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full p-3 border border-slate-300 dark:border-slate-700 rounded-xl bg-transparent"
            rows={3}
            placeholder="What went well? What could be better tomorrow?"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 border border-slate-300 dark:border-slate-700 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Skip
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium"
          >
            Save Review
          </button>
        </div>
      </div>
    </div>
  );
};

export default DailyReview;