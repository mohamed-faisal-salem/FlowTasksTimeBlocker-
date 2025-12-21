import React, { useState, useEffect } from 'react';
import { DailyStats } from '../types';

interface DailyReviewProps {
  stats: DailyStats;
  onSave: (rating: number, notes: string) => void;
  onClose: () => void;
}

const DailyReview: React.FC<DailyReviewProps> = ({ stats, onSave, onClose }) => {
  const [rating, setRating] = useState(stats.dailyRating || 0);
  const [notes, setNotes] = useState(stats.notes || '');

  // إذا كان هناك ريفيو سابق، حمله
  useEffect(() => {
    if (stats.dailyRating) {
      setRating(stats.dailyRating);
    }
    if (stats.notes) {
      setNotes(stats.notes);
    }
  }, [stats.dailyRating, stats.notes]);

  const handleSave = () => {
    if (rating > 0) {
      onSave(rating, notes);
    } else {
      alert('Please rate your day before saving!');
    }
  };

  const getProductivityMessage = (score: number) => {
    if (score >= 80) return "Outstanding productivity! 🎉";
    if (score >= 60) return "Great work today! ✨";
    if (score >= 40) return "Good effort! 👍";
    return "Tomorrow is another chance! 💪";
  };

  // Default values to prevent undefined errors
  const productivityScore = stats.productivityScore || 0;
  const completedTasks = stats.completedTasks || 0;
  const efficiencyRate = stats.efficiencyRate || 0;
  const date = stats.date || new Date().toISOString().split('T')[0];
  const hasExistingReview = !!stats.dailyRating;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white dark:bg-slate-900 rounded-lg sm:rounded-xl max-w-full w-full max-w-md mx-auto p-4 sm:p-5 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg sm:text-xl font-bold">Daily Review</h2>
          <div className="text-xs sm:text-sm text-slate-500">
            {date}
          </div>
        </div>
        
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
          {hasExistingReview ? 'Update your daily reflection:' : 'How was your productivity today?'}
        </p>

        {/* Productivity Summary */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 rounded-lg p-3 sm:p-4 mb-4">
          <div className="text-center mb-3">
            <div className="text-2xl sm:text-3xl font-bold text-indigo-600 dark:text-indigo-400 mb-1">
              {productivityScore}/100
            </div>
            <p className="text-sm font-medium">{getProductivityMessage(productivityScore)}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="text-center">
              <div className="font-bold text-lg">{completedTasks}</div>
              <div className="text-slate-600 dark:text-slate-400">Tasks Done</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-lg">{efficiencyRate}%</div>
              <div className="text-slate-600 dark:text-slate-400">Efficiency</div>
            </div>
          </div>
        </div>

        {/* Rating */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            {hasExistingReview ? 'Update Your Rating' : 'Rate Your Day'}
          </label>
          <div className="flex justify-center gap-0.5 sm:gap-1">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(star => (
              <button
                key={star}
                onClick={() => setRating(star)}
                className={`text-xl sm:text-2xl transition-transform active:scale-95 ${
                  star <= rating ? 'text-yellow-500' : 'text-slate-300'
                }`}
                aria-label={`Rate ${star} stars`}
              >
                {star <= rating ? '★' : '☆'}
              </button>
            ))}
          </div>
          <div className="text-center mt-2 text-sm">
            <span className={`font-medium ${
              rating === 10 ? 'text-green-600' :
              rating >= 8 ? 'text-blue-600' :
              rating >= 6 ? 'text-yellow-600' :
              rating >= 4 ? 'text-orange-600' :
              rating >= 1 ? 'text-red-600' : 'text-slate-500'
            }`}>
              {rating === 10 ? 'Perfect! (10/10)' :
               rating === 9 ? 'Excellent! (9/10)' :
               rating === 8 ? 'Very Good (8/10)' :
               rating === 7 ? 'Good (7/10)' :
               rating === 6 ? 'Above Average (6/10)' :
               rating === 5 ? 'Average (5/10)' :
               rating === 4 ? 'Below Average (4/10)' :
               rating === 3 ? 'Needs Improvement (3/10)' :
               rating === 2 ? 'Poor (2/10)' :
               rating === 1 ? 'Very Poor (1/10)' :
               'Not rated yet'}
            </span>
          </div>
        </div>

        {/* Notes */}
        <div className="mb-5">
          <label className="block text-sm font-medium mb-2">
            Reflection Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full p-2.5 sm:p-3 border border-slate-300 dark:border-slate-700 rounded-lg bg-transparent text-sm sm:text-base"
            rows={3}
            placeholder="What went well? What could be better tomorrow?"
          />
        </div>

        {/* Actions - زرين الآن */}
        <div className="flex gap-2 sm:gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 sm:py-3 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-medium text-sm sm:text-base active:scale-95"
          >
            Close
          </button>
          <button
            onClick={handleSave}
            disabled={rating === 0}
            className={`flex-1 py-2.5 sm:py-3 rounded-lg transition-colors font-medium text-sm sm:text-base active:scale-95 ${
              rating === 0 
                ? 'bg-slate-300 dark:bg-slate-700 text-slate-500 cursor-not-allowed'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
          >
            {hasExistingReview ? 'Update' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DailyReview;