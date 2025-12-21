import React, { useState } from 'react';
import { Task, Priority } from '../types';
import { PRIORITY_LABELS } from '../constants';

interface TaskFormProps {
  sectorId: string;
  onAddTask: (sectorId: string, taskData: Partial<Task>) => void;
  onClose: () => void;
}

const TaskForm: React.FC<TaskFormProps> = ({ sectorId, onAddTask, onClose }) => {
  const [text, setText] = useState('');
  const [priority, setPriority] = useState<Priority>('normal');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!text.trim()) return;

    const newTask: Partial<Task> = {
      text: text.trim(),
      priority,
      estimatedTime: 0,
      progress: 0, // دايماً 0 لأننا خلاص مش هنستخدم progress
      timeSpent: 0,
      completed: false,
      createdAt: Date.now(),
      notes: notes || undefined
    };

    onAddTask(sectorId, newTask);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800">
        <h3 className="text-xl font-bold mb-4">Add New Task</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Task Description */}
          <div>
            <label className="block text-sm font-medium mb-1">Task Description *</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full p-3 border border-slate-300 dark:border-slate-700 rounded-xl bg-transparent"
              rows={3}
              placeholder="What needs to be done?"
              required
            />
          </div>

          {/* Priority Selection */}
          <div>
            <label className="block text-sm font-medium mb-1">Priority</label>
            <div className="flex gap-2">
              {(['urgent', 'important', 'normal'] as Priority[]).map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`flex-1 py-3 rounded-xl border text-sm font-medium ${
                    priority === p 
                    ? p === 'urgent' 
                      ? 'border-red-500 bg-red-500/10 text-red-600 dark:text-red-400'
                      : p === 'important'
                      ? 'border-orange-500 bg-orange-500/10 text-orange-600 dark:text-orange-400'
                      : 'border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400'
                    : 'border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {PRIORITY_LABELS[p]}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium mb-1">Notes (Optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-transparent"
              rows={2}
              placeholder="Additional details, links, or comments..."
            />
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border border-slate-300 dark:border-slate-700 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium"
            >
              Add Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskForm;